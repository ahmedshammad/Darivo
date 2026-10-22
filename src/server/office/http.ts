import { z } from 'zod';
import { officePreferencesSchema, type OfficePreferences } from '@/src/lib/office';
import { requireUser, sameOrigin, rateLimit, failure, json, HttpError } from '../security';
export function officeQueryPreferences(request: Request): Partial<OfficePreferences> {
  const params = new URL(request.url).searchParams;
  const input: Record<string, unknown> = {};
  for (const key of ['currency', 'areaUnit', 'locale'] as const)
    if (params.has(key)) input[key] = params.get(key);
  if (params.has('arabicIndicDigits'))
    input.arabicIndicDigits = z.enum(['1', '0']).parse(params.get('arabicIndicDigits')) === '1';
  return officePreferencesSchema
    .extend({
      currency: officePreferencesSchema.shape.currency.removeDefault().optional(),
      areaUnit: officePreferencesSchema.shape.areaUnit.removeDefault().optional(),
      locale: officePreferencesSchema.shape.locale.removeDefault().optional(),
      arabicIndicDigits: officePreferencesSchema.shape.arabicIndicDigits.removeDefault().optional(),
    })
    .parse(input);
}
export async function officeRequest(request: Request, write = false) {
  if (write) sameOrigin(request);
  const viewer = await requireUser(['CLIENT', 'VERIFIED_CLIENT']);
  rateLimit(`office:${write ? 'write' : 'read'}:${viewer.id}`, write ? 40 : 180);
  return viewer;
}
export async function officeResponse(work: () => Promise<unknown>, status = 200) {
  try {
    return json(await work(), status);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      ['P2002', 'P2034'].includes(String(error.code))
    )
      return failure(new HttpError(409, 'conflict'));
    return failure(error);
  }
}
