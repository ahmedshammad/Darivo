import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const t = await getTranslations();
  return (
    <div className="shell page">
      <div className="panel stack" style={{ maxWidth: 850, marginInline: 'auto' }}>
        <p className="eyebrow">{t('privacy')}</p>
        <h1 className="search-title">{t('privacyTitle')}</h1>
        <p>{t('privacyBody')}</p>
      </div>
    </div>
  );
}
