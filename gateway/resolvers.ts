import type { GatewayContext } from "./context";
import { requireAuth, canSeeDocument } from "./permissions";
import { employeeRepo } from "../services/employees";
import { documentRepo } from "../services/documents";

export const resolvers = {
  Query: {
    // `me` is just the authenticated principal — proven identity, no arguments.
    async me(_p: unknown, _a: unknown, ctx: GatewayContext) {
      const principal = requireAuth(ctx);
      return { ...principal, displayName: principal.email };
    },

    // `documents` fetches, then FILTERS each row by the caller's permission.
    // Authorization is applied per row, not just at the endpoint.
    async documents(_p: unknown, args: { source?: string }, ctx: GatewayContext) {
      const principal = requireAuth(ctx);
      const rows = await documentRepo.list(args.source);
      return rows
        .filter((r) => canSeeDocument(principal, r.visible_to))
        .map((r) => ({
          id: r.id,
          title: r.title,
          source: r.source,
          updatedAt: r.updated_at,
        }));
    },
  },
};
