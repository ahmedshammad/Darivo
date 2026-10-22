import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { Prisma } from '@prisma/client';
import { db } from './client';
import { visibilityWhere, type Viewer } from './properties';
import { resolveOfficeEntity, resolveStory, storySummary, readOfficePreferences } from './story';
import { HttpError } from '../errors';
import { isClientRole } from '../auth/roles';
import { assertOfficePrivacy, getClientPrivacy, type OfficePrivacyAction } from '../office/privacy';
import { slotToIso } from '@/src/lib/timezone';
import {
  officeEntityRefSchema,
  portfolioCreateSchema,
  portfolioRenameSchema,
  portfolioItemsInputSchema,
  viewingInputSchema,
  projectEnquiryInputSchema,
  threadMessageInputSchema,
  portfolioDTOSchema,
  officeDTOSchema,
  viewingDTOSchema,
  projectEnquirySchema,
  advisorDTOSchema,
  threadDTOSchema,
  dossierDTOSchema,
  type OfficeEntityRef,
  type OfficePreferences,
  type PortfolioDTO,
  type OfficeDTO,
  type OfficeComparison,
  type ViewingDTO,
  type AdvisorDTO,
  type ThreadDTO,
  type ProjectEnquiryDTO,
  type DossierDTO,
} from '@/src/lib/office';
import type { StorySummary } from '@/src/lib/story';

