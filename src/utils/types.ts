import type { Selectable } from "kysely";
import type { Client, Employee } from "kysely-codegen";

export interface ClientLocals {
  client: Selectable<Client>;
}

export interface EmployeeLocals {
  employee: Selectable<Client & Employee>;
}
