import { randomUUID } from 'node:crypto';
import type { User } from '@prisma/client';
import {
  CONCIERGE_LIMITS,
  conciergeBriefSchema,
  conciergeStreamEventSchema,
  providerPlanSchema,
  type ConciergeAction,
  type ConciergeBrief,
  type ConciergeComponent,
  type ConciergeEntityRef,
  type ConciergeProvider,
  type ConciergeStreamEvent,
  type WriteProposal,
} from '@/src/lib/concierge';
import { applyConciergeBriefPatch, StaleBriefError } from './brief';
import { cardEntity } from './grounding';
import { extractConciergePrivacy } from './mock-parser';
import { executeConciergeTool } from './tools';

export type ConciergeTurnInput = {
  message: string;
  brief: ConciergeBrief;
  viewer: User | null;
  locale: 'en' | 'ar';
  conversationId: string;
  turnId: string;
  requestId: string;
  signal?: AbortSignal;
  provider: ConciergeProvider;
  priorEntities?: ConciergeEntityRef[];
};
export type ConciergeTurnResult = {
  brief: ConciergeBrief;
  components: ConciergeComponent[];
  text: string;
  proposals: WriteProposal[];
  actions: ConciergeAction[];
  responseLanguage: 'en' | 'ar';
  status: 'complete' | 'cancelled' | 'failed';
};
type EventPayload<T = ConciergeStreamEvent> = T extends ConciergeStreamEvent
  ? Omit<T, 'version' | 'id' | 'conversationId' | 'turnId' | 'requestId' | 'sequence' | 'createdAt'>
  : never;
