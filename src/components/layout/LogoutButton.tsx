"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer text-sm text-gray-500 hover:text-red-500"
    >
      로그아웃
    </button>
  );
}
