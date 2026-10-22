import { z } from 'zod';
import { filterSchema } from '../db/properties';
const partialFilters = filterSchema.partial().extend({
  currency: z.enum(['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP']).optional(),
  sort: z.enum(['curated', 'price_asc', 'price_desc', 'area_desc']).optional(),
  limit: z.number().int().min(1).max(24).optional(),
});
export const briefSchema = z
  .object({
    filters: partialFilters.default({}),
    purpose: z.enum(['residence', 'investment', 'holiday', 'golden_visa', 'relocation']).optional(),
    timeline: z.string().max(120).optional(),
  })
  .strict();
export type Brief = z.infer<typeof briefSchema>;
const id = z
  .string()
  .regex(/^property-[a-zA-Z0-9-]+$/)
  .max(100);
export const toolSchemas = {
  search_properties: z
    .object({
      filters: partialFilters.default({}),
      semantic_query: z.string().max(500).optional(),
      limit: z.number().int().min(1).max(12).default(4),
    })
    .strict(),
  get_property: z.object({ id }).strict(),
  compare_properties: z.object({ ids: z.array(id).min(1).max(4) }).strict(),
  get_area_insights: z.object({ area_id: z.string().max(80) }).strict(),
  calculate_investment: z
    .object({
      property_id: id,
      assumptions: z
        .object({
          annual_rent: z.number().min(0).max(1e9),
          vacancy_percent: z.number().min(0).max(100).default(5),
          other_costs: z.number().min(0).max(1e8).default(0),
        })
        .strict(),
    })
    .strict(),
  save_to_shortlist: z
    .object({
      property_ids: z.array(id).min(1).max(24),
      shortlist_name: z.string().trim().min(1).max(80),
    })
    .strict(),
  request_viewing: z
    .object({
      property_id: id,
      preferred_slots: z
        .array(z.iso.datetime({ offset: true }))
        .min(1)
        .max(3),
      mode: z.enum(['in_person', 'video']),
      timezone: z.enum(['Asia/Dubai', 'Africa/Cairo']).default('Asia/Dubai'),
    })
    .strict(),
  handoff_to_advisor: z.object({ reason: z.string().trim().min(1).max(1000) }).strict(),
};
export type ToolName = keyof typeof toolSchemas;
export type ToolCall = { name: ToolName; arguments: unknown };
export const toolCallSchema = z
  .object({
    name: z.enum(Object.keys(toolSchemas) as [ToolName, ...ToolName[]]),
    arguments: z.unknown(),
  })
  .strict();
