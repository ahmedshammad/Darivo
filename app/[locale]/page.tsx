import {getTranslations} from 'next-intl/server';
export default async function Home(){const t=await getTranslations();return <div className="shell page"><p className="eyebrow">{t('welcome')}</p><h1 style={{marginTop:24,maxWidth:850}}>{t('tagline')}</h1><p className="muted" style={{marginTop:24}}>{t('intro')}</p></div>;}
