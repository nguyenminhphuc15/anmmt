"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Key,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Lock,
} from "lucide-react";

export default function RevocationDemo() {
  const [tokens, setTokens] = useState<
    { type: string; val: string; revoked: boolean }[]
  >([]);
  const [testResult, setTestResult] = useState<any>(null);

  const issueTokens = async () => {
    // We just reuse OIDC to get a fresh JWT for demo
    const res = await fetch("/api/auth/oidc/authorize?scope=openid");
    const json = await res.json();
    setTokens([
      { type: "Access Token", val: json.access_token, revoked: false },
      { type: "ID Token (JWT)", val: json.id_token, revoked: false },
    ]);
    setTestResult(null);
  };

  const handleRevoke = async (index: number) => {
    const tokenToRevoke = tokens[index];
    const res = await fetch("/api/auth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tokenToRevoke.val }),
    });

    if (res.ok) {
      const newTokens = [...tokens];
      newTokens[index].revoked = true;
      setTokens(newTokens);
    }
  };

  const testAccess = async (token: string) => {
    const res = await fetch("/api/auth/protected-resource", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setTestResult({
      status: res.status,
      ...json,
      target: token.substring(0, 10) + "...",
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Token Revocation (RFC 7009)
          </h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Lifecycle Termination
          </p>
        </div>
        <Button
          onClick={issueTokens}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black px-6 h-12 shadow-xl shadow-indigo-100 gap-3"
        >
          <RotateCcw className="w-5 h-5" /> Phát hành Token mới
        </Button>
      </div>

      {tokens.length === 0 ? (
        <div className="h-80 border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center text-slate-400 space-y-6">
          <Key className="w-16 h-16 opacity-20" />
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest">
              No active tokens
            </p>
            <p className="text-xs font-medium text-slate-400 mt-2">
              Nhấn nút bên trên để giả lập phiên làm việc mới
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
              Vault: Active Sessions
            </h4>
            <div className="space-y-4">
              {tokens.map((t, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-6 rounded-[24px] border-2 shadow-sm transition-all relative overflow-hidden ${t.revoked ? "border-red-100 bg-red-50/30" : "border-slate-100 bg-white"}`}
                >
                  {t.revoked && (
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-200/50 -rotate-2 z-10" />
                  )}
                  <div className="flex items-center justify-between gap-4 relative z-20">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${t.revoked ? "bg-red-100 text-red-400" : "bg-indigo-50 text-indigo-600"}`}
                      >
                        <Lock className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`text-sm font-black ${t.revoked ? "text-red-400" : "text-slate-900"}`}
                        >
                          {t.type}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate w-40">
                          {t.val}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!t.revoked ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-100 transition-all"
                            onClick={() => testAccess(t.val)}
                            title="Verify Access"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                            onClick={() => handleRevoke(i)}
                            title="Revoke Token"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </>
                      ) : (
                        <div className="text-[10px] font-black text-red-600 uppercase px-3 py-1 bg-red-100/50 rounded-full border border-red-200">
                          Revoked
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-medium italic pl-2">
              Mô phỏng: Dùng nút Check để gọi API, dùng nút Thùng rác để thu hồi
              Token.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
              RS Monitor
            </h4>
            <div className="bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl min-h-[350px] flex flex-col overflow-hidden">
              <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 px-6 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Inbound Traffic Log
                </span>
              </div>
              <div className="p-8 font-mono text-[11px] leading-relaxed flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                  {!testResult ? (
                    <div className="h-full flex items-center justify-center text-slate-600 italic font-medium">
                      // Monitoring headers for Authorization bearer...
                    </div>
                  ) : (
                    <motion.div
                      key={testResult.target}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 text-indigo-400 font-bold">
                        <span className="opacity-50">{">"}</span>
                        <span>API Request: Bearer {testResult.target}</span>
                      </div>

                      <div className="text-slate-500 italic pl-6 border-l border-slate-800">
                        {"//"} Checking Revocation database in SQLite...
                      </div>

                      <div
                        className={`p-6 rounded-[24px] border-2 shadow-lg ${testResult.status === 200 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"} space-y-4`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-base font-black ${testResult.status === 200 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            HTTP {testResult.status}{" "}
                            {testResult.status === 200 ? "OK" : "Unauthorized"}
                          </span>
                          {testResult.status === 401 && (
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <pre className="text-[10px] text-slate-300 bg-black/30 p-4 rounded-xl border border-white/5 overflow-auto max-h-[200px]">
                          {JSON.stringify(testResult, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
