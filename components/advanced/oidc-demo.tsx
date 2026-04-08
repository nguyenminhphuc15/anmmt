"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Shield, Info, Eye, Code, Search } from "lucide-react";

export default function OidcDemo() {
  const [oidcData, setOidcData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startOidcFlow = async () => {
    setLoading(true);
    const res = await fetch(
      "/api/auth/oidc/authorize?scope=openid email profile",
    );
    const json = await res.json();
    setOidcData(json);
    setLoading(false);
  };

  const fetchDiscovery = async () => {
    const res = await fetch("/api/auth/oidc/.well-known/openid-configuration");
    const json = await res.json();
    setConfig(json);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-blue-400">
          OpenID Connect 1.0 (OIDC)
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDiscovery}
          className="text-[10px] text-slate-500 gap-1.5 h-8"
        >
          <Search className="w-3 h-3" /> Fetch Discovery Doc
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="font-bold text-slate-200">
              Authentication vs Authorization
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              OAuth2 cấp quyền truy cập (Access Token), còn OIDC cung cấp danh
              tính người dùng (ID Token).
            </p>
            <Button
              onClick={startOidcFlow}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 h-11"
            >
              Bắt đầu OIDC Flow
            </Button>
          </div>

          {config && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-4 rounded-2xl border-blue-500/20 bg-blue-500/5 font-mono text-[9px] text-blue-300/70 overflow-auto"
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-500/10">
                <Code className="w-3 h-3" />{" "}
                <span>.well-known/openid-configuration</span>
              </div>
              <pre>{JSON.stringify(config, null, 2)}</pre>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          {!oidcData ? (
            <div className="h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600">
              <Info className="w-10 h-10 mb-4 opacity-20" />
              <p className="text-sm italic">
                Thực hiện flow để xem cấu trúc Token
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ID Token Visualizer */}
              <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Eye className="w-4 h-4" />{" "}
                  <span>ID Token Inspector (JWT)</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Header */}
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-red-400 mb-2">
                      Header (Algorithm & Type)
                    </div>
                    <pre className="text-[10px] text-red-200">
                      {'{ "alg": "HS256", "typ": "JWT" }'}
                    </pre>
                  </div>

                  {/* Payload */}
                  <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-purple-400 mb-2">
                      Payload (User Data / Claims)
                    </div>
                    <pre className="text-[11px] text-purple-200 break-all whitespace-pre-wrap">
                      {JSON.stringify(
                        {
                          sub: "user_123",
                          email: "demo@oidc.com",
                          name: "OIDC Demo User",
                          iss: "auth-demo.local",
                          aud: "client_id_456",
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>

                  {/* Signature */}
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-blue-400 mb-2">
                      Signature (Verification)
                    </div>
                    <div className="text-[10px] text-blue-200 truncate font-mono">
                      HMACSHA256(base64UrlEncode(header) + "." +
                      base64UrlEncode(payload), secret)
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-green-400">
                    Authenticated via ID Token
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    Người dùng: demo@oidc.com (Sub: user_123)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
