import { Temporal } from '@js-temporal/polyfill';
export function slotToIso(local: string, timezone: string) {
  const plain = Temporal.PlainDateTime.from(local);
  return plain.toZonedDateTime(timezone, { disambiguation: 'reject' }).toInstant().toString();
}
