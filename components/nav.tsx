"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Key,
  Mail,
  Fingerprint,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Landing", href: "/", icon: ShieldCheck },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Magic Link", href: "/demo/magic-link", icon: Mail },
  { name: "OAuth2", href: "/demo/oauth", icon: Key },
  { name: "Auth Code", href: "/demo/auth-code-flow", icon: Fingerprint },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-2xl tracking-tighter"
          >
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              AuthFlow
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-100",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="md:hidden">
            {/* Mobile menu could go here, keeping it simple for now */}
          </div>
        </div>
      </div>
    </nav>
  );
}
