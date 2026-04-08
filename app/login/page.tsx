"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import MethodSelector from "@/components/login/method-selector";
import { setSession, MOCK_IP, MOCK_DEVICE } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (method: "magic-link" | "google" | "github") => {
    setIsLoading(true);

    // Simulate flow logic: for this demo, we'll redirect to specific demo pages
    // and those pages will handle the final "login" session set.

    if (method === "magic-link") {
      router.push("/demo/magic-link");
    } else if (method === "google" || method === "github") {
      router.push(`/demo/oauth?provider=${method}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Nav />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
            </Link>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Đang đăng nhập</h1>
            <p className="text-muted-foreground">
              Chọn phương thức để bắt đầu trải nghiệm demo.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />

            <MethodSelector onSelect={handleSelect} />

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500">
                Đây là ứng dụng mô phỏng. Không có dữ liệu thật nào được thu
                thập hoặc lưu trữ trên máy chủ.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
