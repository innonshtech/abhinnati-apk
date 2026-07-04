import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  language: z.enum(['mr', 'en']).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;

export const UpdateAddressSchema = z.object({
  formattedAddress: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 characters'),
  area: z.string().min(2, 'Area name is required'),
});

export type UpdateAddressRequest = z.infer<typeof UpdateAddressSchema>;

export const CreateBusinessSchema = z.object({
  nameMr: z.string().min(2, 'Marathi business name is required'),
  nameEn: z.string().min(2, 'English business name is required'),
  descriptionMr: z.string().default(''),
  descriptionEn: z.string().default(''),
  whatsappNumber: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  serviceRadius: z.string().default('5 km'),
  emergencyStatus: z.string().optional().or(z.literal('')),
});

export type CreateBusinessRequest = z.infer<typeof CreateBusinessSchema>;

export const UpdateBusinessSchema = CreateBusinessSchema.partial();

export type UpdateBusinessRequest = z.infer<typeof UpdateBusinessSchema>;

export const UploadAssetSchema = z.object({
  base64Data: z.string().min(1, 'File base64 data is required'),
  filename: z.string().optional(),
});

export type UploadAssetRequest = z.infer<typeof UploadAssetSchema>;

export const ReorderGallerySchema = z.object({
  urls: z.array(z.string().url('Invalid URL string')),
});

export type ReorderGalleryRequest = z.infer<typeof ReorderGallerySchema>;

export const UpdateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formattedAddress: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6),
  area: z.string().min(2),
});

export type UpdateLocationRequest = z.infer<typeof UpdateLocationSchema>;

export const DayScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM format').nullable().optional(),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM format').nullable().optional(),
  isClosed: z.boolean().default(false),
});

export const UpdateBusinessHoursSchema = z.object({
  schedule: z.array(DayScheduleSchema).optional(),
  vacationMode: z.boolean().optional(),
  vacationStart: z.string().datetime().nullable().optional(),
  vacationEnd: z.string().datetime().nullable().optional(),
  vacationReason: z.string().nullable().optional(),
  blockedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(), // YYYY-MM-DD
  blockedSlots: z.array(z.string()).optional(),
});

export type UpdateBusinessHoursRequest = z.infer<typeof UpdateBusinessHoursSchema>;

export const CreateServiceSchema = z.object({
  nameMr: z.string().min(2, 'Marathi service name is required'),
  nameEn: z.string().min(2, 'English service name is required'),
  price: z.number().nonnegative('Price must be positive'),
  durationMins: z.number().positive('Duration must be positive'),
  descriptionMr: z.string().default(''),
  descriptionEn: z.string().default(''),
  isActive: z.boolean().default(true),
});

export type CreateServiceRequest = z.infer<typeof CreateServiceSchema>;

export const UpdateServiceSchema = CreateServiceSchema.partial();

export type UpdateServiceRequest = z.infer<typeof UpdateServiceSchema>;

export const SubmitKycDocsSchema = z.object({
  documentType: z.enum(['aadhaar', 'pan', 'gst', 'shop_license', 'electricity_bill', 'trade_license']),
  base64Data: z.string().min(1, 'Document base64 data is required'),
});

export type SubmitKycDocsRequest = z.infer<typeof SubmitKycDocsSchema>;

export const UpdateKycStatusSchema = z.object({
  vendorId: z.string().uuid(),
  status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'resubmission']),
  rejectionReason: z.string().optional(),
});

export type UpdateKycStatusRequest = z.infer<typeof UpdateKycStatusSchema>;
