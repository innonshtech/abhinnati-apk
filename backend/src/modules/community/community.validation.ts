import { z } from 'zod';

export const createPostSchema = z.object({
  areaId: z.string().min(1),
  tag: z.enum(['community', 'local_issue', 'spotlight']),
  title_mr: z.string().default(''),
  title_en: z.string().default(''),
  content_mr: z.string().default(''),
  content_en: z.string().default(''),
  imageUrl: z.string().optional(),
});

export const createCommentSchema = z.object({
  authorName: z.string().optional(),
  content: z.string().min(1),
});
