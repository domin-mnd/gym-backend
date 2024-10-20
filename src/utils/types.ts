import type { Selectable } from "kysely";
import type { Client, Employee } from "kysely-codegen";

/**
 * Locals for the client routes matched by src/middleware/authenticate.ts.
 */
export interface ClientLocals {
  client: Selectable<Client>;
}

/**
 * Locals for the client and employee routes matched by src/middleware/admin.ts.
 */
export interface EmployeeLocals {
  employee: Selectable<Client & Employee>;
}
