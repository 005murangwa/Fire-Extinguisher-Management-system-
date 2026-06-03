/**
 * @file schemas.js
 * @module user-service/schemas
 *
 * Purpose:
 *   Zod DTOs for user-management endpoints (create/update/list).
 */

import { z } from 'zod';
import { ROLES } from '@fems/shared/constants.js';

const roleEnum = z.enum([ROLES.ADMIN, ROLES.INSPECTOR, ROLES.USER]);

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

/** Create user (admin). */
export const createUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: strongPassword,
  role: roleEnum.default(ROLES.USER),
});

/** Full update (PUT). */
export const replaceUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  role: roleEnum,
  isActive: z.boolean(),
});

/** Partial update (PATCH). */
export const patchUserSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    role: roleEnum.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' });

/** List query parameters. */
export const listUsersQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  role: roleEnum.optional(),
  sortBy: z.enum(['created_at', 'first_name', 'last_name', 'email']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

/** :id path parameter. */
export const idParam = z.object({ id: z.string().uuid('A valid user id is required') });

export const inviteInspectorSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  message: z.string().trim().max(500).optional(),
});
