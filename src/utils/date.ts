export type ISODate = `${string}-${string}-${string}`;

export function toDateString(date: Date): ISODate {
  return date.toISOString().substring(0, 10) as ISODate;
}

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

export function createDaysArray<T>(
  initialValue: T,
  range: [string, string],
): Record<ISODate, T> {
  // Make object of Record<isodate, T>
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
