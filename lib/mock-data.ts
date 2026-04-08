export const mockUsers = [
  {
    id: "1",
    email: "user@example.com",
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
];

export const mockLoginHistory = [
  {
    id: 1,
    method: "Magic Link",
    provider: "user@mail.com",
    time: "Hôm nay 01:05",
    ip: "113.185.12.x",
    device: "Chrome / Win",
    status: "success",
  },
  {
    id: 2,
    method: "Google",
    provider: "google_user",
    time: "Hôm qua 14:32",
    ip: "113.185.12.x",
    device: "Safari / Mac",
    status: "success",
  },
  {
    id: 3,
    method: "GitHub",
    provider: "github_user",
    time: "3 ngày trước",
    ip: "14.237.12.x",
    device: "Firefox / Linux",
    status: "success",
  },
  {
    id: 4,
    method: "Magic Link",
    provider: "user@mail.com",
    time: "1 tuần trước",
    ip: "113.185.12.x",
    device: "Chrome / Win",
    status: "expired",
  },
];

export const authCodeSteps = [
  {
    id: 1,
    title: "Authorization Request",
    actor: "Browser → Auth Server",
    description:
      "Ứng dụng Client chuyển hướng người dùng đến Server xác thực kèm theo Client ID và Scope.",
    code: `GET /authorize?
  response_type=code&
  client_id=CLIENT_ID&
  redirect_uri=CALLBACK_URL&
  scope=read_user&
  state=xyz123`,
  },
  {
    id: 2,
    title: "User Consent",
    actor: "User → Auth Server",
    description: "Người dùng đăng nhập và chấp nhận cấp quyền cho ứng dụng.",
    code: "// User approves access...",
  },
  {
    id: 3,
    title: "Authorization Code",
    actor: "Auth Server → Browser",
    description:
      "Server xác thực chuyển hướng về CALLBACK_URL kèm theo một mã Code (sử dụng 1 lần).",
    code: "HTTP/1.1 302 Found\nLocation: https://client.app/callback?code=AUTH_CODE_123&state=xyz123",
  },
  {
    id: 4,
    title: "Token Exchange",
    actor: "Client → Auth Server",
    description:
      "Ứng dụng Client gửi mã Code + Client Secret để đổi lấy Access Token (an toàn hơn vì gọi server-to-server).",
    code: `POST /token
  grant_type=authorization_code&
  code=AUTH_CODE_123&
  client_id=CLIENT_ID&
  client_secret=CLIENT_SECRET&
  redirect_uri=CALLBACK_URL`,
  },
  {
    id: 5,
    title: "Access Token Received",
    actor: "Auth Server → Client",
    description: "Server trả về Access Token và optionally Refresh Token.",
    code: `{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "tGzv3JOkSA..."
}`,
  },
];
