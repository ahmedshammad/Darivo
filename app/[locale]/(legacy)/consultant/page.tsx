import { Consultant } from '@/src/components/consultant';
import { optionalUser } from '@/src/server/security';
import { AccessGate } from '@/src/components/access-gate';
import { getAtlasData } from '@/src/server/db/atlas';
import { atlasHandoff } from '@/messages/atlas-handoff';
import Link from 'next/link';
export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<{ property?: string; project?: string; brief?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const [query, route, user] = await Promise.all([searchParams, params, optionalUser()]);
  const locale = route.locale === 'ar' ? 'ar' : 'en';
  const copy = atlasHandoff[locale];
  const request = typeof query.brief === 'string' ? query.brief.slice(0, 1500) : '';
  const project =
    typeof query.project === 'string' && query.project.length <= 160
      ? (await getAtlasData(user)).projects.find((p) => p.id === query.project)
      : undefined;
  const continuation = new URLSearchParams();
  if (project) continuation.set('project', project.id);
  if (request) continuation.set('brief', request);
  if (typeof query.property === 'string')
    continuation.set('property', query.property.slice(0, 160));
  const returnTo = `/${locale}/consultant?${continuation}`;
  const name = project ? (locale === 'ar' ? project.nameAr : project.nameEn) : '';
  const initialInput = [project ? `${copy.ask} ${name} (${project.id})` : '', request]
    .filter(Boolean)
    .join('\n');
  return (
    <>
      {(project || request) && (
        <section className="shell page" aria-label={copy.title} data-testid="atlas-handoff-context">
          <div className="panel stack">
            <h1>{copy.title}</h1>
            <p>{copy.draft}</p>
            {project && (
              <>
                <p className="eyebrow">{copy.project}</p>
                <h2>{name}</h2>
                <p>{project.kind === 'DEMO' ? copy.demo : copy.reference}</p>
                {project.kind === 'REAL_REFERENCE' && <p>{copy.confirm}</p>}
                {[...new Map(project.sources.map((source) => [source.url, source])).values()].map(
                  (source) => (
                    <p className="small" key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {copy.source} · <bdi>{source.publisher}</bdi>
                      </a>{' '}
                      · <bdi>{source.asOf || copy.dateUnknown}</bdi>
                    </p>
                  ),
                )}
              </>
            )}
            {request && (
              <>
                <p className="eyebrow">{copy.request}</p>
                <p dir="auto">{request}</p>
              </>
            )}
            <Link
              href={`/${locale}/explore?${new URLSearchParams({ q: request, ...(project ? { developer: project.developerId } : {}) })}`}
            >
              {copy.back}
            </Link>
          </div>
        </section>
      )}
      {user ? (
        <Consultant propertyId={query.property} initialInput={initialInput || undefined} />
      ) : (
        <AccessGate returnTo={returnTo} />
      )}
    </>
  );
}
