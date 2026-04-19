"use client";

const ASPECT_3_4 = 3 / 4;

type CropToAspectOptions = {
  aspect?: number;
  mimeType?: string;
  quality?: number;
  maxSize?: number;
};

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러오지 못했어요."));
    img.src = url;
  });
}

export async function cropImageToAspect(
  file: File,
  options?: CropToAspectOptions,
): Promise<File> {
  const aspect = options?.aspect ?? ASPECT_3_4;
  const mimeType = options?.mimeType ?? "image/webp";
  const quality = options?.quality ?? 0.9;
  const maxSize = options?.maxSize ?? 1080;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    if (!srcW || !srcH) throw new Error("이미지 크기를 확인할 수 없어요.");

    // Center-crop to the requested aspect ratio.
    const srcAspect = srcW / srcH;
    let cropW = srcW;
    let cropH = srcH;
    if (srcAspect > aspect) {
      cropH = srcH;
      cropW = Math.round(srcH * aspect);
    } else {
      cropW = srcW;
      cropH = Math.round(srcW / aspect);
    }
    const sx = Math.max(0, Math.round((srcW - cropW) / 2));
    const sy = Math.max(0, Math.round((srcH - cropH) / 2));

    let outW = cropW;
    let outH = cropH;
    const longestSide = Math.max(cropW, cropH);
    if (maxSize > 0 && longestSide > maxSize) {
      const scale = maxSize / longestSide;
      outW = Math.max(1, Math.round(cropW * scale));
      outH = Math.max(1, Math.round(cropH * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("이미지 처리를 시작할 수 없어요.");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, outW, outH);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("이미지 변환에 실패했어요."))),
        mimeType,
        quality,
      );
    });

    const ext = mimeType === "image/png" ? "png" : mimeType === "image/jpeg" ? "jpg" : "webp";
    return new File([blob], `${crypto.randomUUID()}.${ext}`, { type: mimeType });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
