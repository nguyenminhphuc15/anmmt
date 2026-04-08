"use client";

import { motion } from "framer-motion";
import { LogOut, User, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/session";

interface UserHeaderProps {
  session: Session;
  onLogout: () => void;
}

export default function UserHeader({ session, onLogout }: UserHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 glass p-8 rounded-3xl border-white/5 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-indigo-500/30">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.email}`}
            />
            <AvatarFallback>
              {session.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0a0a0f] flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-1">
            Xin chào, <span className="text-indigo-400">{session.email}</span>!
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-slate-500">
            <span>Phương thức đăng nhập:</span>
            <Badge
              variant="secondary"
              className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            >
              {session.method}
            </Badge>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="rounded-full glass gap-2 px-8 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4" /> Đăng xuất
      </Button>
    </div>
  );
}
