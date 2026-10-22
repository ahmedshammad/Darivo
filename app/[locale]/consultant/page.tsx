import {Consultant} from '@/src/components/consultant';
import {optionalUser} from '@/src/server/security';
import {AccessGate} from '@/src/components/access-gate';
export default async function Page({searchParams}:{searchParams:Promise<{property?:string}>}){if(!await optionalUser())return <AccessGate/>;return <Consultant propertyId={(await searchParams).property}/>;}
