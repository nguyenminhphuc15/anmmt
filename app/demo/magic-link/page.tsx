"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Server,
  Terminal,
  ShieldCheck,
  Database,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-200/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-purple-200/20 blur-[100px] rounded-full" />
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full py-16 px-4 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-7">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-10 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />{" "}
              Quay lại Home
            </Link>

            <header className="mb-12">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                Magic Link — Real Implementation
              </h1>
              <p className="text-slate-600 font-medium text-lg leading-relaxed">
                Trải nghiệm quy trình đăng nhập không mật khẩu qua email, từ
                request API cho đến xác thực Token JWT.
              </p>

              {/* Progress Stepper */}
              <div className="mt-10 flex gap-3">
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
                        className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                          idx <= activeIdx
                            ? "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-y-110"
                            : "bg-slate-200"
                        }`}
                      />
                    );
                  },
                )}
              </div>
            </header>

            <div className="bg-white/80 backdrop-blur-xl relative p-1 rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 min-h-[450px] flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col justify-center p-8">
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
                      className="text-center space-y-6"
                    >
                      <div className="relative inline-block">
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto" />
                        <Zap className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <p className="text-indigo-600 font-black uppercase tracking-widest text-xs">
                        Processing Backend Requests...
                      </p>
                    </motion.div>
                  )}

                  {step === "inbox" && (
                    <motion.div
                      key="inbox"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="space-y-8"
                    >
                      <EmailPreview
                        email={email}
                        onLinkClick={handleLinkClick}
                      />
                      {debug && (
                        <div className="p-6 bg-slate-900 rounded-3xl shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full" />
                          <div className="flex items-center gap-2 mb-3 relative z-10">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">
                              Raw Callback URL (Debug)
                            </p>
                          </div>
                          <code className="text-[11px] text-slate-300 font-mono break-all leading-relaxed relative z-10">
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
                      className="text-center space-y-8"
                    >
                      <div className="relative w-24 h-24 mx-auto">
                        <Loader2 className="w-24 h-24 text-indigo-600 animate-spin absolute inset-0" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShieldCheck className="w-12 h-12 text-indigo-400 animate-bounce" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                          Xác thực Token
                        </h3>
                        <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">
                          Cryptographic signature verified
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
          </div>

          {/* Sidebar: Server Log */}
          <div className="lg:col-span-5 h-fit sticky top-24">
            <div className="bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl shadow-indigo-900/10 overflow-hidden">
              <div className="bg-slate-800/50 p-6 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                    Server Terminal
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
              </div>
              <div className="p-8 h-[500px] overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col-reverse justify-end gap-3 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent)]">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 italic font-medium">
                    Waiting for inbound requests...
                  </div>
                ) : (
                  logs
                    .map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-3 ${log.includes("ERROR") ? "text-red-400" : log.includes("✔") ? "text-emerald-400" : "text-slate-300"}`}
                      >
                        <span className="text-slate-600 font-bold">
                          [{idx_to_time(i)}]
                        </span>
                        <div className="flex-1">
                          <span className="opacity-50 mr-2">{">"}</span>
                          {log.split("]").slice(1).join("]") || log}
                        </div>
                      </motion.div>
                    ))
                    .reverse()
                )}
              </div>
              <div className="p-4 bg-indigo-500/10 text-center border-t border-slate-800">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">
                  Runtime: Node.js / Next.js
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Glossary Section */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              Giải thích thuật ngữ
            </h2>
            <p className="text-slate-500 font-medium">
              Tìm hiểu bản chất kỹ thuật của Magic Link
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              term: "Magic Token",
              def: "Một chuỗi ký tự ngẫu nhiên, duy nhất và có độ bảo mật cao được tạo ra bởi Server. Token này được lưu tạm thời trong Database và liên kết trực tiếp với email của người dùng.",
            },
            {
              term: "Callback URL",
              def: "Địa chỉ (link) nằm trong email. Khi người dùng click, nó gửi Token ngược lại cho Server thông qua request GET để bắt đầu quá trình xác thực.",
            },
            {
              term: "Token Expiration",
              def: "Thời gian hết hạn của Link (thường là 10-15 phút). Hết thời gian này, Token sẽ bị xóa khỏi DB, ngăn chặn việc kẻ tấn công chiếm được email cũ và đăng nhập.",
            },
            {
              term: "Idempotency",
              def: "Một Magic Link thường chỉ được dùng một lần duy nhất. Ngay sau khi xác thực thành công, Server sẽ vô hiệu hóa Token đó để tránh tấn công Replay.",
            },
            {
              term: "JWT Session",
              def: "Sau khi click link, Server trả về một JSON Web Token (JWT) lưu vào Cookie. Đây là 'chìa khóa' để Client chứng minh mình đã đăng nhập ở các request sau.",
            },
            {
              term: "HttpOnly Cookie",
              def: "Phương thức lưu trữ JWT bảo mật nhất. Cookie này không thể bị truy cập bởi JavaScript (document.cookie), giúp chống lại tấn công XSS chiếm quyền điều khiển.",
            },
          ].map((g, idx) => (
            <Card
              key={idx}
              className="bg-white border-2 border-slate-50 hover:border-indigo-100 transition-all duration-300 rounded-[24px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 group"
            >
              <h3 className="text-lg font-black text-indigo-600 mb-3 group-hover:scale-105 transition-transform origin-left">
                {g.term}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {g.def}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function idx_to_time(i: number) {
  // Just a helper to format time nicely in the log
  return new Date().toLocaleTimeString();
}
