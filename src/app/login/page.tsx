"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LoginFormData } from "@/types";
import { createClient } from "@/lib/supabase/client";

const LOGIN_SUCCESS_MESSAGE = "Logged in successfully.";
const LOGIN_FAILED_MESSAGE = "Login failed. Please try again.";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const signInwithPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error || !data.user) {
      const message = error?.message ?? LOGIN_FAILED_MESSAGE;
      alert(message);
      return;
    }

    alert(LOGIN_SUCCESS_MESSAGE);
    router.push("/");
    router.refresh();
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
      <form onSubmit={signInwithPassword} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            placeholder="example@email.com"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </main>
  );
}
