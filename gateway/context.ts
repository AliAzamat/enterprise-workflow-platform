// The REQUEST CONTEXT carries WHO is calling into every resolver. Identity is
// established once, at the edge, and every resolver reads it from here — no
// resolver ever re-parses a token or trusts a client-supplied user id.
import type { Role } from "./types";

export interface Principal {
  id: string;
  email: string;
  role: Role;
  department: string;
}

export interface GatewayContext {
  // The authenticated caller, or null for an unauthenticated request.
  principal: Principal | null;
}

// Build the per-request context from a verified identity. In production the
// JWT is verified by the auth middleware BEFORE this runs; here we take the
// already-trusted claims and shape them into the principal resolvers use.
export function buildContext(claims: Principal | null): GatewayContext {
  return { principal: claims };
}
