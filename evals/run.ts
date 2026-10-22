import 'dotenv/config';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {z} from 'zod';
import {db} from '../src/server/db/client';
import {consult} from '../src/server/ai/consultant';
import {MockProvider,type AIProvider} from '../src/server/ai/mock';
import {OpenAICompatibleProvider} from '../src/server/ai/openai';
import {getProperty} from '../src/server/db/properties';
const caseSchema=z.object({message:z.string(),filters:z.record(z.string(),z.unknown()).optional(),empty:z.boolean().optional(),handoff:z.boolean().optional()});
async function run(provider:AIProvider,name:string){const id=`eval-${Date.now()}-${name}`;const user=await db.user.create({data:{id,email:`${id}@darivo.example`}});let passed=0;const failures=[];try{const cases=readFileSync('evals/consultant.jsonl','utf8').trim().split('\n').map(l=>caseSchema.parse(JSON.parse(l)));for(const c of cases){try{const reply=await consult(c.message,user,/[\u0600-\u06ff]/.test(c.message)?'ar':'en',{filters:{}},provider);for(const [key,value]of Object.entries(c.filters??{}))assert.deepEqual(reply.brief.filters[key as keyof typeof reply.brief.filters],value,`filter ${key}`);for(const p of reply.properties){assert(await getProperty(p.id,user),'ID exists and is visible');assert.equal(p.visibility,'PUBLIC','zero off-market leakage');}if(c.empty)assert.equal(reply.properties.length,0);if(c.handoff)assert.equal(reply.kind,'handoff');const mentioned=reply.text.match(/property-[\w-]+/g)??[];for(const id of mentioned)assert(reply.properties.some(p=>p.id===id));assert.equal((reply.text.match(/[0-9٠-٩]+/g)??[]).length,0,'factual numbers render only through tool-result cards');passed++;}catch(e){failures.push({message:c.message,error:e instanceof Error?e.message:String(e)});}}console.info(JSON.stringify({provider:name,passed,total:cases.length,offMarketLeakage:failures.some(f=>f.error.includes('leakage'))?'FAIL':0,failures},null,2));if(failures.length)process.exitCode=1;}finally{await db.user.delete({where:{id}});}}
async function main(){await run(new MockProvider(),'mock');if(process.env.OPENAI_API_KEY)await run(new OpenAICompatibleProvider(),'openai');else console.info('Real-provider eval skipped: no API key configured.');}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.$disconnect());
