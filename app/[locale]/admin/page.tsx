import {optionalUser} from '@/src/server/security';
import {AccessGate} from '@/src/components/access-gate';
import {Admin,type AdminData} from '@/src/components/staff';
import {db} from '@/src/server/db/client';
import {propertyInclude,serializeProperty} from '@/src/server/db/properties';
import {getTranslations} from 'next-intl/server';
export default async function Page(){const user=await optionalUser(),t=await getTranslations();if(!user)return <AccessGate/>;if(user.role!=='ADMIN')return <div className="shell page empty">{t('accessDenied')}</div>;const [properties,developers,communities,cities,media,users,audit,events,areas]=await Promise.all([db.property.findMany({include:propertyInclude,orderBy:{id:'asc'}}),db.developer.findMany(),db.community.findMany(),db.city.findMany(),db.propertyMedia.findMany(),db.user.findMany({select:{id:true,email:true,role:true,verification:true}}),db.auditLog.findMany({orderBy:{createdAt:'desc'},take:100}),db.analyticsEvent.groupBy({by:['kind'],_count:true}),db.analyticsEvent.groupBy({by:['areaId'],where:{areaId:{not:null}},_count:true,orderBy:{_count:{areaId:'desc'}},take:5})]);return <Admin data={JSON.parse(JSON.stringify({properties:properties.map(serializeProperty),developers,communities,cities,media,users,audit,analytics:{properties:properties.length,users:users.length,events,areas}})) as AdminData}/>;}
