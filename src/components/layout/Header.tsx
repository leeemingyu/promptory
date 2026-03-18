import Link from "next/link";
import LogoutButton from "@/components/layout/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const username =
    typeof user?.user_metadata?.nickname === "string"
      ? user.user_metadata.nickname
      : (user?.email ?? "");

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-black">
          PROMPTORY
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-medium">
                {username.split("@")[0]}
              </span>
              <Link
                href="/prompts/create"
                className="rounded bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
              >
                Create
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-black"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
