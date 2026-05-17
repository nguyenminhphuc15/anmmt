"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Key, ExternalLink } from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import ConsentScreen from "@/components/oauth/consent-screen";
import TokenDisplay from "@/components/oauth/token-display";
import { setSession, MOCK_IP, MOCK_DEVICE } from "@/lib/session";
import { Button } from "@/components/ui/button";

type Step = "select" | "consent" | "exchanging" | "success";

function OAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProvider = searchParams.get("provider") as
    | "google"
    | "github"
    | null;

  const [step, setStep] = useState<Step>(
    initialProvider ? "consent" : "select",
  );
  const [provider, setProvider] = useState<"google" | "github" | "">(
    initialProvider || "",
  );

  useEffect(() => {
    if (initialProvider) {
      setProvider(initialProvider);
      setStep("consent");
    }
  }, [initialProvider]);

  const handleSelect = (p: "google" | "github") => {
    setProvider(p);
    setStep("consent");
  };

  const handleRealRedirect = () => {
    window.location.href = `/api/auth/oauth/redirect?provider=${provider}`;
  };

  const handleAllow = () => {
    // This is for the frontend demo simulation
    setStep("exchanging");
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const handleFinish = () => {
    setSession({
      method: provider === "google" ? "Google" : "GitHub",
      email: `${provider}_user@demo.local`,
      loggedAt: new Date().toISOString(),
      ip: MOCK_IP,
      device: MOCK_DEVICE,
    });
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-lg">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
      </Link>

      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2 text-glow">
          OAuth2 — Real vs Mock
        </h1>
        <p className="text-slate-600">
          Bạn có thể chạy luồng mô phỏng ngay tại đây hoặc thực hiện Redirect
          thật tới Provider.
        </p>

        {/* Progress Bar */}
        <div className="mt-8 flex gap-2">
          {["select", "consent", "exchange", "success"].map((s, idx) => {
            const steps: Step[] = [
              "select",
              "consent",
              "exchanging",
              "success",
            ];
            const activeIdx = steps.indexOf(step);
            return (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= activeIdx ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-white/10"}`}
              />
            );
          })}
        </div>
      </header>

      <div className="glass relative p-8 rounded-3xl border-slate-200 min-h-[450px] flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold mb-6 text-center">
                Chọn một Provider
              </h3>
              <Button
                variant="outline"
                className="w-full h-12 justify-center gap-2 glass"
                onClick={() => handleSelect("google")}
              >
                Tiếp tục với Google
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 justify-center gap-2 glass"
                onClick={() => handleSelect("github")}
              >
                Tiếp tục với GitHub
              </Button>
            </motion.div>
          )}

          {step === "consent" && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <ConsentScreen
                provider={provider as "google" | "github"}
                onAllow={handleAllow}
                onCancel={() => setStep("select")}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-600">
                  <span className="bg-slate-50 px-2">Hoặc dùng API thực</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full py-6 glass border-indigo-500/20 hover:border-indigo-500/50 text-indigo-300 gap-2"
                onClick={handleRealRedirect}
              >
                <ExternalLink className="w-4 h-4" /> Redirect tới{" "}
                {provider === "google" ? "Google" : "GitHub"} (Real Auth)
              </Button>
            </motion.div>
          )}

          {step === "exchanging" && (
            <motion.div
              key="exchanging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <Loader2 className="w-24 h-24 text-indigo-500 animate-spin absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Key className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold">Đang trao đổi Token...</h3>
                <div className="font-mono text-[10px] text-slate-500 bg-black/30 p-4 rounded-xl border border-slate-200 space-y-1 text-left">
                  <div className="text-indigo-400">
                    POST /api/auth/oauth/callback?code=...
                  </div>
                  <div>Grant Type: authorization_code</div>
                  <div className="truncate text-slate-600 italic">
                    // Server-to-server exchange is happening now
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TokenDisplay
                provider={provider as "google" | "github"}
                onFinish={handleFinish}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-amber-200/50 leading-relaxed">
        <strong>Lưu ý:</strong> Để luồng "Real Auth" hoạt động, bạn cần cấu hình
        CLIENT_ID và SECRET trong file .env.local. Nếu không, server sẽ trả về
        lỗi Redirect.
      </div>
    </div>
  );
}

export default function OAuthPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <Suspense
          fallback={<div className="text-slate-500">Loading demo...</div>}
        >
          <OAuthContent />
        </Suspense>
      </main>
    </div>
  );
}
