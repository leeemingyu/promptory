"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RegisterFormData } from "@/types";
import { createClient } from "@/lib/supabase/client";

const REGISTER_SUCCESS_MESSAGE =
  "Registration complete. Please check your email and then log in.";
const REGISTER_FAILED_MESSAGE = "Registration failed. Please try again.";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    nickname: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: "http://localhost:3000/welcome",
        data: {
          nickname: formData.nickname,
        },
      },
    });

    if (error || !data.user) {
      const message = error?.message ?? REGISTER_FAILED_MESSAGE;
      alert(message);
      setIsLoading(false);
      return;
    }

    alert(REGISTER_SUCCESS_MESSAGE);
    router.push("/login");
    setIsLoading(false);
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nickname"
          placeholder="Nickname"
          value={formData.nickname}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
          onChange={handleChange}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-lg bg-black p-3 font-semibold text-white transition hover:bg-gray-800 ${
            isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </main>
  );
}
