import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { prisma, Prisma } from '@pearl/database';
import { env } from '../../config/env';
import { logger } from '../../services/logger.service';
import { ParsedJobDataSchema } from '@pearl/common';
import type { ParsedJobData } from '@pearl/common';
import { z } from 'zod';

// --- Publish Job Schema ---

export const publishJobSchema = z.object({
  companyName: z.string().min(1),
  jobRole: z.string().min(1),
  ctc: z.string().nullable(),
  minCgpa: z.number().min(0).max(10),
  maxActiveArrears: z.number().int().min(0),
  maxHistoryOfArrears: z.number().int().min(0),
  allowedDepartments: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  parsedData: z.unknown(),
});

// Gemini structured output schema for Job Description parsing
const jobResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    companyName: { type: SchemaType.STRING, description: 'Name of the company offering the job' },
    jobRole: { type: SchemaType.STRING, description: 'Title or role of the job position' },
    ctc: { type: SchemaType.STRING, description: 'CTC or salary package, null if not mentioned', nullable: true },
    minCgpa: { type: SchemaType.NUMBER, description: 'Minimum CGPA required, default 0 if not mentioned' },
    maxActiveArrears: { type: SchemaType.INTEGER, description: 'Maximum active arrears allowed, default 0 if not mentioned' },
    maxHistoryOfArrears: { type: SchemaType.INTEGER, description: 'Maximum history of arrears allowed, default 99 if not mentioned' },
    allowedDepartments: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of eligible departments',
    },
    requiredSkills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of required technical or soft skills',
    },
    unstructuredData: {
      type: SchemaType.OBJECT,
      properties: {
        responsibilities: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'List of job responsibilities',
        },
        perks: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'List of perks or benefits offered',
        },
      },
      required: ['responsibilities', 'perks'],
    },
  },
  required: [
    'companyName',
    'jobRole',
    'ctc',
    'minCgpa',
    'maxActiveArrears',
    'maxHistoryOfArrears',
    'allowedDepartments',
    'requiredSkills',
    'unstructuredData',
  ],
};

const JD_PARSE_PROMPT = `You are an expert HR and campus placement analyst.
Parse the provided Job Description and extract all relevant information accurately.
For companyName: extract the hiring company name.
For jobRole: extract the job title or role.
For ctc: extract the CTC/salary package as a string (e.g. "6 LPA", "5-8 LPA"), return null if not mentioned.
For minCgpa: extract minimum CGPA requirement as a number (e.g. 7.5), default to 0 if not mentioned.
For maxActiveArrears: extract maximum active arrears allowed as an integer, default to 0 if not mentioned.
For maxHistoryOfArrears: extract maximum history of arrears allowed as an integer, default to 99 if not mentioned.
For allowedDepartments: extract the list of eligible departments (e.g. ["CSE", "ECE", "IT"]).
For requiredSkills: extract all required technical and soft skills.
For unstructuredData.responsibilities: extract the list of job responsibilities.
For unstructuredData.perks: extract the list of perks or benefits.
Return a strictly valid JSON object matching the required schema.`;

