import {requireUser,sameOrigin,failure,json} from '@/src/server/security';
import {executeTool} from '@/src/server/ai/tools';
export async function POST(req:Request){try{sameOrigin(req);return json(await executeTool({name:'calculate_investment',arguments:await req.json()},await requireUser()));}catch(e){return failure(e);}}
