/**
 * DB Seed Script
 *
 * Populates the database with test data:
 *   - A set of common skills
 *   - 1 faculty account
 *   - 8 student accounts (varied departments, cgpa, skills)
 *   - 5 ACTIVE jobs whose criteria match subsets of the students
 *   - Applications linking eligible students to the matching jobs
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." pnpm --filter @pearl/database db:seed
 *
 * All test accounts use the password:  Seed@1234
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD = 'Seed@1234';
const SALT_ROUNDS = 10;
const COLLEGE_DOMAIN = '@psnacet.edu.in';

// ---------------------------------------------------------------------------
// Skill definitions
// ---------------------------------------------------------------------------
const SKILL_NAMES = [
  'javascript',
  'typescript',
  'python',
  'react',
  'node.js',
  'java',
  'sql',
  'express',
  'mongodb',
  'git',
  'html/css',
  'docker',
  'c++',
  'data structures',
  'machine learning',
];

// ---------------------------------------------------------------------------
// Student seed data
// ---------------------------------------------------------------------------
interface StudentSeed {
  email: string;
  firstName: string;
  lastName: string;
  registerNumber: string;
  department: string;
  batchYear: number;
  cgpa: number;
  activeArrears: number;
  historyOfArrears: number;
  tenthMark: number;
  twelfthMark: number;
  skills: string[]; // lowercase skill names from SKILL_NAMES
}

const STUDENTS: StudentSeed[] = [
  {
    email: `arjun.kumar${COLLEGE_DOMAIN}`,
    firstName: 'Arjun',
    lastName: 'Kumar',
    registerNumber: '710521104001',
    department: 'CSE',
    batchYear: 2025,
    cgpa: 8.5,
    activeArrears: 0,
    historyOfArrears: 0,
    tenthMark: 92.0,
    twelfthMark: 88.0,
    skills: ['javascript', 'react', 'node.js', 'git'],
  },
  {
    email: `priya.sharma${COLLEGE_DOMAIN}`,
    firstName: 'Priya',
    lastName: 'Sharma',
    registerNumber: '710521104002',
    department: 'CSE',
    batchYear: 2025,
    cgpa: 7.8,
    activeArrears: 0,
    historyOfArrears: 1,
    tenthMark: 87.0,
    twelfthMark: 85.0,
    skills: ['python', 'sql', 'machine learning'],
  },
  {
    email: `karthik.rajan${COLLEGE_DOMAIN}`,
    firstName: 'Karthik',
    lastName: 'Rajan',
    registerNumber: '710521104003',
    department: 'CSE',
    batchYear: 2025,
    cgpa: 9.0,
    activeArrears: 0,
    historyOfArrears: 0,
    tenthMark: 95.0,
    twelfthMark: 93.0,
    skills: ['java', 'sql', 'docker', 'data structures'],
  },
  {
    email: `meena.devi${COLLEGE_DOMAIN}`,
    firstName: 'Meena',
    lastName: 'Devi',
    registerNumber: '710521105001',
    department: 'ECE',
    batchYear: 2025,
    cgpa: 8.2,
    activeArrears: 0,
    historyOfArrears: 0,
    tenthMark: 90.0,
    twelfthMark: 87.0,
    skills: ['c++', 'python', 'data structures'],
  },
  {
    email: `rahul.nair${COLLEGE_DOMAIN}`,
    firstName: 'Rahul',
    lastName: 'Nair',
    registerNumber: '710521106001',
    department: 'IT',
    batchYear: 2025,
    cgpa: 7.5,
    activeArrears: 0,
    historyOfArrears: 0,
    tenthMark: 86.0,
    twelfthMark: 84.0,
    skills: ['javascript', 'typescript', 'react', 'sql'],
  },
  {
    email: `divya.menon${COLLEGE_DOMAIN}`,
    firstName: 'Divya',
    lastName: 'Menon',
    registerNumber: '710521106002',
    department: 'IT',
    batchYear: 2025,
    cgpa: 8.0,
    activeArrears: 0,
    historyOfArrears: 0,
    tenthMark: 89.0,
    twelfthMark: 88.0,
    skills: ['node.js', 'express', 'mongodb', 'git'],
  },
  {
    email: `suresh.mech${COLLEGE_DOMAIN}`,
    firstName: 'Suresh',
    lastName: 'Babu',
    registerNumber: '710521107001',
    department: 'MECH',
    batchYear: 2025,
    cgpa: 7.0,
    activeArrears: 0,
    historyOfArrears: 0,
    tenthMark: 82.0,
    twelfthMark: 80.0,
    skills: ['c++', 'data structures'],
  },
  {
    email: `anjali.web${COLLEGE_DOMAIN}`,
    firstName: 'Anjali',
    lastName: 'Reddy',
    registerNumber: '710521104004',
    department: 'CSE',
    batchYear: 2025,
    cgpa: 6.5,
    activeArrears: 1,
    historyOfArrears: 1,
    tenthMark: 80.0,
    twelfthMark: 78.0,
    skills: ['html/css', 'javascript'],
  },
];

// ---------------------------------------------------------------------------
// Job seed data
// ---------------------------------------------------------------------------
interface JobSeed {
  companyName: string;
  jobRole: string;
  ctc: string;
  description: string;
  minCgpa: number;
  maxActiveArrears: number;
  maxHistoryOfArrears: number;
  allowedDepartments: string[];
  requiredSkills: string[]; // lowercase skill names
  applicationDeadlineDays: number; // days from now
}

const JOBS: JobSeed[] = [
  {
    companyName: 'TechCorp Solutions',
    jobRole: 'Frontend Developer',
    ctc: '6 LPA',
    description:
      'We are looking for a skilled Frontend Developer to join our product team. ' +
      'You will build responsive UIs using React and modern JavaScript, collaborate with ' +
      'designers, and integrate REST APIs.',
    minCgpa: 7.0,
    maxActiveArrears: 1,
    maxHistoryOfArrears: 2,
    allowedDepartments: ['CSE', 'IT'],
    requiredSkills: ['javascript', 'react', 'html/css'],
    applicationDeadlineDays: 30,
  },
  {
    companyName: 'DataSystems Inc',
    jobRole: 'Backend Developer',
    ctc: '8 LPA',
    description:
      'DataSystems Inc is hiring Backend Developers to build scalable microservices. ' +
      'The role involves working with Python, SQL databases, Docker containers, and cloud ' +
      'infrastructure. Strong problem-solving skills required.',
    minCgpa: 8.0,
    maxActiveArrears: 0,
    maxHistoryOfArrears: 1,
    allowedDepartments: ['CSE'],
    requiredSkills: ['python', 'sql', 'docker'],
    applicationDeadlineDays: 21,
  },
  {
    companyName: 'WebAgency Digital',
    jobRole: 'Full Stack Developer',
    ctc: '7 LPA',
    description:
      'WebAgency Digital is seeking Full Stack Developers to work on MERN-stack projects. ' +
      'You will own features end-to-end from database design through to React UI delivery. ' +
      'Remote-friendly team.',
    minCgpa: 7.5,
    maxActiveArrears: 0,
    maxHistoryOfArrears: 1,
    allowedDepartments: ['CSE', 'IT'],
    requiredSkills: ['javascript', 'react', 'node.js', 'express'],
    applicationDeadlineDays: 25,
  },
  {
    companyName: 'Analytics Nexus',
    jobRole: 'Data Analyst',
    ctc: '7.5 LPA',
    description:
      'Analytics Nexus is looking for Data Analysts who can derive insights from large datasets. ' +
      'You will use Python, SQL, and ML libraries to build models and dashboards that drive ' +
      'business decisions.',
    minCgpa: 7.5,
    maxActiveArrears: 0,
    maxHistoryOfArrears: 1,
    allowedDepartments: ['CSE'],
    requiredSkills: ['python', 'sql', 'machine learning'],
    applicationDeadlineDays: 20,
  },
  {
    companyName: 'Infosys Limited',
    jobRole: 'Software Engineer',
    ctc: '5 LPA',
    description:
      'Infosys Limited is conducting a campus drive for Software Engineer roles. ' +
      'Selected candidates will work on enterprise Java applications, perform code reviews, ' +
      'and participate in the full software development lifecycle.',
    minCgpa: 7.0,
    maxActiveArrears: 0,
    maxHistoryOfArrears: 2,
    allowedDepartments: ['CSE', 'ECE', 'IT'],
    requiredSkills: ['java', 'sql', 'data structures'],
    applicationDeadlineDays: 35,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱  Starting database seed...\n');

  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  // ------------------------------------------------------------------
  // 1. Upsert skills
  // ------------------------------------------------------------------
  console.log('📚  Upserting skills...');
  const skillMap: Record<string, string> = {}; // name → id

  for (const name of SKILL_NAMES) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skillMap[skill.name] = skill.id;
    console.log(`   ✓ Skill: ${skill.name}`);
  }

  // ------------------------------------------------------------------
  // 2. Create faculty account
  // ------------------------------------------------------------------
  console.log('\n👩‍🏫  Creating faculty account...');
  const facultyEmail = `dr.ramesh.kumar${COLLEGE_DOMAIN}`;

  const facultyUser = await prisma.user.upsert({
    where: { email: facultyEmail },
    update: {},
    create: {
      email: facultyEmail,
      passwordHash,
      role: 'FACULTY',
      faculty: {
        create: {
          fullName: 'Dr. Ramesh Kumar',
          designation: 'Associate Professor',
          department: 'CSE',
        },
      },
    },
    include: { faculty: true },
  });

  console.log(`   ✓ Faculty: ${facultyUser.email}`);

  // ------------------------------------------------------------------
  // 3. Create student accounts
  // ------------------------------------------------------------------
  console.log('\n🎓  Creating student accounts...');
  const studentMap: Record<string, string> = {}; // email → studentId

  for (const s of STUDENTS) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash,
        role: 'STUDENT',
        student: {
          create: {
            firstName: s.firstName,
            lastName: s.lastName,
            registerNumber: s.registerNumber,
            department: s.department,
            batchYear: s.batchYear,
            cgpa: s.cgpa,
            activeArrears: s.activeArrears,
            historyOfArrears: s.historyOfArrears,
            tenthMark: s.tenthMark,
            twelfthMark: s.twelfthMark,
          },
        },
      },
      include: { student: true },
    });

    const student = user.student!;
    studentMap[s.email] = student.id;

    // Attach skills
    for (const skillName of s.skills) {
      const skillId = skillMap[skillName];
      if (!skillId) continue;
      await prisma.studentSkill.upsert({
        where: { studentId_skillId: { studentId: student.id, skillId } },
        update: {},
        create: { studentId: student.id, skillId, source: 'SEED' },
      });
    }

    console.log(`   ✓ Student: ${s.email}  (${s.department}, CGPA ${s.cgpa})`);
  }

  // ------------------------------------------------------------------
  // 4. Create ACTIVE jobs
  // ------------------------------------------------------------------
  console.log('\n💼  Creating jobs...');
  const jobIds: string[] = [];

  for (const j of JOBS) {
    const job = await prisma.job.create({
      data: {
        createdById: facultyUser.id,
        companyName: j.companyName,
        jobRole: j.jobRole,
        ctc: j.ctc,
        description: j.description,
        minCgpa: j.minCgpa,
        maxActiveArrears: j.maxActiveArrears,
        maxHistoryOfArrears: j.maxHistoryOfArrears,
        allowedDepartments: j.allowedDepartments,
        applicationDeadline: daysFromNow(j.applicationDeadlineDays),
        status: 'ACTIVE',
        requiredSkills: {
          create: j.requiredSkills.map((skillName) => ({
            skillId: skillMap[skillName]!,
            isMandatory: true,
          })),
        },
      },
    });

    jobIds.push(job.id);
    console.log(`   ✓ Job: ${j.jobRole} @ ${j.companyName}`);
  }

  // ------------------------------------------------------------------
  // 5. Create applications — link eligible students to jobs
  // ------------------------------------------------------------------
  console.log('\n📝  Creating applications...');

  for (let i = 0; i < JOBS.length; i++) {
    const jobSeed = JOBS[i]!;
    const jobId = jobIds[i]!;

    for (const s of STUDENTS) {
      const studentId = studentMap[s.email];
      if (!studentId) continue;

      // Check basic eligibility
      const deptOk = jobSeed.allowedDepartments.includes(s.department);
      const cgpaOk = s.cgpa >= jobSeed.minCgpa;
      const activeArrearsOk = s.activeArrears <= jobSeed.maxActiveArrears;
      const historyArrearsOk = s.historyOfArrears <= jobSeed.maxHistoryOfArrears;

      if (!deptOk || !cgpaOk || !activeArrearsOk || !historyArrearsOk) continue;

      // Check that student has at least one required skill
      const hasRequiredSkill = jobSeed.requiredSkills.some((skill) =>
        s.skills.includes(skill),
      );
      if (!hasRequiredSkill) continue;

      await prisma.application.create({
        data: {
          studentId,
          jobId,
          status: 'APPLIED',
        },
      });

      console.log(
        `   ✓ ${s.firstName} ${s.lastName} → ${jobSeed.jobRole} @ ${jobSeed.companyName}`,
      );
    }
  }

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.skill.count(),
    prisma.job.count(),
    prisma.application.count(),
  ]);

  console.log('\n✅  Seed complete!');
  console.log('─'.repeat(40));
  console.log(`   Users        : ${counts[0]}`);
  console.log(`   Students     : ${counts[1]}`);
  console.log(`   Faculty      : ${counts[2]}`);
  console.log(`   Skills       : ${counts[3]}`);
  console.log(`   Jobs (ACTIVE): ${counts[4]}`);
  console.log(`   Applications : ${counts[5]}`);
  console.log('─'.repeat(40));
  console.log(`\n🔑  Login password for all seed accounts: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
