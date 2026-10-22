import type { UIMessage } from 'ai';
import { z } from 'zod';
import {
  briefPatchSchema,
  conciergeBriefSchema,
  conciergeStreamEventSchema,
  entityRefSchema,
} from './concierge';

const requestId = z.string().uuid();
export const conciergeRequestSchema = z
  .object({
    requestId,
    conversationId: requestId,
    locale: z.enum(['en', 'ar']),
    message: z.string().trim().min(1).max(4000),
    brief: conciergeBriefSchema,
    patch: briefPatchSchema.optional(),
    priorEntities: z.array(entityRefSchema).max(12).default([]),
  })
  .strict();
export type ConciergeRequest = z.infer<typeof conciergeRequestSchema>;
export type ConciergeUIMessage = UIMessage<
  never,
  {
    concierge: z.infer<typeof conciergeStreamEventSchema>;
  }
>;
