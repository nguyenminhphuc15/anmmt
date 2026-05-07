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

      // After redirect, we can't reliably know the EXACT state unless we fetch it
      // But we can show what the exchange would look like in the inspector
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
        // Simulate Stage 2 and 3
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
        // Real Redirect
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
      color: "text-indigo-400",
    },
    {
      id: 2,
      title: "Tương tác Provider",
      desc: "Đăng nhập & cấp quyền tại Provider",
      icon: Globe,
      color: "text-blue-400",
    },
    {
      id: 3,
      title: "Trao đổi & Verify",
      desc: "Exchange code và xác thực ID Token",
      icon: ShieldCheck,
      color: "text-green-400",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-glow mb-2">
              OIDC Deep-Dive
            </h1>
            <p className="text-slate-400 text-sm">
              Chi tiết từng bước theo luồng sequenceDiagram chuẩn PKCE.
            </p>
          </div>

          <div className="space-y-4">
            {stages.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border transition-all duration-500 flex gap-4 ${
                  stage === s.id
                    ? "bg-white/5 border-indigo-500/30 ring-1 ring-indigo-500/20"
                    : stage > s.id
                      ? "bg-green-500/5 border-green-500/20 opacity-80"
                      : "bg-white/[0.02] border-white/5 opacity-40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border ${stage >= s.id ? "border-indigo-500/50" : "border-white/5"}`}
                >
                  <s.icon
                    className={`w-5 h-5 ${stage >= s.id ? s.color : "text-slate-600"}`}
                  />
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold ${stage >= s.id ? "text-slate-100" : "text-slate-500"}`}
                  >
                    Giai đoạn {s.id}: {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {s.desc}
                  </p>
                </div>
                {stage > s.id && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto self-center" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <Card className="glass border-white/5 min-h-[600px] overflow-hidden flex flex-col relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            <CardHeader className="border-b border-white/5 bg-white/[0.01] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Luồng Xử lý Chi tiết</CardTitle>
                <CardDescription>
                  Visualizing sequence diagram actions in real-time.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-[10px] font-mono text-slate-400">
                <Server className="w-3 h-3" /> AuthFlow Backend (Next.js)
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
                    className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/20">
                      <Key className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div className="max-w-md space-y-4">
                      <h2 className="text-2xl font-bold">Khởi tạo yêu cầu</h2>
                      <p className="text-slate-400 text-sm italic leading-relaxed">
                        Hệ thống sẽ tạo mã state ngẫu nhiên để chống CSRF và áp
                        dụng Proof Key for Code Exchange (PKCE) để bảo mật tuyệt
                        đối.
                      </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full max-w-sm">
                      <div className="flex gap-2">
                        <Button
                          disabled={loading}
                          onClick={() => startFlow("google")}
                          className="flex-1 bg-white text-black hover:bg-slate-200 h-10 text-xs"
                        >
                          {loading && !isSimulated ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-2" />
                          ) : null}
                          Real Google
                        </Button>
                        <Button
                          disabled={loading}
                          onClick={() => startFlow("github")}
                          variant="outline"
                          className="flex-1 glass h-10 border-white/10 text-xs"
                        >
                          Real GitHub
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-[9px] uppercase font-bold text-slate-600">
                          <span className="bg-[#0a0a0f] px-2">
                            Recommended for demo
                          </span>
                        </div>
                      </div>

                      <Button
                        disabled={loading}
                        onClick={() => startFlow("mock")}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 shadow-lg shadow-indigo-500/20 gap-2"
                      >
                        {loading && isSimulated ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
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
                    className="flex-1 flex flex-col p-8 space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <Code2 className="w-4 h-4 text-green-400" />
                      </div>
                      <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                        Step 1: Proof Generation
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-darker p-4 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          State & Nonce
                        </span>
                        <div className="font-mono text-[10px] text-indigo-300 break-all bg-black/40 p-2 rounded">
                          state: {flowData.state}
                          <br />
                          nonce: {flowData.nonce}
                        </div>
                      </div>
                      <div className="glass-darker p-4 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          PKCE Details
                        </span>
                        <div className="font-mono text-[10px] text-amber-300 break-all bg-black/40 p-2 rounded">
                          verifier: {flowData.code_verifier.substring(0, 20)}...
                          <br />
                          challenge: {flowData.code_challenge.substring(0, 20)}
                          ...
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                      <p className="text-sm text-slate-400 animate-pulse">
                        Redirecting to Identity Provider...
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          SQLite Update
                        </span>
                      </div>
                      <code className="text-[10px] text-slate-300 font-mono">
                        INSERT INTO oidc_flows (state, nonce, code_verifier,
                        expires_at) VALUES (...)
                      </code>
                    </div>
                  </motion.div>
                )}

                {stage === 2 && (
                  <motion.div
                    key="stage2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col p-8 space-y-8 items-center justify-center text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 relative">
                      <Globe className="w-10 h-10 text-blue-400" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                        2
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold">
                        Stage 2: Provider Interaction
                      </h2>
                      <p className="text-slate-400 text-sm max-w-sm">
                        {isSimulated
                          ? "Mô phỏng: Người dùng đang đăng nhập và chấp thuận quyền truy cập tại trang của Provider."
                          : "Người dùng đang thực hiện xác thực tại Identity Provider."}
                      </p>
                    </div>

                    <div className="w-full max-w-md p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Provider Action</span>
                        <span className="text-blue-400 font-mono">
                          Storing code_challenge...
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </div>
                    </div>

                    {isSimulated && (
                      <p className="text-[10px] text-slate-500 animate-pulse font-mono">
                        Receiving Authorization Code & State back from
                        Provider...
                      </p>
                    )}
                  </motion.div>
                )}

                {stage === 3 && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col p-8 space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </div>
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                          Auth Completed Successfully
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                        STAGE 3 COMPLETED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-300">
                            User Identification
                          </h4>
                          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                              {userEmail?.[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-100">
                                {userEmail}
                              </div>
                              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                                Verified via {provider}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase">
                            Server Internal Verification
                          </h4>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">
                                ID Token Signature
                              </span>
                              <span className="text-green-500 font-bold">
                                Verified
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">
                                Nonce match
                              </span>
                              <span className="text-green-500 font-bold">
                                Matched
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">
                                PKCE Challenge-Verifier match
                              </span>
                              <span className="text-green-500 font-bold">
                                SHA256 Match
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex flex-col items-center justify-center text-center space-y-4">
                          <Lock className="w-10 h-10 text-indigo-400" />
                          <h4 className="text-sm font-bold">
                            HttpOnly Session Created
                          </h4>
                          <p className="text-[11px] text-slate-400 italic">
                            User is now logged in. The session token is stored
                            in a secure cookie, inaccessible via JavaScript.
                          </p>
                        </div>
                        <Button
                          asChild
                          className="w-full bg-white text-black hover:bg-slate-200"
                        >
                          <Link href="/dashboard">
                            Vào Dashboard{" "}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        <Button
                          onClick={() => router.push("/demo/oidc-sequence")}
                          variant="ghost"
                          className="w-full text-slate-500 text-xs hover:text-slate-300"
                        >
                          Reset and Try Again
                        </Button>
                      </div>
                    </div>

                    <div className="mt-auto p-4 bg-slate-900/50 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">
                          Database Final state
                        </span>
                      </div>
                      <div className="font-mono text-[9px] text-slate-500">
                        INSERT INTO users (...) ON CONFLICT UPDATE;
                        <br />
                        DELETE FROM oidc_flows WHERE state = '
                        {flowData?.state || "used_state"}';
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Panel & HTTP Inspector */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Server Logs */}
        <div className="glass-darker rounded-[24px] border border-white/5 flex flex-col overflow-hidden h-[300px]">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Server Logs (Simulated)
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-amber-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
          </div>
          <div className="p-4 overflow-auto font-mono text-[10px] flex-1 space-y-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-700 italic">
                No logs yet. Start the flow to see activity.
              </div>
            ) : (
              logs.map((L, i) => (
                <div
                  key={i}
                  className={`flex gap-3 animate-in fade-in slide-in-from-left-1 duration-300`}
                >
                  <span className="text-slate-600">
                    [{new Date().toLocaleTimeString()}]
                  </span>
                  <span
                    className={
                      L.type === "req"
                        ? "text-indigo-400"
                        : L.type === "db"
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }
                  >
                    {L.type === "req" ? ">>" : L.type === "db" ? "##" : "<<"}{" "}
                    {L.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* HTTP Inspector */}
        <div className="glass-darker rounded-[24px] border border-white/5 flex flex-col overflow-hidden h-[300px]">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              HTTP Request / Response Inspector
            </span>
          </div>
          <div className="p-4 overflow-auto font-mono text-[9px] flex-1 space-y-4 custom-scrollbar">
            {lastRequest && (
              <div className="space-y-2">
                <div className="bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded inline-block text-[8px] font-bold uppercase">
                  Last Request
                </div>
                <div className="text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="mb-2 font-bold">
                    {lastRequest.method} {lastRequest.url}
                  </div>
                  {lastRequest.body && (
                    <pre className="text-slate-400 overflow-hidden text-ellipsis">
                      {JSON.stringify(lastRequest.body, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
            {lastResponse && (
              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded inline-block text-[8px] font-bold uppercase">
                  Last Response
                </div>
                <pre className="text-slate-400 bg-black/20 p-3 rounded-lg border border-white/5">
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            )}
            {!lastRequest && (
              <div className="h-full flex items-center justify-center text-slate-700 italic text-[10px]">
                Perform an action to inspect traffic
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OidcSequencePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <Nav />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Loading flow sequencer...
          </div>
        }
      >
        <SequenceFlowContent />
      </Suspense>
      <footer className="py-10 border-t border-white/5 text-center text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
        OIDC / PKCE Sequence Diagram Demo Implementation
      </footer>
    </div>
  );
}
