import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { optionalUser } from '@/src/server/security';
import { resolveStory } from '@/src/server/db/story';
import { getAtlasData } from '@/src/server/db/atlas';
import { StoryClient } from '@/src/components/story/story-client';
import { storyCopy } from '@/messages/story';

// React cache is request-local: page and metadata share the same authorized projection.
const readStory = cache(async (slug: string) => {
  const viewer = await optionalUser();
  return { viewer, story: await resolveStory(slug, viewer) };
});
type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ theme?: string; fallback?: string }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  if (locale !== 'en' && locale !== 'ar')
    return { title: 'Darivo', robots: { index: false, follow: false } };
  const { story } = await readStory(slug);
  if (!story) return { title: 'Darivo', robots: { index: false, follow: false } };
  return {
    title: `${story.name[locale]} · Darivo`,
    description: storyCopy[locale].story,
    robots: { index: story.kind === 'REAL_REFERENCE_PROJECT', follow: true },
    alternates: { canonical: `/${locale}${story.storyPath}` },
  };
}
export default async function StoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const [{ story, viewer }, query] = await Promise.all([readStory(slug), searchParams]);
  if (!story) notFound();
  const atlas = await getAtlasData(viewer);
  // One authorized subject and nearby Demo context, not the inventory, cross the RSC boundary.
  const projects = atlas.projects.filter((project) => project.id === story.projectId);
  const pois = atlas.pois.filter(
    (poi) =>
      Math.abs(poi.center[0] - story.center[0]) < 0.6 &&
      Math.abs(poi.center[1] - story.center[1]) < 0.6,
  );
  return (
    <StoryClient
      story={story}
      data={{ projects, pois }}
      locale={locale}
      initialTheme={query.theme === 'light' ? 'light' : 'dark'}
      forceFallback={query.fallback === '1'}
    />
  );
}
