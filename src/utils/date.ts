/**
 * Simplified date type with time subtracted.
 */
export type ISODate = `${string}-${string}-${string}`;

/**
 * Convert a date to a string in the format 'YYYY-MM-DD'.
 * @param date - The date to convert.
 * @returns The date as a string in the format 'YYYY-MM-DD'.
 * @example
 * toDateString(new Date('2024-01-01T12:34:56.789Z'));
 * // Returns: '2024-01-01'
 */
export function toDateString(date: Date): ISODate {
  return date.toISOString().substring(0, 10) as ISODate;
}

/**
 * Convert a date to a unified format in which the time is set to 00:00:00.000.
 * @param date - The date to convert.
 * @returns - The date in the unified format.
 * @example
 * unifyDay(new Date('2024-01-01T12:34:56.789Z'));
 * // Returns: 2024-01-01T00:00:00.000Z
 */
export function unifyDay(date: Date): Date {
  const params = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  ];

  return new Date(...(params as []));
}

/**
 * Creates a KV record of days between two dates with given initial value.
 * @param initialValue - The initial value for each day.
 * @param range - The range of dates.
 * @returns An object with the days as keys and the initial value as values.
 * @example
 * createDaysArray(0, ['2024-01-01', '2024-01-03']);
 * // Returns: {
 * //   '2024-01-01': 0,
 * //   '2024-01-02': 0,
 * //   '2024-01-03': 0,
 * // }
 */
export function createDaysArray<T>(
  initialValue: T,
  range: [string, string],
): Record<ISODate, T> {
  const start = new Date(range[0]);
  const end = new Date(range[1]);
  const maxDays = end.getDate() - start.getDate();

  return Array.from({ length: maxDays }, () => 0).reduce(acc => {
    acc[toDateString(unifyDay(start))] =
      structuredClone(initialValue);
    start.setDate(start.getDate() + 1);

    return acc;
  }, {});
}
