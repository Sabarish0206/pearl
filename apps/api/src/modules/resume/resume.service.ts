import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { prisma, Prisma } from '@pearl/database';
import { env } from '../../config/env';
import { logger } from '../../services/logger.service';
import { ParsedResumeDataSchema } from '@pearl/common';
import type { CommitResumeInput, ParsedResumeData } from '@pearl/common';

// Gemini client is instantiated lazily — GEMINI_API_KEY is optional and
// validated at call time so the server starts fine without it (e.g. CI/test).

// Gemini structured output schema
const resumeResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    ats_score: { type: SchemaType.INTEGER, description: 'ATS score from 0 to 100' },
    cgpa: { type: SchemaType.NUMBER, description: 'CGPA or GPA, null if not found', nullable: true },
    active_arrears: { type: SchemaType.INTEGER, description: 'Number of active arrears, null if not found', nullable: true },
    history_of_arrears: { type: SchemaType.INTEGER, description: 'Total history of arrears, null if not found', nullable: true },
    tenth_mark: { type: SchemaType.NUMBER, description: 'Tenth grade percentage, null if not found', nullable: true },
    twelfth_mark: { type: SchemaType.NUMBER, description: 'Twelfth grade percentage, null if not found', nullable: true },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of technical and soft skills',
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          institution: { type: SchemaType.STRING },
          degree: { type: SchemaType.STRING },
          start_year: { type: SchemaType.STRING },
          end_year: { type: SchemaType.STRING },
          score: { type: SchemaType.STRING },
        },
        required: ['institution', 'degree', 'start_year', 'end_year', 'score'],
      },
    },
    projects: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          technologies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          link: { type: SchemaType.STRING, nullable: true },
        },
        required: ['title', 'description', 'technologies', 'link'],
      },
    },
    certifications: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          issuer: { type: SchemaType.STRING },
          date: { type: SchemaType.STRING },
        },
        required: ['name', 'issuer', 'date'],
      },
    },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          role: { type: SchemaType.STRING },
          company: { type: SchemaType.STRING },
          duration: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
        },
        required: ['role', 'company', 'duration', 'description'],
      },
    },
    achievements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ['ats_score', 'skills', 'education', 'projects', 'certifications', 'experience', 'achievements'],
};

export const getStudentResume = async (userId: string) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) {
    const err = new Error('Student profile not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const resume = await prisma.resume.findUnique({ where: { studentId: student.id } });
  if (!resume) {
    return { status: 'NOT_UPLOADED' as const };
  }

  if (!resume.isVerified) {
    return { status: 'DRAFT' as const, data: resume };
  }

  return { status: 'VERIFIED' as const, data: resume };
};

export const parseAndDraftResume = async (userId: string, filePath: string): Promise<{ resume_id: string; parsed_data: ParsedResumeData }> => {
  if (!env.GEMINI_API_KEY) {
    const err = new Error('Resume parsing is not available. Please contact support.') as Error & { status: number };
    err.status = 503;
    throw err;
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) {
    const err = new Error('Student profile not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Read file asynchronously and convert to Base64
  const fileBuffer = await fs.readFile(filePath);
  const base64Data = fileBuffer.toString('base64');

  // Helper to clean up the uploaded file on Gemini-side failures
  const deleteUploadedFile = async () => {
    try {
      await fs.unlink(filePath);
    } catch (unlinkErr) {
      logger.error('Failed to delete uploaded resume file after parse error', unlinkErr);
    }
  };

  // Call Gemini API
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: resumeResponseSchema as any,
    },
  });

  let result: Awaited<ReturnType<typeof model.generateContent>>;
  try {
    result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
      {
        text: `You are an expert ATS resume parser for a campus placement platform.
Analyze this student resume PDF and extract all information accurately.
For ats_score: evaluate resume quality based on formatting, keywords, completeness, and relevance (0-100).
For skills: extract all technical skills, programming languages, tools, frameworks mentioned.
For cgpa, tenth_mark, twelfth_mark, active_arrears, history_of_arrears: extract if present, otherwise return null.
For projects, education, certifications, experience: extract all entries found.
Return a strictly valid JSON object matching the required schema.`,
      },
    ]);
  } catch (geminiErr) {
    logger.error('Gemini API call failed', geminiErr);
    await deleteUploadedFile();
    const err = new Error('AI service is unavailable. Please try again later.') as Error & { status: number };
    err.status = 502;
    throw err;
  }

  const rawText = result.response.text();
  let parsedData: ParsedResumeData;

  try {
    const rawJson = JSON.parse(rawText) as unknown;
    const validation = ParsedResumeDataSchema.safeParse(rawJson);
    if (!validation.success) {
      logger.error('Gemini response failed schema validation', validation.error.flatten());
      await deleteUploadedFile();
      const err = new Error('AI returned unexpected data format. Please try again.') as Error & { status: number };
      err.status = 500;
      throw err;
    }
    parsedData = validation.data;
  } catch (parseErr) {
    if ((parseErr as { status?: number }).status) throw parseErr; // re-throw our own typed errors (already cleaned up)
    logger.error('Failed to parse Gemini AI response as JSON', parseErr);
    await deleteUploadedFile();
    const err = new Error('AI parsing failed. Please try a different PDF or contact support.') as Error & { status: number };
    err.status = 500;
    throw err;
  }

  // Normalize relative file path for storage
  const relativePath = path.relative(process.cwd(), filePath);

  // Upsert into resumes table (Draft - is_verified = false)
  const resume = await prisma.resume.upsert({
    where: { studentId: student.id },
    create: {
      studentId: student.id,
      filePath: relativePath,
      atsScore: parsedData.ats_score,
      parsedData: parsedData as any,
      isVerified: false,
    },
    update: {
      filePath: relativePath,
      atsScore: parsedData.ats_score,
      parsedData: parsedData as any,
      isVerified: false,
    },
  });

  return { resume_id: resume.id, parsed_data: parsedData };
};

