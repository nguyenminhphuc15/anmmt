"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SuccessScreenProps {
  email: string;
  onFinish: () => void;
}

export default function SuccessScreen({ email, onFinish }: SuccessScreenProps) {
  return (
    <div className="text-center space-y-8 py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Xác thực thành công!</h3>
        <div className="flex items-center justify-center gap-3 glass p-4 rounded-2xl border-white/5">
          <Avatar className="w-12 h-12 border border-indigo-500/30">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`}
            />
            <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="text-sm font-medium">{email}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              Trạng thái: Đã đăng nhập
            </div>
          </div>
        </div>
      </div>

      <Button onClick={onFinish} className="w-full h-12 gap-2 group">
        Đi đến Dashboard{" "}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
