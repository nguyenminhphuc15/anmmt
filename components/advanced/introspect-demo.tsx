"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Activity,
  Lock,
  Unlock,
  AlertCircle,
  Database,
  Terminal,
} from "lucide-react";

export default function IntrospectDemo() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleIntrospect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/introspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-amber-400">
          Token Introspection (RFC 7662)
        </h3>
        <span className="text-[10px] px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded uppercase font-bold text-amber-400">
          Resource Server Check
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
              <Lock className="w-4 h-4" /> <span>Hỏi Auth Server về Token</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Resource Server gửi token nhận được từ Client tới endpoint{" "}
              <code>/introspect</code> để xem nó có còn hoạt động hay không.
            </p>

            <div className="space-y-3">
              <Input
                placeholder="Dán Access Token vào đây..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="glass border-white/10 text-xs"
              />
              <Button
                onClick={handleIntrospect}
                disabled={!token || loading}
                className="w-full bg-amber-600 hover:bg-amber-500 gap-2"
              >
                <Search className="w-4 h-4" /> Kiểm tra trạng thái Token
              </Button>
            </div>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-[10px]">
              <Activity className="w-3 h-3" /> USE CASE
            </div>
            <p className="text-[10px] text-slate-500">
              Dùng cho Opaque Tokens hoặc khi cần kiểm tra trạng thái Revocation
              realtime mà không cần database lookup tại Resource Server.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {!result ? (
            <div className="h-full min-h-[250px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600">
              <Database className="w-10 h-10 mb-4 opacity-20" />
              <p className="text-sm italic">Nhập token và nhấn kiểm tra</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div
                className={`p-6 rounded-3xl border ${result.active ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"} flex items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${result.active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                  >
                    {result.active ? (
                      <Unlock className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`font-bold ${result.active ? "text-green-400" : "text-red-400"}`}
                    >
                      Token is {result.active ? "ACTIVE" : "INACTIVE"}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {result.active
                        ? "Token hợp lệ và chưa hết hạn"
                        : result.reason ||
                          "Token không tồn tại hoặc đã bị thu hồi"}
                    </p>
                  </div>
                </div>
                {result.active && (
                  <div className="text-[10px] px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20 font-bold">
                    200 OK
                  </div>
                )}
              </div>

              <div className="glass-darker p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <Terminal className="w-3 h-3" /> Introspection Response JSON
                </div>
                <pre className="bg-black/40 p-4 rounded-xl border border-white/5 text-[11px] text-slate-400 overflow-auto max-h-[300px]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
