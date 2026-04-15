import type { ImgHTMLAttributes } from "react";
import { User } from "lucide-react";

type ProfileAvatarProps = {
  imageUrl: string | null | undefined;
  alt?: string;
  wrapperClassName?: string;
  imgClassName: string;
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  fallbackVariant?: "plain" | "box";
  fallbackClassName?: string;
  iconClassName: string;
};

function normalizeImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return null;
  if (imageUrl === "default") return null;
  return imageUrl;
}

export default function ProfileAvatar({
  imageUrl,
  alt = "",
  wrapperClassName,
  imgClassName,
  referrerPolicy = "no-referrer",
  fallbackVariant = "plain",
  fallbackClassName,
  iconClassName,
}: ProfileAvatarProps) {
  const normalized = normalizeImageUrl(imageUrl);

  if (normalized) {
    // Use <img> to avoid Next Image host restrictions.
    const image = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={normalized}
        alt={alt}
        className={imgClassName}
        referrerPolicy={referrerPolicy}
      />
    );

    if (wrapperClassName) {
      return <div className={wrapperClassName}>{image}</div>;
    }

    return image;
  }

  if (fallbackVariant === "box") {
    return (
      <div className={fallbackClassName}>
        <User className={iconClassName} aria-hidden="true" />
      </div>
    );
  }

  return <User className={iconClassName} aria-hidden="true" />;
}
