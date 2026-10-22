import { db } from './client';
import { getProperty, type Viewer, type PropertyDTO } from './properties';
export async function scopedShortlists(user: NonNullable<Viewer>, id?: string) {
  const lists = await db.shortlist.findMany({
    where: { userId: user.id, ...(id ? { id } : {}) },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  const result = [];
  for (const list of lists) {
    const properties: PropertyDTO[] = [];
    for (const item of list.items) {
      const property = await getProperty(item.propertyId, user);
      if (property) properties.push(property);
    }
    result.push({
      id: list.id,
      name: list.name,
      properties,
      createdAt: list.createdAt.toISOString(),
    });
  }
  return result;
}
