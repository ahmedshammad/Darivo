import {z} from 'zod';
import {db} from '@/src/server/db/client';
import {requireUser,sameOrigin,failure,json} from '@/src/server/security';
export async function POST(req:Request){try{sameOrigin(req);const user=await requireUser();z.object({placeholder:z.literal('synthetic-placeholder'),consent:z.literal(true)}).strict().parse(await req.json());await db.user.updateMany({where:{id:user.id,verification:'UNVERIFIED'},data:{verification:'PENDING'}});await db.auditLog.create({data:{actorId:user.id,action:'MOCK_VERIFICATION_REQUEST',targetId:user.id}});return json({status:'PENDING'});}catch(e){return failure(e);}}
