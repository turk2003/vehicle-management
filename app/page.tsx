"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import api from "@/lib/api"
import type * as React from "react"
import { TEST_ACCOUNTS } from "./constants"
import { getLoginErrorMessage } from "./utils"
import LoginBranding from "./_components/LoginBranding"
import LoginForm from "./_components/LoginForm"
import TestAccounts from "./_components/TestAccounts"

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", { email, password });
      const role = response.data.user.role;

      if (role === "ADMIN") router.push("/admin");
      else if (role === "APPROVER") router.push("/approver");
      else router.push("/user");
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillAccount = (acc: (typeof TEST_ACCOUNTS)[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#750064] text-gray-900">
      <Image
        src="/wall4.avif"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[42%_center] lg:object-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-black/40" aria-hidden="true" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1fr_440px] lg:gap-12 lg:px-8">
        <LoginBranding />

        <section
          className="rounded-xl bg-white shadow-xl"
          aria-labelledby="login-title"
        >
          <div className="border-b border-gray-200 px-6 py-6 sm:px-8">
            <h2 id="login-title" className="text-2xl font-bold text-gray-950">
              เข้าสู่ระบบ
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              ใช้อีเมลและรหัสผ่านที่ได้รับสิทธิ์ในระบบ
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <LoginForm
              handleLogin={handleLogin}
              error={error}
              email={email}
              setEmail={setEmail}
              showPassword={showPassword}
              password={password}
              setPassword={setPassword}
              setShowPassword={setShowPassword}
              loading={loading}
            />

            {process.env.NODE_ENV !== "production" && <TestAccounts
                                                        fillAccount={fillAccount}
                                                        loading={loading}
                                                      />}
          </div>
        </section>
      </div>
    </main>
  );
}
