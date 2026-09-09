import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  isAdmin: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'rngterm-super-secret-key-change-in-production-please',
  cookieName: 'rngterm-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 24 hours
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
