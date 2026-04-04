import { Request, Response } from 'express';
import * as StudentService from './student.service';
import type { StudentSearchPayload } from './student.service';

export const handleSearchStudents = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as Partial<StudentSearchPayload>;

  const payload: StudentSearchPayload = {
    skills: Array.isArray(body.skills) ? body.skills : undefined,
    minCgpa: typeof body.minCgpa === 'number' ? body.minCgpa : undefined,
    maxActiveArrears: typeof body.maxActiveArrears === 'number' ? body.maxActiveArrears : undefined,
    departments: Array.isArray(body.departments) ? body.departments : undefined,
    page: typeof body.page === 'number' ? body.page : undefined,
    limit: typeof body.limit === 'number' ? body.limit : undefined,
    sortBy: body.sortBy === 'cgpa' || body.sortBy === 'name' ? body.sortBy : undefined,
    sortOrder: body.sortOrder === 'asc' || body.sortOrder === 'desc' ? body.sortOrder : undefined,
  };

  const data = await StudentService.searchStudents(payload);
  res.status(200).json({ success: true, data });
};
