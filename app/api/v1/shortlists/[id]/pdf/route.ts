import { requireUser, failure, json, rateLimit } from '@/src/server/security';
import { scopedShortlists } from '@/src/server/db/workflows';
import { renderDossier } from '@/src/server/pdf/dossier';
export const runtime = 'nodejs';
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    rateLimit(`pdf:${user.id}`, 6);
    const [list] = await scopedShortlists(user, (await params).id);
    if (!list) return json({ error: 'not_found' }, 404);
    const pdf = await renderDossier(
      list.name,
      list.properties.slice(0, 24),
      user.profile?.currency ?? 'AED',
    );
    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="darivo-private-dossier.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    return failure(e);
  }
}
