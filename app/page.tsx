"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import api from "@/lib/api";

const TEST_ACCOUNTS = [
  {
    role: "ผู้ดูแลระบบ",
    email: "admin@system.com",
    password: "admin123",
    color: "bg-red-50 text-red-800 border-red-200 hover:bg-red-100",
    dot: "bg-red-500",
  },
  {
    role: "ผู้อนุมัติ",
    email: "ap1@gmain.com",
    password: "1234",
    color: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100",
    dot: "bg-blue-500",
  },
  {
    role: "ผู้ใช้งาน",
    email: "test01@gmail.con",
    password: "1234",
    color: "bg-green-50 text-green-800 border-green-200 hover:bg-green-100",
    dot: "bg-green-500",
  },
];

function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
}

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
        <section className="mb-8 flex flex-col justify-center lg:mb-0">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-xl bg-white shadow-md">
            <Image
              src="/pea_logo.png"
              alt="PEA logo"
              width={64}
              height={64}
              priority
            />
          </div>

          <div className="max-w-xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-purple-900">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              ระบบภายในสำหรับงานยานพาหนะ
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
              ระบบจัดการยานพาหนะ
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/90">
              เข้าสู่ระบบเพื่อจองรถ ตรวจคำขออนุมัติ
              และจัดการข้อมูลยานพาหนะขององค์กรอย่างเป็นระบบ
            </p>
          </div>
        </section>

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
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    !
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  อีเมล
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="กรอกอีเมล"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="min-h-11 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-12 text-gray-950 placeholder:text-gray-500 transition-colors duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span
                    className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin motion-reduce:border-white"
                    aria-hidden="true"
                  />
                ) : (
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="mb-3 text-sm font-medium text-gray-700">
                บัญชีทดสอบ
              </p>
              <div className="space-y-2">
                {TEST_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillAccount(acc)}
                    disabled={loading}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60 ${acc.color}`}
                  >
                    <span
                      className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${acc.dot}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-20 font-semibold">{acc.role}</span>
                    <span className="truncate text-xs opacity-90">
                      {acc.email}
                    </span>
                    <span className="ml-auto flex-shrink-0 text-xs opacity-80">
                      รหัส: {acc.password}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
