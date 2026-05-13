"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Server, Fingerprint } from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import PasskeyForm from "@/components/passkey/passkey-form";
import SuccessScreen from "@/components/magic-link/success-screen"; // Tái sử dụng màn hình thành công
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { setSession, MOCK_IP, MOCK_DEVICE } from "@/lib/session";

type Step = "input" | "processing" | "success";

export default function PasskeyDemoPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // --- LUỒNG ĐĂNG KÝ ---
  const handleRegister = async (emailStr: string) => {
    setEmail(emailStr);
    setStep("processing");
    setLogs([]);
    addLog(`POST /api/auth/passkey/generate { email: "${emailStr}" }`);

    try {
      addLog("DB: Checking user existence / Creating user...");
      const generateResp = await fetch("/api/auth/passkey/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailStr }),
      });
      const options = await generateResp.json();
      
      addLog("CRYPTO: Sending challenge to authenticator...");
      addLog("OS: Waiting for User PIN/Biometrics...");
      
      const regResp = await startRegistration({ optionsJSON: options });
      addLog("OS: ✔ Chữ ký sinh trắc học đã được tạo.");
      
      addLog("POST /api/auth/passkey/verify (Sending signature)");
      const verifyResp = await fetch("/api/auth/passkey/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regResp),
      });

      if (verifyResp.ok) {
        addLog("DB: ✔ Public Key stored successfully.");
        addLog("JOSE: Signing session JWT...");
        setTimeout(() => setStep("success"), 1000);
      } else {
        addLog("ERROR: Verification failed on server.");
        setStep("input");
      }
    } catch (err) {
      if (err instanceof Error) {
        addLog(`ERROR: ${err.message}`);
      } else {
        addLog(`ERROR: Đã xảy ra lỗi hệ thống`);
      }
      setStep("input");
    }
  };

  // --- LUỒNG ĐĂNG NHẬP ---
  const handleLogin = async () => {
    setStep("processing");
    setLogs([]);
    addLog("GET /api/auth/passkey/login-generate");

    try {
      const generateResp = await fetch("/api/auth/passkey/login-generate");
      const options = await generateResp.json();
      
      addLog("OS: Prompting user for Passkey selection...");
      const authResp = await startAuthentication({ optionsJSON: options });
      addLog("OS: ✔ Biometric signature created.");

      addLog("POST /api/auth/passkey/login-verify");
      const verifyResp = await fetch("/api/auth/passkey/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResp),
      });

      const result = await verifyResp.json();

      if (verifyResp.ok) {
        setEmail(result.email);
        addLog(`DB: ✔ Signature verified. User is ${result.email}.`);
        addLog("DB: Updated counter to prevent Replay Attacks.");
        addLog("COOKIE: Setting auth_token (HttpOnly)...");
        setTimeout(() => setStep("success"), 1000);
      } else {
        addLog("ERROR: Login verification failed.");
        setStep("input");
      }
    } catch (err) {
      if (err instanceof Error) {
        addLog(`ERROR: ${err.message}`);
      } else {
        addLog(`ERROR: Đã xảy ra lỗi hệ thống`);
      }
      setStep("input");
    }
  };

  const handleFinish = () => {
    setSession({ method: "Passkey", email, loggedAt: new Date().toISOString(), ip: MOCK_IP, device: MOCK_DEVICE });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Nav />
      <main className="flex-1 max-w-6xl mx-auto w-full py-12 px-4">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
          
          {/* KHUNG BÊN TRÁI: GIAO DIỆN NGƯỜI DÙNG */}
          <div className="lg:col-span-7">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
            </Link>

            <header className="mb-12">
              <h1 className="text-3xl font-bold mb-2">Passkey (WebAuthn) Flow</h1>
              <p className="text-slate-400">Demo tạo Khóa (Register) và Đăng nhập (Authenticate) an toàn tuyệt đối.</p>

              {/* Progress Bar */}
              <div className="mt-8 flex gap-2">
                {["input", "processing", "success"].map((s, idx) => {
                  const steps: Step[] = ["input", "processing", "success"];
                  const activeIdx = steps.indexOf(step);
                  return (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= activeIdx ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-white/10"}`} />
                  );
                })}
              </div>
            </header>

            <div className="glass relative p-8 rounded-3xl border-white/5 min-h-[400px] flex flex-col justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {step === "input" && (
                  <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <PasskeyForm onRegister={handleRegister} onLogin={handleLogin} />
                  </motion.div>
                )}

                {step === "processing" && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                      <Loader2 className="w-24 h-24 text-indigo-500 animate-spin absolute inset-0" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Fingerprint className="w-8 h-8 text-indigo-400 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Đang giao tiếp với hệ điều hành...</h3>
                      <p className="text-xs text-slate-500">Vui lòng kiểm tra màn hình và nhập mã PIN/Vân tay</p>
                    </div>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <SuccessScreen email={email} onFinish={handleFinish} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* KHUNG BÊN PHẢI: SERVER LOGS */}
          <div className="lg:col-span-5 h-fit sticky top-24">
            <div className="glass-darker rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="bg-white/5 p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Server Instance</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                </div>
              </div>
              <div ref={scrollRef} className="p-6 bg-black/40 h-[450px] overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col-reverse justify-end gap-2 scrollbar-none">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 italic">Waiting for requests...</div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`${log.includes("ERROR") ? "text-red-400" : log.includes("✔") ? "text-green-400" : "text-slate-300"}`}>
                      <span className="text-slate-600 mr-2">{">"}</span>{log}
                    </motion.div>
                  )).reverse()
                )}
              </div>
              <div className="p-3 bg-indigo-500/5 text-center">
                <p className="text-[10px] text-indigo-400/60 uppercase font-bold">Node.js API Runtime</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}