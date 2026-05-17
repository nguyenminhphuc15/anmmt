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
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Token Introspection (RFC 7662)
          </h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Real-time Token Validation
          </p>
        </div>
        <span className="text-[10px] px-4 py-1.5 bg-amber-600 text-white rounded-full uppercase font-black tracking-widest shadow-lg shadow-amber-100">
          Resource Server Check
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-slate-900 font-black text-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-600" />
              </div>
              <span>Hỏi Auth Server về Token</span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Resource Server (API) gửi token nhận được từ Client tới endpoint{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-700">
                /introspect
              </code>{" "}
              để xem nó có còn hoạt động hay không.
            </p>

            <div className="space-y-4">
              <Input
                placeholder="Dán Access Token vào đây..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="h-14 rounded-2xl border-2 border-slate-100 focus:border-amber-600 font-medium px-6 transition-all"
              />
              <Button
                onClick={handleIntrospect}
                disabled={!token || loading}
                className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-lg gap-3 shadow-xl shadow-amber-100 transition-all active:scale-[0.98]"
              >
                <Search className="w-5 h-5" /> Kiểm tra trạng thái
              </Button>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[28px] shadow-xl relative overflow-hidden group font-medium">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full" />
            <div className="flex items-center gap-3 text-amber-400 font-black text-[10px] uppercase tracking-widest relative z-10 mb-2">
              <Activity className="w-4 h-4" /> Professional USE CASE
            </div>
            <p className="text-xs text-slate-400 leading-relaxed relative z-10">
              Dùng cho **Opaque Tokens** (thẻ tham chiếu) hoặc khi cần kiểm tra
              trạng thái **Revocation** ngay lập tức mà không cần cache tại
              Resource Server.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {!result ? (
            <div className="h-full min-h-[400px] border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center text-slate-400 group-hover:border-indigo-100 transition-colors">
              <Database className="w-16 h-16 mb-6 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest">
                Awaiting Token Input
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div
                className={`p-8 rounded-[32px] border-2 shadow-xl ${result.active ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"} flex items-center justify-between`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${result.active ? "bg-white text-emerald-600" : "bg-white text-red-600"}`}
                  >
                    {result.active ? (
                      <Unlock className="w-8 h-8" />
                    ) : (
                      <Lock className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-xl font-black ${result.active ? "text-emerald-700" : "text-red-700"}`}
                    >
                      Token is {result.active ? "ACTIVE" : "INACTIVE"}
                    </h4>
                    <p className="text-sm font-medium text-slate-600 mt-1">
                      {result.active
                        ? "Token hợp lệ, chữ ký chuẩn và còn hiệu lực."
                        : result.reason ||
                          "Token đã hết hạn hoặc bị thu hồi khỏi hệ thống."}
                    </p>
                  </div>
                </div>
                {result.active && (
                  <div className="text-[10px] px-4 py-1.5 bg-emerald-600 text-white rounded-full font-black uppercase tracking-widest">
                    Verified
                  </div>
                )}
              </div>

              <div className="bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                      Response Data
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <pre className="text-[12px] text-slate-300 font-mono overflow-auto max-h-[350px] leading-relaxed custom-scrollbar">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
