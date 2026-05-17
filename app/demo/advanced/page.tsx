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
  Zap,
  Info,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import PkceDemo from "@/components/advanced/pkce-demo";
import OidcDemo from "@/components/advanced/oidc-demo";
import IntrospectDemo from "@/components/advanced/introspect-demo";
import RevocationDemo from "@/components/advanced/revocation-demo";
import { Card } from "@/components/ui/card";

type ActiveTab = "pkce" | "oidc" | "introspect" | "revocation";

const tabs = [
  { id: "pkce", label: "PKCE", icon: Cpu, desc: "Public Client Security" },
  { id: "oidc", label: "OIDC", icon: ShieldCheck, desc: "Identity Protocol" },
  {
    id: "introspect",
    label: "Introspection",
    icon: Lock,
    desc: "Token Validation",
  },
  {
    id: "revocation",
    label: "Revocation",
    icon: RefreshCcw,
    desc: "Token Lifecycle",
  },
];

const glossary = [
  {
    term: "PKCE (RFC 7636)",
    def: "Proof Key for Code Exchange. Cơ chế giúp bảo vệ Authorization Code flow bằng cách sử dụng một chuỗi bí mật (verifier) được băm (challenge). Nó loại bỏ nhu cầu sử dụng Client Secret trên các ứng dụng không bảo mật được code của mình như Mobile hay Single Page App (SPA).",
  },
  {
    term: "OIDC (OpenID Connect)",
    def: "Một lớp (layer) danh tính phía trên giao thức OAuth 2.0. Nó cho phép Client xác minh danh tính của người dùng cuối dựa trên kết quả xác thực được thực hiện bởi một Authorization Server, đồng thời nhận thông tin profile cơ bản.",
  },
  {
    term: "Introspection (RFC 7662)",
    def: "Một endpoint cho phép Resource Server (API) truy vấn Authorization Server để biết trạng thái hiện tại của một access token (còn hiệu lực không, có phạm vi gì, ai là chủ sở hữu). Rất hữu ích khi sử dụng Reference Tokens.",
  },
  {
    term: "Reference Tokens",
    def: "Thay vì chứa dữ liệu (như JWT), token này chỉ là một chuỗi ký tự ngẫu nhiên (handle). Resource Server phải gọi Introspection endpoint để lấy thông tin thực tế. Ưu điểm: Bảo mật cực cao, có thể thu hồi ngay lập tức.",
  },
  {
    term: "Token Revocation (RFC 7009)",
    def: "Chuẩn cho phép Client thông báo với Authorization Server rằng một Access Token hoặc Refresh Token không còn được sử dụng nữa và cần phải bị vô hiệu hóa ngay lập tức (thường dùng khi Logout).",
  },
  {
    term: "JWKS (JSON Web Key Set)",
    def: "Một tập hợp các khóa công khai (public keys) mà Authorization Server công bố. Client sử dụng các khóa này để kiểm tra chữ ký của ID Token hoặc Access Token dạng JWT mà không cần gọi Server ở mỗi request.",
  },
];

export default function AdvancedAuthPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("pkce");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      <Nav />
      {/* Decorative background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-200/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <main className="flex-1 container mx-auto py-16 px-4 max-w-6xl relative z-10">
        <div className="space-y-12">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />{" "}
                Trang chủ
              </Link>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                Advanced Auth Standards
              </h1>
              <p className="text-slate-600 font-medium text-lg max-w-2xl leading-relaxed">
                Nơi đi sâu vào các kỹ thuật bảo mật IAM (Identity & Access
                Management) giúp bảo vệ hệ thống API quy mô lớn.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 shadow-sm">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                Compliance Validated
              </span>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-3 p-2 bg-white/50 backdrop-blur-md rounded-[24px] border-2 border-slate-100 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex-1 min-w-[160px] flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 relative group overflow-hidden ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 ring-2 ring-indigo-50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white border-2 border-transparent"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? "text-white" : "text-slate-400"}`}
                />
                <div className="text-left relative z-10">
                  <div className="text-sm font-black uppercase tracking-wider">
                    {tab.label}
                  </div>
                  <div
                    className={`text-[10px] font-bold ${activeTab === tab.id ? "text-indigo-100" : "text-slate-400"} hidden sm:block`}
                  >
                    {tab.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-12 rounded-[40px] min-h-[600px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {activeTab === "pkce" && <PkceDemo />}
                {activeTab === "oidc" && <OidcDemo />}
                {activeTab === "introspect" && <IntrospectDemo />}
                {activeTab === "revocation" && <RevocationDemo />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Expert Note */}
          <div className="p-8 rounded-3xl bg-slate-900 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent)]" />
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                <Box className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  Technical Context{" "}
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">
                    Real Implementation
                  </span>
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Mọi dữ liệu bạn thấy ở trên đều được xử lý bởi backend thực tế
                  (Next.js Route Handlers) và lưu trữ trong SQLite. Các cơ chế
                  như băm <span className="text-indigo-400">SHA-256</span> cho
                  PKCE hay việc decode ID Token đều tuân thủ các chuẩn RFC hiện
                  hành. Hệ thống này mô phỏng chính xác cách các nền tảng như
                  Okta hay Auth0 vận hành.
                </p>
              </div>
            </div>
          </div>

          {/* Glossary Section */}
          <section className="pt-12 pb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Giải thích thuật ngữ
                </h2>
                <p className="text-slate-500 font-medium italic">
                  Hiểu sâu các chuẩn công nghiệp RFC
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {glossary.map((g, idx) => (
                <Card
                  key={idx}
                  className="bg-white border-2 border-slate-50 hover:border-indigo-100 transition-all duration-500 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 group"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                    <h3 className="text-lg font-black text-indigo-600 tracking-tight">
                      {g.term}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {g.def}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
