import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { prisma } from '@pearl/database';
import { env } from '../../config/env';
import { logger } from '../../services/logger.service';
import { ParsedJobDataSchema } from '@pearl/common';
import type { ParsedJobData } from '@pearl/common';

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
  input: { base64Data: string } | { rawText: string },
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

  // Save draft job to database
  const job = await prisma.job.create({
    data: {
      companyName: parsedData.companyName,
      jobRole: parsedData.jobRole,
      ctc: parsedData.ctc ?? null,
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
