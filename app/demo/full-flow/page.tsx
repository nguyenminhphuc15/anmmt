"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Cpu,
  ShieldCheck,
  Key,
  RefreshCcw,
  Search,
  Lock,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Database,
  User,
  Clock,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import { Button } from "@/components/ui/button";

interface Step {
  id: number;
  title: string;
  actor: string;
  desc: string;
  color: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Client khởi tạo PKCE",
    actor: "Browser",
    desc: "Tạo code_verifier và code_challenge (S256).",
    color: "text-indigo-400",
  },
  {
    id: 2,
    title: "Yêu cầu Cấp phép",
    actor: "Client → Auth Server",
    desc: "Gửi authorization request kèm PKCE challenge.",
    color: "text-blue-400",
  },
  {
    id: 3,
    title: "Người dùng đồng ý",
    actor: "User → Auth Server",
    desc: "Server tạo Auth Code (one-time) lưu vào DB.",
    color: "text-amber-400",
  },
  {
    id: 4,
    title: "Đổi Token",
    actor: "Client → Auth Server",
    desc: "Gửi Code + Verifier. Server tính hash đối chiếu challenge.",
    color: "text-indigo-400",
  },
  {
    id: 5,
    title: "Truy cập API",
    actor: "Client → Resource Server",
    desc: "Dùng Access Token gọi API bảo vệ.",
    color: "text-green-400",
  },
  {
    id: 6,
    title: "Xác minh Token",
    actor: "RS → Auth Server",
    desc: "Introspection: kiểm tra trạng thái token realtime.",
    color: "text-indigo-400",
  },
  {
    id: 7,
    title: "Mô phỏng Hết hạn",
    actor: "System",
    desc: "Access Token hết hiệu lực (401 Unauthorized).",
    color: "text-orange-400",
  },
  {
    id: 8,
    title: "Refresh Token",
    actor: "Client → Auth Server",
    desc: "Dùng Refresh Token đổi cặp Token mới (Rotation).",
    color: "text-blue-400",
  },
  {
    id: 9,
    title: "Truy cập thành công",
    actor: "Client → RS",
    desc: "Dùng token mới để tiếp tục phiên làm việc.",
    color: "text-green-400",
  },
  {
    id: 10,
    title: "Thu hồi Token",
    actor: "Client → Auth Server",
    desc: "Đăng xuất: Xoá token khỏi DB (Revocation).",
    color: "text-red-400",
  },
  {
    id: 11,
    title: "Bị chặn truy cập",
    actor: "RS",
    desc: "Thử dùng token cũ → Server chặn vì đã bị revoke.",
    color: "text-red-500",
  },
  {
    id: 12,
    title: "Hoàn tất",
    actor: "End",
    desc: "Hoàn thành chu kỳ sống của một session chuẩn bảo mật.",
    color: "text-slate-400",
  },
];

