"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  HardDrive,
  Cpu,
  StepForward,
  Terminal,
  CheckCircle2,
} from "lucide-react";

export default function PkceDemo() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<{
    code_verifier?: string;
    code_challenge?: string;
    valid?: boolean;
    server_response?: any;
  }>({});
  const [loading, setLoading] = useState(false);

  const generateChallenge = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/pkce/challenge");
    const json = await res.json();
    setData(json);
    setLoading(false);
    setStep(2);
  };

  const verifyVerifier = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/pkce/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code_verifier: data.code_verifier }),
    });
    const json = await res.json();
    setData({ ...data, valid: json.valid, server_response: json });
    setLoading(false);
    setStep(4);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            PKCE Extension (RFC 7636)
          </h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Proof Key for Code Exchange
          </p>
        </div>
        <span className="text-[10px] px-4 py-1.5 bg-indigo-600 text-white rounded-full uppercase font-black tracking-widest shadow-lg shadow-indigo-100">
          Public Client Protection
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="relative border-l-4 border-indigo-100 ml-4 space-y-12 pb-6">
            {/* Step 1: Generate */}
            <div
              className={`relative pl-10 transition-all duration-500 ${step === 1 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-white border-4 border-indigo-600 shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              </div>
              <h4 className="text-base font-black text-slate-900 mb-2">
                Bước 1: Client tạo Secrets
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                Client bí mật tạo ngẫu nhiên một{" "}
                <code className="text-indigo-600 font-bold">code_verifier</code>{" "}
                và băm nó bằng SHA-256 để tạo{" "}
                <code className="text-purple-600 font-bold">
                  code_challenge
                </code>
                .
              </p>
              {step === 1 && (
                <Button
                  onClick={generateChallenge}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black px-6 h-12 shadow-xl shadow-indigo-100"
                >
                  Phát sinh Bundle
                </Button>
              )}
            </div>

            {/* Step 2: Auth Request */}
            <div
              className={`relative pl-10 transition-all duration-500 ${step === 2 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-white border-4 border-slate-200 shadow-sm flex items-center justify-center">
                {step > 2 && (
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                )}
              </div>
              <h4 className="text-base font-black text-slate-900 mb-2">
                Bước 2: Đăng ký Challenge
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                App gửi{" "}
                <code className="text-purple-600 font-bold">
                  code_challenge
                </code>{" "}
                tới Server. Server lưu lại và trả về mã <code>code</code> tạm
                thời.
              </p>
              {step === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 rounded-xl font-black px-6 h-12 transition-all"
                >
                  Gửi Challenge Request
                </Button>
              )}
            </div>

            {/* Step 3: Token Exchange */}
            <div
              className={`relative pl-10 transition-all duration-500 ${step === 3 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-white border-4 border-slate-200 shadow-sm" />
              <h4 className="text-base font-black text-slate-900 mb-2">
                Bước 3: Xác minh Verifier
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                Khi đổi token, Client gửi{" "}
                <code className="text-indigo-600 font-bold">code_verifier</code>{" "}
                (dạng thô). Server sẽ băm nó và so sánh với challenge đã nhận ở
                Bước 2.
              </p>
              {step === 3 && (
                <Button
                  onClick={verifyVerifier}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black px-6 h-12 shadow-xl shadow-indigo-100"
                >
                  Submit Verifier
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Visual Console */}
        <div className="bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="bg-slate-800/50 p-4 flex items-center justify-between border-b border-slate-700/50 px-6">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Security Sandbox Console
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            </div>
          </div>
          <div className="p-8 font-mono text-[11px] space-y-6 flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent)]">
            <AnimatePresence>
              {data.code_verifier && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-indigo-400/80 border-l-2 border-indigo-500/30 pl-4 py-1">
                    // Client: Local Secret Generation
                  </div>
                  <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                    <span className="text-slate-500 mr-2">verifier:</span>
                    <span className="text-indigo-300 break-all font-bold">
                      {data.code_verifier}
                    </span>
                  </div>

                  <div className="text-slate-500 border-l-2 border-slate-700 pl-4 py-1 mt-6">
                    // Crypto: SHA-256 Hashing...
                  </div>
                  <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                    <span className="text-slate-500 mr-2">challenge:</span>
                    <span className="text-amber-400 break-all font-bold">
                      {data.code_challenge}
                    </span>
                  </div>
                </motion.div>
              )}

              {step >= 4 && data.server_response && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 pt-8 border-t border-slate-800 space-y-6"
                >
                  <div className="text-emerald-400 font-bold uppercase tracking-widest text-[9px]">
                    Server Verification Result
                  </div>
                  <pre className="p-5 bg-black/40 rounded-2xl border border-emerald-500/20 text-slate-300 overflow-x-auto">
                    {JSON.stringify(data.server_response, null, 2)}
                  </pre>
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">
                      Match Success! Access Token Issued.
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {!data.code_verifier && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 italic gap-4">
                <Cpu className="w-12 h-12 opacity-10" />
                <p className="font-bold uppercase tracking-widest text-[10px]">
                  Initializing Crypto Engine...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
