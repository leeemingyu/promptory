"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { promptApi } from "@/lib/api";
import { uploadImage } from "@/lib/uploadImage";

export default function CreatePromptPage() {
  const router = useRouter();
  // token은 interceptor가 처리하므로 컴포넌트 레벨에서 굳이 안 꺼내도 됩니다.
  const { isLoggedIn, _hasHydrated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    prompt_text: "",
    description: "",
    ai_model: "GPT-4",
  });

  // 1. 하이드레이션 완료 후 로그인 체크
  useEffect(() => {
    if (_hasHydrated && !isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      router.push("/login");
    }
  }, [_hasHydrated, isLoggedIn, router]);

  // 2. 파일 선택 시 미리보기
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // 메모리 누수 방지를 위해 cleanup 함수 고려 (선택)
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return alert("로그인이 필요합니다.");

    setIsLoading(true);

    try {
      let finalImageUrl = "";

      // 1. 이미지가 있으면 업로드 (token 인자 제거됨)
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      // 2. 백엔드 API 호출 (token 인자 제거됨, 인터셉터가 자동 처리)
      const submitData = {
        ...formData,
        sample_image_url: finalImageUrl,
      };

      await promptApi.create(submitData);

      alert("성공적으로 등록되었습니다!");
      router.push("/");
      router.refresh(); // 메인 목록 갱신
    } catch (error: any) {
      console.error(error);
      alert(error.message || "등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로딩(Zustand 데이터 읽기 전) 또는 비로그인 시 렌더링 방지
  if (!_hasHydrated || !isLoggedIn) return null;

  return (
    <main className="max-w-2xl mx-auto mt-10 px-4 mb-20">
      <h1 className="text-3xl font-bold mb-8 text-black">프롬프트 공유하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">제목</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text"
            placeholder="멋진 프롬프트의 제목을 지어주세요"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
            required
          />
        </div>

        {/* AI 모델 선택 */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            사용된 AI 모델
          </label>
          <select
            name="ai_model"
            value={formData.ai_model}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
          >
            <option value="GPT-4">GPT-4 / ChatGPT</option>
            <option value="Midjourney">Midjourney</option>
            <option value="Stable Diffusion">Stable Diffusion</option>
            <option value="DALL-E 3">DALL-E 3</option>
            <option value="Claude 3">Claude 3</option>
            <option value="Etc">기타</option>
          </select>
        </div>

        {/* 프롬프트 내용 */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            프롬프트 내용
          </label>
          <textarea
            name="prompt_text"
            value={formData.prompt_text}
            onChange={handleChange}
            placeholder="AI에게 입력했던 명령어를 여기에 붙여넣으세요..."
            className="w-full p-3 border rounded-lg h-40 focus:ring-2 focus:ring-black outline-none resize-none font-mono text-sm bg-gray-50"
            required
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            설명 (선택)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="이 프롬프트를 잘 쓰는 꿀팁이 있다면 알려주세요!"
            className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-black outline-none resize-none"
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="border-2 border-dashed border-gray-200 p-6 rounded-xl">
          <label className="block font-semibold mb-2 text-gray-700">
            결과물 이미지
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
          />
          {previewUrl && (
            <div className="mt-4 relative w-40 h-40">
              <img
                src={previewUrl}
                alt="미리보기"
                className="w-full h-full object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg transition
            ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800 shadow-lg"}`}
        >
          {isLoading ? "업로드 중..." : "프롬프트 등록하기"}
        </button>
      </form>
    </main>
  );
}
