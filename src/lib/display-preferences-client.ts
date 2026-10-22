/** A small browser-only decoder; API requests still use the server's strict Zod schema. */
export type DisplayPreferenceInput = {
  currency?: 'AED' | 'EGP' | 'USD' | 'EUR' | 'SAR' | 'GBP';
  areaUnit?: 'sqm' | 'sqft';
  arabicIndicDigits?: boolean;
};

export function decodeDisplayPreferences(value: unknown): DisplayPreferenceInput | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const keys = Object.keys(value);
  if (
    !keys.length ||
    keys.some((key) => !['currency', 'areaUnit', 'arabicIndicDigits'].includes(key))
  )
    return null;
  const input = value as Record<string, unknown>;
  if (
    (input.currency !== undefined &&
      !['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP'].includes(input.currency as string)) ||
    (input.areaUnit !== undefined && !['sqm', 'sqft'].includes(input.areaUnit as string)) ||
    (input.arabicIndicDigits !== undefined && typeof input.arabicIndicDigits !== 'boolean')
  )
    return null;
  // Copy only the accepted own fields. The return value cannot carry unrelated storage data.
  return Object.fromEntries(keys.map((key) => [key, input[key]])) as DisplayPreferenceInput;
}
