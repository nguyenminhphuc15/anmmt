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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
        <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900">
                AuthFlow Security
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                no-reply@authflow.demo
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider">
            <Clock className="w-3 h-3" /> Vừa xong
          </div>
        </div>

        <div className="p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-10 h-10 text-indigo-600" />
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Đăng nhập vào AuthFlow
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Xin chào{" "}
              <strong className="text-indigo-600 underline underline-offset-4 decoration-indigo-200">
                {email}
              </strong>
              ,<br />
              Chúng tôi nhận được yêu cầu đăng nhập của bạn. Click vào nút bên
              dưới để xác thực ngay.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="py-2"
          >
            <Button
              onClick={onLinkClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-14 rounded-2xl font-black shadow-xl shadow-indigo-100 text-lg transition-all"
            >
              Đăng nhập ngay
            </Button>
          </motion.div>

          <p className="text-[11px] text-slate-400 font-medium italic">
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
