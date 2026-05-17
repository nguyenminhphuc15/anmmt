"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Key,
  RefreshCcw,
  Lock,
  Box,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import PkceDemo from "@/components/advanced/pkce-demo";
import OidcDemo from "@/components/advanced/oidc-demo";
import IntrospectDemo from "@/components/advanced/introspect-demo";
import RevocationDemo from "@/components/advanced/revocation-demo";

type ActiveTab = "pkce" | "oidc" | "introspect" | "revocation";

const tabs = [
  { id: "pkce", label: "PKCE", icon: Cpu, desc: "Public Client Security" },
  { id: "oidc", label: "OIDC", icon: ShieldCheck, desc: "Identity Protocol" },
  {
    id: "introspect",
    label: "Introspection",
    icon: SearchIcon,
    desc: "Token Validation",
  },
  {
    id: "revocation",
    label: "Revocation",
    icon: RefreshCcw,
    desc: "Token Lifecycle",
  },
];

function SearchIcon({ className }: { className?: string }) {
  return <Lock className={className} />;
}

export default function AdvancedAuthPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("pkce");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      <main className="flex-1 container mx-auto py-12 px-4 max-w-6xl">
        <div className="space-y-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Home
              </Link>
              <h1 className="text-4xl font-bold text-glow">
                Advanced Auth Standards
              </h1>
              <p className="text-slate-600 max-w-2xl">
                Khám phá các tiêu chuẩn bảo mật hiện đại giúp bảo vệ dữ liệu
                người dùng và hệ thống API trong môi trường thực tế.
              </p>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 p-1.5 glass rounded-2xl border-slate-200 bg-slate-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex-1 min-w-[140px] flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
                }`}
              >
                <tab.icon
                  className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-400" : "text-slate-600"}`}
                />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {tab.label}
                  </div>
                  <div className="text-[9px] opacity-60 hidden sm:block">
                    {tab.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="glass p-8 md:p-10 rounded-[32px] border-slate-200 min-h-[550px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "pkce" && <PkceDemo />}
                {activeTab === "oidc" && <OidcDemo />}
                {activeTab === "introspect" && <IntrospectDemo />}
                {activeTab === "revocation" && <RevocationDemo />}
              </motion.div>
            </AnimatePresence>

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          </div>

          {/* Expert Note */}
          <div className="p-6 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Box className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-indigo-300">
                Technical Context
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mọi dữ liệu bạn thấy ở trên đều được xử lý bởi backend thực tế
                (Next.js Route Handlers) và lưu trữ trong SQLite. Các cơ chế như
                băm SHA-256 cho PKCE hay việc decode ID Token đều tuân thủ các
                chuẩn RFC hiện hành.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
