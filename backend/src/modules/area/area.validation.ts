import { z } from 'zod';
import { AreaConstants } from './area.constants';

// Basic check for SQL injection patterns in search query string
const sqlInjectionPattern = /('|--|#|\/\*|\*\/|union\s+select|select\s+.*from|insert\s+into|delete\s+from|drop\s+table|update\s+.*set)/i;

export const searchSchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, { message: AreaConstants.ERRORS.QUERY_REQUIRED })
    .max(AreaConstants.MAX_QUERY_LENGTH, { message: AreaConstants.ERRORS.QUERY_TOO_LONG })
    .refine((val) => !sqlInjectionPattern.test(val), {
      message: AreaConstants.ERRORS.SQL_INJECTION_DETECTED,
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : AreaConstants.DEFAULT_SEARCH_LIMIT))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive number' }),
});

export const nearbySchema = z.object({
  latitude: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), { message: AreaConstants.ERRORS.LATITUDE_REQUIRED })
    .transform((val) => parseFloat(val))
    .refine((val) => val >= -90 && val <= 90, { message: AreaConstants.ERRORS.INVALID_LATITUDE }),
  longitude: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), { message: AreaConstants.ERRORS.LONGITUDE_REQUIRED })
    .transform((val) => parseFloat(val))
    .refine((val) => val >= -180 && val <= 180, { message: AreaConstants.ERRORS.INVALID_LONGITUDE }),
  radius: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : AreaConstants.DEFAULT_NEARBY_RADIUS_KM))
    .refine((val) => !isNaN(val) && val > 0, { message: AreaConstants.ERRORS.INVALID_RADIUS }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : AreaConstants.DEFAULT_SEARCH_LIMIT))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive number' }),
});

export const detailsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid ID format. Must be a valid UUID' }),
});
