/**
 * @file schemas.js
 * @module extinguisher-service/schemas
 *
 * Purpose:
 *   Zod DTOs for fire extinguisher endpoints, including the business rule that
 *   the expiry date must be after the installation date.
 */

import { z } from 'zod';
import {
  EXTINGUISHER_TYPES,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUS,
} from '@fems/shared/constants.js';

const typeEnum = z.enum(EXTINGUISHER_TYPES);
const sizeEnum = z.enum(EXTINGUISHER_SIZES);
const statusEnum = z.enum(EXTINGUISHER_STATUS);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/** Shared cross-field rule: expiry strictly after installation. */
const expiryAfterInstall = (data, ctx) => {
  if (data.installationDate && data.expiryDate && data.expiryDate <= data.installationDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['expiryDate'],
      message: 'Expiry date must be after the installation date',
    });
  }
};

/** Create extinguisher. */
export const createSchema = z
  .object({
    serialNumber: z.string().trim().min(1, 'Serial number is required').max(60),
    location: z.string().trim().min(1, 'Location is required').max(255),
    type: typeEnum,
    size: sizeEnum,
    installationDate: dateString,
    expiryDate: dateString,
    status: statusEnum.optional(),
  })
  .superRefine(expiryAfterInstall);

/** Full update (PUT). */
export const replaceSchema = z
  .object({
    serialNumber: z.string().trim().min(1).max(60),
    location: z.string().trim().min(1).max(255),
    type: typeEnum,
    size: sizeEnum,
    installationDate: dateString,
    expiryDate: dateString,
    status: statusEnum,
  })
  .superRefine(expiryAfterInstall);

/** Partial update (PATCH). */
export const patchSchema = z
  .object({
    serialNumber: z.string().trim().min(1).max(60).optional(),
    location: z.string().trim().min(1).max(255).optional(),
    type: typeEnum.optional(),
    size: sizeEnum.optional(),
    installationDate: dateString.optional(),
    expiryDate: dateString.optional(),
    status: statusEnum.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' })
  .superRefine(expiryAfterInstall);

/** List / search query. */
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  serialNumber: z.string().trim().optional(),
  location: z.string().trim().optional(),
  type: typeEnum.optional(),
  status: statusEnum.optional(),
  sortBy: z.enum(['created_at', 'serial_number', 'expiry_date', 'installation_date', 'location']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export const idParam = z.object({ id: z.string().uuid('A valid extinguisher id is required') });

export const assignSchema = z.object({
  userId: z.string().uuid('A valid user id is required'),
});
