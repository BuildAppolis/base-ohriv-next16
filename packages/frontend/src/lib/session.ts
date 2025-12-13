import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = new TextEncoder().encode(
  process.env.SESSION_SECRET || "fallback-secret-key-change-in-production"
);

const cookieName = "demo-session";

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
  demoAccess: boolean;
  [key: string]: string | number | boolean | Date;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createDemoSession(): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours from now

  const session = await encrypt({
    userId: "demo-user",
    expiresAt,
    demoAccess: true,
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieName, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function removeDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getDemoSession(): Promise<SessionPayload | null> {
  const cookie = (await cookies()).get(cookieName)?.value;
  if (!cookie) return null;

  const session = await decrypt(cookie);
  if (!session) return null;

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    await removeDemoSession();
    return null;
  }

  return session;
}

export async function requireDemoSession(): Promise<SessionPayload> {
  const session = await getDemoSession();
  if (!session || !session.demoAccess) {
    throw new Error("Demo access required");
  }
  return session;
}
