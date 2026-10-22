import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
export async function AccessGate({ returnTo }: { returnTo?: string } = {}) {
  const t = await getTranslations(),
    locale = await getLocale();
  return (
    <div className="shell page empty stack">
      <h2>{t('accessRequired')}</h2>
      <p>{t('accessBody')}</p>
      <Link
        className="button button-primary"
        style={{ margin: 'auto' }}
        href={`/${locale}/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
      >
        {t('signIn')}
      </Link>
    </div>
  );
}
