import type { ApplicationStatus } from '@pearl/common';

export type TabValue = 'ALL' | ApplicationStatus;

export const ALL_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'SHORTLISTED',
  'OFFERED',
  'REJECTED',
];

export const TAB_OPTIONS: { value: TabValue; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const STATUS_CHIP_COLOR = {
  APPLIED: 'default',
  SHORTLISTED: 'primary',
  OFFERED: 'success',
  REJECTED: 'error',
} as const;
