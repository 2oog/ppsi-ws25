/**
 * NextAuth.js Authentication Route.
 *
 * @remarks
 * Handles authentication requests such as sign-in, sign-out, and session management.
 * Proxies requests to NextAuth.js handlers.
 *
 * @see {@link https://next-auth.js.org/} for more details.
 */
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
