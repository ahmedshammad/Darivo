'use client';
import { useParams } from 'next/navigation';
import { storyCopy } from '@/messages/story';
import '@/src/components/story/story.css';
export default function StoryLoading() {
  const { locale } = useParams<{ locale: string }>();
  const t = storyCopy[locale === 'ar' ? 'ar' : 'en'];
  return (
    <main id="main" className="story-state" role="status">
      <p>DARIVO</p>
      <h1>{t.loading}</h1>
    </main>
  );
}
