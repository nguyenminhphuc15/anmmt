"use client";

import { motion } from "framer-motion";
import { Mail, Link, Globe, Fingerprint } from "lucide-react"; // Đã thêm Fingerprint
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MethodSelectorProps {
  // Bổ sung thêm "passkey" vào danh sách method hợp lệ
  onSelect: (method: "magic-link" | "google" | "github" | "passkey") => void;
}

export default function MethodSelector({ onSelect }: MethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          variant="outline"
          className="w-full h-14 justify-start gap-4 glass group hover:border-indigo-500/50"
          onClick={() => onSelect("magic-link")}
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Magic Link</div>
            <div className="text-xs text-muted-foreground">
              Đăng nhập qua email không cần mật khẩu
            </div>
          </div>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          className="w-full h-14 justify-start gap-4 glass group hover:border-indigo-500/50"
          onClick={() => onSelect("google")}
        >
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
            <Globe className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Google Account</div>
            <div className="text-xs text-muted-foreground">
              Đăng nhập bằng tài khoản Google
            </div>
          </div>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="outline"
          className="w-full h-14 justify-start gap-4 glass group hover:border-indigo-500/50"
          onClick={() => onSelect("github")}
        >
          <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-500/20 transition-colors">
            <Link className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold">GitHub Profile</div>
            <div className="text-xs text-muted-foreground">
              Đăng nhập bằng tài khoản GitHub
            </div>
          </div>
        </Button>
      </motion.div>

      {/* NÚT PASSKEY ĐƯỢC THÊM VÀO ĐÂY */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }} // Delay 0.4 để trượt ra cuối cùng
      >
        <Button
          variant="outline"
          className="w-full h-14 justify-start gap-4 glass group hover:border-emerald-500/50"
          onClick={() => onSelect("passkey")}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Passkey</div>
            <div className="text-xs text-muted-foreground">
              Đăng nhập bằng Passkey
            </div>
          </div>
        </Button>
      </motion.div>
    </div>
  );
}