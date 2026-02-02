const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 프롬프트 목록 가져오기
export const getPrompts = async () => {
  const res = await fetch(`${API_URL}/prompts`);
  return res.json();
};

// 회원가입
export const register = async (userData: any) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
};
