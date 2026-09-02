/**
 * Authentication Validation Schemas (Zod)
 * For form validation and type safety
 */

import { z } from 'zod';

/**
 * Login Form Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  legalAccepted: z.boolean().refine(Boolean, {
    message: 'Please acknowledge the Terms and Privacy Policy',
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Signup Form Schema
 */
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  college: z
    .string()
    .max(200, 'College name must be less than 200 characters')
    .optional(),
  legalAccepted: z.boolean().refine(Boolean, {
    message: 'Please accept the Terms and Privacy Policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupSchema>;
