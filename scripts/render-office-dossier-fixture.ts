import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { db } from '../src/server/db/client';
import { resolveOfficeEntity, storySummary } from '../src/server/db/story';
import { renderOfficeDossier, officeDossierHtml } from '../src/server/pdf/office-dossier';
import { dossierDTOSchema } from '../src/lib/office';
// Read-only projection of public seeded subjects; the QA board is never persisted.
async function main() {
  const output = process.argv[2] ?? '/tmp/darivo-office-dossier';
  await mkdir(output, { recursive: true });
  const viewer = await db.user.findUniqueOrThrow({ where: { id: 'demo-client' } });
  const refs = [
    { kind: 'reference-project' as const, id: 'orla-palm-jumeirah' },
    { kind: 'reference-project' as const, id: 'southmed' },
    { kind: 'demo-unit' as const, id: 'property-001' },
  ];
  const now = new Date().toISOString();
  for (const locale of ['en', 'ar'] as const) {
    const preferences = {
      locale,
      currency: 'GBP' as const,
      areaUnit: 'sqm' as const,
      arabicIndicDigits: locale === 'ar',
    };
    const stories = [];
    for (const ref of refs) {
      const story = await resolveOfficeEntity(ref, viewer, preferences);
      if (!story) throw new Error('missing ' + ref.id);
      stories.push(story);
    }
    const data = dossierDTOSchema.parse({
      version: 1,
      generatedAt: now,
      preferences,
      stories,
      portfolio: {
        id: 'qa-only',
        name: 'Across two shores / بين شاطئين',
        version: 0,
        createdAt: now,
        updatedAt: now,
        visibleCount: stories.length,
        items: stories.map((story, index) => ({
          itemId: 'qa-' + index,
          ref: refs[index],
          summary: storySummary(story),
        })),
      },
    });
    await writeFile(join(output, `${locale}.json`), JSON.stringify(data, null, 2));
    await writeFile(join(output, `${locale}.html`), await officeDossierHtml(data));
    const pdf = await renderOfficeDossier(data);
    await writeFile(join(output, `${locale}.pdf`), pdf);
    console.info(
      JSON.stringify({
        locale,
        stories: stories.length,
        bytes: pdf.length,
        fixture: 'ephemeral QA board; authorized read-only source projection',
      }),
    );
  }
}
main().finally(() => db.$disconnect());
