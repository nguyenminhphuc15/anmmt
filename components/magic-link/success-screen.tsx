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
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          Xác thực thành công!
        </h3>
        <div className="flex items-center justify-center gap-4 bg-slate-50 p-6 rounded-[24px] border-2 border-slate-100 shadow-sm">
          <Avatar className="w-14 h-14 border-2 border-indigo-600 shadow-lg">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`}
            />
            <AvatarFallback className="bg-indigo-600 text-white font-bold">
              {email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="text-base font-black text-slate-900">{email}</div>
            <div className="text-[10px] text-indigo-600 uppercase font-black tracking-widest mt-1">
              Trạng thái: Đã đăng nhập
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onFinish}
        className="w-full h-16 gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] group"
      >
        Đi đến Dashboard
        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
