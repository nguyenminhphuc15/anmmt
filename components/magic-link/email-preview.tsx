"use client";

import { motion } from "framer-motion";
import { Mail, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailPreviewProps {
  email: string;
  onLinkClick: () => void;
}

export default function EmailPreview({
  email,
  onLinkClick,
}: EmailPreviewProps) {
  return (
    <div className="w-full">
      <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="bg-black/20 px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold">AuthFlow Security</div>
              <div className="text-[10px] text-slate-400">
                no-reply@authflow.demo
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Vừa xong
          </div>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold">Đăng nhập vào AuthFlow</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Xin chào <strong>{email}</strong>,<br />
              Chúng tôi nhận được yêu cầu đăng nhập của bạn. Click vào nút bên
              dưới để xác thực ngay.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onLinkClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 font-bold shadow-lg shadow-indigo-500/20"
            >
              Đăng nhập ngay
            </Button>
          </motion.div>

          <p className="text-[10px] text-slate-500">
            Link này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu đăng nhập,
            hãy bỏ qua email này.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
          Mô phỏng: click vào nút để tiếp tục flow
        </div>
      </div>
    </div>
  );
}
