import {getProperty} from '@/src/server/db/properties';
import {optionalUser} from '@/src/server/security';
import {PropertyDetail} from '@/src/components/property-detail';
import {notFound} from 'next/navigation';
export default async function Page({params}:{params:Promise<{id:string}>}){const p=await getProperty((await params).id,await optionalUser());if(!p)notFound();return <PropertyDetail property={p}/>;}
