import type { GatewayContext, Principal } from "./context";
import { GraphQLError } from "graphql";

// AUTHORIZATION lives in one module so the rules are written once and reused.
// Every check FAILS CLOSED: no principal, or the wrong role, means denied.

export function requireAuth(ctx: GatewayContext): Principal {
  if (!ctx.principal) {
    throw new GraphQLError("authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.principal;
}

const RANK = { EMPLOYEE: 0, MANAGER: 1, ADMIN: 2 } as const;

// Require AT LEAST a role. A manager passes a MANAGER check; an admin passes
// every check. Encodes the role hierarchy as a single comparison.
export function requireRole(ctx: GatewayContext, min: keyof typeof RANK): Principal {
  const p = requireAuth(ctx);
  if (RANK[p.role] < RANK[min]) {
    throw new GraphQLError(`requires role ${min}`, {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return p;
}

// Row-level rule: may this principal see this document? Admins see all; others
// see a doc only if it is unrestricted or targets their department.
export function canSeeDocument(p: Principal, visibleTo: string[]): boolean {
  if (p.role === "ADMIN") return true;
  return visibleTo.length === 0 || visibleTo.includes(p.department);
}
