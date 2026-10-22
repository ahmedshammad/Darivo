import { z } from 'zod';

const displayFields = {
  currency: z.enum(['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP']),
  areaUnit: z.enum(['sqm', 'sqft']),
  arabicIndicDigits: z.boolean(),
};
export const displayPreferencesSchema = z
  .object(displayFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Choose at least one preference');
export const profileSchema = z
  .object({
    ...displayFields,
    arabicIndicDigits: z.boolean().optional(),
    language: z.enum(['en', 'ar']),
    timezone: z.enum(['Asia/Dubai', 'Africa/Cairo', 'Europe/London']),
    notifications: z.boolean(),
    consent: z.literal(true),
  })
  .strict();
