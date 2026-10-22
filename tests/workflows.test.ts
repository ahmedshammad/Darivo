import {describe,it,expect,afterAll} from 'vitest';
import {slotToIso} from '../src/lib/timezone';
import {executeTool} from '../src/server/ai/tools';
import {db} from '../src/server/db/client';
const client={id:'demo-client',role:'CLIENT' as const,verification:'UNVERIFIED' as const};
afterAll(()=>db.$disconnect());
describe('client workflows',()=>{it('converts Dubai and Cairo summer slots to UTC',()=>{expect(slotToIso('2027-06-01T12:00','Asia/Dubai')).toBe('2027-06-01T08:00:00Z');expect(slotToIso('2027-06-01T12:00','Africa/Cairo')).toBe('2027-06-01T09:00:00Z');});it('rejects saving a restricted property even with a valid user',async()=>{await expect(executeTool({name:'save_to_shortlist',arguments:{property_ids:['property-020'],shortlist_name:'leak'}},client)).rejects.toThrow('not_found');});it('calculates cash flow from bounded explicit assumptions',async()=>{const r=await executeTool({name:'calculate_investment',arguments:{property_id:'property-002',assumptions:{annual_rent:440000,vacancy_percent:5,other_costs:10000}}},client);expect(r.data?.grossYield).toBe(5);expect(r.data?.annualCashFlow).toBe(390000);expect(r.data?.estimated).toBe(true);});it('refuses past viewing slots',async()=>{await expect(executeTool({name:'request_viewing',arguments:{property_id:'property-002',preferred_slots:['2020-01-01T12:00:00Z'],mode:'video'}},client)).rejects.toThrow('invalid_slots');});});
