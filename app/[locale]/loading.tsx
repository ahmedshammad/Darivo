import { getTranslations } from 'next-intl/server';
export default async function Loading() {
  const t = await getTranslations();
  return (
    <div className="page empty" role="status" style={{ minBlockSize: '100svh' }}>
      {t('loading')}
    </div>
  );
}
