"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Key,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Nav from "@/components/nav";

const flows = [
  {
    title: "Magic Link",
    description:
      "Đăng nhập không mật khẩu qua email. Đơn giản, an toàn và tối ưu trải nghiệm người dùng.",
    icon: Mail,
    href: "/demo/magic-link",
    color: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600",
    borderColor: "group-hover:border-blue-200",
  },
  {
    title: "OAuth2 Social Login",
    description:
      "Tích hợp Google, GitHub. Luồng xác thực phổ biến nhất hiện nay cho các ứng dụng hiện đại.",
    icon: Key,
    href: "/demo/oauth",
    color: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-600",
    borderColor: "group-hover:border-purple-200",
  },
  {
    title: "Auth Code Flow",
    description:
      "Trực quan hóa quy trình trao đổi code của OIDC. Hiểu sâu về cách thức hoạt động của backend.",
    icon: Fingerprint,
    href: "/demo/auth-code-flow",
    color: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600",
    borderColor: "group-hover:border-emerald-200",
  },
  {
    title: "Advanced Standards",
    description:
      "Đi sâu vào các tiêu chuẩn bảo mật như PKCE, OIDC Introspection và Token Revocation.",
    icon: ShieldCheck,
    href: "/demo/advanced",
    color: "from-indigo-500/10 to-blue-500/10",
    iconColor: "text-indigo-600",
    borderColor: "group-hover:border-indigo-200",
  },
  {
    title: "OIDC Deep-Dive",
    description:
      "Mô phỏng chi tiết từng bước theo Sequence Diagram chuẩn. Dành cho các chuyên gia bảo mật.",
    icon: Zap,
    href: "/demo/oidc-sequence",
    color: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
    borderColor: "group-hover:border-amber-200",
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
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-200/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[20%] w-[35%] h-[35%] bg-blue-200/20 blur-[110px] rounded-full" />
      </div>

      <Nav />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-24 pb-20 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-4xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-indigo-600 text-sm font-semibold mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nền tảng học thuật về Xác thực hiện đại</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight text-slate-900">
              Hiểu tường tận về{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 pb-2">
                Auth Flow
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
              Trải nghiệm thực tế các luồng xác thực từ cơ bản đến chuyên sâu.
              Công cụ học tập trực quan dành cho lập trình viên.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-md font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                asChild
              >
                <Link href="/login">Bắt đầu trải nghiệm</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-10 h-14 text-md font-bold bg-white/50 backdrop-blur-md border-slate-200 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                asChild
              >
                <Link href="/demo/auth-code-flow">Xem sơ đồ luồng</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="container mx-auto px-4 pb-32">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto"
          >
            {flows.map((flow) => (
              <motion.div key={flow.title} variants={item}>
                <Card
                  className={`group h-full flex flex-col bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 overflow-hidden border-2 ${flow.borderColor}`}
                >
                  <CardHeader className="pb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${flow.color} flex items-center justify-center mb-6 ring-4 ring-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500`}
                    >
                      <flow.icon className={`w-7 h-7 ${flow.iconColor}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {flow.title}
                    </CardTitle>
                    <CardDescription className="text-[15px] leading-relaxed text-slate-600 font-medium pt-2">
                      {flow.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1" />
                  <CardFooter className="pt-0">
                    <Button
                      variant="ghost"
                      className="w-full justify-between items-center rounded-xl h-12 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 font-bold"
                      asChild
                    >
                      <Link href={flow.href}>
                        Khám phá ngay
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 font-medium mb-2">
            © 2026 AuthFlow Lab. Được phát triển bởi đội ngũ đam mê bảo mật.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
              Next.js 14
            </span>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
              Framer Motion
            </span>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
              Tailwind CSS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
