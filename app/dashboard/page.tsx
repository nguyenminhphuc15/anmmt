"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Database, Cookie, Lock } from "lucide-react";
import Nav from "@/components/nav";
import UserHeader from "@/components/dashboard/user-header";
import LoginHistoryTable from "@/components/dashboard/login-history-table";
import { clearSession, Session } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearSession(); // Legacy clear
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      <main className="flex-1 container mx-auto py-12 px-4 space-y-12">
        {!session ? (
          <div className="max-w-md mx-auto py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 rounded-3xl border-slate-200 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <ShieldAlert className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  Phiên đăng nhập không hợp lệ
                </h3>
                <p className="text-sm text-slate-600">
                  Vui lòng thực hiện một luồng đăng nhập thực để xem Dashboard
                  này.
                </p>
              </div>
              <Button asChild className="w-full h-12 gap-2">
                <Link href="/login">
                  Đi đến trang Login <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <UserHeader session={session} onLogout={handleLogout} />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight px-2 border-l-4 border-indigo-500">
                  Giám sát Bảo mật Real-time
                </h2>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase">
                    <Database className="w-3 h-3" /> persistence: sqlite
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                    <Cookie className="w-3 h-3" /> transport: httponly
                  </div>
                </div>
              </div>
              <LoginHistoryTable currentSession={session} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="glass p-8 rounded-3xl border-slate-200 space-y-4 relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <Lock className="w-48 h-48" />
                </div>
                <h4 className="font-bold text-indigo-400">
                  JWT Payload (JOSE)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  Token này được verify tại Middleware trước khi cho phép truy
                  cập Dashboard.
                </p>
                <div className="bg-slate-100 p-4 rounded-xl font-mono text-[10px] text-slate-600 border border-slate-200 space-y-1">
                  <div className="text-indigo-300">
                    "sub": "{session.email}"
                  </div>
                  <div>"method": "{session.method}"</div>
                  <div>
                    "iat":{" "}
                    {Math.floor(new Date(session.loggedAt).getTime() / 1000)}
                  </div>
                  <div>"exp": {Math.floor(Date.now() / 1000) + 86400}</div>
                </div>
              </div>
              <div className="glass p-8 rounded-3xl border-slate-200 space-y-4">
                <h4 className="font-bold text-indigo-400">Bảo mật thiết bị</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hệ thống đang theo dõi Device Fingerprint và IP ({session.ip})
                  để phát hiện các truy cập bất thường.
                </p>
                <div className="flex items-center gap-3 text-[10px] text-green-500 bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Thiết bị "{session.device}" hiện tại được tin cậy
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
