"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Server,
  Database,
  Globe,
  Key,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Code2,
  Fingerprint,
  Zap,
  Terminal,
  Search,
  BookOpen,
  Info,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function SequenceFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSuccess = searchParams.get("success") === "true";
  const userEmail = searchParams.get("email");
  const provider = searchParams.get("provider");

  const [stage, setStage] = useState<1 | 2 | 3>(isSuccess ? 3 : 1);
  const [loading, setLoading] = useState(false);
  const [flowData, setFlowData] = useState<any>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [logs, setLogs] = useState<
    { msg: string; type: "req" | "res" | "db"; time: string }[]
  >([]);
  const [lastRequest, setLastRequest] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const addLog = (msg: string, type: "req" | "res" | "db") => {
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `[FE] ${msg}`,
        type: type.toUpperCase(),
      }),
    });
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (Array.isArray(data)) {
        const formattedLogs = data
          .map((l: any) => ({
            msg: l.message,
            type: (l.type === "DB"
              ? "db"
              : l.type === "REQ"
                ? "req"
                : "res") as "db" | "req" | "res",
            time: new Date(l.timestamp).toLocaleTimeString(),
          }))
          .reverse();
        setLogs(formattedLogs);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedReq = sessionStorage.getItem("oidc_demo_lastReq");
    const savedRes = sessionStorage.getItem("oidc_demo_lastRes");

    if (isSuccess) {
      if (savedReq) setLastRequest(JSON.parse(savedReq));
      if (savedRes) setLastResponse(JSON.parse(savedRes));

      if (!savedReq) {
        setLastRequest({
          method: "POST",
          url: "/token",
          body: {
            grant_type: "authorization_code",
            code: "...",
            code_verifier: "...",
          },
        });
      }
    } else {
      sessionStorage.removeItem("oidc_demo_lastReq");
      sessionStorage.removeItem("oidc_demo_lastRes");
    }
  }, [isSuccess]);

  const saveState = (req: any, res: any) => {
    setLastRequest(req);
    setLastResponse(res);
    sessionStorage.setItem("oidc_demo_lastReq", JSON.stringify(req));
    sessionStorage.setItem("oidc_demo_lastRes", JSON.stringify(res));
  };

  const startFlow = async (p: "google" | "github" | "mock") => {
    setLoading(true);
    setIsSimulated(p === "mock");

    // Clear logs via API for a fresh demo
    await fetch("/api/logs", { method: "DELETE" });
    setLogs([]);
    sessionStorage.removeItem("oidc_demo_lastReq");
    sessionStorage.removeItem("oidc_demo_lastRes");

    addLog(`Initiating ${p} flow...`, "req");

    try {
      const provider = p === "mock" ? "google" : p;
      const reqBody = { provider };
      const reqInfo = {
        method: "POST",
        url: "/api/auth/oidc-sequence/init",
        body: reqBody,
      };

      const res = await fetch("/api/auth/oidc-sequence/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      saveState(reqInfo, data);
      setFlowData(data);

      addLog("Step 1: State & Nonce generated.", "res");
      addLog("Step 1: PKCE Verifier & Challenge created.", "res");
      addLog("DB: INSERT INTO oidc_flows (state, nonce, verifier, ...)", "db");

      if (p === "mock") {
        addLog("Simulating Stage 2: User Redirect to Provider.", "req");
        setTimeout(() => {
          setStage(2);
          addLog("Mock Provider: User authenticated and authorized.", "res");
        }, 2000);
        setTimeout(() => {
          setStage(3);
          addLog("Stage 3: Token Exchange with provider success.", "res");
          setLoading(false);
        }, 5000);
      } else {
        addLog(
          `Redirecting user to: ${data.authUrl.substring(0, 40)}...`,
          "req",
        );
        setTimeout(() => {
          window.location.href = data.authUrl;
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      addLog("Error occurred during initialization", "res");
      setLoading(false);
    }
  };

  const stages = [
    {
      id: 1,
      title: "Khởi tạo & Tạo Proof",
      desc: "Tạo state, nonce và PKCE challenge",
      icon: Fingerprint,
      color: "text-indigo-600",
    },
    {
      id: 2,
      title: "Tương tác Provider",
      desc: "Đăng nhập & cấp quyền tại Provider",
      icon: Globe,
      color: "text-blue-600",
    },
    {
      id: 3,
      title: "Trao đổi & Verify",
      desc: "Exchange code và xác thực ID Token",
      icon: ShieldCheck,
      color: "text-green-600",
    },
  ];

  const glossary = [
    {
      term: "State",
      def: "Một chuỗi ngẫu nhiên do Client tạo ra. Nó được gửi kèm yêu cầu đăng nhập và Provider phải trả lại y hệt. Client so khớp để đảm bảo phản hồi đến từ request ban đầu, chống tấn công CSRF.",
    },
    {
      term: "Nonce",
      def: "Chuỗi ngẫu nhiên dùng một lần (Number used Once). Nó được gửi đến Provider và đính kèm vào trong ID Token đã ký. Client verify nonce này để ngăn chặn tấn công phát lại (Replay Attack).",
    },
    {
      term: "Code Challenge",
      def: "Phiên bản được băm (thường là SHA256) của Code Verifier. Nó được gửi đến Provider ở Bước 1. Provider giữ lại để so khớp sau này mà không cần biết chuỗi gốc sớm.",
    },
    {
      term: "Code Verifier",
      def: "Chuỗi gốc cực kỳ bảo mật mà Client giữ kín. Chỉ ở Bước 3 (Trao đổi Code lấy Token), Client mới gửi chuỗi này lên Server. Server sẽ băm nó và so sánh với Challenge đã nhận ở Bước 1 để xác thực Client hợp lệ.",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />{" "}
          Quay lại Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="mb-8">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                OIDC Deep-Dive
              </h1>
              <p className="text-slate-600 font-medium text-sm">
                Chi tiết từng bước theo luồng sequence chuẩn PKCE.
              </p>
            </div>

            <div className="space-y-4">
              {stages.map((s) => (
                <div
                  key={s.id}
                  className={`p-5 rounded-2xl border-2 transition-all duration-500 flex gap-4 ${
                    stage === s.id
                      ? "bg-white border-indigo-600 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50"
                      : stage > s.id
                        ? "bg-green-50/50 border-green-200 opacity-80"
                        : "bg-white border-slate-100 opacity-40"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center border-2 ${stage >= s.id ? "border-indigo-600 shadow-sm" : "border-slate-100"}`}
                  >
                    <s.icon
                      className={`w-6 h-6 ${stage >= s.id ? s.color : "text-slate-300"}`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-black uppercase tracking-wider ${stage >= s.id ? "text-slate-900" : "text-slate-400"}`}
                    >
                      Giai đoạn {s.id}: {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                  {stage > s.id && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto self-center" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <Card className="bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50 rounded-3xl min-h-[600px] overflow-hidden flex flex-col relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

              <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-8 py-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900">
                    Luồng Xử lý Chi tiết
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    Visualizing OIDC sequence actions in real-time.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Server className="w-3 h-3 text-indigo-600" /> Auth Backend
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 flex flex-col">
                <AnimatePresence mode="wait">
                  {stage === 1 && !flowData && (
                    <motion.div
                      key="init"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-10"
                    >
                      <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200">
                        <Key className="w-12 h-12 text-white" />
                      </div>
                      <div className="max-w-md space-y-4">
                        <h2 className="text-3xl font-black text-slate-900">
                          Khởi tạo yêu cầu
                        </h2>
                        <p className="text-slate-600 text-md font-medium leading-relaxed">
                          Hệ thống sẽ tạo mã{" "}
                          <span className="text-indigo-600 font-bold underline decoration-indigo-200">
                            state
                          </span>{" "}
                          ngẫu nhiên để chống CSRF và áp dụng{" "}
                          <span className="text-purple-600 font-bold underline decoration-purple-200">
                            PKCE
                          </span>{" "}
                          để bảo mật tuyệt đối cho Client-side.
                        </p>
                      </div>
                      <div className="flex flex-col gap-5 w-full max-w-sm">
                        <div className="flex gap-4">
                          <Button
                            disabled={loading}
                            onClick={() => startFlow("google")}
                            className="flex-1 bg-slate-900 text-white hover:bg-slate-800 h-14 rounded-2xl font-bold shadow-lg shadow-slate-200"
                          >
                            {loading && !isSimulated ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Real Google
                          </Button>
                          <Button
                            disabled={loading}
                            onClick={() => startFlow("github")}
                            variant="outline"
                            className="flex-1 bg-white border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 h-14 rounded-2xl font-bold transition-all"
                          >
                            Real GitHub
                          </Button>
                        </div>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100" />
                          </div>
                          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400">
                            <span className="bg-white px-3">
                              Recommended for demo
                            </span>
                          </div>
                        </div>

                        <Button
                          disabled={loading}
                          onClick={() => startFlow("mock")}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 rounded-2xl font-black shadow-xl shadow-indigo-100 gap-3 text-lg"
                        >
                          {loading && isSimulated ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Zap className="w-5 h-5" />
                          )}
                          Simulate Detailed Sequence
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {stage === 1 && flowData && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col p-10 space-y-10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center border-2 border-emerald-200">
                          <Code2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                          Step 1: Proof Generation
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 space-y-3">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            State & Nonce
                          </span>
                          <div className="font-mono text-xs text-indigo-700 break-all bg-white p-4 rounded-xl border border-slate-100 shadow-sm leading-relaxed">
                            <span className="opacity-50">state:</span>{" "}
                            {flowData.state}
                            <div className="h-2" />
                            <span className="opacity-50">nonce:</span>{" "}
                            {flowData.nonce}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 space-y-3">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            PKCE Details
                          </span>
                          <div className="font-mono text-xs text-amber-700 break-all bg-white p-4 rounded-xl border border-slate-100 shadow-sm leading-relaxed">
                            <span className="opacity-50">verifier:</span>{" "}
                            {flowData.code_verifier.substring(0, 20)}...
                            <div className="h-2" />
                            <span className="opacity-50">challenge:</span>{" "}
                            {flowData.code_challenge.substring(0, 20)}
                            ...
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-8">
                        <div className="relative">
                          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-indigo-400" />
                          </div>
                        </div>
                        <p className="text-lg font-bold text-slate-900 animate-pulse">
                          Redirecting to Identity Provider...
                        </p>
                      </div>

                      <div className="p-6 bg-slate-900 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                            Secure Database Transaction
                          </span>
                        </div>
                        <code className="text-[12px] text-slate-300 font-mono leading-relaxed">
                          <span className="text-purple-400">INSERT INTO</span>{" "}
                          oidc_flows (state, nonce, code_verifier, expires_at)
                          <br />
                          <span className="text-purple-400">VALUES</span> (
                          <span className="text-amber-300">
                            '{flowData.state.substring(0, 8)}...'
                          </span>
                          ,{" "}
                          <span className="text-amber-300">
                            '{flowData.nonce.substring(0, 8)}...'
                          </span>
                          , ...);
                        </code>
                      </div>
                    </motion.div>
                  )}

                  {stage === 2 && (
                    <motion.div
                      key="stage2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col p-12 space-y-10 items-center justify-center text-center"
                    >
                      <div className="relative">
                        <div className="w-28 h-24 rounded-full bg-blue-50 border-4 border-white shadow-2xl flex items-center justify-center relative z-10">
                          <Globe className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-full border-4 border-white flex items-center justify-center text-sm font-black shadow-lg z-20">
                          2
                        </div>
                        <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
                      </div>

                      <div className="space-y-4 max-w-sm">
                        <h2 className="text-3xl font-black text-slate-900">
                          Stage 2: Provider Interaction
                        </h2>
                        <p className="text-slate-600 font-medium leading-relaxed">
                          {isSimulated
                            ? "Mô phỏng: Người dùng đang thực hiện xác thực và cấp quyền truy cập các phạm vi (scopes) tại trang của Provider."
                            : "Người dùng đang xác thực danh tính tại Identity Provider."}
                        </p>
                      </div>

                      <div className="w-full max-w-md p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                          <span className="text-slate-400">
                            Provider Status
                          </span>
                          <span className="text-blue-600">
                            Validating Credentials...
                          </span>
                        </div>
                        <div className="h-3 w-full bg-white border border-slate-100 rounded-full overflow-hidden p-0.5">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      </div>

                      {isSimulated && (
                        <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">
                          Receiving Auth Code & State...
                        </p>
                      )}
                    </motion.div>
                  )}

                  {stage === 3 && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col p-10 space-y-10"
                    >
                      <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </div>
                          <h3 className="font-black text-emerald-900 uppercase tracking-widest text-xs">
                            Auth Completed Successfully
                          </h3>
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
                          STAGE 3 FINALIZED
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                              User Identification
                            </h4>
                            <div className="flex items-center gap-5 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                                {userEmail?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <div className="text-lg font-black text-slate-900">
                                  {userEmail || "anonymous@example.com"}
                                </div>
                                <div className="text-xs text-indigo-600 font-black uppercase tracking-widest mt-1">
                                  Verified via {provider || "Mock"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl space-y-4 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Internal Server Verification
                            </h4>
                            <div className="space-y-3">
                              {[
                                {
                                  label: "ID Token Signature",
                                  status: "Verified",
                                },
                                { label: "Nonce match", status: "Matched" },
                                {
                                  label: "PKCE Challenge Pair",
                                  status: "SHA256 Match",
                                },
                              ].map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs font-bold border-b border-slate-50 pb-2 last:border-0 last:pb-0"
                                >
                                  <span className="text-slate-500">
                                    {item.label}
                                  </span>
                                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                    {item.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="p-8 bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-center space-y-5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                            <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                              <Lock className="w-10 h-10 text-indigo-400" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-lg font-black text-white tracking-tight">
                                HttpOnly Session Created
                              </h4>
                              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                Session token is now stored in a secure cookie,
                                protected from JavaScript theft.
                              </p>
                            </div>
                          </div>

                          <Button
                            asChild
                            className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02]"
                          >
                            <Link href="/dashboard">
                              Vào Dashboard
                              <ArrowRight className="w-6 h-6 ml-3" />
                            </Link>
                          </Button>

                          <Button
                            onClick={() => router.push("/demo/oidc-sequence")}
                            variant="ghost"
                            className="w-full text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] h-12"
                          >
                            Reset and Try Again
                          </Button>
                        </div>
                      </div>

                      <div className="mt-auto p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Database className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                              Database Final state
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 line-clamp-2">
                            INSERT INTO users (...) ON CONFLICT UPDATE; DELETE
                            FROM oidc_flows WHERE state = '
                            {flowData?.state || "used_state"}';
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Log Panel & HTTP Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col overflow-hidden h-[400px]">
          <div className="p-6 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                Server Logs (Internal)
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
          </div>
          <div className="p-6 overflow-auto font-mono text-[11px] flex-1 space-y-3 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent)]">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 italic font-medium">
                No logs generated. Initiate authentication to begin.
              </div>
            ) : (
              logs.map((L, i) => (
                <div
                  key={i}
                  className={`flex gap-4 animate-in fade-in slide-in-from-left-2 duration-500`}
                >
                  <span className="text-slate-600 font-bold">{L.time}</span>
                  <span
                    className={
                      L.type === "req"
                        ? "text-indigo-400"
                        : L.type === "db"
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }
                  >
                    <span className="opacity-50 mr-2">
                      {L.type === "req" ? ">>" : L.type === "db" ? "##" : "<<"}
                    </span>
                    {L.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl flex flex-col overflow-hidden h-[400px]">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              HTTP Inspector
            </span>
          </div>
          <div className="p-6 overflow-auto font-mono text-[11px] flex-1 space-y-6 custom-scrollbar">
            {lastRequest ? (
              <>
                <div className="space-y-3">
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg inline-block text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                    Latest Outgoing Request
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="mb-3 font-black text-slate-900 border-b border-slate-200 pb-2">
                      {lastRequest.method}{" "}
                      <span className="text-indigo-600">{lastRequest.url}</span>
                    </div>
                    {lastRequest.body && (
                      <pre className="text-slate-600 font-medium whitespace-pre-wrap">
                        {JSON.stringify(lastRequest.body, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
                {lastResponse && (
                  <div className="space-y-3">
                    <div className="bg-emerald-600 text-white px-3 py-1 rounded-lg inline-block text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">
                      Incoming Response
                    </div>
                    <pre className="text-slate-600 font-medium bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm whitespace-pre-wrap">
                      {JSON.stringify(lastResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <BookOpen className="w-12 h-12 opacity-20" />
                <p className="italic font-medium text-xs">
                  Waiting for HTTP traffic simulation...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Glossary Section */}
      <section className="pt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Info className="w-6 h-6 text-slate-900" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Giải thích thuật ngữ
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {glossary.map((g, idx) => (
            <Card
              key={idx}
              className="bg-white border-2 border-slate-50 hover:border-indigo-100 transition-all rounded-3xl p-6 group"
            >
              <h3 className="text-lg font-black text-indigo-600 mb-2 group-hover:translate-x-1 transition-transform">
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

export default function OidcSequencePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Nav />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/20 to-transparent pointer-events-none" />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">
            <Loader2 className="w-6 h-6 animate-spin mr-3 text-indigo-600" />
            Loading flow sequencer...
          </div>
        }
      >
        <SequenceFlowContent />
      </Suspense>
    </div>
  );
}
