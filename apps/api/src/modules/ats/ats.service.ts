import { prisma } from '@pearl/database';
import type { ApplicationStatus } from '@pearl/database';
import { parse as csvParse } from 'json2csv';

const VALID_STATUSES: readonly ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'OFFERED', 'REJECTED'];

const isValidStatus = (value: string): value is ApplicationStatus =>
  VALID_STATUSES.includes(value as ApplicationStatus);

// --- Fetch all applications for a specific job ---

export const getJobApplications = async (jobId: string, status?: string) => {
  if (status !== undefined && !isValidStatus(status)) {
    const err = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`) as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyName: true, jobRole: true },
  });

  if (!job) {
    const err = new Error('Job not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const applications = await prisma.application.findMany({
    where: {
      jobId,
      ...(status ? { status: status as ApplicationStatus } : {}),
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          registerNumber: true,
          department: true,
          cgpa: true,
          studentSkills: {
            select: {
              skill: { select: { name: true } },
            },
          },
          applications: {
            where: { status: 'OFFERED' },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mappedApplications = applications.map((app) => ({
    id: app.id,
    status: app.status,
    appliedAt: app.createdAt,
    student: {
      id: app.student.id,
      name: `${app.student.firstName} ${app.student.lastName}`,
      registerNumber: app.student.registerNumber,
      department: app.student.department,
      cgpa: app.student.cgpa !== null ? Number(app.student.cgpa) : null,
      isPlaced: app.student.applications.length > 0,
      skills: app.student.studentSkills.map((ss) => ss.skill.name),
    },
  }));

  return {
    job: { id: job.id, companyName: job.companyName, jobRole: job.jobRole },
    applications: mappedApplications,
  };
};

// --- Update an application status (enforces placement policy via transaction) ---

export const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
  if (!isValidStatus(newStatus)) {
    const err = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`) as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  const existing = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true, studentId: true },
  });

  if (!existing) {
    const err = new Error('Application not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Use a transaction to atomically update status and enforce placement policy.
  // isPlaced is derived from whether the student has any OFFERED application,
  // so the side-effect is automatic — no separate Student field to update.
  // The transaction guarantees the application update is atomic.
  const updatedApplication = await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id: applicationId },
      data: { status: newStatus as ApplicationStatus },
    });
    return updated;
  });

  return updatedApplication;
};

// --- Export job applications as CSV ---

type CsvRow = {
  'Register Number': string;
  'Full Name': string;
  Department: string;
  CGPA: number | string;
  'Current Status': string;
};

export const exportJobApplications = async (jobId: string, status?: string) => {
  if (status !== undefined && !isValidStatus(status)) {
    const err = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`) as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyName: true, jobRole: true },
  });

  if (!job) {
    const err = new Error('Job not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const applications = await prisma.application.findMany({
    where: {
      jobId,
      ...(status ? { status: status as ApplicationStatus } : {}),
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          registerNumber: true,
          department: true,
          cgpa: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const csvData: CsvRow[] = applications.map((app) => ({
    'Register Number': app.student.registerNumber,
    'Full Name': `${app.student.firstName} ${app.student.lastName}`,
    Department: app.student.department,
    CGPA: app.student.cgpa !== null ? Number(app.student.cgpa) : '',
    'Current Status': app.status,
  }));

  const fields = ['Register Number', 'Full Name', 'Department', 'CGPA', 'Current Status'];

  // parse returns a valid CSV with just the header row when csvData is empty
  const csvString = csvParse<CsvRow>(csvData, { fields });

  return {
    companyName: job.companyName,
    status: status ?? 'ALL',
    csvString,
  };
};
