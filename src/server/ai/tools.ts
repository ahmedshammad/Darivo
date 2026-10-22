import { db } from '../db/client';
import { getProperty, searchProperties, type Viewer, type PropertyDTO } from '../db/properties';
import { toolSchemas, type ToolCall } from './schema';
import { FX } from '@/src/lib/catalog';
export type ToolResult = {
  kind: string;
  properties: PropertyDTO[];
  data?: Record<string, unknown>;
};
async function visible(ids: string[], user: Viewer) {
  const list = await Promise.all(ids.map((id) => getProperty(id, user)));
  if (list.some((p) => !p)) throw new Error('not_found');
  return list as PropertyDTO[];
}
export async function executeTool(call: ToolCall, user: Viewer): Promise<ToolResult> {
  if (!user) throw new Error('unauthorized');
  switch (call.name) {
    case 'search_properties': {
      const a = toolSchemas.search_properties.parse(call.arguments);
      return {
        kind: 'matches',
        ...(await searchProperties({ ...a.filters, q: a.semantic_query, limit: a.limit }, user)),
      };
    }
    case 'get_property': {
      const a = toolSchemas.get_property.parse(call.arguments),
        p = await getProperty(a.id, user);
      return { kind: 'matches', properties: p ? [p] : [] };
    }
    case 'compare_properties': {
      const a = toolSchemas.compare_properties.parse(call.arguments);
      return { kind: 'compare', properties: await visible(a.ids, user) };
    }
    case 'get_area_insights': {
      const a = toolSchemas.get_area_insights.parse(call.arguments),
        area = await db.areaInsight.findUnique({ where: { communityId: a.area_id } });
      return { kind: 'insights', properties: [], data: area ? { ...area, synthetic: true } : {} };
    }
    case 'calculate_investment': {
      const a = toolSchemas.calculate_investment.parse(call.arguments),
        [p] = await visible([a.property_id], user);
      const charge = p.serviceChargeMinor / 100 / FX[p.currency],
        rent = a.assumptions.annual_rent;
      return {
        kind: 'investment',
        properties: [p],
        data: {
          estimated: true,
          currency: 'AED',
          annualRent: rent,
          grossYield: (rent / p.priceAed) * 100,
          serviceCharges: charge,
          annualCashFlow:
            rent * (1 - a.assumptions.vacancy_percent / 100) - charge - a.assumptions.other_costs,
        },
      };
    }
    case 'save_to_shortlist': {
      const a = toolSchemas.save_to_shortlist.parse(call.arguments),
        properties = await visible(a.property_ids, user);
      const shortlist = await db.shortlist.upsert({
        where: { userId_name: { userId: user.id, name: a.shortlist_name } },
        update: {},
        create: { userId: user.id, name: a.shortlist_name },
      });
      await db.shortlistItem.createMany({
        data: properties.map((p) => ({ propertyId: p.id, shortlistId: shortlist.id })),
        skipDuplicates: true,
      });
      return { kind: 'saved', properties, data: { shortlistId: shortlist.id } };
    }
    case 'request_viewing': {
      const a = toolSchemas.request_viewing.parse(call.arguments),
        properties = await visible([a.property_id], user);
      const slots = a.preferred_slots.map((s) => new Date(s));
      if (slots.some((s) => s.getTime() <= Date.now() || s.getTime() > Date.now() + 366 * 86400000))
        throw new Error('invalid_slots');
      const request = await db.viewingRequest.create({
        data: {
          userId: user.id,
          propertyId: a.property_id,
          slots,
          timezone: a.timezone,
          mode: a.mode,
        },
      });
      await db.analyticsEvent.create({
        data: { kind: 'viewing', areaId: properties[0].communityId },
      });
      return { kind: 'viewing_requested', properties, data: { requestId: request.id } };
    }
    case 'handoff_to_advisor': {
      const a = toolSchemas.handoff_to_advisor.parse(call.arguments);
      const handoff = await db.handoff.create({ data: { userId: user.id, reason: a.reason } });
      return { kind: 'handoff', properties: [], data: { handoffId: handoff.id } };
    }
  }
}
