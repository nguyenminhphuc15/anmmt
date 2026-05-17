"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface EmailFormProps {
  onSubmit: (email: string) => void;
}

export default function EmailForm({ onSubmit }: EmailFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label
          htmlFor="email"
          className="text-sm font-black uppercase tracking-widest text-slate-500 ml-1"
        >
          Địa chỉ Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium px-6 shadow-sm"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-14 gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 text-lg transition-all active:scale-[0.98]"
        disabled={!email}
      >
        <Send className="w-5 h-5" /> Gửi Magic Link
      </Button>
    </form>
  );
}
