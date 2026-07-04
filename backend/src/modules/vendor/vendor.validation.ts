import { z } from 'zod';

export const kycSchema = z.object({
  businessNameMr: z.string().min(1),
  businessNameEn: z.string().min(1),
  categorySlug: z.string().min(1),
  categoryNameMr: z.string().min(1),
  categoryNameEn: z.string().min(1),
  descriptionMr: z.string().min(1),
  descriptionEn: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  areaId: z.string().min(1),
  kycDocsUrl: z.string().optional(),
  kycDocs: z.record(
    z.object({
      fileName: z.string(),
      mimeType: z.string(),
      fileData: z.string(),
    })
  ).optional(),
});

export const serviceSchema = z.object({
  id: z.string().optional(),
  name_mr: z.string().min(1),
  name_en: z.string().min(1),
  price: z.number().min(0),
  duration_mins: z.number().min(1),
  description_mr: z.string().default(''),
  description_en: z.string().default(''),
});

export const reviewReplySchema = z.object({
  reply: z.string().min(1, { message: 'Reply text is required' }),
});
