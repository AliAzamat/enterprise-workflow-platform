import { Pool } from "pg";

// ONE connection pool for the whole process. Opening a connection per query
// would exhaust Postgres under load; the pool reuses a bounded set of them.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                          // cap concurrent connections
  idleTimeoutMillis: 30_000,
});

// A thin typed query helper. Note params are passed SEPARATELY from the SQL —
// the driver sends them out of band, so user input can never become SQL.
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool.query(sql, params);
  return res.rows as T[];
}
