import { z } from 'zod';

const sourceUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith('https://'), 'HTTPS source required');
const asOf = z
  .string()
  .regex(/^[1-9]\d{3}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/)
  .refine((value) => {
    if (value.length !== 10) return true;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, 'Invalid calendar date');
const price = z
  .object({
    amount: z.number().int().positive().safe(),
    currency: z.enum(['AED', 'EGP']),
    label: z.string().min(1),
    basis: z.enum([
      'agent_listing',
      'listing',
      'broker_project_page',
      'portal_project_page',
      'press_report',
    ]),
  })
  .strict();
export const referenceDatasetSchema = z
  .object({
    _meta: z
      .object({
        name: z.string(),
        compiled_on: asOf,
        purpose: z.string(),
        rules_for_use: z.array(z.string()),
      })
      .strict(),
    developers: z.array(
      z
        .object({
          id: z.string().min(1),
          name: z.string().min(1),
          country: z.enum(['UAE', 'Egypt']),
          positioning: z.string(),
          known_for: z.array(z.string()),
          source: sourceUrl,
        })
        .strict(),
    ),
    projects: z.array(
      z
        .object({
          id: z.string().min(1),
          name: z.string().min(1),
          developer_id: z.string(),
          country: z.enum(['UAE', 'Egypt']),
          city: z.string(),
          community: z.string(),
          approx_coords: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]),
          type: z.array(z.string()),
          headline_facts: z.array(z.string()),
          price_from: price.nullable(),
          price_note: z.string().optional(),
          payment_plan: z.string().optional(),
          completion: z.string().optional(),
          status: z.string().optional(),
          as_of: asOf.optional(),
          confidence: z.enum(['low']).optional(),
          sources: z.array(sourceUrl).min(1),
        })
        .strict(),
    ),
    market_pulse: z.array(
      z
        .object({
          market: z.string(),
          metric: z.string(),
          value: z.string(),
          detail: z.string().optional(),
          as_of: asOf,
          source: sourceUrl,
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((data, context) => {
    const organisations = new Map(data.developers.map((developer) => [developer.id, developer]));
    if (organisations.size !== data.developers.length)
      context.addIssue({ code: 'custom', message: 'Duplicate developer IDs' });
    if (new Set(data.projects.map((project) => project.id)).size !== data.projects.length)
      context.addIssue({ code: 'custom', message: 'Duplicate project IDs' });
    for (const project of data.projects) {
      if (!organisations.has(project.developer_id) || project.developer_id === 'other-uae-luxury') {
        context.addIssue({ code: 'custom', message: `Invalid organisation for ${project.id}` });
      }
    }
  });
export type ReferenceDataset = z.infer<typeof referenceDatasetSchema>;
export function datePrecision(value?: string | null): 'UNKNOWN' | 'YEAR' | 'MONTH' | 'DAY' {
  return !value ? 'UNKNOWN' : value.length === 4 ? 'YEAR' : value.length === 7 ? 'MONTH' : 'DAY';
}
export function sourceBasis(value?: string) {
  switch (value) {
    case 'agent_listing':
      return 'AGENT_LISTING' as const;
    case 'listing':
      return 'LISTING' as const;
    case 'broker_project_page':
      return 'BROKER_PROJECT_PAGE' as const;
    case 'portal_project_page':
      return 'PORTAL_PROJECT_PAGE' as const;
    case 'press_report':
      return 'PRESS_REPORT' as const;
    default:
      return 'UNKNOWN' as const;
  }
}

/** Never converts a month/year into an invented exact date. */
export function freshnessRange(asOfValue: string | null, today: Date) {
  if (!asOfValue) return { status: 'unknown' as const, minimumAgeDays: null, maximumAgeDays: null };
  const [year, month, day] = asOfValue.split('-').map(Number);
  const earliest = Date.UTC(year, (month ?? 1) - 1, day ?? 1);
  const latest = day ? earliest : month ? Date.UTC(year, month, 0) : Date.UTC(year, 11, 31);
  const age = (time: number) => Math.max(0, Math.floor((today.getTime() - time) / 86_400_000));
  const minimumAgeDays = age(latest),
    maximumAgeDays = age(earliest);
  const status =
    minimumAgeDays > 180
      ? 'stale'
      : minimumAgeDays > 90
        ? 'aging'
        : maximumAgeDays > 90
          ? 'uncertain'
          : 'recent';
  return { status, minimumAgeDays, maximumAgeDays };
}
