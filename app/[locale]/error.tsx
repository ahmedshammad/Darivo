'use client';
import { useTranslations } from 'next-intl';
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations();
  return (
    <div className="shell page empty stack">
      <h2>{t('errorTitle')}</h2>
      <p>{t('errorBody')}</p>
      <button className="button" onClick={reset}>
        {t('retry')}
      </button>
    </div>
  );
}
