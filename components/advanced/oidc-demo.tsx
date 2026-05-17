"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  User,
  Shield,
  Info,
  Eye,
  Code,
  Search,
  Fingerprint,
} from "lucide-react";

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
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            OpenID Connect 1.0 (OIDC)
          </h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Identity Overlay Protocol
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDiscovery}
          className="rounded-full border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest px-4 h-9 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Search className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Discovery Doc
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100 shadow-inner group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-indigo-600" />
            </div>
            <h4 className="text-lg font-black text-slate-900">
              Core Principle: Identity
            </h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              OAuth2 cấp quyền truy cập (Access Token), còn{" "}
              <span className="text-indigo-600 font-bold">OIDC</span> cung cấp
              thông tin định danh (ID Token). Nó giúp App biết "Ai là người đang
              sử dụng?" thay vì chỉ "App được làm gì?".
            </p>
            <Button
              onClick={startOidcFlow}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              Phát hành ID Token
            </Button>
          </div>

          <AnimatePresence>
            {config && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900 p-6 rounded-[28px] border border-slate-800 shadow-2xl font-mono text-[10px] relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5 text-slate-400">
                  <Code className="w-4 h-4 text-emerald-400" />{" "}
                  <span className="font-bold uppercase tracking-widest">
                    Metadata / Discovery
                  </span>
                </div>
                <pre className="text-slate-300 leading-relaxed overflow-x-auto max-h-[250px] custom-scrollbar">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-7">
          {!oidcData ? (
            <div className="h-full min-h-[400px] border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center text-slate-400">
              <Fingerprint className="w-16 h-16 mb-6 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest italic">
                Awaiting Identity Request
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ID Token Visualizer */}
              <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8">
                <div className="flex items-center gap-3 text-slate-900 font-black text-base">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span>JWT Inspector: ID Token Structure</span>
                </div>

                <div className="space-y-4">
                  {/* Header */}
                  <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-2xl relative">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-[10px] uppercase font-black text-rose-600 tracking-widest">
                        Header: Alg & Key
                      </div>
                      <div className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                        Standard
                      </div>
                    </div>
                    <pre className="text-sm text-rose-700 font-bold font-mono">
                      {'{ "alg": "HS256", "typ": "JWT" }'}
                    </pre>
                  </div>

                  {/* Payload */}
                  <div className="p-6 bg-indigo-50 border-2 border-indigo-100 rounded-2xl">
                    <div className="text-[10px] uppercase font-black text-indigo-600 tracking-widest mb-4">
                      Payload: Claims (Identity Profile)
                    </div>
                    <pre className="text-[13px] text-indigo-800 font-bold font-mono leading-relaxed overflow-x-auto">
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
                  <div className="p-5 bg-slate-900 border-2 border-slate-800 rounded-2xl">
                    <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">
                      Digital Signature
                    </div>
                    <div className="text-[11px] text-emerald-400/80 font-mono italic break-all">
                      HMACSHA256(base64UrlEncode(header) + "." +
                      base64UrlEncode(payload), server_secret)
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-emerald-700 leading-tight">
                        Verified Identity
                      </h5>
                      <p className="text-sm font-medium text-emerald-600 mt-0.5">
                        Authenticated as{" "}
                        <span className="underline decoration-emerald-200">
                          demo@oidc.com
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
