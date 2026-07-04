import { config } from '../lib/config';
import { logger } from '../lib/logger';
import { validateBody } from '../lib/validation';
import { responseHelper } from '../lib/response';
import { storageService } from '../lib/storage';
import { ValidationError, UnauthorizedError } from '../lib/errors';
import { z } from 'zod';

async function test() {
  console.log('--- STARTING BACKEND FOUNDATION TS TESTS ---');

  // 1. Test Config Loading
  console.log('\n[Test 1] Testing config manager...');
  console.log(`DATABASE_URL loaded: ${config.DATABASE_URL ? 'YES' : 'NO'}`);
  console.log(`JWT_SECRET loaded: ${config.JWT_SECRET ? 'YES' : 'NO'}`);
  console.log(`PORT: ${config.PORT}`);
  console.log(`NODE_ENV: ${config.NODE_ENV}`);
  if (!config.DATABASE_URL || !config.JWT_SECRET) {
    throw new Error('Config failed to load required variables');
  }
  console.log('✔ Config test PASSED.');

  // 2. Test Logger
  console.log('\n[Test 2] Testing structured logger (inspect JSON console outputs below)...');
  logger.info('Test info message', { module: 'foundation-test' });
  logger.warn('Test warn message', { warningCode: 42 });
  logger.error('Test error message', new Error('Sample log error exception'));
  console.log('✔ Logger test PASSED.');

  // 3. Test Validation & Custom Errors
  console.log('\n[Test 3] Testing Zod schema validation helper...');
  const testSchema = z.object({
    username: z.string().min(3),
    age: z.number().int().positive()
  });

  // Successful validation
  const validData = { username: 'sneha', age: 24 };
  const validated = validateBody(testSchema, validData);
  console.log('Validated successfully:', validated);
  if (validated.username !== 'sneha' || validated.age !== 24) {
    throw new Error('validateBody did not return valid properties');
  }

  // Failed validation
  console.log('Testing failed validation (expecting ValidationError)...');
  try {
    validateBody(testSchema, { username: 'x', age: -5 });
    throw new Error('Expected validation to fail, but it passed!');
  } catch (err: any) {
    if (err instanceof ValidationError) {
      console.log('Correctly caught ValidationError exception.');
      console.log('Error details:', JSON.stringify(err.details, null, 2));
      if (err.statusCode !== 400 || err.details.length !== 2) {
        throw new Error(`Expected status 400 and 2 issues, got status=${err.statusCode} count=${err.details.length}`);
      }
    } else {
      throw new Error(`Expected ValidationError, got: ${err.message}`);
    }
  }
  console.log('✔ Validation test PASSED.');

  // 4. Test Response Helper
  console.log('\n[Test 4] Testing response helper...');
  
  // Test Success response
  const mockData = { user: 'abc' };
  const successRes = responseHelper.success(mockData, 'Created successfully', 201);
  const successBody = await successRes.json();
  console.log('Success response body:', successBody);
  if (successRes.status !== 201 || !successBody.success || successBody.message !== 'Created successfully') {
    throw new Error('responseHelper.success did not generate correct format');
  }

  // Test Error response with custom exceptions
  const errException = new UnauthorizedError('Token is invalid');
  const errorRes = responseHelper.error(errException);
  const errorBody = await errorRes.json();
  console.log('Error response body:', errorBody);
  if (errorRes.status !== 401 || errorBody.success !== false || errorBody.error !== 'Token is invalid') {
    throw new Error('responseHelper.error did not handle UnauthorizedError correctly');
  }
  console.log('✔ Response helper test PASSED.');

  // 5. Test Storage Service Fallback
  console.log('\n[Test 5] Testing storage service upload fallback...');
  const base64Pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const url = await storageService.uploadFile('profile-images', 'test-pixel.png', base64Pixel, 'image/png');
  console.log('Uploaded image URL:', url);
  if (!url.startsWith('http') || !url.includes('profile-images') || !url.includes('test-pixel.png')) {
    throw new Error(`Unexpected public URL returned: ${url}`);
  }
  console.log('✔ Storage service test PASSED.');

  console.log('\n--- ALL BACKEND FOUNDATION TESTS PASSED SUCCESSFULLY! ---');
}

test().catch((err) => {
  console.error('\n❌ FOUNDATION TS TESTS FAILED:', err.message);
  process.exit(1);
});
