# 📘 Hướng Dẫn Sử Dụng — AuthFlow Demo

Chào mừng bạn đến với ứng dụng mô phỏng các luồng xác thực (Authentication Flows). Đây là hướng dẫn chi tiết để bạn có thể trải nghiệm và hiểu rõ cách hệ thống hoạt động.

---

## 🚀 Cài Đặt Ban Đầu

Để ứng dụng chạy đầy đủ các tính năng backend, hãy thực hiện các bước sau:

1.  **Cài đặt thư viện**:
    ```bash
    npm install
    ```
2.  **Cấu hình Môi trường**:
    Tạo file `.env.local` (nếu chưa có) và điền các thông tin sau:

    ```env
    JWT_SECRET=thay_doi_chuoi_nay_thanh_gi_do_bao_mat_32_ky_tu
    NEXT_PUBLIC_BASE_URL=http://localhost:3000

    # Tùy chọn cho Magic Link (Nếu trống sẽ in link ra terminal)
    RESEND_API_KEY=

    # Tùy chọn cho OAuth (Cần Client ID thật để chạy luồng Real)
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GITHUB_CLIENT_ID=
    GITHUB_CLIENT_SECRET=
    ```

3.  **Chạy ứng dụng**:
    ```bash
    npm run dev
    ```

---

## 🛠️ Các Luồng Demo Chi Tiết

### 1. Magic Link (Đăng nhập không mật khẩu)

Luồng này mô phỏng việc xác thực qua email.

- **Cách dùng**: Nhập email của bạn → Nhấn "Gửi link".
- **Điểm quan trọng**:
  - Quan sát panel **Server Log** bên phải để thấy Server tạo Token và lưu vào SQLite như thế nào.
  - Nếu bạn không điền `RESEND_API_KEY`, hãy kiểm tra **Terminal/Console** của VS Code để lấy đường dẫn đăng nhập mô phỏng.
  - Click vào link trong "Mock Inbox" để server xác thực và cấp Session.

### 2. OAuth2 (Google & GitHub)

Xác thực thông qua bên thứ ba.

- **Mô phỏng (Mock)**: Nhấn nút "Allow" trên màn hình consent giả lập để xem quá trình trao đổi code-to-token giữa Server-to-Server.
- **Thực tế (Real)**: Nếu bạn đã điền Client ID trong `.env.local`, bạn có thể nhấn nút "Redirect tới Google/GitHub (Real Auth)" để đăng nhập bằng tài khoản thật.

### 3. Authorization Code Flow (Sơ đồ tương tác)

Dành cho mục đích giáo dục, giải thích cơ chế "bí mật" đằng sau các luồng OAuth.

- **Cách dùng**: Nhấn "Tiếp theo" để đi qua từng bước.
- **Tính năng Real API**: Tại các bước quan trọng (bước 2 và 4), nhấn nút **"Execute Real API Step"**. Lúc này, ứng dụng sẽ gọi tới API backend thực sự để lấy mã code và token, hiển thị dữ liệu JSON thô mà Server nhận được.

### 4. Advanced Standards (Các chuẩn bảo mật nâng cao)

Module này đào sâu vào các cơ chế bảo mật chuyên sâu trong doanh nghiệp.

- **PKCE (Proof Key for Code Exchange)**:
  - Mô phỏng băm SHA-256 để tạo Challenge.
  - Giải thích cách bảo vệ Client (Mobile/SPA) khi không thể giữ Client Secret bí mật.
- **OIDC (OpenID Connect)**:
  - Phân tích cấu trúc **ID Token (JWT)** gồm 3 phần: Header, Payload, Signature.
  - Xem tài liệu cấu hình server chuẩn `.well-known/openid-configuration`.
- **Token Introspection (RFC 7662)**:
  - Demo cách Resource Server kiểm tra trạng thái Token trực tiếp với Auth Server.
- **Token Revocation (RFC 7009)**:
  - Giả lập việc thu hồi Token. Một khi đã revoke, bạn sẽ thấy API trả về lỗi **401 Unauthorized** khi cố gắng truy cập.

---

## 🛡️ Giám Sát & Bảo Mật

Sau khi đăng nhập thành công, bạn sẽ được chuyển đến **Dashboard**:

- **User Header**: Hiển thị Email và phương thức bạn đã dùng.
- **Lịch sử đăng nhập**: Dữ liệu được truy vấn từ bảng `users` và `logs` trong SQLite.
- **JWT Payload**: Hiển thị nội dung mã hóa bên trong Session Token của bạn (trích xuất từ cookie `auth_token`).
- **Thiết bị**: Hệ thống nhận diện Device và IP (mô phỏng) để đánh giá độ tin cậy.

---

## 📂 Cấu trúc Kỹ thuật (Cho Developer)

- **Database**: `auth_demo.db` (SQLite) - Được tạo tự động khi chạy app.
- **Backend logic**: Nằm tại `app/api/auth/*` (Gồm login, oauth, pkce, oidc, và resource simulation).
- **Components**: Các component tương tác tại `components/magic-link`, `components/oauth`, `components/auth-code-flow` và `components/advanced`.
- **Middleware**: `middleware.ts` xử lý bảo vệ route `/dashboard`.
- **Security**: Token được lưu trong **HttpOnly Cookie**, không thể bị đánh cắp bởi mã độc JavaScript.

---

_Chúc bạn có trải nghiệm thú vị với AuthFlow Demo!_
