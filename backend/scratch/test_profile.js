/**
 * Verification script for User Profile API.
 * Run this script using `node backend/scratch/test_profile.js`.
 */

const AUTH_URL = 'http://localhost:3000/api/v1/auth';
const PROFILE_URL = 'http://localhost:3000/api/v1/user/profile';

async function runTests() {
  console.log('=== STARTING PROFILE UPDATE VERIFICATION TESTS ===\n');

  try {
    const testPhone = '9876500000';
    const testAreaId = 'e2c0e8a7-3df8-4bf8-b9a3-5c21f7b8c7a1'; // Bandra West UUID

    // 1. Get OTP
    console.log(`Step 1: Request OTP for phone: ${testPhone}...`);
    const reqRes = await fetch(`${AUTH_URL}/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: testPhone }),
    });
    const reqData = await reqRes.json();
    if (!reqRes.ok || !reqData.success) {
      throw new Error(`Failed OTP Request: ${JSON.stringify(reqData)}`);
    }

    // 2. Verify OTP
    console.log('Step 2: Verify OTP code...');
    const verifyRes = await fetch(`${AUTH_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: reqData.sessionId, code: '123456' }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) {
      throw new Error(`Failed OTP Verification: ${JSON.stringify(verifyData)}`);
    }
    const token = verifyData.token;
    console.log('✓ Token obtained successfully.');

    // 3. Update Profile (Name & Area)
    console.log(`Step 3: PATCH /user/profile (setting name="Sneha Patil", areaId="${testAreaId}")...`);
    const updateRes = await fetch(PROFILE_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Sneha Patil',
        activeAreaId: testAreaId,
      }),
    });

    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.success) {
      throw new Error(`Failed Profile Update: ${JSON.stringify(updateData)}`);
    }
    console.log('✓ Profile updated successfully!');
    console.log('  Updated Data:', updateData.data);

    // Verify properties match
    if (updateData.data.name === 'Sneha Patil' && updateData.data.activeAreaId === testAreaId) {
      console.log('\n✓ Assertion Passed: Profile matches updated values perfectly.');
    } else {
      throw new Error('Updated properties do not match assertion!');
    }

    console.log('\n=== ALL PROFILE VERIFICATION TESTS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('\n❌ Profile test execution failed with error:', err.message);
    process.exit(1);
  }
}

runTests();
