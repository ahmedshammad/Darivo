import type { Role, User } from '@prisma/client';

export const CLIENT_ROLES = ['CLIENT', 'VERIFIED_CLIENT'] as const;
export const STAFF_ROLES = ['ADVISOR', 'ADMIN'] as const;
export function isClientRole(role: Role) {
  return CLIENT_ROLES.some((allowed) => allowed === role);
}
export function isStaffRole(role: Role) {
  return STAFF_ROLES.some((allowed) => allowed === role);
}
export function canAccessVerifiedInventory(user: Pick<User, 'role' | 'verification'>) {
  return user.role === 'VERIFIED_CLIENT' && user.verification === 'VERIFIED';
}
