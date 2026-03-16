import { prisma } from '@pearl/database';
import type { CreateJobInput, ShortlistedCandidate, PlacementAnalytics } from '@pearl/common';
import type { ParsedResumeData } from '@pearl/common';

// ─── Job CRUD ─────────────────────────────────────────────────────────────────

export const createJob = async (input: CreateJobInput, createdBy: string) => {
  return prisma.jobRequirement.create({
    data: {
      title: input.title,
      companyName: input.companyName,
      description: input.description,
      requiredSkills: input.requiredSkills,
      minCgpa: input.minCgpa ?? null,
      maxArrears: input.maxArrears ?? null,
      eligibleDepts: input.eligibleDepts,
      minExperienceYr: input.minExperienceYr ?? 0,
      salaryLpa: input.salaryLpa ?? null,
      deadline: input.deadline ? new Date(input.deadline) : null,
      isActive: input.isActive ?? true,
      createdBy,
    },
  });
};

export const listJobs = async () => {
  return prisma.jobRequirement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { creator: { select: { email: true } } },
  });
};

export const getJob = async (id: string) => {
  const job = await prisma.jobRequirement.findUnique({ where: { id } });
  if (!job) {
    const err = new Error('Job not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return job;
};

export const updateJob = async (id: string, input: Partial<CreateJobInput>) => {
  const job = await prisma.jobRequirement.findUnique({ where: { id } });
  if (!job) {
    const err = new Error('Job not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  const { deadline, ...rest } = input;
  return prisma.jobRequirement.update({
    where: { id },
    data: {
      ...rest,
      ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
    },
  });
};

export const deleteJob = async (id: string) => {
  await prisma.jobRequirement.delete({ where: { id } });
};

// ─── Shortlisting ─────────────────────────────────────────────────────────────

export const getShortlist = async (jobId: string): Promise<ShortlistedCandidate[]> => {
  const job = await prisma.jobRequirement.findUnique({ where: { id: jobId } });
  if (!job) {
    const err = new Error('Job not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const students = await prisma.student.findMany({
    where: {
      resume: { isVerified: true },
      ...(job.eligibleDepts?.length ? { department: { in: job.eligibleDepts } } : {}),
      ...(job.minCgpa != null ? { cgpa: { gte: job.minCgpa } } : {}),
      ...(job.maxArrears != null ? { activeArrears: { lte: job.maxArrears } } : {}),
    },
    include: {
      user: { select: { id: true, email: true } },
      resume: { select: { atsScore: true, parsedData: true } },
      studentSkills: { include: { skill: true } },
    },
  });

  const reqSkillsLower = (job.requiredSkills as string[]).map((s: string) => s.toLowerCase());

  const candidates: ShortlistedCandidate[] = students.map((s: any) => {
    const studentSkills = s.studentSkills.map((ss: any) => ss.skill.name.toLowerCase());
    const matchedSkills = reqSkillsLower.filter((rs: string) => studentSkills.includes(rs));
    const skillMatchPct = reqSkillsLower.length > 0 ? matchedSkills.length / reqSkillsLower.length : 0;
    const atsScore = s.resume?.atsScore ?? 0;
    const cgpa = s.cgpa ? parseFloat(s.cgpa.toString()) : 0;
    const parsedData = s.resume?.parsedData as ParsedResumeData | null;
    const experienceCount = parsedData?.experience?.length ?? 0;
    const experienceScore = Math.min(experienceCount * 20, 100);
    const compositeScore =
      atsScore * 0.4 + (cgpa / 10) * 100 * 0.3 + skillMatchPct * 100 * 0.2 + experienceScore * 0.1;
    return {
      studentId: s.id,
      userId: s.user.id,
      firstName: s.firstName,
      lastName: s.lastName,
      registerNumber: s.registerNumber,
      department: s.department,
      batchYear: s.batchYear,
      email: s.user.email,
      cgpa: cgpa || null,
      activeArrears: s.activeArrears,
      atsScore: s.resume?.atsScore ?? null,
      skills: studentSkills,
      matchedSkills,
      skillMatchPct: Math.round(skillMatchPct * 100),
      compositeScore: Math.round(compositeScore),
      rank: 0,
    };
  });

  candidates.sort((a, b) => b.compositeScore - a.compositeScore);
  candidates.forEach((c, i) => { c.rank = i + 1; });
  return candidates;
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getAnalytics = async (): Promise<PlacementAnalytics> => {
  const [totalStudents, studentsWithResume, studentsVerified, allStudents] = await Promise.all([
    prisma.student.count(),
    prisma.resume.count(),
    prisma.resume.count({ where: { isVerified: true } }),
    prisma.student.findMany({
      include: {
        resume: { select: { atsScore: true } },
        studentSkills: { include: { skill: true } },
      },
    }),
  ]);

  const atsScores = allStudents
    .map((s: any) => s.resume?.atsScore)
    .filter((s: any) => s != null) as number[];
  const averageAtsScore = atsScores.length
    ? Math.round(atsScores.reduce((a: number, b: number) => a + b, 0) / atsScores.length)
    : 0;

  const deptMap = new Map<string, { count: number; totalAts: number }>();
  allStudents.forEach((s: any) => {
    const dept = s.department;
    const ats = s.resume?.atsScore ?? 0;
    const existing = deptMap.get(dept) ?? { count: 0, totalAts: 0 };
    deptMap.set(dept, { count: existing.count + 1, totalAts: existing.totalAts + ats });
  });
  const departmentBreakdown = Array.from(deptMap.entries())
    .map(([department, data]) => ({
      department,
      count: data.count,
      avgAts: data.count > 0 ? Math.round(data.totalAts / data.count) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const skillMap = new Map<string, number>();
  allStudents.forEach((s: any) => {
    s.studentSkills.forEach((ss: any) => {
      const name = ss.skill.name;
      skillMap.set(name, (skillMap.get(name) ?? 0) + 1);
    });
  });
  const skillDistribution = Array.from(skillMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const cgpaRanges = [
    { range: '< 6.0', min: 0, max: 6 },
    { range: '6.0 – 7.0', min: 6, max: 7 },
    { range: '7.0 – 8.0', min: 7, max: 8 },
    { range: '8.0 – 9.0', min: 8, max: 9 },
    { range: '9.0+', min: 9, max: 11 },
  ];
  const cgpaDistribution = cgpaRanges.map(({ range, min, max }) => ({
    range,
    count: allStudents.filter((s: any) => {
      const cgpa = s.cgpa ? parseFloat(s.cgpa.toString()) : null;
      return cgpa != null && cgpa >= min && cgpa < max;
    }).length,
  }));

  return {
    totalStudents,
    studentsWithResume,
    studentsVerified,
    averageAtsScore,
    departmentBreakdown,
    skillDistribution,
    cgpaDistribution,
  };
};

// ─── Students list ────────────────────────────────────────────────────────────

export const listStudents = async () => {
  const students = await prisma.student.findMany({
    include: {
      user: { select: { id: true, email: true } },
      resume: { select: { atsScore: true, isVerified: true } },
      studentSkills: { include: { skill: { select: { name: true } } } },
    },
    orderBy: { batchYear: 'desc' },
  });
  return students.map((s: any) => ({
    id: s.id,
    userId: s.user.id,
    email: s.user.email,
    firstName: s.firstName,
    lastName: s.lastName,
    registerNumber: s.registerNumber,
    department: s.department,
    batchYear: s.batchYear,
    cgpa: s.cgpa ? parseFloat(s.cgpa.toString()) : null,
    activeArrears: s.activeArrears,
    atsScore: s.resume?.atsScore ?? null,
    isVerified: s.resume?.isVerified ?? false,
    skills: s.studentSkills.map((ss: any) => ss.skill.name),
  }));
};