const copy = {
  ACKNOWLEDGE: {
    en: 'I have updated your Brief. We can refine each market separately.',
    ar: 'حدّثت طلبك. يمكننا تنقيح كل سوق بصورة مستقلة.',
  },
  CLARIFY: {
    en: 'Which part of your Brief would you like to clarify first?',
    ar: 'أي جزء من طلبك ترغب في توضيحه أولاً؟',
  },
  RESULTS: {
    en: 'Here are the available records to review against your Brief. The cards keep original prices, sources and unknowns visible.',
    ar: 'إليك السجلات المتاحة لمراجعتها مقابل طلبك. تُبقي البطاقات الأسعار الأصلية والمصادر والمعلومات غير المؤكدة ظاهرة.',
  },
  NO_MATCHES: {
    en: 'I could not verify an exact match. Review your requirements to choose the next step.',
    ar: 'لم أتمكن من توثيق تطابق تام. راجع متطلباتك لاختيار الخطوة التالية.',
  },
  ADVICE_HANDOFF: {
    en: 'That decision needs qualified advice. I can offer an advisor enquiry for you to review; nothing has been shared.',
    ar: 'يتطلب هذا القرار مشورة مؤهلة. يمكنني عرض استفسار إلى مستشار لمراجعته؛ لم تُشارك أي معلومات.',
  },
  WRITE_CONFIRMATION: {
    en: 'Review the proposed action before confirming it. No portfolio save, advisor contact or viewing booking has been made.',
    ar: 'راجع الإجراء المقترح قبل تأكيده. لم يُحفظ شيء في قائمة العقارات، ولم يُتواصل مع مستشار أو يُحجز موعد معاينة.',
  },
} as const;
const clarificationCopy: Record<string, { en: string; ar: string }> = {
  'developer.entity': {
    en: 'Which developer or named reference project would you like me to explain?',
    ar: 'أي مطوّر أو مشروع مرجعي مسمّى تريد أن أوضّح معلوماته؟',
  },
  'calculation.unit': {
    en: 'Which fictional unit should I use for the illustrative calculation?',
    ar: 'أي وحدة خيالية تريد أن أستخدم للحساب التوضيحي؟',
  },
  'calculation.assumptions': {
    en: 'What annual rent and annual costs, each with a currency, and vacancy percentage should I use for this illustration?',
    ar: 'ما الإيجار السنوي والتكاليف السنوية مع عملة كل منهما ونسبة الشغور التي تريد استخدامها لهذا المثال؟',
  },
  'budget.currency': {
    en: 'Which currency should I use for this budget?',
    ar: 'ما العملة التي تريد استخدامها لهذه الميزانية؟',
  },
  'budget.amount': {
    en: 'What amount or price range should I use for your budget?',
    ar: 'ما المبلغ أو النطاق السعري الذي تريد اعتماده للميزانية؟',
  },
  'budget.market': {
    en: 'Which market does this budget apply to: Egypt or the UAE?',
    ar: 'لأي سوق هذه الميزانية: مصر أم الإمارات؟',
  },
  'deadline.market': {
    en: 'Which market does this deadline apply to: Egypt or the UAE?',
    ar: 'لأي سوق هذا الموعد: مصر أم الإمارات؟',
  },
  'deadline.anchor': {
    en: 'From which date should I count this time period?',
    ar: 'من أي تاريخ أبدأ حساب هذه المدة؟',
  },
  'deadline.boundary': {
    en: 'Do you mean before that year begins, or by its end?',
    ar: 'هل تقصد قبل بداية تلك السنة أم بحلول نهايتها؟',
  },
  'selection.entity': {
    en: 'Which project or fictional unit should I use?',
    ar: 'أي مشروع أو وحدة خيالية تريد أن أستخدم؟',
  },
  'map.entities': {
    en: 'Which project, fictional unit or area would you like to see on the map?',
    ar: 'أي مشروع أو وحدة خيالية أو منطقة تريد عرضها على الخريطة؟',
  },
  'chart.entities': {
    en: 'Which two or more fictional units should I compare by price and area?',
    ar: 'أي وحدتين خياليتين أو أكثر تريد مقارنة سعرها ومساحتها؟',
  },
  'itinerary.places': {
    en: 'Which areas should I include in the illustrative visit plan?',
    ar: 'أي مناطق تريد إدراجها في خطة الزيارة التوضيحية؟',
  },
  'timeline.entity': {
    en: 'Which project or fictional unit should I show a payment timeline for?',
    ar: 'لأي مشروع أو وحدة خيالية تريد عرض خطة السداد؟',
  },
};
function entitiesFrom(components: ConciergeComponent[]): ConciergeEntityRef[] {
  return [
    ...new Map(
      components
        .flatMap((component) =>
          'cards' in component
            ? component.cards.map(cardEntity)
            : component.kind === 'mini-map'
              ? component.entities
              : [],
        )
        .map((entity) => [`${entity.kind}:${entity.id}`, entity]),
    ).values(),
  ];
}
async function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  let listener: (() => void) | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        listener = () => reject(signal.reason);
        signal.addEventListener('abort', listener, { once: true });
      }),
    ]);
  } finally {
    if (listener) signal.removeEventListener('abort', listener);
  }
}
/** No persistence or writes: all durable operations belong to explicit confirmed workflows. */
export async function runConciergeTurn(
  input: ConciergeTurnInput,
  emit: (event: ConciergeStreamEvent) => void | Promise<void>,
): Promise<ConciergeTurnResult> {
  let brief = conciergeBriefSchema.parse(input.brief);
  let responseLanguage: 'en' | 'ar' =
    brief.responseLanguage === 'auto' ? input.locale : brief.responseLanguage;
  const components: ConciergeComponent[] = [],
    actions: ConciergeAction[] = [],
    proposals: WriteProposal[] = [];
  let sequence = 0,
    text = '',
    terminal = false;
  const timeout = AbortSignal.timeout(90_000);
  const signal = input.signal ? AbortSignal.any([input.signal, timeout]) : timeout;
  const send = async (payload: EventPayload) => {
    const event = conciergeStreamEventSchema.parse({
      version: 1,
      id: randomUUID(),
      conversationId: input.conversationId,
      turnId: input.turnId,
      requestId: input.requestId,
      sequence: sequence++,
      createdAt: new Date().toISOString(),
      ...payload,
    });
    await emit(event);
  };
  const result = (status: ConciergeTurnResult['status']): ConciergeTurnResult => ({
    brief,
    components,
    actions,
    proposals,
    text,
    responseLanguage,
    status,
  });
  try {
    signal.throwIfAborted();
    await send({ type: 'turn.started', briefRevision: brief.revision });
    const restrictions = extractConciergePrivacy(input.message);
    const flags = (['doNotSave', 'doNotShare', 'doNotBook', 'discreet'] as const).filter(
      (flag) => restrictions[flag],
    );
    if (flags.length || restrictions.restrictMemory) {
      brief = applyConciergeBriefPatch(brief, {
        baseRevision: brief.revision,
        operations: [
          ...(flags.length ? [{ op: 'privacy.restrict' as const, flags }] : []),
          ...(restrictions.restrictMemory
            ? [
                {
                  op: 'memory.restrict' as const,
                  consent: (brief.tasteMemory.consent === 'granted' ||
                  brief.tasteMemory.consent === 'revoked'
                    ? 'revoked'
                    : 'declined') as 'revoked' | 'declined',
                },
              ]
            : []),
        ],
      });
      await send({ type: 'brief.updated', brief });
    }
    let replyKey: keyof typeof copy = 'ACKNOWLEDGE';
    let clarificationFields: string[] = [];
    const executed = new Set<string>();
    let pendingSchoolDisclosure: ConciergeComponent | null = null;
    const isSchoolDisclosure = (component: ConciergeComponent) =>
      component.kind === 'notice' &&
      /:(school|school-disclosure|area-qualification)$/.test(component.id);
    const needsSchoolDisclosure = () =>
      Boolean(
        pendingSchoolDisclosure ||
        brief.household.curriculum ||
        brief.household.schoolRequirement !== 'unspecified',
      ) && !components.some(isSchoolDisclosure);
    const ensureSchoolDisclosure = async () => {
      if (!needsSchoolDisclosure()) return;
      const component: ConciergeComponent = pendingSchoolDisclosure ?? {
        id: `${input.turnId}:school-disclosure`,
        turnId: input.turnId,
        kind: 'notice',
        code: 'DEMO_LIMITATION',
        text: {
          en: 'School markers are fictional demo points. The requested curriculum, places and family suitability are unverified; ask for current school evidence before relying on them.',
          ar: 'علامات المدارس نقاط تجريبية خيالية. المنهج المطلوب وتوافر الأماكن والملاءمة للأسرة غير موثقة؛ اطلب أدلة مدرسية حديثة قبل الاعتماد عليها.',
        },
      };
      components.push(component);
      await send({ type: 'component.upsert', component });
      signal.throwIfAborted();
    };
    for (let round = 0; round < CONCIERGE_LIMITS.toolRounds; round++) {
      signal.throwIfAborted();
      await send({ type: 'status', phase: 'interpreting' });
      const plan = providerPlanSchema.parse(
        await abortable(
          input.provider.plan({
            round,
            message: input.message,
            brief: structuredClone(brief),
            responseLanguage,
            priorEntities: [
              ...new Map(
                [...(input.priorEntities ?? []), ...entitiesFrom(components)].map((entity) => [
                  `${entity.kind}:${entity.id}`,
                  entity,
                ]),
              ).values(),
            ],
            toolResults: structuredClone(components),
            signal,
          }),
          signal,
        ),
      );
      signal.throwIfAborted();
      if (plan.baseRevision !== brief.revision) throw new StaleBriefError();
      responseLanguage = plan.responseLanguage;
      replyKey = plan.replyKey;
      clarificationFields = plan.clarificationFields;
      if (plan.briefPatch) {
        brief = applyConciergeBriefPatch(brief, plan.briefPatch);
        await send({ type: 'brief.updated', brief });
      }
      await send({ type: 'status', phase: 'retrieving' });
      for (const call of plan.calls) {
        signal.throwIfAborted();
        if (components.length >= CONCIERGE_LIMITS.componentsPerTurn) break;
        const fingerprint = JSON.stringify(
          call.name === 'compare' ? { ...call, name: 'ui.showComparison' } : call,
        );
        if (executed.has(fingerprint)) continue;
        executed.add(fingerprint);
        const callId = randomUUID();
        await send({ type: 'tool.started', toolCallId: callId, toolName: call.name });
        if (call.name === 'brief.update') {
          brief = applyConciergeBriefPatch(brief, call.arguments);
          await send({ type: 'brief.updated', brief });
          continue;
        }
        const output = await executeConciergeTool(call, {
          brief,
          viewer: input.viewer,
          turnId: input.turnId,
          requestId: input.requestId,
          callId,
          message: input.message,
          signal,
        });
        signal.throwIfAborted();
        const acceptedIds = new Set<string>();
        for (let component of output.components) {
          // Defer standalone school warnings so a teaching map can lead with one complete qualification.
          if (component.kind === 'notice' && component.id.endsWith(':school')) {
            pendingSchoolDisclosure = component;
            continue;
          }
          if (isSchoolDisclosure(component) && components.some(isSchoolDisclosure)) continue;
          const limit =
            CONCIERGE_LIMITS.componentsPerTurn -
            (needsSchoolDisclosure() && !isSchoolDisclosure(component) ? 1 : 0);
          if (components.length >= limit) continue;
          if ('cards' in component) {
            const seen = new Set(
              entitiesFrom(components)
                .filter((entity) => entity.kind === 'project' || entity.kind === 'unit')
                .map((entity) => `${entity.kind}:${entity.id}`),
            );
            const cards = component.cards.filter((card) => {
              const entity = cardEntity(card),
                key = `${entity.kind}:${entity.id}`;
              if (seen.has(key)) return true;
              if (seen.size >= CONCIERGE_LIMITS.recommendations) return false;
              seen.add(key);
              return true;
            });
            if (!cards.length || (component.kind !== 'project-cards' && cards.length < 2)) continue;
            component =
              component.kind === 'price-area-chart'
                ? {
                    ...component,
                    cards,
                    points: component.points.filter((point) =>
                      cards.some(
                        (card) =>
                          cardEntity(card).id === point.entity.id &&
                          cardEntity(card).kind === point.entity.kind,
                      ),
                    ),
                  }
                : { ...component, cards };
          }
          components.push(component);
          acceptedIds.add(component.id);
          await send({ type: 'component.upsert', component });
          signal.throwIfAborted();
        }
        for (const action of output.actions) {
          if ('componentId' in action && !acceptedIds.has(action.componentId)) continue;
          actions.push(action);
          await send({ type: 'ui.action', action });
          signal.throwIfAborted();
        }
        for (const proposal of output.proposals) {
          proposals.push(proposal);
          await send({ type: 'write.proposed', proposal });
          signal.throwIfAborted();
        }
      }
      if (!plan.continue || components.length >= CONCIERGE_LIMITS.componentsPerTurn) break;
    }
    await ensureSchoolDisclosure();
    if (brief.uncertainties.includes('deadline_year_boundary')) {
      for (const market of brief.markets) {
        if (
          market.deadline?.kind !== 'year' ||
          market.deadline.boundary !== 'by' ||
          components.length >= CONCIERGE_LIMITS.componentsPerTurn
        )
          continue;
        const year = market.deadline.year;
        const component: ConciergeComponent = {
          id: randomUUID(),
          turnId: input.turnId,
          kind: 'notice',
          code: 'NEEDS_CLARIFICATION',
          text: {
            en: `For your ${market.country === 'UAE' ? 'UAE' : 'Egypt'} Brief, I am treating “by ${year}” as the end of ${year}. Edit this if you mean an earlier date.`,
            ar: `في طلبك الخاص بـ${market.country === 'UAE' ? 'الإمارات' : 'مصر'}، أفسّر «بحلول ${year}» على أنه نهاية ${year}. عدّل هذا إذا كنت تقصد موعداً أبكر.`,
          },
        };
        components.push(component);
        signal.throwIfAborted();
        await send({ type: 'component.upsert', component });
      }
    }
    await send({ type: 'status', phase: 'composing' });
    if (replyKey === 'RESULTS' && !components.some((component) => component.kind !== 'notice'))
      replyKey = 'NO_MATCHES';
    if (proposals.length) replyKey = 'WRITE_CONFIRMATION';
    // Application-owned prose is never composed from provider-authored factual strings.
    const contextualCopy = components.some((component) => component.kind === 'comparison')
      ? {
          en: 'Compare the original prices and reported completion details below. Unknowns remain explicit; availability needs confirmation.',
          ar: 'قارن الأسعار الأصلية وتفاصيل الإنجاز المعلنة أدناه. تبقى المعلومات غير المعروفة واضحة؛ والتوافر يحتاج إلى تأكيد.',
        }
      : components.some((component) => component.id.endsWith(':area-qualification'))
        ? {
            en: 'Start with the neighbourhood map, then compare the labelled fictional examples. School suitability remains an open check.',
            ar: 'ابدأ بخريطة المناطق، ثم قارن الأمثلة الخيالية المعلّمة بوضوح. تبقى ملاءمة المدارس بحاجة إلى تحقق.',
          }
        : copy.RESULTS;
    const sentence =
      replyKey === 'CLARIFY'
        ? (clarificationCopy[clarificationFields.find((field) => clarificationCopy[field]) ?? ''] ??
            copy.CLARIFY)[responseLanguage]
        : (replyKey === 'RESULTS' ? contextualCopy : copy[replyKey])[responseLanguage];
    signal.throwIfAborted();
    text = sentence;
    await send({ type: 'text.delta', text: sentence, origin: 'APPLICATION_COPY' });
    await send({
      type: 'turn.completed',
      outcome: proposals.length
        ? 'confirmation_required'
        : replyKey === 'CLARIFY'
          ? 'needs_input'
          : replyKey === 'ADVICE_HANDOFF'
            ? 'handoff_offered'
            : 'complete',
      briefRevision: brief.revision,
    });
    terminal = true;
    return result('complete');
  } catch (error) {
    if (signal.aborted && !timeout.aborted) {
      if (!terminal) await send({ type: 'turn.cancelled', reason: 'user' });
      return result('cancelled');
    }
    if (!terminal)
      await send({
        type: 'turn.error',
        code: timeout.aborted
          ? 'TIMEOUT'
          : error instanceof StaleBriefError
            ? 'STALE_BRIEF'
            : error instanceof Error && error.name === 'ZodError'
              ? 'INVALID_PLAN'
              : 'TOOL_FAILED',
        retryable: true,
      });
    return result('failed');
  }
}
