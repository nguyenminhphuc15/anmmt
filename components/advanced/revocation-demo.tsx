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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-red-400">
          Token Revocation (RFC 7009)
        </h3>
        <Button
          size="sm"
          onClick={issueTokens}
          className="bg-red-600 hover:bg-red-500 gap-2"
        >
          <RotateCcw className="w-3 h-3" /> Cấp Token mới
        </Button>
      </div>

      {tokens.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600 space-y-4">
          <Key className="w-10 h-10 opacity-20" />
          <p className="text-sm">
            Nhấn nút bên trên để giả lập phát hành Tokens
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-2">
              Token Wallet
            </h4>
            {tokens.map((t, i) => (
              <motion.div
                key={i}
                layout
                className={`glass p-5 rounded-2xl border ${t.revoked ? "border-red-500/20 bg-red-500/5" : "border-white/5"} transition-colors relative overflow-hidden`}
              >
                {t.revoked && (
                  <div className="absolute inset-x-0 top-1/2 h-px bg-red-500/40 -rotate-2 z-10" />
                )}
                <div className="flex items-center justify-between gap-4 relative z-20">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.revoked ? "bg-red-500/10 text-red-500/40" : "bg-indigo-500/10 text-indigo-400"}`}
                    >
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div
                        className={`text-xs font-bold ${t.revoked ? "text-red-400/50" : "text-slate-200"}`}
                      >
                        {t.type}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate w-32">
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
                          className="h-9 w-9 text-slate-500 hover:text-slate-200 hover:bg-white/5"
                          onClick={() => testAccess(t.val)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleRevoke(i)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="text-[9px] font-bold text-red-500/60 uppercase px-2 py-1 bg-red-500/10 rounded border border-red-500/20">
                        Revoked
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <p className="text-[10px] text-slate-600 italic px-2">
              Nhấn dấu check để gọi Resource API bằng Token tương ứng.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-2">
              Resource Server Logs
            </h4>
            <div className="glass-darker p-6 rounded-3xl border border-white/5 min-h-[300px] flex flex-col h-full font-mono text-[11px]">
              <AnimatePresence mode="wait">
                {!testResult ? (
                  <div className="h-full flex items-center justify-center text-slate-700 italic">
                    No Activity Logged
                  </div>
                ) : (
                  <motion.div
                    key={testResult.target}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-indigo-400">
                      <span>
                        {">"} Incoming Request with Token {testResult.target}
                      </span>
                    </div>
                    <div className="text-slate-500 italic">
                      {"//"} Server checking revocation list in SQLite...
                    </div>

                    <div
                      className={`p-4 rounded-xl border ${testResult.status === 200 ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"} space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${testResult.status === 200 ? "text-green-400" : "text-red-400"}`}
                        >
                          HTTP {testResult.status}{" "}
                          {testResult.status === 200 ? "OK" : "Unauthorized"}
                        </span>
                        {testResult.status === 401 && (
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <pre className="text-[10px] text-slate-400 overflow-auto">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
