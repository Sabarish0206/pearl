import { prisma } from '@pearl/database';
import type { ParsedJobData } from '@pearl/common';

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
    return { isPlaced: true, jobs: [] };
  }

  // 3. Build the eligibility where-clause against the student's metrics.
  //    If cgpa or activeArrears are unset, treat conservatively (return no jobs).
  const cgpa = student.cgpa;
  const activeArrears = student.activeArrears ?? 0;

  if (cgpa === null) {
    return { isPlaced: false, jobs: [] };
  }

  const jobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      minCgpa: { lte: cgpa },
      maxActiveArrears: { gte: activeArrears },
      allowedDepartments: { has: student.department },
    },
    select: {
      id: true,
      companyName: true,
      jobRole: true,
      ctc: true,
      applicationDeadline: true,
      allowedDepartments: true,
      parsedData: true,
      requiredSkills: {
        select: {
          skill: { select: { name: true } },
        },
      },
      applications: {
        where: { studentId: student.id },
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mappedJobs = jobs.map((job) => ({
    id: job.id,
    companyName: job.companyName,
    jobRole: job.jobRole,
    ctc: job.ctc,
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.toISOString() : null,
    allowedDepartments: job.allowedDepartments,
    requiredSkills: job.requiredSkills.map((js) => js.skill.name),
    parsedData: job.parsedData as ParsedJobData | null,
    applications: job.applications,
  }));

  return { isPlaced: false, jobs: mappedJobs };
};
