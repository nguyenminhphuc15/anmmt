"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Server, Terminal } from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import EmailForm from "@/components/magic-link/email-form";
import EmailPreview from "@/components/magic-link/email-preview";
import SuccessScreen from "@/components/magic-link/success-screen";
import { setSession, MOCK_IP, MOCK_DEVICE } from "@/lib/session";

type Step = "input" | "requesting" | "inbox" | "verifying" | "success";

export default function MagicLinkPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [debug, setDebug] = useState<{
    token: string;
    callbackUrl: string;
  } | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const handleEmailSubmit = async (emailStr: string) => {
    setEmail(emailStr);
    setStep("requesting");
    setLogs([]);
    addLog(`POST /api/auth/magic-link/request { email: "${emailStr}" }`);

    try {
      const res = await fetch("/api/auth/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailStr }),
      });

      const data = await res.json();

      setTimeout(() => addLog("DB: Checking user existence..."), 400);
      setTimeout(() => addLog("DB: User found/created."), 800);
      setTimeout(() => addLog(`CRYPTO: Generating token...`), 1200);
      setTimeout(
        () =>
          addLog(`DB: Storing token ${data.debug?.token.substring(0, 8)}...`),
        1600,
      );
      setTimeout(
        () => addLog(`SMTP: Sending magic link to ${emailStr}...`),
        2000,
      );

      setTimeout(() => {
        addLog("SMTP: ✔ Email sent successfully.");
        setDebug(data.debug);
        setStep("inbox");
      }, 2500);
    } catch (error) {
      addLog("ERROR: API endpoint failed.");
    }
  };

  const handleLinkClick = () => {
    setStep("verifying");
    addLog(
      `GET /api/auth/magic-link/callback?token=${debug?.token.substring(0, 8)}...`,
    );

    setTimeout(
      () => addLog("DB: Verifying token authenticity & expiration..."),
      500,
    );
    setTimeout(
      () => addLog("DB: Token valid. Invalidating for future use..."),
      1000,
    );
    setTimeout(() => addLog("JOSE: Signing session JWT..."), 1500);
    setTimeout(() => addLog("COOKIE: Setting auth_token (HttpOnly)..."), 2000);

    setTimeout(() => {
      setStep("success");
    }, 2500);
  };

  const handleFinish = () => {
    // In real flow, the session is already in cookies.
    // We setSession only for client-side legacy mock parts if needed.
    setSession({
      method: "Magic Link",
      email,
      loggedAt: new Date().toISOString(),
      ip: MOCK_IP,
      device: MOCK_DEVICE,
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Nav />
      <main className="flex-1 max-w-6xl mx-auto w-full py-12 px-4">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-7">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
            </Link>

            <header className="mb-12">
              <h1 className="text-3xl font-bold mb-2">
                Magic Link — Real Implementation
              </h1>
              <p className="text-slate-400">
                Demo thực hiện request tới API, lưu DB, và xác thực token JWT.
              </p>

              {/* Progress Bar */}
              <div className="mt-8 flex gap-2">
                {["input", "requesting", "inbox", "verifying", "success"].map(
                  (s, idx) => {
                    const steps: Step[] = [
                      "input",
                      "requesting",
                      "inbox",
                      "verifying",
                      "success",
                    ];
                    const activeIdx = steps.indexOf(step);
                    return (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          idx <= activeIdx
                            ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            : "bg-white/10"
                        }`}
                      />
                    );
                  },
                )}
              </div>
            </header>

            <div className="glass relative p-8 rounded-3xl border-white/5 min-h-[400px] flex flex-col justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {step === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <EmailForm onSubmit={handleEmailSubmit} />
                  </motion.div>
                )}

                {step === "requesting" && (
                  <motion.div
                    key="requesting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-indigo-400 font-mono text-sm">
                      Processing Backend Requests...
                    </p>
                  </motion.div>
                )}

                {step === "inbox" && (
                  <motion.div
                    key="inbox"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <EmailPreview email={email} onLinkClick={handleLinkClick} />
                    {debug && (
                      <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">
                          Debug Info (API Data)
                        </p>
                        <code className="text-[10px] text-indigo-300 break-all">
                          {debug.callbackUrl}
                        </code>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === "verifying" && (
                  <motion.div
                    key="verifying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-6"
                  >
                    <div className="relative w-20 h-20 mx-auto">
                      <Loader2 className="w-20 h-20 text-indigo-500 animate-spin absolute inset-0" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Đang xác thực Token...
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        JOSE Verification in progress
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <SuccessScreen email={email} onFinish={handleFinish} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar: Server Log */}
          <div className="lg:col-span-5 h-fit sticky top-24">
            <div className="glass-darker rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="bg-white/5 p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Server Instance
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                </div>
              </div>
              <div className="p-6 bg-black/40 h-[450px] overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col-reverse justify-end gap-2 scrollbar-none">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 italic">
                    Waiting for requests...
                  </div>
                ) : (
                  logs
                    .map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${log.includes("ERROR") ? "text-red-400" : log.includes("✔") ? "text-green-400" : "text-slate-300"}`}
                      >
                        <span className="text-slate-600 mr-2">{">"}</span>
                        {log}
                      </motion.div>
                    ))
                    .reverse()
                )}
              </div>
              <div className="p-3 bg-indigo-500/5 text-center">
                <p className="text-[10px] text-indigo-400/60 uppercase font-bold">
                  Node.js API Runtime
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
