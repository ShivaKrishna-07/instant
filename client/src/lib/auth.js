/**
 * Auth Utilities
 * Helper functions for authentication and session management
 */

import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";

/**
 * Get session on server side
 * Use in Server Components and API routes
 */
export async function getAuthSession() {
  return await getServerSession();
}

/**
 * Get session on client side
 * Use in Client Components
 */
export async function getClientSession() {
  return await getSession();
}

/**
 * Check if user is authenticated (server)
 */
export async function isAuthenticated() {
  const session = await getAuthSession();
  return !!session?.user;
}

/**
 * Get current user (server)
 */
export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user || null;
}
