/**
 * Verification script for Auth endpoints.
 * Run this script using `node backend/scratch/test_auth.js`.
 */

const BASE_URL = 'http://localhost:3000/api/v1/auth';

async function runTests() {
  console.log('=== STARTING AUTH VERIFICATION TESTS ===\n');

  try {
    const testPhone = '9988776655';

    // Test 1: Request OTP
    console.log(`Test 1: POST /request-otp for phone: ${testPhone}...`);
    const reqRes = await fetch(`${BASE_URL}/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: testPhone }),
    });
    
    const reqData = await reqRes.json();
    if (!reqRes.ok || !reqData.success) {
      throw new Error(`Failed Test 1: ${JSON.stringify(reqData)}`);
    }
    console.log('✓ Passed: OTP requested successfully.');
    console.log(`  Session ID: ${reqData.sessionId}\n`);

    // Test 2: Verify OTP
    console.log('Test 2: POST /verify-otp with valid mock OTP code...');
    const verifyRes = await fetch(`${BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: reqData.sessionId, code: '123456' }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) {
      throw new Error(`Failed Test 2: ${JSON.stringify(verifyData)}`);
    }
    console.log('✓ Passed: OTP verified successfully!');
    console.log(`  JWT Token: ${verifyData.token.substring(0, 20)}...`);
    console.log(`  Is New User: ${verifyData.isNewUser}`);
    console.log(`  Role: ${verifyData.role}\n`);

    console.log('=== ALL AUTH VERIFICATION TESTS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('\n❌ Auth test execution failed with error:', err.message);
    process.exit(1);
  }
}

runTests();
