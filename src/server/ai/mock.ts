import {AREAS} from '@/src/lib/catalog';
import {briefSchema,type Brief,type ToolCall} from './schema';
export function normalize(input:string){return input.toLowerCase().replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[أإآ]/g,'ا').replace(/[ًٌٍَُِّْ]/g,'');}
export function extractBrief(input:string):Brief{const text=normalize(input),filters:Brief['filters']={};
 for(const a of AREAS)if([a[0].replaceAll('-',' '),a[3],a[4]].some(n=>text.includes(normalize(n)))){filters.community=a[0];filters.country=a[7];break;}
 if(/dubai|دبي/.test(text)){filters.city='dubai';filters.country='AE';}else if(/abu dhabi|ابوظبي|ابو ظبي/.test(text)){filters.city='abu-dhabi';filters.country='AE';}else if(/cairo|القاهرة/.test(text)){filters.country='EG';}else if(/egypt|مصر/.test(text))filters.country='EG';else if(/uae|emirates|الامارات/.test(text))filters.country='AE';
 if(/villa|فيلا|فيلات|vila/.test(text))filters.type='villa';else if(/apartment|flat|شقة|شقه/.test(text))filters.type='apartment';else if(/penthouse|بنتهاوس/.test(text))filters.type='penthouse';else if(/townhouse|تاون/.test(text))filters.type='townhouse';else if(/mansion|قصر/.test(text))filters.type='mansion';else if(/plot|ارض/.test(text))filters.type='plot';
 const bed=text.match(/(\d+)\s*[- ]?\s*(?:bed(?:room)?s?|غرف|غرفة|غرفه)/);if(bed)filters.bedrooms=Number(bed[1]);else if(/three bedrooms|ثلاث غرف/.test(text))filters.bedrooms=3;
 const budget=text.match(/(?:under|below|budget(?: of)?|up to|max(?:imum)?|تحت|اقل من|حتى|بحدود|ميزاني(?:ة|ه|تي))\s*[:=]?\s*([\d,.]+)\s*(million|m\b|مليون|ملايين|k\b|الف)?/);
 if(budget){const amount=Number(budget[1].replaceAll(',',''));filters.maxPrice=amount*(/million|^m$|مليون|ملايين/.test(budget[2]??'')?1e6:/^k$|الف/.test(budget[2]??'')?1000:1);}
 for(const [currency,pattern]of [['AED',/aed|dirham|درهم/],['EGP',/egp|egyptian pound|جنيه/],['USD',/usd|dollar|دولار|\$/],['EUR',/eur|euro|يورو/],['SAR',/sar|riyal|ريال/],['GBP',/gbp|sterling|استرليني/]] as const)if(pattern.test(text))filters.currency=currency;
 if(/off.plan|على المخطط|قيد الانشاء/.test(text))filters.status='off_plan';else if(/ready|جاهز|جاهزة/.test(text))filters.status='ready';
 if(/sea view|waterfront|اطلالة بحر|اطلاله بحر/.test(text))filters.view='sea';else if(/garden view|اطلالة على الحديقة/.test(text))filters.view='garden';
 const amenities:NonNullable<Brief['filters']['amenities']>=[];if(/private pool|مسبح خاص|حمام سباحة/.test(text))amenities.push('private_pool');if(/school|مدرس/.test(text))amenities.push('school');if(amenities.length)filters.amenities=amenities;
 if(/branded|علامة/.test(text))filters.branded='true';
 const purpose=/golden visa|اقامة ذهبية|الاقامة الذهبية/.test(text)?'golden_visa':/invest|استثمار/.test(text)?'investment':/holiday|عطلة|مصيف/.test(text)?'holiday':/relocat|انتقال/.test(text)?'relocation':/residen|family|home|سكن|عائل/.test(text)?'residence':undefined;
 if(purpose==='golden_visa')filters.goldenVisa='true';const timeline=text.match(/(?:within|in|خلال)\s+(\d+\s*(?:months?|years?|اشهر|شهور|سنوات|سنة))/)?.[1];return briefSchema.parse({filters,purpose,timeline});
}
export const isAdvice=(text:string)=>/tax|legal|lawyer|personal financial|my savings|should i invest|guarantee.*return|ضرائب|ضريب|قانون|مدخرات|استثمر اموالي|عائد مضمون/.test(normalize(text));
export interface AIProvider {plan(message:string,brief:Brief,locale:'en'|'ar'):Promise<{brief:Brief;calls:ToolCall[]}>;}
export class MockProvider implements AIProvider{async plan(message:string,previous:Brief){const extracted=extractBrief(message);const brief=briefSchema.parse({...previous,...Object.fromEntries(Object.entries(extracted).filter(([k,v])=>k!=='filters'&&v!==undefined)),filters:{...previous.filters,...extracted.filters}});const text=normalize(message),ids=message.match(/property-[a-zA-Z0-9-]+/g)??[];
 let calls:ToolCall[];
 if(isAdvice(message)||/human|advisor|مستشار بشري|موظف/.test(text))calls=[{name:'handoff_to_advisor',arguments:{reason:message}}];
 else if(/compare|قارن|مقارنة/.test(text)&&ids.length)calls=[{name:'compare_properties',arguments:{ids:ids.slice(0,4)}}];
 else if(/save|shortlist|احفظ|حفظ/.test(text)&&ids.length)calls=[{name:'save_to_shortlist',arguments:{property_ids:ids,shortlist_name:/[\u0600-\u06ff]/.test(message)?'اختياراتي':'My collection'}}];
 else if(/area insight|عن المنطقة/.test(text)&&brief.filters.community)calls=[{name:'get_area_insights',arguments:{area_id:brief.filters.community}}];
 else if(/calculate|احسب/.test(text)&&ids.length&&text.match(/(?:rent|ايجار)\s+([\d,]+)/))calls=[{name:'calculate_investment',arguments:{property_id:ids[0],assumptions:{annual_rent:Number(text.match(/(?:rent|ايجار)\s+([\d,]+)/)![1].replaceAll(',',''))}}}];
 else if(/viewing|book|معاينة|احجز/.test(text)&&ids.length&&message.match(/\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})/))calls=[{name:'request_viewing',arguments:{property_id:ids[0],preferred_slots:[message.match(/\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})/)![0]],mode:/video|فيديو/.test(text)?'video':'in_person'}}];
 else if(ids.length)calls=[{name:'get_property',arguments:{id:ids[0]}}];
 else calls=[{name:'search_properties',arguments:{filters:brief.filters,semantic_query:message.slice(0,500),limit:4}}];
 return {brief,calls};}}
