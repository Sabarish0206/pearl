import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@pearl/database';
import type { SignupInput, LoginInput, AuthUser } from '@pearl/common';
import { env } from '../../config/env';

const SALT_ROUNDS = 12;
const COLLEGE_EMAIL_DOMAIN = '@psnacet.edu.in';

export interface JwtPayload {
  userId: number;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
}

const buildDisplayName = (user: {
  student?: { firstName: string; lastName: string } | null;
  faculty?: { fullName: string } | null;
}): string | undefined => {
  if (user.student) {
    return `${user.student.firstName} ${user.student.lastName}`.trim();
  }

  if (user.faculty?.fullName) {
    return user.faculty.fullName;
  }

  return undefined;
};

export const signupUser = async (input: SignupInput): Promise<AuthUser> => {
  const emailLower = input.email.toLowerCase();

  if (!emailLower.endsWith(COLLEGE_EMAIL_DOMAIN)) {
    const error = new Error(
      `Signup is restricted to college emails ending with ${COLLEGE_EMAIL_DOMAIN}`
    ) as Error & { status: number };
    error.status = 400;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower },
  });

  if (existingUser) {
    const error = new Error('An account with this email already exists') as Error & {
      status: number;
    };
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  if (input.role === 'STUDENT') {
    const user = await prisma.user.create({
      data: {
        email: emailLower,
        passwordHash,
        role: 'STUDENT',
        student: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            registerNumber: input.registerNumber,
            department: input.department,
            batchYear: input.batchYear,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: 'STUDENT',
      name: `${input.firstName} ${input.lastName}`.trim(),
    };
  }

  const user = await prisma.user.create({
    data: {
      email: emailLower,
      passwordHash,
      role: 'FACULTY',
      faculty: {
        create: {
          fullName: input.fullName,
          designation: input.designation,
          department: input.department,
        },
      },
    },
  });

  return { id: user.id, email: user.email, role: 'FACULTY', name: input.fullName };
};

export const loginUser = async (
  input: LoginInput
): Promise<{ user: AuthUser; token: string }> => {
  const emailLower = input.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: emailLower },
  });

  if (!user) {
    const error = new Error('Invalid email or password') as Error & { status: number };
    error.status = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password') as Error & { status: number };
    error.status = 401;
    throw error;
  }

  const payload: JwtPayload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return {
    user: { id: user.id, email: user.email, role: user.role },
    token,
  };
};

export const getCurrentUser = async (userId: string): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    const error = new Error('User not found') as Error & { status: number };
    error.status = 404;
    throw error;
  }

  return { id: user.id, email: user.email, role: user.role };
};
