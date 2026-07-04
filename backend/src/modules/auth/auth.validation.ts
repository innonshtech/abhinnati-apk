import { z } from 'zod';

export const requestOtpSchema = z.object({
  phone_number: z.string().min(10).max(15),
});

export const verifyOtpSchema = z.object({
  session_id: z.string(),
  code: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
