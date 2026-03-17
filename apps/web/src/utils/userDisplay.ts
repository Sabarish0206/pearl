import type { AuthUser } from '@pearl/common';

export const getUserDisplayName = (user: AuthUser | null): string => {
  if (!user) return '';
  if (user.name && user.name.trim().length > 0) return user.name;
  return user.email.split('@')[0];
};

export const getRoleLabel = (role: AuthUser['role']): string => {
  if (role === 'STUDENT') return 'Student';
  if (role === 'FACULTY') return 'Placement Officer';
  return 'Admin';
};
