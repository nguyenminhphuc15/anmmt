"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Mail,
  Layers,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const flows = [
  {
    title: "Magic Link",
    description:
      "Xác thực cực nhanh không cần mật khẩu. Demo đầy đủ từ gửi mail đến verify JWT session.",
    icon: Mail,
    href: "/demo/magic-link",
    color: "from-blue-500 to-indigo-500",
    badge: "Passwordless",
  },
  {
    title: "OIDC Interactive",
    description:
      "Visualizing toàn bộ sequence diagram của OpenID Connect. Hỗ trợ Real Google & GitHub login.",
    icon: Fingerprint,
    href: "/demo/oidc-sequence",
    color: "from-indigo-600 to-purple-600",
    badge: "Social Login Included",
  },
  {
    title: "Security Standards",
    description:
      "Deep-dive vào các chuẩn bảo mật chuyên sâu: PKCE, Token Introspection và Revocation.",
    icon: ShieldCheck,
    href: "/demo/advanced",
    color: "from-purple-600 to-pink-600",
    badge: "Enterprise Ready",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Nav />

      {/* Hero Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-200/20 blur-[150px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-200/20 blur-[150px] rounded-full translate-y-1/2 pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-32 relative z-10">
        <div className="text-center space-y-8 mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4"
          >
            <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Tech-Stack Spotlight
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tight text-slate-900"
          >
            Hiểu tường tận về <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Auth Flow
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Dự án mô phỏng thực tế các luồng xác thực hiện đại nhất cho Senior
            Engineers & Security Architects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-lg"
            >
              <Link href="/demo/oidc-sequence">Bắt đầu ngay</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 rounded-2xl border-2 border-slate-200 hover:bg-white hover:border-indigo-200 transition-all font-black text-lg"
            >
              GitHub Repo
            </Button>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {flows.map((flow) => (
            <motion.div key={flow.title} variants={item} className="group">
              <Card className="h-full bg-white/70 backdrop-blur-md border-2 border-slate-100 hover:border-indigo-600 transition-all duration-500 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-100 group">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${flow.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}
                    >
                      <flow.icon className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {flow.badge}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 mb-3">
                    {flow.title}
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium leading-relaxed min-h-[60px]">
                    {flow.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-8 pt-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-between items-center rounded-2xl h-14 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 font-black text-slate-900 px-6"
                    asChild
                  >
                    <Link href={flow.href}>
                      Xem Demo
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="py-20 border-t border-slate-100 bg-white/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white italic">
                A
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                AuthFlow Project
              </span>
            </div>
            <p className="text-slate-500 font-medium max-w-md">
              Xây dựng bởi Team An Ninh Mạng với mục tiêu phổ cập kiến thức về
              IAM và Modern Protocols.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 md:justify-end">
            {[
              { label: "Next.js 15", color: "bg-black text-white" },
              { label: "Tailwind 4", color: "bg-blue-600 text-white" },
              { label: "OIDC 1.0", color: "bg-indigo-600 text-white" },
              { label: "OAuth 2.1", color: "bg-purple-600 text-white" },
              { label: "JWT", color: "bg-pink-600 text-white" },
            ].map((tag) => (
              <span
                key={tag.label}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${tag.color}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
