/**
 * @file schemas.js
 * @module inspection-service/schemas
 *
 * Purpose:
 *   Zod DTOs for inspection scheduling and maintenance logging, enforcing the
 *   "no past dates" rule for new inspections.
 */

import { z } from 'zod';
import { INSPECTION_STATUS } from '@fems/shared/constants.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const timeString = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM format');

/**
 * Returns today's date (local) as a YYYY-MM-DD string for date comparisons.
 * @returns {string} Today in ISO date form.
 */
const today = () => new Date().toISOString().slice(0, 10);

/** Schedule an inspection. */
export const scheduleSchema = z
  .object({
    extinguisherId: z.string().uuid('A valid extinguisher is required'),
    inspectorId: z.string().uuid('A valid inspector is required').optional(),
    inspectionDate: dateString,
    inspectionTime: timeString,
    notes: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    // Business rule: inspections cannot be scheduled in the past.
    if (data.inspectionDate < today()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['inspectionDate'],
        message: 'Inspection date cannot be in the past',
      });
    }
  });

/** Update an inspection (complete / set result / reschedule). */
export const updateInspectionSchema = z
  .object({
    status: z.enum(INSPECTION_STATUS).optional(),
    result: z.enum(['Pass', 'Fail', 'Needs Maintenance']).optional(),
    inspectorId: z.string().uuid().optional(),
    inspectionDate: dateString.optional(),
    inspectionTime: timeString.optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' });

const optionalText = z
  .union([z.string().max(2000), z.literal('')])
  .optional()
  .transform((v) => (v === '' ? undefined : v));

/** Log a maintenance activity. */
export const maintenanceSchema = z.object({
  extinguisherId: z.string().uuid('A valid extinguisher is required'),
  inspectionId: z.preprocess(
    (val) => (val === '' || val == null ? undefined : val),
    z.string().uuid('A valid inspection id is required').optional()
  ),
  actionTaken: z.string().trim().min(1, 'Action taken is required').max(255),
  maintenanceDate: dateString,
  issuesIdentified: optionalText,
  notes: optionalText,
  recommendations: optionalText,
});

/** List inspections query. */
export const listInspectionsQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(INSPECTION_STATUS).optional(),
  extinguisherId: z.string().uuid().optional(),
  inspectorId: z.string().uuid().optional(),
  sortBy: z.enum(['inspection_date', 'created_at', 'status']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

/** List maintenance query. */
export const listMaintenanceQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  extinguisherId: z.string().uuid().optional(),
  sortBy: z.enum(['maintenance_date', 'created_at']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export const idParam = z.object({ id: z.string().uuid('A valid id is required') });
export const extinguisherIdParam = z.object({ extinguisherId: z.string().uuid('A valid extinguisher id is required') });
