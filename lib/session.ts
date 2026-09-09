import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  isAdmin?: boolean;
}

const sessionOptions = {
  password: (() => {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SESSION_SECRET must be set in production');
      }
      return 'dev-only-session-secret-change-me';
    }
    return secret;
  })(),
  cookieName: 'rngterm-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAdmin() {
  const session = await getSession();
  return session.isAdmin === true;
}
