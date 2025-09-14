export type DateLike = Date | string | number;

function toDate(input: DateLike): Date {
  return input instanceof Date ? input : new Date(input);
}

/**
 * Format a date/time in Asia/Jakarta with Indonesian locale.
 * Pass addWIB to append "WIB" label.
 */
export function formatDateTimeWIB(
  input: DateLike,
  options?: (Intl.DateTimeFormatOptions & { addWIB?: boolean })
): string {
  const { addWIB, ...fmt } = options ?? {};
  const d = toDate(input);
  const s = d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', ...fmt });
  return addWIB ? `${s} WIB` : s;
}

export function formatDateWIB(
  input: DateLike,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = toDate(input);
  return d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', ...options });
}

export function formatTimeWIB(
  input: DateLike,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = toDate(input);
  return d.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', ...options });
}

