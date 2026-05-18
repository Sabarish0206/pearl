import { prisma } from '@pearl/database';

const resolveStudent = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    const err = new Error('Student profile not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return student;
};

export const applyToJob = async (userId: string, jobId: string) => {
  const student = await resolveStudent(userId);

  // Fetch and validate the job
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyName: true, status: true },
  });

  if (!job) {
    const err = new Error('Job not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (job.status !== 'ACTIVE') {
    const err = new Error('This job is no longer accepting applications.') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Duplicate check (before Prisma @@unique constraint fires, for a friendly message)
  const existing = await prisma.application.findUnique({
    where: { studentId_jobId: { studentId: student.id, jobId } },
    select: { id: true },
  });

  if (existing) {
    const err = new Error('You have already applied to this job.') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Create the application
  await prisma.application.create({
    data: { studentId: student.id, jobId, status: 'APPLIED' },
  });

  return { companyName: job.companyName };
};

export const getApplicationHistory = async (userId: string) => {
  const student = await resolveStudent(userId);

  const applications = await prisma.application.findMany({
    where: { studentId: student.id },
    include: {
      job: {
        select: { companyName: true, jobRole: true, ctc: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return applications;
};

