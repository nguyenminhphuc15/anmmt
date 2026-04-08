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
      "Passwordless authentication via email links. Simple and secure.",
    icon: Mail,
    href: "/demo/magic-link",
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "OAuth2 Social Login",
    description: "Login with Google or GitHub. The most common modern flow.",
    icon: Key,
    href: "/demo/oauth",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    title: "Auth Code Flow",
    description:
      "Interactive visualization of the OIDC Authorization Code grant.",
    icon: Fingerprint,
    href: "/demo/auth-code-flow",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Advanced Standards",
    description:
      "Deep dive into PKCE, OIDC, Introspection, and Token Revocation.",
    icon: ShieldCheck,
    href: "/demo/advanced",
    color: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-400",
  },
  {
    title: "Integrated Full Flow",
    description:
      "A complete 12-step lifecycle demo: PKCE, OIDC, Refresh Rotation, and Revocation.",
    icon: Zap,
    href: "/demo/full-flow",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Nav />

      <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Xác thực hiện đại</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Hiểu về{" "}
            <span className="text-glow text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Auth Flow
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Khám phá và trải nghiệm các luồng xác thực thực tế. Từ Magic Link
            đơn giản đến Authorization Code Flow phức tạp.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/login">Bắt đầu thử ngay</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 glass"
              asChild
            >
              <Link href="/demo/auth-code-flow">Xem sơ đồ</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
        >
          {flows.map((flow) => (
            <motion.div key={flow.title} variants={item}>
              <Card className="glass h-full flex flex-col hover:border-white/20 transition-all duration-300 group">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${flow.color} flex items-center justify-center mb-4 border border-white/5`}
                  >
                    <flow.icon className={`w-6 h-6 ${flow.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl">{flow.title}</CardTitle>
                  <CardDescription className="text-base text-slate-400">
                    {flow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-white/5 group-hover:text-primary transition-colors"
                    asChild
                  >
                    <Link href={flow.href}>
                      Xem chi tiết{" "}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="py-10 border-t border-white/5 text-center text-muted-foreground text-sm">
        <p>© 2026 AuthFlow Demo. Built with Next.js 14 & Framer Motion.</p>
      </footer>
    </div>
  );
}
