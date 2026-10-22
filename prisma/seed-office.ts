import type { PrismaClient } from '@prisma/client';

/** Fictional, authored profile. Reruns never reset assignments or conversation content. */
export async function seedOffice(db: PrismaClient) {
  const advisorUser = await db.user.findUnique({ where: { id: 'demo-advisor' } });
  if (!advisorUser) return;
  const advisor = await db.advisor.upsert({
    where: { userId: advisorUser.id },
    update: {},
    create: {
      userId: advisorUser.id,
      displayNameEn: 'Noura — Demo advisor',
      displayNameAr: 'نورا — مستشارة تجريبية',
      profileKind: 'DEMO',
      availability: 'BY_APPOINTMENT',
      availabilityUpdatedAt: new Date('2026-10-23T00:00:00Z'),
    },
  });
  // Upgrade only the migration's anonymous default profile, preserving any authored profile.
  await db.advisor.updateMany({
    where: {
      id: advisor.id,
      displayNameEn: 'Demo advisor',
      displayNameAr: 'مستشار تجريبي',
      availability: 'UNKNOWN',
    },
    data: {
      displayNameEn: 'Noura — Demo advisor',
      displayNameAr: 'نورا — مستشارة تجريبية',
      availability: 'BY_APPOINTMENT',
      availabilityUpdatedAt: new Date('2026-10-23T00:00:00Z'),
    },
  });
  for (const clientId of ['demo-client', 'demo-verified']) {
    const client = await db.user.findUnique({ where: { id: clientId } });
    if (!client) continue;
    const existing = await db.advisorAssignment.findFirst({ where: { clientId, endedAt: null } });
    const assignment =
      existing ??
      (await db.advisorAssignment.create({ data: { clientId, advisorId: advisor.id } }));
    await db.advisorThread.upsert({
      where: { assignmentId: assignment.id },
      update: {},
      create: { assignmentId: assignment.id },
    });
  }
}