type Database = Prisma.TransactionClient;
type Actor = NonNullable<Viewer>;
const jsonValue = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export async function officeClient(viewer: Actor, tx: Database = db) {
  const user = await tx.user.findUnique({ where: { id: viewer.id } });
  if (!user) throw new HttpError(401, 'unauthorized');
  if (!isClientRole(user.role)) throw new HttpError(403, 'client_required');
  return user;
}
export async function authorizeOfficeRefs(
  refs: OfficeEntityRef[],
  viewer: Actor,
  tx: Database = db,
) {
  const user = await officeClient(viewer, tx);
  const unique = [
    ...new Map(refs.map((r) => [`${r.kind}:${r.id}`, officeEntityRefSchema.parse(r)])).values(),
  ];
  for (const ref of unique) {
    const found =
      ref.kind === 'reference-project'
        ? await tx.project.findFirst({
            where: { id: ref.id, kind: 'REAL_REFERENCE' },
            select: { id: true },
          })
        : await tx.property.findFirst({
            where: { AND: [{ id: ref.id }, visibilityWhere(user)] },
            select: { id: true },
          });
    if (!found) throw new HttpError(404, 'not_found');
  }
  return { user, refs: unique };
}
async function mutation<T extends Prisma.InputJsonObject>(
  viewer: Actor,
  kind: string,
  input: { clientRequestId: string },
  action: OfficePrivacyAction,
  work: (tx: Database, user: Awaited<ReturnType<typeof officeClient>>) => Promise<T>,
): Promise<T> {
  return db.$transaction(
    async (tx) => {
      const user = await officeClient(viewer, tx);
      await assertOfficePrivacy(user.id, action, tx);
      const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
      const previous = await tx.workflowMutation.findUnique({
        where: {
          userId_kind_clientRequestId: {
            userId: user.id,
            kind,
            clientRequestId: input.clientRequestId,
          },
        },
      });
      if (previous) {
        if (previous.requestHash !== hash) throw new HttpError(409, 'idempotency_conflict');
        return previous.result as T;
      }
      const result = await work(tx, user);
      await tx.workflowMutation.create({
        data: {
          userId: user.id,
          kind,
          clientRequestId: input.clientRequestId,
          requestHash: hash,
          result,
        },
      });
      return result;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
async function ownedPortfolio(id: string, viewer: Actor, tx: Database = db) {
  const user = await officeClient(viewer, tx);
  const board = await tx.shortlist.findFirst({
    where: { id, userId: user.id },
    include: { items: true, projectItems: true },
  });
  if (!board) throw new HttpError(404, 'not_found');
  return board;
}
function entries(board: Awaited<ReturnType<typeof ownedPortfolio>>) {
  return [
    ...board.items.map((i) => ({
      itemId: i.id,
      ref: { kind: 'demo-unit' as const, id: i.propertyId },
    })),
    ...board.projectItems.map((i) => ({
      itemId: i.id,
      ref: { kind: 'reference-project' as const, id: i.projectId },
    })),
  ].sort((a, b) => a.itemId.localeCompare(b.itemId));
}
export async function getPortfolio(
  id: string,
  viewer: Actor,
  preferences: Partial<OfficePreferences> = {},
): Promise<PortfolioDTO | null> {
  const user = await officeClient(viewer);
  const board = await db.shortlist.findFirst({
    where: { id, userId: user.id },
    include: { items: true, projectItems: true },
  });
  if (!board) return null;
  const items = [];
  for (const item of entries(board)) {
    const story = await resolveOfficeEntity(item.ref, user, preferences);
    if (story) items.push({ ...item, summary: storySummary(story) });
  }
  return portfolioDTOSchema.parse({
    id: board.id,
    name: board.name,
    version: board.version,
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
    items,
    visibleCount: items.length,
  });
}
export async function listPortfolios(viewer: Actor, preferences: Partial<OfficePreferences> = {}) {
  const user = await officeClient(viewer);
  const rows = await db.shortlist.findMany({
    where: { userId: user.id },
    select: { id: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const boards: PortfolioDTO[] = [];
  for (const row of rows) {
    const board = await getPortfolio(row.id, user, preferences);
    if (board) boards.push(board);
  }
  return boards;
}
export async function createPortfolio(value: unknown, viewer: Actor) {
  const input = portfolioCreateSchema.parse(value);
  const result = await mutation(viewer, 'portfolio.create', input, 'save', async (tx, user) => {
    if ((await tx.shortlist.count({ where: { userId: user.id } })) >= 100)
      throw new HttpError(409, 'portfolio_limit');
    const board = await tx.shortlist.upsert({
      where: { userId_name: { userId: user.id, name: input.name } },
      update: {},
      create: { userId: user.id, name: input.name },
    });
    return { id: board.id };
  });
  return getPortfolio(String(result.id), viewer);
}
export async function renamePortfolio(id: string, value: unknown, viewer: Actor) {
  const input = portfolioRenameSchema.parse(value);
  await mutation(viewer, `portfolio.rename:${id}`, input, 'save', async (tx, user) => {
    await ownedPortfolio(id, user, tx);
    const changed = await tx.shortlist.updateMany({
      where: { id, userId: user.id, version: input.version },
      data: { name: input.name, version: { increment: 1 } },
    });
    if (!changed.count) throw new HttpError(409, 'stale_version');
    return { id };
  });
  return getPortfolio(id, viewer);
}
export async function changePortfolioItems(
  id: string,
  value: unknown,
  viewer: Actor,
  remove = false,
) {
  const input = portfolioItemsInputSchema.parse(value);
  await mutation(
    viewer,
    `portfolio.${remove ? 'remove' : 'add'}:${id}`,
    input,
    remove ? 'delete' : 'save',
    async (tx, user) => {
      const board = await ownedPortfolio(id, user, tx);
      if (board.version !== input.version) throw new HttpError(409, 'stale_version');
      const refs = remove ? input.refs : (await authorizeOfficeRefs(input.refs, user, tx)).refs;
      if (!remove && board.items.length + board.projectItems.length + refs.length > 100)
        throw new HttpError(409, 'portfolio_limit');
      const changed = await tx.shortlist.updateMany({
        where: { id, version: input.version },
        data: { version: { increment: 1 } },
      });
      if (!changed.count) throw new HttpError(409, 'stale_version');
      for (const ref of refs) {
        if (ref.kind === 'demo-unit') {
          if (remove)
            await tx.shortlistItem.deleteMany({ where: { shortlistId: id, propertyId: ref.id } });
          else
            await tx.shortlistItem.upsert({
              where: { shortlistId_propertyId: { shortlistId: id, propertyId: ref.id } },
              update: {},
              create: { shortlistId: id, propertyId: ref.id },
            });
        } else {
          if (remove)
            await tx.shortlistProjectItem.deleteMany({
              where: { shortlistId: id, projectId: ref.id },
            });
          else
            await tx.shortlistProjectItem.upsert({
              where: { shortlistId_projectId: { shortlistId: id, projectId: ref.id } },
              update: {},
              create: { shortlistId: id, projectId: ref.id },
            });
        }
      }
      return { id };
    },
  );
  return getPortfolio(id, viewer);
}
export async function deletePortfolio(id: string, viewer: Actor) {
  const user = await officeClient(viewer);
  const result = await db.shortlist.deleteMany({ where: { id, userId: user.id } });
  if (!result.count) throw new HttpError(404, 'not_found');
  return { deleted: true };
}
export async function compareOfficeEntities(
  refs: OfficeEntityRef[],
  viewer: Actor,
  preferences: Partial<OfficePreferences> = {},
): Promise<OfficeComparison> {
  const authorized = await authorizeOfficeRefs(refs, viewer);
  if (authorized.refs.length < 2 || authorized.refs.length > 4)
    throw new HttpError(400, 'invalid_input');
  const summaries: StorySummary[] = [];
  for (const ref of authorized.refs) {
    const story = await resolveOfficeEntity(ref, authorized.user, preferences);
    if (!story) throw new HttpError(404, 'not_found');
    summaries.push(storySummary(story));
  }
  return { version: 1, entries: summaries };
}
export async function getDossierData(
  id: string,
  viewer: Actor,
  preferences: Partial<OfficePreferences> = {},
  options: { reviewVisible?: boolean } = {},
): Promise<DossierDTO | null> {
  const user = await officeClient(viewer);
  const board = await ownedPortfolio(id, user);
  const portfolio = await getPortfolio(id, user, preferences);
  if (!portfolio) return null;
  // Neutral failure: neither missing identity nor withheld count is disclosed.
  if (!options.reviewVisible && portfolio.items.length !== entries(board).length)
    throw new HttpError(409, 'portfolio_changed');
  if (!portfolio.items.length) throw new HttpError(409, 'portfolio_empty');
  if (portfolio.items.length > 24) throw new HttpError(409, 'dossier_limit');
  const stories = [];
  for (const item of portfolio.items) {
    const story = await resolveOfficeEntity(item.ref, user, preferences);
    if (!story) throw new HttpError(409, 'portfolio_changed');
    stories.push(story);
  }
  return dossierDTOSchema.parse({
    version: 1,
    portfolio,
    stories,
    generatedAt: new Date().toISOString(),
    preferences: await readOfficePreferences(user, preferences),
  });
}
export async function listViewings(
  viewer: Actor,
  preferences: Partial<OfficePreferences> = {},
): Promise<ViewingDTO[]> {
  const user = await officeClient(viewer);
  const rows = await db.viewingRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const output: ViewingDTO[] = [];
  for (const row of rows) {
    const story = await resolveOfficeEntity(
      { kind: 'demo-unit', id: row.propertyId },
      user,
      preferences,
    );
    if (story)
      output.push(
        viewingDTOSchema.parse({
          id: row.id,
          subject: storySummary(story),
          slots: row.slots.map((s) => s.toISOString()),
          timezone: row.timezone,
          mode: row.mode,
          status: row.status,
          confirmedSlot: row.confirmedSlot?.toISOString() ?? null,
          createdAt: row.createdAt.toISOString(),
        }),
      );
  }
  return output;
}
export async function requestUnitViewing(value: unknown, viewer: Actor): Promise<ViewingDTO> {
  const input = viewingInputSchema.parse(value);
  let slots: Date[];
  try {
    slots = input.localSlots.map((s) => new Date(slotToIso(s, input.timezone)));
  } catch {
    throw new HttpError(400, 'invalid_local_time');
  }
  if (
    new Set(slots.map((s) => s.toISOString())).size !== slots.length ||
    slots.some((s) => s.getTime() <= Date.now() || s.getTime() > Date.now() + 366 * 86400000)
  )
    throw new HttpError(400, 'invalid_slots');
  const result = await mutation(viewer, 'viewing.request', input, 'viewing', async (tx, user) => {
    await authorizeOfficeRefs([{ kind: 'demo-unit', id: input.unitId }], user, tx);
    const row = await tx.viewingRequest.create({
      data: {
        userId: user.id,
        propertyId: input.unitId,
        slots,
        timezone: input.timezone,
        mode: input.mode,
      },
    });
    return { id: row.id };
  });
  const viewing = (await listViewings(viewer)).find((v) => v.id === result.id);
  if (!viewing) throw new HttpError(404, 'not_found');
  return viewing;
}
export async function cancelViewing(id: string, viewer: Actor) {
  const user = await officeClient(viewer);
  const result = await db.viewingRequest.updateMany({
    where: { id, userId: user.id },
    data: { status: 'CANCELLED', version: { increment: 1 } },
  });
  if (!result.count) throw new HttpError(404, 'not_found');
  return { cancelled: true };
}
async function activeAssignment(clientId: string, tx: Database = db) {
  return tx.advisorAssignment.findFirst({
    where: { clientId, endedAt: null, advisor: { user: { role: 'ADVISOR' } } },
    include: { advisor: true, thread: true },
  });
}
export async function getMyAdvisor(viewer: Actor): Promise<AdvisorDTO | null> {
  const user = await officeClient(viewer);
  const assignment = await activeAssignment(user.id);
  if (!assignment?.thread) return null;
  return advisorDTOSchema.parse({
    id: assignment.advisor.id,
    name: { en: assignment.advisor.displayNameEn, ar: assignment.advisor.displayNameAr },
    kind: assignment.advisor.profileKind,
    availability: assignment.advisor.availability,
    availabilityUpdatedAt: assignment.advisor.availabilityUpdatedAt?.toISOString() ?? null,
    threadId: assignment.thread.id,
  });
}
async function threadAccess(id: string, viewer: Actor, tx: Database = db) {
  const actor = await tx.user.findUnique({ where: { id: viewer.id } });
  if (!actor) throw new HttpError(401, 'unauthorized');
  const thread = await tx.advisorThread.findUnique({
    where: { id },
    include: { assignment: { include: { client: true, advisor: true } } },
  });
  if (!thread) throw new HttpError(404, 'not_found');
  const a = thread.assignment;
  const own = isClientRole(actor.role) && a.clientId === actor.id;
  const advisor = actor.role === 'ADVISOR' && a.endedAt === null && a.advisor.userId === actor.id;
  if (!own && !advisor) throw new HttpError(404, 'not_found');
  if (!isClientRole(a.client.role)) throw new HttpError(404, 'not_found');
  return { thread, actor, client: a.client, own };
}
export async function readThread(
  id: string,
  viewer: Actor,
  cursor?: string,
  preferences: Partial<OfficePreferences> = {},
): Promise<ThreadDTO> {
  const access = await threadAccess(id, viewer);
  if (
    cursor &&
    !(await db.advisorMessage.findFirst({
      where: { id: cursor, threadId: id },
      select: { id: true },
    }))
  )
    throw new HttpError(404, 'not_found');
  const rows = await db.advisorMessage.findMany({
    where: { threadId: id },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 51,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const selected = rows.slice(0, 50);
  const messages = [];
  for (const row of [...selected].reverse()) {
    const refs = officeEntityRefSchema.array().max(4).safeParse(row.attachmentRefs);
    const attachments: StorySummary[] = [];
    if (refs.success)
      for (const ref of refs.data) {
        const story = await resolveOfficeEntity(ref, access.client, preferences);
        if (story) attachments.push(storySummary(story));
      }
    messages.push({
      id: row.id,
      author: row.authorId === access.client.id ? 'CLIENT' : 'ADVISOR',
      body: row.body,
      attachments,
      createdAt: row.createdAt.toISOString(),
    });
  }
  return threadDTOSchema.parse({
    id,
    archived: access.thread.assignment.endedAt !== null,
    messages,
    nextCursor: rows.length > 50 ? selected.at(-1)!.id : null,
  });
}
export async function sendThreadMessage(id: string, value: unknown, viewer: Actor) {
  const input = threadMessageInputSchema.parse(value);
  await db.$transaction(
    async (tx) => {
      const access = await threadAccess(id, viewer, tx);
      if (access.thread.assignment.endedAt) throw new HttpError(409, 'thread_archived');
      await assertOfficePrivacy(access.client.id, 'message', tx);
      await authorizeOfficeRefs(input.attachments, access.client, tx);
      const existing = await tx.advisorMessage.findUnique({
        where: {
          authorId_clientRequestId: {
            authorId: access.actor.id,
            clientRequestId: input.clientRequestId,
          },
        },
      });
      if (existing) {
        if (
          existing.threadId !== id ||
          existing.body !== input.body ||
          !isDeepStrictEqual(existing.attachmentRefs, input.attachments)
        )
          throw new HttpError(409, 'idempotency_conflict');
        return;
      }
      await tx.advisorMessage.create({
        data: {
          threadId: id,
          authorId: access.actor.id,
          body: input.body,
          attachmentRefs: jsonValue(input.attachments),
          clientRequestId: input.clientRequestId,
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
  return readThread(id, viewer);
}
export async function listProjectEnquiries(
  viewer: Actor,
  preferences: Partial<OfficePreferences> = {},
): Promise<ProjectEnquiryDTO[]> {
  const user = await officeClient(viewer);
  const rows = await db.projectEnquiry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const output: ProjectEnquiryDTO[] = [];
  for (const row of rows) {
    const story = await resolveOfficeEntity(
      { kind: 'reference-project', id: row.projectId },
      user,
      preferences,
    );
    if (story)
      output.push(
        projectEnquirySchema.parse({
          id: row.id,
          subject: storySummary(story),
          message: row.message,
          status: row.status,
          createdAt: row.createdAt.toISOString(),
        }),
      );
  }
  return output;
}
export async function requestProjectEnquiry(
  value: unknown,
  viewer: Actor,
): Promise<ProjectEnquiryDTO> {
  const input = projectEnquiryInputSchema.parse(value);
  const result = await mutation(viewer, 'project.enquiry', input, 'enquiry', async (tx, user) => {
    await authorizeOfficeRefs([{ kind: 'reference-project', id: input.projectId }], user, tx);
    const assignment = await activeAssignment(user.id, tx);
    if (!assignment?.thread) throw new HttpError(409, 'advisor_unassigned');
    const row = await tx.projectEnquiry.create({
      data: {
        userId: user.id,
        projectId: input.projectId,
        threadId: assignment.thread.id,
        message: input.message,
      },
    });
    await tx.advisorMessage.create({
      data: {
        threadId: assignment.thread.id,
        authorId: user.id,
        body: input.message,
        attachmentRefs: jsonValue([{ kind: 'reference-project', id: input.projectId }]),
        clientRequestId: `enquiry:${row.id}`,
      },
    });
    return { id: row.id };
  });
  const enquiry = (await listProjectEnquiries(viewer)).find((e) => e.id === result.id);
  if (!enquiry) throw new HttpError(404, 'not_found');
  return enquiry;
}
export async function cancelProjectEnquiry(id: string, viewer: Actor) {
  const user = await officeClient(viewer);
  const result = await db.projectEnquiry.updateMany({
    where: { id, userId: user.id },
    data: { status: 'CANCELLED' },
  });
  if (!result.count) throw new HttpError(404, 'not_found');
  return { cancelled: true };
}
export async function getPrivateCollection(
  viewer: Actor,
  preferences: Partial<OfficePreferences> = {},
): Promise<StorySummary[]> {
  const user = await officeClient(viewer);
  const rows = await db.property.findMany({
    where: { AND: [{ visibility: { not: 'PUBLIC' } }, visibilityWhere(user)] },
    select: { slug: true },
    orderBy: { id: 'asc' },
    take: 12,
  });
  const result: StorySummary[] = [];
  for (const row of rows) {
    const story = await resolveStory(`unit-${row.slug}`, user, preferences);
    if (story) result.push(storySummary(story));
  }
  return result;
}
export async function getOfficeOverview(
  viewer: Actor,
  preferences: Partial<OfficePreferences> = {},
): Promise<OfficeDTO> {
  const user = await officeClient(viewer);
  const [portfolios, viewings, enquiries, advisor, privacy] = await Promise.all([
    listPortfolios(user, preferences),
    listViewings(user, preferences),
    listProjectEnquiries(user, preferences),
    getMyAdvisor(user),
    getClientPrivacy(user.id),
  ]);
  return officeDTOSchema.parse({ version: 1, portfolios, viewings, enquiries, advisor, privacy });
}
