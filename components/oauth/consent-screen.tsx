"use client";

import { motion } from "framer-motion";
import { Link, Globe, Shield, User, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ConsentScreenProps {
  provider: "google" | "github";
  onAllow: () => void;
  onCancel: () => void;
}

export default function ConsentScreen({
  provider,
  onAllow,
  onCancel,
}: ConsentScreenProps) {
  const isGoogle = provider === "google";

  return (
    <div className="w-full max-w-sm mx-auto bg-[#16161e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-black/20 p-6 text-center border-b border-white/5">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
          {isGoogle ? (
            <Globe className="w-6 h-6 text-red-500" />
          ) : (
            <Link className="w-6 h-6 text-white" />
          )}
        </div>
        <h3 className="text-lg font-bold">
          Đăng nhập bằng {isGoogle ? "Google" : "GitHub"}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Ứng dụng <strong>AuthFlow Demo</strong> muốn truy cập tài khoản của
          bạn.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <User className="w-3 h-3" />
            </div>
            <div className="text-sm">
              <div className="font-medium">Thông tin cá nhân</div>
              <div className="text-[11px] text-slate-500 leading-tight">
                Truy cập tên, ảnh đại diện và ID công khai của bạn.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Mail className="w-3 h-3" />
            </div>
            <div className="text-sm">
              <div className="font-medium">Địa chỉ Email</div>
              <div className="text-[11px] text-slate-500 leading-tight">
                Xem địa chỉ email chính của bạn (primary email).
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg flex gap-3">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[10px] text-amber-200/70 leading-normal">
            Bạn có thể thu hồi quyền truy cập này bất cứ lúc nào trong cài đặt
            tài khoản {isGoogle ? "Google" : "GitHub"} của bạn.
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 glass text-xs"
            onClick={onCancel}
          >
            Hủy bỏ
          </Button>
          <Button
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-xs shadow-lg shadow-indigo-600/20"
            onClick={onAllow}
          >
            Cho phép
          </Button>
        </div>
      </div>
    </div>
  );
}
