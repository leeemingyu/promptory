"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  onLogout?: () => void;
  className?: string;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
};

export default function LogoutButton({
  onLogout,
  className,
  buttonProps,
}: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const { className: buttonClassName, ...restButtonProps } = buttonProps ?? {};

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      onLogout?.();
    }
  };

  return (
    <button
      type="button"
      {...restButtonProps}
      onClick={handleLogout}
      className={[
        "cursor-pointer text-sm text-gray-500",
        buttonClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      로그아웃
    </button>
  );
}
