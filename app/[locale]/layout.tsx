import {NextIntlClientProvider} from 'next-intl';
import {getMessages,setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {auth} from '@/auth';
import {db} from '@/src/server/db/client';
import {Shell} from '@/src/components/shell';
import '../globals.css';
export const metadata={title:{default:'Darivo · A considered address',template:'%s · Darivo'},description:'A private, bilingual property collection. Synthetic demonstration.'};
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(!['en','ar'].includes(locale))notFound();setRequestLocale(locale);const messages=await getMessages();const session=await auth();const user=session?.user?.email?await db.user.findUnique({where:{email:session.user.email}}):null;return <html lang={locale} dir={locale==='ar'?'rtl':'ltr'}><body><NextIntlClientProvider messages={messages}><Shell email={user?.email} role={user?.role}>{children}</Shell></NextIntlClientProvider></body></html>;}
