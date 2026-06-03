/**
 * @file routes.js
 * @module auth-service/routes
 *
 * Purpose:
 *   Wire the Authentication Service HTTP routes to validation middleware and
 *   controllers. Sensitive endpoints get a stricter rate limiter.
 */

import { asyncHandler } from '@fems/shared/http.js';
import { authenticate } from './middleware/auth.js';
import { validate } from '@fems/shared/middleware/validate.js';
import { authRateLimiter } from '@fems/shared/middleware/security.js';
import * as ctrl from './controller.js';
import {
  sendOtpSchema,
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './schemas.js';

/**
 * Mount auth routes on the provided router.
 *
 * @param {import('express').Router} router - Router to populate.
 * @returns {void}
 */
export function mountRoutes(router) {
  const strict = authRateLimiter();

  router.post('/send-registration-otp', strict, validate({ body: sendOtpSchema }), asyncHandler(ctrl.sendRegistrationOtp));
  router.post('/register', strict, validate({ body: registerSchema }), asyncHandler(ctrl.register));
  router.post('/login', strict, validate({ body: loginSchema }), asyncHandler(ctrl.login));
  router.post('/refresh', validate({ body: refreshSchema }), asyncHandler(ctrl.refresh));
  router.post('/logout', validate({ body: logoutSchema }), asyncHandler(ctrl.logout));

  router.post('/forgot-password', strict, validate({ body: forgotPasswordSchema }), asyncHandler(ctrl.forgotPassword));
  router.post('/reset-password', strict, validate({ body: resetPasswordSchema }), asyncHandler(ctrl.resetPassword));

  // Authenticated profile endpoints.
  router.get('/profile', authenticate, asyncHandler(ctrl.getProfile));
  router.patch('/profile', authenticate, validate({ body: updateProfileSchema }), asyncHandler(ctrl.updateProfile));
  router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), asyncHandler(ctrl.changePassword));
}

export default mountRoutes;
