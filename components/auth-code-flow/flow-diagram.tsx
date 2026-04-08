"use client";

import { motion } from "framer-motion";
import { Laptop, Server, ShieldCheck, User } from "lucide-react";

interface FlowDiagramProps {
  currentStep: number;
}

const actors = [
  { name: "Browser", icon: Laptop, color: "text-blue-400" },
  { name: "Client App", icon: Server, color: "text-indigo-400" },
  { name: "Auth Server", icon: ShieldCheck, color: "text-purple-400" },
  { name: "Resource Server", icon: Server, color: "text-emerald-400" },
];

export default function FlowDiagram({ currentStep }: FlowDiagramProps) {
  return (
    <div className="w-full h-64 relative mb-12 flex items-center justify-between px-6 pt-10">
      {/* Connector line */}
      <div className="absolute top-[4.5rem] left-[10%] right-[10%] h-0.5 bg-white/5 border-b border-dashed border-white/10" />

      {actors.map((actor, idx) => {
        const Icon = actor.icon;
        const isActive =
          (idx === 0 && (currentStep === 1 || currentStep === 3)) ||
          (idx === 1 &&
            (currentStep === 1 || currentStep === 4 || currentStep === 5)) ||
          (idx === 2 &&
            (currentStep === 1 ||
              currentStep === 2 ||
              currentStep === 3 ||
              currentStep === 4 ||
              currentStep === 5));

        return (
          <div
            key={actor.name}
            className="relative z-10 flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                borderColor: isActive
                  ? "rgba(99, 102, 241, 0.5)"
                  : "rgba(255, 255, 255, 0.1)",
              }}
              className="w-16 h-16 rounded-2xl glass flex items-center justify-center"
            >
              <Icon
                className={`w-8 h-8 ${isActive ? actor.color : "text-slate-500"}`}
              />
            </motion.div>
            <span
              className={`text-xs font-medium ${isActive ? "text-white" : "text-slate-500"}`}
            >
              {actor.name}
            </span>
          </div>
        );
      })}

      {/* Animated Arrows for each step */}
      <div className="absolute inset-0 pointer-events-none">
        {currentStep === 1 && (
          <motion.div
            initial={{ left: "15%", opacity: 0 }}
            animate={{ left: "62%", opacity: 1 }}
            className="absolute top-14 w-8 h-8 flex items-center justify-center text-indigo-400"
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div
            initial={{ left: "62%", opacity: 0 }}
            animate={{ left: "15%", opacity: 1 }}
            className="absolute top-14 w-8 h-8 flex items-center justify-center text-purple-400 rotate-180"
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.div>
        )}
        {currentStep === 4 && (
          <motion.div
            initial={{ left: "38%", opacity: 0 }}
            animate={{ left: "62%", opacity: 1 }}
            className="absolute top-14 w-8 h-8 flex items-center justify-center text-indigo-400"
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
