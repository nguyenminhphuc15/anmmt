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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-indigo-400">
          PKCE Extension (RFC 7636)
        </h3>
        <span className="text-[10px] px-2 py-1 bg-indigo-50 border border-indigo-500/20 rounded uppercase font-bold text-indigo-400">
          Public Client Protection
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative border-l-2 border-indigo-500/20 ml-4 space-y-8 pb-4">
            {/* Step 1: Generate */}
            <div
              className={`relative pl-8 transition-opacity ${step === 1 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-slate-50 border-2 border-indigo-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-2">
                Bước 1: Client tạo Verifier & Challenge
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Client bí mật tạo ngẫu nhiên <code>code_verifier</code> và băm
                nó bằng SHA-256 để tạo <code>code_challenge</code>.
              </p>
              {step === 1 && (
                <Button
                  size="sm"
                  onClick={generateChallenge}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Phát sinh Verifier & Challenge
                </Button>
              )}
            </div>

            {/* Step 2: Auth Request */}
            <div
              className={`relative pl-8 transition-opacity ${step === 2 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-slate-50 border-2 border-slate-700 flex items-center justify-center">
                {step > 2 && (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-2">
                Bước 2: Gửi Authorization Request
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Gửi <code>code_challenge</code> tới Server. Server lưu lại và
                chỉ phát mã <code>code</code>.
              </p>
              {step === 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="glass border-indigo-500/30 text-indigo-400"
                >
                  Gửi request kèm Challenge
                </Button>
              )}
            </div>

            {/* Step 3: Token Exchange */}
            <div
              className={`relative pl-8 transition-opacity ${step === 3 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-slate-50 border-2 border-slate-700 flex items-center justify-center" />
              <h4 className="text-sm font-bold text-slate-800 mb-2">
                Bước 3: Đổi Token bằng Verifier
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Khi đổi token, Client gửi <code>code_verifier</code> (dạng thô).
                Server sẽ băm và so sánh với challenge đã lưu.
              </p>
              {step === 3 && (
                <Button
                  size="sm"
                  onClick={verifyVerifier}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Gửi Verifier để xác minh
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Visual Console */}
        <div className="glass-darker rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="bg-slate-100 p-3 flex items-center gap-2 border-b border-slate-200">
            <Terminal className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase text-slate-600">
              Browser Console / Math Engine
            </span>
          </div>
          <div className="p-6 font-mono text-[11px] space-y-4 flex-1 overflow-auto">
            <AnimatePresence>
              {data.code_verifier && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="text-indigo-400">
                    // Client-side generation
                  </div>
                  <div className="text-slate-700">
                    verifier:{" "}
                    <span className="text-indigo-300 break-all">
                      {data.code_verifier}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-4">
                    // SHA-256 Hashing...
                  </div>
                  <div className="text-slate-700">
                    challenge:{" "}
                    <span className="text-amber-300 break-all">
                      {data.code_challenge}
                    </span>
                  </div>
                </motion.div>
              )}

              {step >= 4 && data.server_response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-6 border-t border-slate-200 space-y-4"
                >
                  <div className="text-green-400">
                    // Server Verification Response
                  </div>
                  <pre className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
                    {JSON.stringify(data.server_response, null, 2)}
                  </pre>
                  <div className="flex items-center gap-2 text-green-500 bg-green-500/5 p-3 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác minh thành công! Access Token được cấp.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!data.code_verifier && (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Waiting for Client Action...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
