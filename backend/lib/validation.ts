import { Schema } from 'zod';
import { ValidationError } from './errors';

/**
 * Validates request payload using a Zod schema.
 * Throws a ValidationError with structured issues if validation fails.
 * 
 * @param schema - The Zod schema to validate against.
 * @param data - The data payload to validate.
 * @returns The successfully parsed and typed data.
 */
export function validateBody<T>(schema: Schema<T>, data: any): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    
    throw new ValidationError('Validation failed', errorDetails);
  }
  
  return result.data;
}
