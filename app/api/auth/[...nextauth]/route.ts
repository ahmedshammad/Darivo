import type {NextRequest} from 'next/server';
import {handlers} from '@/auth';
import {failure,rateLimit} from '@/src/server/security';
export const GET=handlers.GET;
export async function POST(req:NextRequest){try{rateLimit('auth',30);return await handlers.POST(req);}catch(e){return failure(e);}}
