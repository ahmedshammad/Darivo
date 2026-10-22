import 'dotenv/config';
import {PrismaClient,type Role} from '@prisma/client';
const db=new PrismaClient();
async function seed(){for(const [id,role,verified]of [['client','CLIENT',false],['verified','CLIENT',true],['advisor','ADVISOR',true],['admin','ADMIN',true]] as const){await db.user.upsert({where:{email:`${id}@darivo.example`},update:{},create:{id:`demo-${id}`,name:`Demo ${id}`,email:`${id}@darivo.example`,emailVerified:new Date(),role:role as Role,verification:verified?'VERIFIED':'UNVERIFIED',profile:{create:{consentAt:new Date()}}}});}console.info('Demo identities ready.');}
seed().finally(()=>db.$disconnect());
