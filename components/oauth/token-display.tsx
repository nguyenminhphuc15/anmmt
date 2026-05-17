"use client";

import { motion } from "framer-motion";
import { Check, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TokenDisplayProps {
  provider: "google" | "github";
  onFinish: () => void;
}

export default function TokenDisplay({
  provider,
  onFinish,
}: TokenDisplayProps) {
  const mockToken = {
    access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.${provider === "google" ? "google_secret" : "github_secret"}`,
    token_type: "Bearer",
    expires_in: 3600,
    scope: "read_user email",
    user_info: {
      id: "987654321",
      email: `${provider}_user@example.com`,
      name: `${provider === "google" ? "Google" : "GitHub"} User`,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${provider}`,
    },
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-green-500" />
        </div>
        <h3 className="text-xl font-bold">Xác thực thành công</h3>
        <p className="text-sm text-slate-600">
          Đã nhận được Access Token từ API của{" "}
          {provider === "google" ? "Google" : "GitHub"}.
        </p>
      </div>

      <div className="relative">
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="px-2 py-1 rounded bg-indigo-500/20 text-[10px] text-indigo-400 font-mono border border-indigo-500/30 uppercase">
            Bearer Token
          </div>
        </div>
        <pre className="glass p-6 rounded-2xl border-slate-200 text-[11px] font-mono text-indigo-300 overflow-x-auto">
          {JSON.stringify(mockToken, null, 2)}
        </pre>
      </div>

      <Button onClick={onFinish} className="w-full">
        Tiếp tục đến Dashboard
      </Button>
    </div>
  );
}
