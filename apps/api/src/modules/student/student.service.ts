import { prisma, Prisma } from '@pearl/database';
import { parse as csvParse } from 'json2csv';

export interface StudentSearchPayload {
  skills?: string[];
  minCgpa?: number;
  maxActiveArrears?: number;
  departments?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'cgpa' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export const getStudentProfile = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: {
        select: { email: true },
      },
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

  return {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.user.email,
    registerNumber: student.registerNumber,
    department: student.department,
    batchYear: student.batchYear,
    cgpa: student.cgpa !== null ? Number(student.cgpa) : null,
    activeArrears: student.activeArrears ?? null,
    historyOfArrears: student.historyOfArrears ?? null,
    tenthMark: student.tenthMark !== null ? Number(student.tenthMark) : null,
    twelfthMark: student.twelfthMark !== null ? Number(student.twelfthMark) : null,
    placementStatus: student.applications.length > 0 ? 'PLACED' : 'UNPLACED',
  };
};

export const searchStudents = async (payload: StudentSearchPayload) => {
  const {
    skills,
    minCgpa,
    maxActiveArrears,
    departments,
    sortBy = 'cgpa',
    sortOrder = 'desc',
  } = payload;

  // Sanitize pagination parameters
  const page = payload.page !== undefined && payload.page >= 1 ? Math.floor(payload.page) : 1;
  const limit = payload.limit !== undefined && payload.limit >= 1 ? Math.floor(payload.limit) : 20;
  const skip = (page - 1) * limit;

  // Dynamically build the AND conditions array
  const andConditions: Prisma.StudentWhereInput[] = [];

  // Scalar filters
  if (minCgpa !== undefined) {
    andConditions.push({ cgpa: { gte: minCgpa } });
  }

  if (maxActiveArrears !== undefined) {
    andConditions.push({ activeArrears: { lte: maxActiveArrears } });
  }

  if (departments && departments.length > 0) {
    andConditions.push({ department: { in: departments } });
  }

  // Relational division (AND logic): each skill must be present
  if (skills && skills.length > 0) {
    for (const rawSkill of skills) {
      const skillName = rawSkill.toLowerCase().trim();
      if (!skillName) continue;
      andConditions.push({
        studentSkills: {
          some: {
            skill: { name: skillName },
          },
        },
      });
    }
  }

  const where: Prisma.StudentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  // Build orderBy
  const orderBy: Prisma.StudentOrderByWithRelationInput =
    sortBy === 'name'
      ? { firstName: sortOrder }
      : { cgpa: sortOrder };

  // Execute findMany + count in a single transaction
  const [students, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        registerNumber: true,
        department: true,
        cgpa: true,
        activeArrears: true,
        studentSkills: {
          select: {
            skill: {
              select: { name: true },
            },
          },
        },
        applications: {
          where: { status: 'OFFERED' },
          select: { id: true },
        },
      },
    }),
    prisma.student.count({ where }),
  ]);

  const mappedStudents = students.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    registerNumber: s.registerNumber,
    department: s.department,
    cgpa: s.cgpa !== null ? Number(s.cgpa) : null,
    activeArrears: s.activeArrears ?? null,
    isPlaced: s.applications.length > 0,
    skills: s.studentSkills.map((ss) => ss.skill.name),
  }));

  return {
    students: mappedStudents,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

type StudentCsvRow = {
  'Register Number': string;
  'First Name': string;
  'Last Name': string;
  Department: string;
  CGPA: number | string;
  'Active Arrears': number | string;
  'Placement Status': string;
  Skills: string;
};

export const exportStudentsCsv = async (payload: StudentSearchPayload) => {
  const {
    skills,
    minCgpa,
    maxActiveArrears,
    departments,
    sortBy = 'cgpa',
    sortOrder = 'desc',
  } = payload;

  const andConditions: Prisma.StudentWhereInput[] = [];

  if (minCgpa !== undefined) {
    andConditions.push({ cgpa: { gte: minCgpa } });
  }

  if (maxActiveArrears !== undefined) {
    andConditions.push({ activeArrears: { lte: maxActiveArrears } });
  }

  if (departments && departments.length > 0) {
    andConditions.push({ department: { in: departments } });
  }

  if (skills && skills.length > 0) {
    for (const rawSkill of skills) {
      const skillName = rawSkill.toLowerCase().trim();
      if (!skillName) continue;
      andConditions.push({
        studentSkills: {
          some: {
            skill: { name: skillName },
          },
        },
      });
    }
  }

  const where: Prisma.StudentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const orderBy: Prisma.StudentOrderByWithRelationInput =
    sortBy === 'name'
      ? { firstName: sortOrder }
      : { cgpa: sortOrder };

  const students = await prisma.student.findMany({
    where,
    orderBy,
    select: {
      firstName: true,
      lastName: true,
      registerNumber: true,
      department: true,
      cgpa: true,
      activeArrears: true,
      studentSkills: {
        select: {
          skill: {
            select: { name: true },
          },
        },
      },
      applications: {
        where: { status: 'OFFERED' },
        select: { id: true },
      },
    },
  });

  const csvData: StudentCsvRow[] = students.map((s) => ({
    'Register Number': s.registerNumber,
    'First Name': s.firstName,
    'Last Name': s.lastName,
    Department: s.department,
    CGPA: s.cgpa !== null ? Number(s.cgpa) : '',
    'Active Arrears': s.activeArrears ?? '0',
    'Placement Status': s.applications.length > 0 ? 'Placed' : 'Unplaced',
    Skills: s.studentSkills.map((ss) => ss.skill.name).join(', '),
  }));

  const fields = [
    'Register Number',
    'First Name',
    'Last Name',
    'Department',
    'CGPA',
    'Active Arrears',
    'Placement Status',
    'Skills',
  ];

  const csvString = csvParse<StudentCsvRow>(csvData, { fields });

  return csvString;
};
