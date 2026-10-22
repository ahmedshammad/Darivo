import { createHash } from 'node:crypto';
import { officePreferencesSchema, type DossierDTO } from '@/src/lib/office';
import { getDossierData } from '@/src/server/db/office';
import { db } from '@/src/server/db/client';
import { renderOfficeDossier } from '@/src/server/pdf/office-dossier';
import { failure, requireUser, rateLimit, HttpError } from '@/src/server/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const exportPreferences = officePreferencesSchema.extend({
  currency: officePreferencesSchema.shape.currency.removeDefault().optional(),
  locale: officePreferencesSchema.shape.locale.removeDefault().optional(),
  areaUnit: officePreferencesSchema.shape.areaUnit.removeDefault().optional(),
  arabicIndicDigits: officePreferencesSchema.shape.arabicIndicDigits.removeDefault().optional(),
});
/** Ignores generation time only; any authorized data, board or preference change invalidates bytes. */
function dossierFingerprint(data: DossierDTO) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        version: data.version,
        portfolio: data.portfolio,
        stories: data.stories,
        preferences: data.preferences,
      }),
    )
    .digest('hex');
}
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await requireUser(['CLIENT', 'VERIFIED_CLIENT']);
    rateLimit(`office-pdf:${viewer.id}`, 6);
    const query = new URL(request.url).searchParams;
    const reviewVisibleValue = query.get('reviewVisible');
    if (reviewVisibleValue !== null && !['true', 'false'].includes(reviewVisibleValue))
      throw new HttpError(400, 'invalid_input');
    const options = { reviewVisible: reviewVisibleValue === 'true' };
    query.delete('reviewVisible');
    const requested = Object.fromEntries(query);
    const preferences = exportPreferences.parse({
      ...requested,
      ...(query.has('arabicIndicDigits')
        ? {
            arabicIndicDigits: ['true', '1'].includes(query.get('arabicIndicDigits') ?? '')
              ? true
              : ['false', '0'].includes(query.get('arabicIndicDigits') ?? '')
                ? false
                : query.get('arabicIndicDigits'),
          }
        : {}),
    });
    const id = (await params).id;
    const data = await getDossierData(id, viewer, preferences, options);
    if (!data) throw new HttpError(404, 'not_found');
    if (!data.stories.length) throw new HttpError(409, 'empty_portfolio');
    const fingerprint = dossierFingerprint(data);
    const pdf = await renderOfficeDossier(data);
    // Rendering can outlive a grant, role or board change. Re-read before releasing bytes.
    const currentViewer = await requireUser(['CLIENT', 'VERIFIED_CLIENT']);
    if (currentViewer.id !== viewer.id) throw new HttpError(404, 'not_found');
    const current = await getDossierData(id, currentViewer, preferences, options);
    if (!current) throw new HttpError(404, 'not_found');
    if (dossierFingerprint(current) !== fingerprint)
      throw new HttpError(409, 'dossier_review_required');
    await db.auditLog.create({
      data: { actorId: viewer.id, action: 'PRIVATE_DOSSIER_EXPORT', targetId: id },
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="darivo-private-dossier.pdf"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return failure(error);
  }
}
