import { prisma } from '@pearl/database';

export const getAdminProfile = async (userId: string) => {
  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
          _count: {
            select: { jobs: true },
          },
        },
      },
    },
  });

  if (!faculty) {
    const err = new Error('Faculty profile not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return {
    fullName: faculty.fullName,
    email: faculty.user.email,
    designation: faculty.designation,
    department: faculty.department,
    jobsCreatedCount: faculty.user._count.jobs,
  };
};
