import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not set in environment variables');
  }
  return secret;
}

/**
 * Signs a payload with HMAC SHA-256
 */
export function signToken(payload: string): string {
  const secret = getSecret();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verifies if a token is valid and matches the HMAC signature
 */
export function verifyToken(token: string): boolean {
  try {
    const secret = getSecret();
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) return false;

    // Parse payload to check expiration
    // Payload format: admin:expiresAt
    const [userType, expiresAtStr] = payload.split(':');
    if (userType !== 'admin') return false;
    
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Expired
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

/**
 * Creates a signed admin session token valid for 24 hours
 */
export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `admin:${expiresAt}`;
  return signToken(payload);
}

/**
 * Server-side function to check if the current request has a valid admin session
 */
export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return false;
  }
  return verifyToken(sessionCookie.value);
}

/**
 * Set session cookie
 */
export async function setAdminSessionCookie() {
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day in seconds
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
