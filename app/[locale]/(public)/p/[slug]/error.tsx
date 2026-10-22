'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { storyCopy } from '@/messages/story';
import '@/src/components/story/story.css';
export default function StoryError({ retry }: { retry: () => void }) {
  const params = useParams<{ locale: string }>();
  const locale = params.locale === 'ar' ? 'ar' : 'en';
  const t = storyCopy[locale];
  return (
    <main id="main" className="story-state">
      <h1>{t.errorTitle}</h1>
      <p>{t.errorBody}</p>
      <button onClick={retry}>{t.retry}</button>
      <Link href={`/${locale}/explore`}>{t.back}</Link>
    </main>
  );
}
