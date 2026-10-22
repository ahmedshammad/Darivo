import {optionalUser} from '@/src/server/security';
import {Comparison} from '@/src/components/client-workflows';
import {getProperty,type PropertyDTO} from '@/src/server/db/properties';
import {notFound} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<{ids?:string}>}){const user=await optionalUser(),ids=(await searchParams).ids?.split(',')??[],properties:PropertyDTO[]=[];if(ids.length>4)notFound();for(const id of ids){const p=await getProperty(id,user);if(!p)notFound();properties.push(p);}return <Comparison properties={properties}/>;}
