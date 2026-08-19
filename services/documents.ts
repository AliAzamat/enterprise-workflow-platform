import { query } from "../db/pool";

export interface DocumentRow {
  id: string;
  title: string;
  source: string;
  visible_to: string[];
  body: string;
  updated_at: string;
}

export const documentRepo = {
  async list(source?: string): Promise<DocumentRow[]> {
    // Filter by source in SQL when given; otherwise return all rows. Row-level
    // permission filtering happens ABOVE this, in the resolver, per principal.
    if (source) {
      return query<DocumentRow>(
        "SELECT id, title, source, visible_to, body, updated_at FROM documents WHERE source = $1 ORDER BY updated_at DESC",
        [source],
      );
    }
    return query<DocumentRow>(
      "SELECT id, title, source, visible_to, body, updated_at FROM documents ORDER BY updated_at DESC",
    );
  },
};
