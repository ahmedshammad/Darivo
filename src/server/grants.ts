import {z} from 'zod';
import type {User} from '@prisma/client';
import {db} from './db/client';
import {HttpError} from './errors';
export const grantInput=z.object({userId:z.string().min(1).max(100),propertyId:z.string().min(1).max(100)}).strict();
export async function changeGrant(actor:Pick<User,'id'|'role'>,input:unknown,revoke=false){if(!['ADVISOR','ADMIN'].includes(actor.role))throw new HttpError(403,'forbidden');const a=grantInput.parse(input);return db.$transaction(async tx=>{const property=await tx.property.findUnique({where:{id:a.propertyId}}),client=await tx.user.findUnique({where:{id:a.userId}});if(!property||property.visibility!=='PRIVATE_INVITE'||!client||client.role!=='CLIENT')throw new HttpError(400,'invalid_grant');if(revoke)await tx.offMarketGrant.deleteMany({where:a});else await tx.offMarketGrant.upsert({where:{userId_propertyId:a},update:{grantedBy:actor.id},create:{...a,grantedBy:actor.id}});await tx.auditLog.create({data:{actorId:actor.id,action:revoke?'PRIVATE_GRANT_REVOKED':'PRIVATE_GRANT_CREATED',targetId:`${a.userId}:${a.propertyId}`}});return {granted:!revoke};});}