// Service accepts pre-read base64 data or raw text — no filesystem access here.
export const parseAndDraftJob = async (
  input: { base64Data: string; description: string } | { rawText: string },
  createdById: string,
): Promise<{ job_id: string; parsed_data: ParsedJobData }> => {
  if (!env.GEMINI_API_KEY) {
    const err = new Error('Job parsing is not available. Please contact support.') as Error & { status: number };
    err.status = 503;
    throw err;
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: jobResponseSchema as any,
    },
  });

  let result: Awaited<ReturnType<typeof model.generateContent>>;

  try {
    if ('base64Data' in input) {
      result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: input.base64Data,
          },
        },
        { text: JD_PARSE_PROMPT },
      ]);
    } else {
      result = await model.generateContent([
        { text: `${JD_PARSE_PROMPT}\n\nJob Description:\n${input.rawText}` },
      ]);
    }
  } catch (geminiErr) {
    logger.error('Gemini API call failed for JD parsing', geminiErr);
    const err = new Error('AI service is unavailable. Please try again later.') as Error & { status: number };
    err.status = 502;
    throw err;
  }

  const rawText = result.response.text();
  let parsedData: ParsedJobData;

  try {
    const rawJson = JSON.parse(rawText) as unknown;
    const validation = ParsedJobDataSchema.safeParse(rawJson);
    if (!validation.success) {
      logger.error('Gemini response failed job schema validation', validation.error.flatten());
      const err = new Error('AI returned unexpected data format. Please try again.') as Error & { status: number };
      err.status = 500;
      throw err;
    }
    parsedData = validation.data;
  } catch (parseErr) {
    if ((parseErr as { status?: number }).status) throw parseErr;
    logger.error('Failed to parse Gemini AI response for JD as JSON', parseErr);
    const err = new Error('AI parsing failed. Please try a different PDF or contact support.') as Error & { status: number };
    err.status = 500;
    throw err;
  }

  // The description field stores the raw source text (from rawText or filename placeholder for PDFs)
  const description = 'rawText' in input ? input.rawText : input.description;

  // Save draft job to database
  const job = await prisma.job.create({
    data: {
      createdById,
      companyName: parsedData.companyName,
      jobRole: parsedData.jobRole,
      ctc: parsedData.ctc ?? null,
      description,
      minCgpa: parsedData.minCgpa,
      maxActiveArrears: parsedData.maxActiveArrears,
      maxHistoryOfArrears: parsedData.maxHistoryOfArrears,
      allowedDepartments: parsedData.allowedDepartments,
      status: 'DRAFT',
      parsedData: {
        requiredSkills: parsedData.requiredSkills,
        unstructuredData: parsedData.unstructuredData,
      } as any,
    },
  });

  return { job_id: job.id, parsed_data: parsedData };
};

// --- Get all jobs created by an admin/faculty ---

export const getJobsByAdmin = async (adminId: string) => {
  const jobs = await prisma.job.findMany({
    where: { createdById: adminId },
    select: {
      id: true,
      companyName: true,
      jobRole: true,
      ctc: true,
      status: true,
      allowedDepartments: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return jobs.map((job) => ({
    id: job.id,
    companyName: job.companyName,
    jobRole: job.jobRole,
    ctc: job.ctc,
    status: job.status,
    allowedDepartments: job.allowedDepartments,
    applicationCount: job._count.applications,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }));
};

// --- Get a single job by ID (for admin review form) ---

export const getJobById = async (jobId: string, adminId: string) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    const err = new Error('Job not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (job.createdById !== adminId) {
    const err = new Error('You do not have permission to access this job.') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  return job;
};

// --- Publish a job (Phase 2 transaction) ---

export type PublishJobInput = z.infer<typeof publishJobSchema>;

export const publishJob = async (jobId: string, adminId: string, payload: PublishJobInput) => {
  // Verify the job exists, belongs to this admin, and is a DRAFT
  const existing = await prisma.job.findUnique({ where: { id: jobId } });

  if (!existing) {
    const err = new Error('Job not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (existing.createdById !== adminId) {
    const err = new Error('You do not have permission to publish this job.') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  if (existing.status !== 'DRAFT') {
    const err = new Error('Only DRAFT jobs can be published.') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  // Execute as an interactive Prisma transaction
  const updatedJob = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Update the Job record and set status to ACTIVE
    const job = await tx.job.update({
      where: { id: jobId },
      data: {
        companyName: payload.companyName,
        jobRole: payload.jobRole,
        ctc: payload.ctc ?? null,
        minCgpa: payload.minCgpa,
        maxActiveArrears: payload.maxActiveArrears,
        maxHistoryOfArrears: payload.maxHistoryOfArrears,
        allowedDepartments: payload.allowedDepartments,
        parsedData: payload.parsedData ?? existing.parsedData ?? Prisma.JsonNull,
        status: 'ACTIVE',
      },
    });

    // 2. Delete existing skill mappings for this job (in case of re-publish)
    await tx.jobSkill.deleteMany({ where: { jobId } });

    // 3. Upsert each required skill (lowercase) and collect skill IDs
    const skillIds: string[] = [];
    for (const rawSkill of payload.requiredSkills) {
      const skillName = rawSkill.toLowerCase().trim();
      if (!skillName) continue;
      const skill = await tx.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName },
      });
      skillIds.push(skill.id);
    }

    // 4. Create JobSkill mapping records
    if (skillIds.length > 0) {
      await tx.jobSkill.createMany({
        data: skillIds.map((skillId) => ({ jobId, skillId })),
        skipDuplicates: true,
      });
    }

    return job;
  });

  return updatedJob;
};
