import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";
import { Session, MOCK_IP, MOCK_DEVICE } from "./session";

/**
 * Server-side session retrieval
 * Note: Should only be imported in Server Components or API Routes
 */
export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload) return null;

  return {
    email: payload.email as string,
    method: payload.method as string,
    loggedAt: new Date((payload.iat || 0) * 1000).toISOString(),
    ip: MOCK_IP,
    device: MOCK_DEVICE,
  };
}
