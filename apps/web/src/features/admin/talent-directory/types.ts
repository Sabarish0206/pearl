export interface FilterState {
  skills: string[];
  minCgpa: number;
  maxActiveArrears: number | undefined;
  departments: string[];
}

export const INITIAL_FILTERS: FilterState = {
  skills: [],
  minCgpa: 0,
  maxActiveArrears: undefined,
  departments: [],
};
