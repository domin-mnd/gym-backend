import type { LevelType } from "kysely-codegen";

/**
 * Hardcoded prices for membership levels.
 */
export const membershipPrices: Record<LevelType, number> = {
  SIMPLE: 790,
  INFINITY: 1490,
  PREMIUM: 1790,
};

/**
 * Calculate appointment price.
 * Every hour of the appointment date is 1000 rubles. The minimum price is 1000 rubles.
 * @param appointedAt - Appointment date.
 * @param endsAt - Appointment end date.
 * @returns Appointment price.
 */
export function getAppointmentPrice(
  appointedAt: Date,
  endsAt: Date,
): number {
  const diff = endsAt.getTime() - appointedAt.getTime();
  const calculated = Math.floor(diff / 3600);
  return calculated < 1000 ? 1000 : calculated;
}
