import { prisma } from '@pearl/database';

export const getEligibleJobs = async (userId: string) => {
  // 1. Fetch the student record for this user
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      cgpa: true,
      activeArrears: true,
      department: true,
      applications: {
        where: { status: 'OFFERED' },
        select: { id: true },
      },
    },
  });

  if (!student) {
    const err = new Error('Student profile not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // 2. College placement policy: placed students are ineligible for further drives
  const isPlaced = student.applications.length > 0;
  if (isPlaced) {
    return { jobs: [] };
  }

  // 3. Build the eligibility where-clause against the student's metrics.
  //    If cgpa or activeArrears are unset, treat conservatively (return no jobs).
  const cgpa = student.cgpa;
  const activeArrears = student.activeArrears ?? 0;

  if (cgpa === null) {
    return { jobs: [] };
  }

  const jobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      minCgpa: { lte: cgpa },
      maxActiveArrears: { gte: activeArrears },
      allowedDepartments: { has: student.department },
    },
    include: {
      applications: {
        where: { studentId: student.id },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { jobs };
};
