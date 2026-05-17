"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fingerprint, KeyRound } from "lucide-react";

interface PasskeyFormProps {
  onRegister: (email: string) => void;
  onLogin: () => void;
}

export default function PasskeyForm({ onRegister, onLogin }: PasskeyFormProps) {
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-500">
          Địa chỉ Email (Để tạo Khóa mới)
        </label>
        <Input
          id="email"
          type="email"
          placeholder="nhan_student@hutech.edu.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass h-12 border-white/10 focus:border-indigo-500/50 transition-colors"
        />
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1 h-12 gap-2 glass text-indigo-400 border-indigo-500 hover:bg-indigo-500"
          onClick={() => onRegister(email)}
          disabled={!email}
        >
          <KeyRound className="w-4 h-4" /> Tạo Passkey
        </Button>
        
        <Button 
          className="flex-1 h-12 gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
          onClick={onLogin}
        >
          <Fingerprint className="w-4 h-4" /> Đăng nhập bằng Passkey
        </Button>
      </div>
      <p className="text-[10px] text-slate-500 text-center">
        * Đăng nhập không cần nhập email nếu bạn đã tạo khóa trước đó trên thiết bị này.
      </p>
    </div>
  );
}