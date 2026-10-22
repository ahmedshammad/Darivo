import 'dotenv/config';
import {PrismaClient,type Role} from '@prisma/client';
import {AREAS,TYPES,typeAr,FX,FX_DATE} from '../src/lib/catalog';
import {embed} from '../src/server/search/embedding';
const db=new PrismaClient();
async function seed(){for(const [id,role,verified]of [['client','CLIENT',false],['verified','CLIENT',true],['advisor','ADVISOR',true],['admin','ADMIN',true]] as const){await db.user.upsert({where:{email:`${id}@darivo.example`},update:{},create:{id:`demo-${id}`,name:`Demo ${id}`,email:`${id}@darivo.example`,emailVerified:new Date(),role:role as Role,verification:verified?'VERIFIED':'UNVERIFIED',profile:{create:{consentAt:new Date()}}}});}await seedInventory();console.info('Demo identities and 200 fictional properties ready.');}
async function seedInventory(){
 for(const [id,nameEn,nameAr]of [['AE','United Arab Emirates','الإمارات العربية المتحدة'],['EG','Egypt','مصر']])await db.country.upsert({where:{id},update:{},create:{id,nameEn,nameAr}});
 for(const [id,city,cityAr,nameEn,nameAr,lat,lng,countryId]of AREAS){const cityId=city.toLowerCase().replaceAll(' ','-');await db.city.upsert({where:{id:cityId},update:{},create:{id:cityId,nameEn:city,nameAr:cityAr,countryId}});await db.community.upsert({where:{id},update:{},create:{id,cityId,nameEn,nameAr,lat,lng,insight:{create:{averageAedSqm:countryId==='AE'?24000:6500,yieldLow:4.5,yieldHigh:6.5,notesEn:'Synthetic outlook: a balanced pipeline of low-density homes. All figures are illustrative.',notesAr:'توقعات افتراضية: معروض متوازن من المساكن منخفضة الكثافة. جميع الأرقام توضيحية.'}}}});}
 for(const [i,nameEn,nameAr] of [[0,'Nacre Habitat','مساكن الصدف'],[1,'Serein Living','سيرين للعيش الراقي'],[2,'Aureline Estates','أوريلين العقارية'],[3,'Riwaq Atelier','رواق أتولييه']] as const)await db.developer.upsert({where:{id:`developer-${i}`},update:{},create:{id:`developer-${i}`,nameEn,nameAr,descriptionEn:'A fictional studio of considered homes, created for this Darivo demonstration.',descriptionAr:'استوديو عقاري افتراضي لمساكن مدروسة بعناية، صُمّم لعرض داريفو التجريبي.'}});
 for(const [currency,perAed]of Object.entries(FX))await db.fxRate.upsert({where:{currency},update:{},create:{currency,perAed,asOf:new Date(FX_DATE)}});
 if(await db.property.count())return;
 const names=['The Courtyard','The Horizon','The Grove','The Terrace','The Sanctuary','The Dune'];
 const namesAr=['دار الفناء','دار الأفق','دار البستان','دار الشرفة','دار السكينة','دار الكثبان'];
 for(let i=0;i<200;i++){
 const area=AREAS[i%AREAS.length],type=i===1?'villa':TYPES[i%6],beds=i===1?3:type==='plot'?0:2+i%5;
 const priceAed=i===1?8800000:area[7]==='AE'?1800000+(i%21)*710000+(type==='mansion'?18000000:0):650000+(i%17)*180000;
 const currency=area[7]==='AE'?'AED':'EGP',status=i%3===0?'off_plan':'ready',view=i%2===0?'sea':'garden';
 const title=`${names[i%6]} ${String(i+1).padStart(3,'0')}`,titleAr=`${namesAr[i%6]} ${String(i+1).padStart(3,'0')}`;
 const description=`An inviting ${type} in ${area[3]}, with ${beds} bedrooms, considered proportions and a ${view} outlook. Quiet interiors open onto generous outdoor living. Fictional property, illustrative design.`;
 const descriptionAr=`${typeAr[type]} في ${area[4]}، تضم ${beds} غرف نوم ومساحات رحبة وإطلالة ${view==='sea'?'بحرية':'على الحديقة'}. تنسجم التفاصيل الهادئة مع مساحات خارجية مريحة. عقار افتراضي وتصميم توضيحي.`;
 const id=`property-${String(i+1).padStart(3,'0')}`;
 await db.property.create({data:{id,slug:title.toLowerCase().replaceAll(' ','-'),communityId:area[0],developerId:`developer-${i%4}`,type,status,handoverDate:status==='off_plan'?new Date('2028-06-30'):null,bedrooms:beds,bathrooms:Math.max(1,beds+1),areaSqm:140+(i%12)*55,plotSqm:type==='villa'||type==='mansion'?700+i*5:null,priceMinor:BigInt(Math.round(priceAed*FX[currency]*100)),currency,priceAed,serviceChargeMinor:Math.round(18000*FX[currency]*100),view,furnishing:i%2?'furnished':'unfurnished',amenities:['concierge','security',...(i%2?['private_pool','school']:['gym','beach'])],branded:i%7===0,visibility:i%20===19?'PRIVATE_INVITE':i%20>=16?'VERIFIED_ONLY':'PUBLIC',permitNumber:`SYN-${area[7]}-${String(i+1).padStart(5,'0')}`,lastVerifiedAt:new Date('2026-10-01'),verification:'VERIFIED',lat:area[5]+(i%5)*.002,lng:area[6]+(i%4)*.002,translations:{create:[{locale:'en',title,description},{locale:'ar',title:titleAr,description:descriptionAr}]},media:{create:[{url:`/art/property-${i%6}.svg`,altEn:'Original architectural illustration of a fictional residence',altAr:'رسم معماري أصلي لمسكن افتراضي',position:0},{url:`/art/property-${(i+2)%6}.svg`,altEn:'Illustrative courtyard concept',altAr:'تصوّر توضيحي للفناء',position:1}]},...(status==='off_plan'?{paymentPlan:{create:{bookingPercent:20,constructionPercent:40,handoverPercent:40}}}:{})}});
 const embedding=JSON.stringify(embed(`${title} ${description} ${titleAr} ${descriptionAr} ${area[3]} ${area[4]} ${type} ${view}`));
 await db.$executeRaw`UPDATE "Property" SET embedding=${embedding}::vector WHERE id=${id}`;
 }
}
seed().finally(()=>db.$disconnect());
