/**
 * @file schemas.js
 * @module auth-service/schemas
 *
 * Purpose:
 *   Zod request schemas (DTOs) for the Authentication Service. They provide
 *   server-side validation and double as living documentation of the request
 *   contracts.
 */

import { z } from 'zod';

/** Strong password policy mirrored from @fems/shared/password. */
const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

/** Send registration OTP (step 1). */
export const sendOtpSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: strongPassword,
});

/** Complete registration with OTP (step 2). */
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: strongPassword,
  otp: z.string().length(6, 'Enter the 6-digit verification code'),
});

/** Login request body. */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

/** Refresh token request body (optional when httpOnly cookie is set). */
export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'A refresh token is required').optional(),
});

/** Logout request body (optional when httpOnly cookie is set). */
export const logoutSchema = z.object({
  refreshToken: z.string().min(10, 'A refresh token is required').optional(),
});

/** Update profile (partial). */
export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

/** Change password (authenticated). */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPassword,
});

/** Forgot password (request a reset token). */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
});

/** Reset password (consume a reset token). */
export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'A reset token is required'),
  newPassword: strongPassword,
});
