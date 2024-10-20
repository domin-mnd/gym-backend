import type { Selectable } from "kysely";
import type { VisitHistory } from "kysely-codegen";
import { type ISODate, createDaysArray } from "./date";

/**
 * Parse visit history table array into a date graph.
 * @param visitHistory - Array of visit_history objects.
 * @param range - ISO date range to parse days array into.
 * @returns Parsed record of iso dates with its values as visit length in milliseconds.
 */
export function getGraph(
  visitHistory: Selectable<Omit<VisitHistory, "client_id">>[],
  range: [string, string],
): Record<ISODate, number> {
  const periodArray = createDaysArray(0, range);

  for (const visit of visitHistory) {
    const [enteredAt, leftAt] = [
      visit.entered_at,
      visit.left_at ?? new Date(),
    ];

    const innerRange: [string, string] = [
      enteredAt.toISOString(),
      leftAt.toISOString(),
    ];

    const visitPeriod = createDaysArray(60 * 60 * 24, innerRange);

    const keys = Object.keys(visitPeriod);

    switch (keys.length) {
      case 1:
        visitPeriod[keys[0]] = leftAt.getTime() - enteredAt.getTime();
        break;
      default:
        visitPeriod[keys[0]] =
          new Date(enteredAt).setHours(23, 59, 59, 999) -
          enteredAt.getTime();
        visitPeriod[keys[keys.length - 1]] =
          leftAt.getTime() - new Date(leftAt).setHours(0, 0, 0, 0);
        break;
    }

    for (const key of keys) {
      if (!periodArray[key]) periodArray[key] = 0;
      periodArray[key] += visitPeriod[key];
    }
  }

  return periodArray;
}
