# 🔐 AuthFlow Demo — Next.js 16 Real Backend Simulation

Một ứng dụng demo tương tác cao, giúp hiểu rõ cơ chế của các luồng xác thực hiện đại (Magic Link, OAuth2, Auth Code Flow) với backend thực tế bằng Next.js, SQLite và JOSE.

## ✨ Tính năng nổi bật

- **Magic Link**: Luồng đăng nhập không mật khẩu với animation Server Log chi tiết.
- **OAuth2**: Tích hợp Google và GitHub (Hỗ trợ cả Mock simulation và Real integration).
- **Auth Code Flow Diagram**: Sơ đồ tương tác giải thích cơ chế trao đổi Code-to-Token.
- **Real Backend**: Xử lý API Route Handlers, lưu Database SQLite, và bảo mật bằng JWT HttpOnly Cookies.
- **Modern UI**: Thiết kế Glassmorphism, Dark mode, Framer Motion animations.

## 📖 Hướng dẫn sử dụng

Vui lòng đọc file **[USER_GUIDE.md](./USER_GUIDE.md)** để biết cách cài đặt môi trường và trải nghiệm chi tiết các tính năng.

## 🛠️ Stack công nghệ

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Database**: SQLite (better-sqlite3)
- **Auth**: JOSE (JWT), HttpOnly Cookies
- **Animation**: Framer Motion
- **Components**: shadcn/ui

## 🚀 Khởi chạy nhanh

1. `npm install`
2. Tạo file `.env.local` theo mẫu trong hướng dẫn.
3. `npm run dev`

---

_Dự án được xây dựng phục vụ mục đích học tập và trình diễn._
