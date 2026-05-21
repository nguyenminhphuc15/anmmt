"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PasskeyButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handlePasskeyAuth = async () => {
    setIsLoading(true);
    try {
      // 1. Lấy Challenge từ Server
      const resp = await fetch("/api/auth/passkey/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "passkey_user@demo.local" }),
      });
      const options = await resp.json();

      // 2. Kích hoạt bảng quét vân tay/PIN của hệ điều hành
      const regResp = await startRegistration({ optionsJSON: options });

      // 3. Gửi chữ ký xác thực lên Server
      const verifyResp = await fetch("/api/auth/passkey/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regResp),
      });

      if (verifyResp.ok) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Passkey error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full h-14 justify-start gap-4 glass group hover:border-indigo-500/50"
      onClick={handlePasskeyAuth}
      disabled={isLoading}
    >
      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
      </div>
      <div className="text-left">
        <div className="font-semibold">Passkey / Sinh trắc học</div>
        <div className="text-xs text-muted-foreground">Đăng nhập bằng vân tay hoặc mã PIN máy tính</div>
      </div>
    </Button>
  );
}