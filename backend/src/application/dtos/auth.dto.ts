import { z } from 'zod';

export const LoginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const RegisterVendorSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessNameMr: z.string().min(2, 'Marathi business name is required'),
  businessNameEn: z.string().min(2, 'English business name is required'),
  categorySlug: z.string().min(1, 'Category slug is required'),
  categoryNameMr: z.string().min(2, 'Category Marathi name is required'),
  categoryNameEn: z.string().min(2, 'Category English name is required'),
  descriptionMr: z.string().default(''),
  descriptionEn: z.string().default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formattedAddress: z.string().min(5, 'Formatted address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 characters'),
  area: z.string().min(2, 'Area name is required'),
  kycDocsUrl: z.string().url('Invalid KYC documents URL').optional().or(z.literal('')),
});

export type RegisterVendorRequest = z.infer<typeof RegisterVendorSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;

export const RequestOtpSchema = z.object({
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
});

export type RequestOtpRequest = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  code: z.string().min(6, 'Verification code must be 6 digits').max(6, 'Verification code must be 6 digits'),
});

export type VerifyOtpRequest = z.infer<typeof VerifyOtpSchema>;
