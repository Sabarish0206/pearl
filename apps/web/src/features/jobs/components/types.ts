import type { ParsedJobData } from '@pearl/common';

export type JobUIState = 'input' | 'parsing' | 'success';

export interface ParsedJobResult {
  job_id: string;
  parsed_data: ParsedJobData;
}
