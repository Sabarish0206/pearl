import type { JobListItem } from '@pearl/common';

export type JobStatus = JobListItem['status'];
export type JobStatusFilter = 'ALL' | JobStatus;

export const TAB_OPTIONS: { value: JobStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const STATUS_CHIP_COLOR: Record<JobStatus, string> = {
  DRAFT: '#f59e0b',
  ACTIVE: '#22c55e',
  CLOSED: '#06b6d4',
  COMPLETED: '#94a3b8',
  CANCELLED: '#ef4444',
};
