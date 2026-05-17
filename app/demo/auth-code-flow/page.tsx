"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  StepForward,
  RotateCcw,
  Box,
  Terminal as TerminalIcon,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import FlowDiagram from "@/components/auth-code-flow/flow-diagram";
import StepDetail from "@/components/auth-code-flow/step-detail";
import { authCodeSteps } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export default function AuthCodeFlowPage() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const currentStep = authCodeSteps[currentStepIdx];

  const nextStep = () => {
    if (currentStepIdx < authCodeSteps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setApiResponse(null);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setApiResponse(null);
    }
  };

  const reset = () => {
    setCurrentStepIdx(0);
    setApiResponse(null);
  };

  const executeApi = async () => {
    setIsExecuting(true);
    try {
      if (currentStep.id === 2) {
        // Authorize
        const res = await fetch(
          "/api/auth/code-flow/authorize?response_type=code&client_id=demo_app&state=xyz789",
        );
        const data = await res.json();
        setApiResponse(data);
      } else if (currentStep.id === 4) {
        // Token exchange
        const formData = new FormData();
        formData.append("grant_type", "authorization_code");
        formData.append("code", "demo_code_123");
        const res = await fetch("/api/auth/code-flow/token", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setApiResponse(data);
      }
    } catch (e) {
      setApiResponse({ error: "API execution failed" });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4 text-glow">
              Auth Code Flow Visualization
            </h1>
            <p className="text-slate-600 max-w-2xl">
              OAuth 2.0 Authorization Code là flow an toàn nhất, sử dụng backend
              server để trao đổi token.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              {/* Control Bar */}
              <div className="flex items-center justify-between glass p-4 rounded-2xl border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  disabled={currentStepIdx === 0}
                  className="glass"
                >
                  <RotateCcw className="w-3 h-3 mr-2" /> Reset
                </Button>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                    Step {currentStep.id} of {authCodeSteps.length}
                  </span>
                  <div className="flex gap-1">
                    {authCodeSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-4 h-1 rounded-full transition-all duration-300 ${idx === currentStepIdx ? "w-8 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStepIdx === 0}
                    className="glass text-xs"
                  >
                    Quay lại
                  </Button>
                  <Button
                    size="sm"
                    onClick={nextStep}
                    disabled={currentStepIdx === authCodeSteps.length - 1}
                    className="bg-indigo-600 hover:bg-indigo-500 text-xs"
                  >
                    Tiếp theo <StepForward className="ml-2 w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Diagram Area */}
              <div className="glass p-8 rounded-3xl border-slate-200 relative bg-gradient-to-br from-indigo-500/5 to-transparent min-h-[500px]">
                <FlowDiagram currentStep={currentStep.id} />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="glass p-6 rounded-3xl border-slate-200 space-y-6">
                <StepDetail step={currentStep} />

                {(currentStep.id === 2 || currentStep.id === 4) && (
                  <div className="pt-4 border-t border-slate-200">
                    <Button
                      variant="secondary"
                      className="w-full h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-400 border border-indigo-500/30 gap-2"
                      onClick={executeApi}
                      disabled={isExecuting}
                    >
                      {isExecuting ? (
                        <RotateCcw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      Execute Real API Step
                    </Button>

                    {apiResponse && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 p-4 bg-black/50 rounded-xl border border-indigo-500/20 font-mono text-[10px] space-y-2"
                      >
                        <div className="flex items-center gap-2 text-indigo-400 border-b border-indigo-500/10 pb-2 mb-2">
                          <Box className="w-3 h-3" /> <span>API Response</span>
                        </div>
                        <pre className="text-slate-700 break-all whitespace-pre-wrap">
                          {JSON.stringify(apiResponse, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <div className="glass p-6 rounded-2xl border-slate-200 bg-amber-500/5">
                <div className="flex gap-3 mb-3">
                  <TerminalIcon className="w-4 h-4 text-amber-500 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200/70">
                    Educational Context
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tại bước này, hệ thống thực sự gọi tới Route Handler{" "}
                  <code>/api/auth/code-flow/*</code> để mô phỏng dữ liệu thô
                  (raw data) được trả về từ Auth Server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
