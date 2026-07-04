import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name cannot be empty' }).max(40).optional(),
  language: z.enum(['mr', 'en']).optional(),
  activeAreaId: z.string().min(1, { message: 'Invalid Area ID format' }).optional(),
  activeArea: z.object({
    id: z.string(),
    name: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
    pincode: z.string().optional(),
    district: z.string().optional(),
  }).optional(),
});

export const createProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters long' })
    .max(50, { message: 'Full name cannot exceed 50 characters' })
    .regex(/^[\p{L}\s]+$/u, { message: 'Full name can only contain alphabets and spaces' }),
  profileImage: z.string().optional(),
});