export default function FullFlowPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<any>({});
  const [verifier, setVerifier] = useState("");
  const [challenge, setChallenge] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [lastRequest, setLastRequest] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [logs, setLogs] = useState<
    { msg: string; type: "req" | "res" | "db" }[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: "req" | "res" | "db") => {
    setLogs((prev) => [...prev, { msg, type }]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Actions
  const initPkce = async () => {
    setLoading(true);
    setLastRequest({ method: "GET", url: "/api/auth/pkce/challenge" });
    const res = await fetch("/api/auth/pkce/challenge");
    const json = await res.json();
    setLastResponse(json);
    setVerifier(json.code_verifier);
    setChallenge(json.code_challenge);
    addLog(
      `Generated code_verifier: ${json.code_verifier.substring(0, 15)}...`,
      "req",
    );
    addLog(
      `Computed code_challenge: ${json.code_challenge.substring(0, 15)}...`,
      "req",
    );
    setLoading(false);
    setCurrentStep(2);
  };

  const getFullAuthorize = async () => {
    setLoading(true);
    const body = {
      code_challenge: challenge,
      email: "demo-user@flow.com",
    };
    setLastRequest({
      method: "POST",
      url: "/api/auth/full-flow/authorize",
      body,
    });
    addLog(`GET /authorize?challenge=${challenge}&scope=openid`, "req");
    const res = await fetch("/api/auth/full-flow/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setLastResponse(json);
    addLog(`DB: INSERT INTO auth_codes (code, challenge)`, "db");
    addLog(`Received Auth Code: ${json.code}`, "res");
    setAuthCode(json.code);
    setLoading(false);
    setCurrentStep(4); // Skip consent for speed in full flow
  };

  const exchangeToken = async () => {
    setLoading(true);
    const body = {
      code: authCode,
      code_verifier: verifier,
      client_id: "demo_client",
    };
    setLastRequest({ method: "POST", url: "/api/auth/full-flow/token", body });
    addLog(`POST /token (code=${authCode}, verifier=...)`, "req");
    const res = await fetch("/api/auth/full-flow/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setLastResponse(json);
    if (json.access_token) {
      addLog(`DB: SELECT FROM auth_codes -> PKCE VERIFY SUCCESS`, "db");
      addLog(`DB: DELETE code`, "db");
      addLog(`Received Access, Refresh, and ID Tokens`, "res");
      setTokens(json);
      setCurrentStep(5);
    } else {
      addLog(
        `Error: ${json.message || json.error || "Token exchange failed"}`,
        "res",
      );
    }
    setLoading(false);
  };

  const callProtected = async (tokenOverride?: string) => {
    const t = tokenOverride || tokens.access_token;
    setLastRequest({
      method: "GET",
      url: "/api/auth/protected-resource",
      headers: { Authorization: `Bearer ${t?.substring(0, 10)}...` },
    });
    addLog(`GET /protected-resource (Bearer ${t?.substring(0, 10)}...)`, "req");
    const res = await fetch("/api/auth/protected-resource", {
      headers: { Authorization: `Bearer ${t}` },
    });
    const json = await res.json();
    setLastResponse(json);
    setApiResponse({ status: res.status, data: json });
    addLog(`Response: ${res.status} ${res.statusText}`, "res");
    if (res.status === 200 && currentStep === 5) setCurrentStep(6);
    if (res.status === 401 && (currentStep === 7 || currentStep === 11)) {
      if (currentStep === 7) setCurrentStep(8);
      if (currentStep === 11) setCurrentStep(12);
    }
  };

  const introspect = async () => {
    const body = { token: tokens.access_token };
    setLastRequest({ method: "POST", url: "/api/auth/introspect", body });
    addLog(`POST /introspect (token=...)`, "req");
    const res = await fetch("/api/auth/introspect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setLastResponse(json);
    addLog(
      `RS Logic: Check DB revoked_tokens -> Status: ${json.active ? "ACTIVE" : "INACTIVE"}`,
      "db",
    );
    addLog(`Introspection result received`, "res");
    setCurrentStep(7);
  };

  const handleRefresh = async () => {
    setLoading(true);
    const body = { refresh_token: tokens.refresh_token };
    setLastRequest({
      method: "POST",
      url: "/api/auth/full-flow/refresh",
      body,
    });
    addLog(
      `POST /refresh (rt=${tokens.refresh_token?.substring(0, 8)}...)`,
      "req",
    );
    const res = await fetch("/api/auth/full-flow/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setLastResponse(json);
    if (json.access_token) {
      addLog(`DB: UPDATE refresh_tokens SET used=1`, "db");
      addLog(`DB: INSERT new refresh_token`, "db");
      addLog(`New Token Pair issued (Rotation)`, "res");
      setTokens(json);
      setCurrentStep(9);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const body = { token: tokens.access_token };
    setLastRequest({ method: "POST", url: "/api/auth/revoke", body });
    addLog(`POST /revoke (token=...)`, "req");
    const res = await fetch("/api/auth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setLastResponse(json);
    addLog(`DB: INSERT INTO revoked_tokens`, "db");
    addLog(`Session revoked locally and server-side`, "res");
    setCurrentStep(11);
    setLoading(false);
  };

  const simulateExpiry = () => {
    addLog(`Simulating passage of 15 minutes...`, "req");
    // Use an invalid dummy token for a 401
    const expiredToken = "expired_" + tokens.access_token;
    addLog(`Token expired. RS will reject.`, "db");
    callProtected(expiredToken);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Nav />
      <main className="flex-1 container mx-auto py-12 px-4 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Timeline Column */}
          <div className="xl:col-span-4 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-glow">Integrated Flow</h1>
              <p className="text-xs text-slate-500">
                Chu kỳ sống hoàn chỉnh (End-to-End Auth Lifecycle)
              </p>
            </div>

            <div className="relative space-y-1 pl-4 border-l border-white/5 pr-4 py-2">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={`relative pl-8 py-3 rounded-xl transition-all duration-300 ${currentStep === s.id ? "bg-indigo-500/10 border border-indigo-500/20" : "opacity-40"}`}
                >
                  <div
                    className={`absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 ${currentStep >= s.id ? "bg-indigo-500 border-indigo-400" : "bg-slate-800 border-slate-700"}`}
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-tight ${s.id <= currentStep ? s.color : "text-slate-600"}`}
                    >
                      {s.actor}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {s.title}
                    </span>
                    {currentStep === s.id && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        {s.desc}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interaction Column */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="glass p-8 rounded-[32px] border-white/5 flex-1 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Visual indicator for which step is active */}
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Active Step {currentStep} / 12
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 max-w-md w-full"
                >
                  {currentStep === 1 && (
                    <>
                      <Cpu className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold">
                        Bắt đầu luồng bảo mật
                      </h2>
                      <p className="text-slate-400 text-sm italic">
                        Hệ thống sẽ thực hiện PKCE tự động để bảo vệ mã code.
                      </p>
                      <Button
                        onClick={initPkce}
                        className="w-full bg-indigo-600 h-12 shadow-lg shadow-indigo-500/20"
                      >
                        Generate PKCE Bundle
                      </Button>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <Zap className="w-16 h-16 text-blue-400 mx-auto" />
                      <h2 className="text-2xl font-bold">
                        Authorization Request
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Gửi challenge và state tới server để xin cấp code.
                      </p>
                      <Button
                        onClick={getFullAuthorize}
                        className="w-full bg-blue-600 h-12"
                      >
                        Submit Auth Request
                      </Button>
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      <Key className="w-16 h-16 text-indigo-400 mx-auto" />
                      <h2 className="text-2xl font-bold">Exchange Bundle</h2>
                      <div className="p-4 bg-white/5 rounded-xl text-[11px] font-mono text-left space-y-1">
                        <div>code: {authCode}</div>
                        <div>verifier: {verifier.substring(0, 15)}...</div>
                      </div>
                      <Button
                        onClick={exchangeToken}
                        className="w-full bg-indigo-600 h-12"
                      >
                        Verify & Exchange
                      </Button>
                    </>
                  )}

                  {currentStep === 5 && (
                    <>
                      <Lock className="w-16 h-16 text-green-400 mx-auto" />
                      <h2 className="text-2xl font-bold">Token Active!</h2>
                      <p className="text-slate-400 text-sm">
                        Sử dụng Access Token để truy cập dữ liệu bảo mật.
                      </p>
                      <Button
                        onClick={() => callProtected()}
                        className="w-full bg-green-600 h-12"
                      >
                        Fetch Protected Data
                      </Button>
                    </>
                  )}

                  {currentStep === 6 && (
                    <>
                      <Search className="w-16 h-16 text-indigo-400 mx-auto" />
                      <h2 className="text-2xl font-bold">
                        Introspection Check
                      </h2>
                      <p className="text-slate-400 text-sm">
                        RS thực hiện kiểm tra token thô với Auth Server.
                      </p>
                      <Button
                        onClick={introspect}
                        className="w-full bg-indigo-600 h-12"
                      >
                        Introspect Token
                      </Button>
                    </>
                  )}

                  {currentStep === 7 && (
                    <>
                      <Clock className="w-16 h-16 text-orange-400 mx-auto" />
                      <h2 className="text-2xl font-bold">
                        Thời gian trôi qua...
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Giả sử Access Token đã hết hạn (expired).
                      </p>
                      <Button
                        onClick={simulateExpiry}
                        className="w-full bg-orange-600 h-12"
                      >
                        Simulate Expiry Flow
                      </Button>
                    </>
                  )}

                  {currentStep === 8 && (
                    <>
                      <RefreshCcw className="w-16 h-16 text-blue-400 mx-auto" />
                      <h2 className="text-2xl font-bold">
                        Refresh Token Exchange
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Hệ thống phát hiện 401 và tự động dùng Refresh Token.
                      </p>
                      <Button
                        onClick={handleRefresh}
                        className="w-full bg-blue-600 h-12"
                      >
                        Execute Token Rotation
                      </Button>
                    </>
                  )}

                  {currentStep === 9 && (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                      <h2 className="text-2xl font-bold">Sử dụng Token mới</h2>
                      <p className="text-slate-400 text-sm">
                        Mọi thứ đã được khôi phục, người dùng không cần đăng
                        nhập lại.
                      </p>
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => callProtected()}
                          className="flex-1 glass border-green-500/30"
                        >
                          Test Again
                        </Button>
                        <Button
                          onClick={() => setCurrentStep(10)}
                          className="flex-1 bg-green-600"
                        >
                          Proceed to Logout
                        </Button>
                      </div>
                    </>
                  )}

                  {currentStep === 10 && (
                    <>
                      <Trash2 className="w-16 h-16 text-red-400 mx-auto" />
                      <h2 className="text-2xl font-bold">Revoke Session</h2>
                      <p className="text-slate-400 text-sm">
                        Hủy bỏ toàn bộ quyền truy cập của các token này.
                      </p>
                      <Button
                        onClick={handleLogout}
                        className="w-full bg-red-600 h-12"
                      >
                        Logout / Revoke All
                      </Button>
                    </>
                  )}

                  {currentStep === 11 && (
                    <>
                      <ShieldCheck className="w-16 h-16 text-slate-500 mx-auto" />
                      <h2 className="text-2xl font-bold">Final Block Test</h2>
                      <p className="text-slate-400 text-sm">
                        Dùng Access Token cũ gọi API lần cuối.
                      </p>
                      <Button
                        onClick={() => callProtected()}
                        className="w-full bg-slate-700 h-12"
                      >
                        Send Invalid Request
                      </Button>
                      {apiResponse && apiResponse.status === 401 && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <Button
                            variant="link"
                            onClick={() => setCurrentStep(12)}
                            className="text-indigo-400 pt-4"
                          >
                            Proceed to Finish →
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {currentStep === 12 && (
                    <>
                      <User className="w-16 h-16 text-indigo-400 mx-auto" />
                      <h2 className="text-3xl font-bold text-glow">
                        Flow Complete!
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Bạn đã đi qua toàn bộ vòng đời của một Auth Session hiện
                        đại.
                      </p>
                      <Button asChild className="w-full bg-indigo-600 h-12">
                        <Link href="/">Hoàn tất & Quay về Home</Link>
                      </Button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Absolute Background element */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full" />
            </div>

            {/* Live Monitor / HTTP Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
              {/* Column 1: Logs */}
              <div className="glass-darker rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-indigo-400" /> Server Logs
                  </span>
                </div>
                <div
                  ref={scrollRef}
                  className="p-4 overflow-auto font-mono text-[10px] flex-1 space-y-1.5 custom-scrollbar"
                >
                  {logs.map((L, i) => (
                    <div
                      key={i}
                      className={
                        L.type === "req"
                          ? "text-indigo-300"
                          : L.type === "db"
                            ? "text-amber-500"
                            : "text-slate-400"
                      }
                    >
                      {L.type === "req" ? ">" : L.type === "db" ? "#" : "<"}{" "}
                      {L.msg}
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: HTTP Inspector */}
              <div className="glass-darker rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2">
                  <Search className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    HTTP Inspector
                  </span>
                </div>
                <div className="p-4 overflow-auto font-mono text-[9px] flex-1 space-y-4 custom-scrollbar">
                  {lastRequest && (
                    <div className="space-y-1.5">
                      <div className="text-blue-400 font-bold uppercase underline">
                        Last Request
                      </div>
                      <div className="text-slate-300">
                        {lastRequest.method} {lastRequest.url}
                      </div>
                      {lastRequest.body && (
                        <pre className="p-2 bg-indigo-500/5 border border-white/5 rounded text-indigo-300">
                          {JSON.stringify(lastRequest.body, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                  {lastResponse && (
                    <div className="space-y-1.5 border-t border-white/5 pt-4">
                      <div className="text-green-400 font-bold uppercase underline">
                        Last Response JSON
                      </div>
                      <pre className="p-2 bg-green-500/5 border border-white/5 rounded text-green-300">
                        {JSON.stringify(lastResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                  {!lastRequest && (
                    <div className="h-full flex items-center justify-center text-slate-700 italic">
                      Perform an action to inspect HTTP traffic
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Memory State */}
              <div className="glass-darker rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2">
                  <Database className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Memory State
                  </span>
                </div>
                <div className="p-4 space-y-4 font-mono text-[10px]">
                  <div className="space-y-1">
                    <div className="text-slate-500 uppercase font-bold text-[9px]">
                      Auth Code
                    </div>
                    <div className="text-amber-400/80 break-all bg-amber-500/5 p-2 rounded border border-amber-500/10">
                      {authCode || "null"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 uppercase font-bold text-[9px]">
                      Access Token
                    </div>
                    <div className="text-indigo-400/80 break-all bg-indigo-500/5 p-2 rounded border border-indigo-500/10">
                      {tokens.access_token
                        ? tokens.access_token.substring(0, 40) + "..."
                        : "null"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 uppercase font-bold text-[9px]">
                      Refresh Token
                    </div>
                    <div className="text-blue-400/80 break-all bg-blue-500/5 p-2 rounded border border-blue-500/10">
                      {tokens.refresh_token || "null"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          Interactive Auth Flow Documentation v1.0
        </p>
      </footer>
    </div>
  );
}
