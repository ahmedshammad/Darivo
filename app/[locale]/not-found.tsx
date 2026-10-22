import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
export default async function NotFound() {
  const t = await getTranslations(),
    locale = await getLocale();
  return (
    <main id="main" className="shell page empty stack">
      <h1>{t('notFound')}</h1>
      <p>{t('notFoundBody')}</p>
      <Link href={`/${locale}/search`}>{t('back')}</Link>
    </main>
  );
}
