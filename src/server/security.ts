import {z} from 'zod';
import {auth} from '@/auth';
import {db} from './db/client';
import type {Role} from '@prisma/client';
export class HttpError extends Error {constructor(public status:number,message:string){super(message)}}
export async function requireUser(roles?:Role[]){const session=await auth();const user=session?.user?.email?await db.user.findUnique({where:{email:session.user.email},include:{profile:true}}):null;if(!user)throw new HttpError(401,'unauthorized');if(roles&&!roles.includes(user.role))throw new HttpError(403,'forbidden');return user;}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');const expected=new URL(process.env.AUTH_URL??req.url).origin;if(!origin||origin!==expected)throw new HttpError(403,'origin_rejected');}
const buckets=new Map<string,{count:number;reset:number}>();
export function rateLimit(key:string,limit=60,windowMs=60000){const now=Date.now();if(buckets.size>10000)for(const [k,v]of buckets)if(v.reset<now)buckets.delete(k);const bucket=buckets.get(key);if(!bucket||bucket.reset<now){buckets.set(key,{count:1,reset:now+windowMs});return;}if(++bucket.count>limit)throw new HttpError(429,'rate_limited');}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
export function failure(error:unknown){if(error instanceof HttpError)return json({error:error.message},error.status);if(error instanceof z.ZodError)return json({error:'invalid_input',fields:error.issues.map(i=>i.path.join('.'))},400);console.error(JSON.stringify({event:'request_error',type:error instanceof Error?error.name:'unknown'}));return json({error:'internal_error'},500);}
