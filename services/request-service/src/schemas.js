import { z } from 'zod';

export const createRequestSchema = z.object({
  extinguisherId: z.string().uuid(),
  reason: z.string().trim().min(10).max(500),
  locationDetails: z.string().trim().max(500).optional(),
});

export const denySchema = z.object({
  denialReason: z.string().trim().min(3).max(500),
});

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'DENIED']).optional(),
  requesterId: z.string().uuid().optional(),
});

export const idParam = z.object({ id: z.string().uuid() });
