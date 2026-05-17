"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Laptop, Smartphone, CheckCircle, XCircle } from "lucide-react";
import { mockLoginHistory } from "@/lib/mock-data";
import { Session } from "@/lib/session";

interface LoginHistoryTableProps {
  currentSession: Session | null;
}

export default function LoginHistoryTable({
  currentSession,
}: LoginHistoryTableProps) {
  // Merge modern session into the mock data
  const history = [
    ...(currentSession
      ? [
          {
            id: 0,
            method: currentSession.method,
            provider: currentSession.email,
            time: "Vừa xong",
            ip: currentSession.ip,
            device: currentSession.device,
            status: "success",
            isCurrent: true,
          },
        ]
      : []),
    ...mockLoginHistory,
  ];

  return (
    <div className="glass rounded-3xl border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-100">
        <h3 className="font-bold">Lịch sử đăng nhập</h3>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          5 bản ghi gần nhất
        </span>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Email/Provider</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Địa chỉ IP</TableHead>
            <TableHead>Thiết bị</TableHead>
            <TableHead className="text-right">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((row, idx) => (
            <TableRow
              key={row.id}
              className={`border-slate-200 transition-colors duration-200 ${
                "isCurrent" in row && row.isCurrent
                  ? "bg-indigo-50 hover:bg-indigo-500/15"
                  : "hover:bg-slate-100"
              }`}
            >
              <TableCell className="text-center font-mono text-[10px] text-slate-500">
                {idx + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      row.method === "Magic Link"
                        ? "bg-blue-500"
                        : row.method === "Google"
                          ? "bg-red-500"
                          : "bg-white"
                    }`}
                  />
                  <span className="text-xs font-medium">{row.method}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs font-mono text-slate-700">
                {row.provider}
              </TableCell>
              <TableCell className="text-xs text-slate-600">
                {row.time}
              </TableCell>
              <TableCell className="text-xs font-mono text-slate-500">
                {row.ip}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  {row.device.includes("Chrome") ? (
                    <Laptop className="w-3 h-3" />
                  ) : (
                    <Smartphone className="w-3 h-3" />
                  )}
                  {row.device}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {row.status === "success" ? (
                  <Badge className="bg-green-50 text-green-500 border-green-500/20 pointer-events-none">
                    <CheckCircle className="w-3 h-3 mr-1" /> Thành công
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 pointer-events-none">
                    <XCircle className="w-3 h-3 mr-1" /> Hết hạn
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {history.length === 0 && (
        <div className="p-20 text-center text-slate-500">
          Không có dữ liệu lịch sử.
        </div>
      )}
    </div>
  );
}
