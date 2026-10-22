import { resolveStory } from '@/src/server/db/story';
import { HttpError, rateLimit, optionalUser } from '@/src/server/security';
import { officeResponse, officeQueryPreferences } from '@/src/server/office/http';
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  return officeResponse(async () => {
    const viewer = await optionalUser();
    rateLimit(`story:${viewer?.id ?? 'guest'}`, 180);
    const story = await resolveStory((await ctx.params).slug, viewer, officeQueryPreferences(req));
    if (!story) throw new HttpError(404, 'not_found');
    return story;
  });
}
