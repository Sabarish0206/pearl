export const formatDeadline = (isoString: string | null): string => {
  if (!isoString) return 'No deadline set';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
