'use client';
import { useParams } from 'next/navigation';
import { errorCopy } from '@/messages/errors';
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { locale } = useParams<{ locale: string }>();
  const t = errorCopy[locale === 'ar' ? 'ar' : 'en'];
  return (
    <main id="main" className="shell page empty stack">
      <h1>{t.errorTitle}</h1>
      <p>{t.errorBody}</p>
      <button className="button" onClick={reset}>
        {t.retry}
      </button>
    </main>
  );
}
