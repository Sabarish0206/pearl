import { prisma } from '@pearl/database';

const resolveStudent = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      cgpa: true,
      activeArrears: true,
      historyOfArrears: true,
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

  return student;
};

export const applyToJob = async (userId: string, jobId: string) => {
  const student = await resolveStudent(userId);

  // College placement policy: placed students are ineligible for further drives
  if (student.applications.length > 0) {
    const err = new Error('You are already placed and are not eligible to apply for further drives.') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  // Fetch and validate the job
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      companyName: true,
      status: true,
      applicationDeadline: true,
      minCgpa: true,
      maxActiveArrears: true,
      maxHistoryOfArrears: true,
      allowedDepartments: true,
    },
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

  // Check application deadline
  if (job.applicationDeadline && new Date() > job.applicationDeadline) {
    const err = new Error('The application deadline for this job has passed.') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Validate student eligibility criteria.
  // CGPA null is kept as null: a student with no recorded CGPA cannot prove they meet the
  // minimum requirement, so they are rejected. Arrears null defaults to 0 (no known arrears).
  const cgpa = student.cgpa !== null ? Number(student.cgpa) : null;
  const activeArrears = student.activeArrears ?? 0;
  const historyOfArrears = student.historyOfArrears ?? 0;

  if (job.minCgpa !== null && (cgpa === null || cgpa < Number(job.minCgpa))) {
    const err = new Error('You do not meet the minimum CGPA requirement for this job.') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  if (job.maxActiveArrears !== null && activeArrears > job.maxActiveArrears) {
    const err = new Error('You do not meet the active arrears requirement for this job.') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  if (job.maxHistoryOfArrears !== null && historyOfArrears > job.maxHistoryOfArrears) {
    const err = new Error('You do not meet the history of arrears requirement for this job.') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  if (job.allowedDepartments.length > 0 && !job.allowedDepartments.includes(student.department)) {
    const err = new Error('Your department is not eligible for this job.') as Error & { status: number };
    err.status = 403;
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
        select: { companyName: true, jobRole: true, ctc: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return applications;
};

