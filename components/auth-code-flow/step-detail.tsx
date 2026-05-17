"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepDetailProps {
  step: {
    id: number;
    title: string;
    actor: string;
    description: string;
    code: string;
  };
}

export default function StepDetail({ step }: StepDetailProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">
              Step {step.id}: {step.actor}
            </div>
            <h3 className="text-xl font-bold">{step.title}</h3>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          {step.description}
        </p>

        <div className="relative group">
          <div className="absolute top-3 left-4 flex items-center gap-2 text-slate-500">
            <Terminal className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase tracking-tight">
              Request Details
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <pre className="bg-slate-100 border border-slate-200 p-8 pt-10 rounded-xl font-mono text-[11px] text-indigo-300/90 overflow-x-auto">
            {step.code}
          </pre>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
