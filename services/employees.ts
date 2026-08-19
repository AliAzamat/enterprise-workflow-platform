import { query } from "../db/pool";
import type { Principal } from "../gateway/context";

// The shape of an employee ROW as stored. The repository maps DB rows to the
// types the rest of the platform speaks — resolvers never see snake_case SQL.
interface EmployeeRow {
  id: string;
  email: string;
  display_name: string;
  role: Principal["role"];
  department: string;
}

function toPrincipal(r: EmployeeRow): Principal {
  return { id: r.id, email: r.email, role: r.role, department: r.department };
}

// REPOSITORY: the only code that knows the employees table exists. It exposes
// intent-named methods, not SQL, so resolvers depend on behavior not schema.
export const employeeRepo = {
  async byId(id: string): Promise<Principal | null> {
    const rows = await query<EmployeeRow>(
      "SELECT id, email, display_name, role, department FROM employees WHERE id = $1",
      [id],            // parameterized: $1 is bound, never string-concatenated
    );
    return rows[0] ? toPrincipal(rows[0]) : null;
  },
};
