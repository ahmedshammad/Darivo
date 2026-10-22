import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
export async function AccessGate() {
  const t = await getTranslations(),
    locale = await getLocale();
  return (
    <div className="shell page empty stack">
      <h2>{t('accessRequired')}</h2>
      <p>{t('accessBody')}</p>
      <Link className="button button-primary" style={{ margin: 'auto' }} href={`/${locale}/login`}>
        {t('signIn')}
      </Link>
    </div>
  );
}
