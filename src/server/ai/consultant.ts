import { db } from '../db/client';
import { type Viewer, type PropertyDTO } from '../db/properties';
import { briefSchema, type Brief } from './schema';
import { MockProvider, isAdvice, type AIProvider } from './mock';
import { OpenAICompatibleProvider } from './openai';
import { executeTool, type ToolResult } from './tools';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';
export function provider(): AIProvider {
  return process.env.AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY
    ? new OpenAICompatibleProvider()
    : new MockProvider();
}
export type ConsultantReply = {
  text: string;
  properties: PropertyDTO[];
  brief: Brief;
  kind: string;
  results: ToolResult[];
};
export async function consult(
  message: string,
  user: Viewer,
  locale: 'en' | 'ar',
  previous: Brief = { filters: {} },
  ai: AIProvider = provider(),
): Promise<ConsultantReply> {
  if (!user) throw new Error('unauthorized');
  const language = /[\u0600-\u06ff]/.test(message)
    ? 'ar'
    : /[a-zA-Z]/.test(message)
      ? 'en'
      : locale;
  const dictionary = language === 'ar' ? ar : en;
  const plan = await (isAdvice(message) ? new MockProvider() : ai).plan(
    message,
    previous,
    language,
  );
  const results: ToolResult[] = [];
  for (const call of plan.calls.slice(0, 4)) {
    // Write tools require intent independently of the model's proposal.
    if (
      call.name === 'save_to_shortlist' &&
      (!/save|shortlist|احفظ|حفظ/i.test(message) ||
        /don't|do not|never save|لا تحفظ|لا تحجز/i.test(message))
    )
      throw new Error('intent_required');
    if (
      call.name === 'request_viewing' &&
      (!/viewing|book|معاينة|زيارة|احجز/i.test(message) || /don't|do not|لا تحجز/i.test(message))
    )
      throw new Error('intent_required');
    try {
      results.push(await executeTool(call, user));
    } catch (e) {
      if (e instanceof Error && e.message === 'not_found')
        results.push({ kind: 'matches', properties: [] });
      else throw e;
    }
  }
  const properties = [
    ...new Map(results.flatMap((r) => r.properties).map((p) => [p.id, p])).values(),
  ];
  const kind = results.some((r) => r.kind === 'handoff')
    ? 'handoff'
    : (results.find((r) => !['matches', 'compare'].includes(r.kind))?.kind ??
      (properties.length ? 'matches' : 'empty'));
  const key =
    kind === 'handoff'
      ? 'chatHandoff'
      : kind === 'saved'
        ? 'chatSaved'
        : kind === 'viewing_requested'
          ? 'chatViewing'
          : kind === 'insights'
            ? 'chatInsights'
            : kind === 'investment'
              ? 'chatInvestment'
              : properties.length
                ? 'chatMatches'
                : 'chatNoMatches';
  const question = !plan.brief.purpose
    ? 'discoveryPurpose'
    : !plan.brief.filters.maxPrice
      ? 'discoveryBudget'
      : !plan.brief.filters.community && !plan.brief.filters.city
        ? 'discoveryLocation'
        : !plan.brief.timeline
          ? 'discoveryTimeline'
          : 'discoveryMustHaves';
  const text = dictionary[key] + (kind === 'matches' ? `\n\n${dictionary[question]}` : '');
  return { text, properties, brief: briefSchema.parse(plan.brief), kind, results };
}
export async function saveTurn(userId: string, message: string, reply: ConsultantReply) {
  let conversation = await db.consultantConversation.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!conversation) conversation = await db.consultantConversation.create({ data: { userId } });
  await db.clientBrief.upsert({
    where: { userId },
    update: { data: JSON.parse(JSON.stringify(reply.brief)) },
    create: { userId, data: JSON.parse(JSON.stringify(reply.brief)) },
  });
  await db.consultantMessage.createMany({
    data: [
      { conversationId: conversation.id, role: 'user', content: { text: message } },
      {
        conversationId: conversation.id,
        role: 'assistant',
        content: {
          text: reply.text,
          propertyIds: reply.properties.map((p) => p.id),
          kind: reply.kind,
          results: JSON.parse(
            JSON.stringify(
              reply.results
                .filter((r) => ['insights', 'investment'].includes(r.kind))
                .map((r) => ({ kind: r.kind, data: r.data ?? {} })),
            ),
          ),
        },
      },
    ],
  });
  await db.analyticsEvent.create({
    data: { kind: 'consultant', areaId: reply.brief.filters.community },
  });
}