export const commitResume = async (userId: string, input: CommitResumeInput): Promise<void> => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) {
    const err = new Error('Student profile not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Step 1: Verify resume belongs to this student
  const resume = await prisma.resume.findUnique({ where: { id: input.resume_id } });
  if (!resume || resume.studentId !== student.id) {
    const err = new Error('Resume not found or access denied') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const { resume_id, skills: rawSkills, cgpa, active_arrears, history_of_arrears, tenth_mark, twelfth_mark, ...restData } = input;

  // Normalize skills to lowercase and de-duplicate
  const normalizedSkills = [...new Set(rawSkills.map((s) => s.trim().toLowerCase()).filter(Boolean))];

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Step 2: Update resume - set parsed_data to edited payload and mark as verified
    await tx.resume.update({
      where: { id: resume_id },
      data: {
        parsedData: {
          ats_score: resume.atsScore,
          cgpa,
          active_arrears,
          history_of_arrears,
          tenth_mark,
          twelfth_mark,
          skills: normalizedSkills,
          ...restData,
        } as any,
        isVerified: true,
      },
    });

    // Step 3: Update students table with hard metrics
    await tx.student.update({
      where: { id: student.id },
      data: {
        cgpa: cgpa ?? null,
        activeArrears: active_arrears ?? null,
        historyOfArrears: history_of_arrears ?? null,
        tenthMark: tenth_mark ?? null,
        twelfthMark: twelfth_mark ?? null,
      },
    });

    // Step 4: Upsert skills (INSERT ON CONFLICT DO NOTHING)
    if (normalizedSkills.length > 0) {
      await tx.skill.createMany({
        data: normalizedSkills.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }

    // Step 5: Sync student_skills - delete existing, insert new
    await tx.studentSkill.deleteMany({ where: { studentId: student.id } });

    if (normalizedSkills.length > 0) {
      const skillRecords = await tx.skill.findMany({
        where: { name: { in: normalizedSkills } },
        select: { id: true },
      });

      await tx.studentSkill.createMany({
        data: skillRecords.map((skill: { id: string }) => ({
          studentId: student.id,
          skillId: skill.id,
          source: 'RESUME',
        })),
        skipDuplicates: true,
      });
    }
  });

  // Clean up the uploaded resume file now that it has been verified and is no longer needed
  if (resume.filePath) {
    const absolutePath = path.resolve(process.cwd(), resume.filePath);
    try {
      await fs.unlink(absolutePath);
    } catch (unlinkErr) {
      logger.error('Failed to delete resume file after commit', unlinkErr);
    }
  }
};
