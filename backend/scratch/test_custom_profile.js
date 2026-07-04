/**
 * Verification script for Custom/Dynamic Area Profile updates.
 */

const AUTH_URL = 'http://localhost:3000/api/v1/auth';
const PROFILE_URL = 'http://localhost:3000/api/v1/user/profile';

async function runTests() {
  console.log('=== STARTING DYNAMIC PROFILE UPDATE VERIFICATION TESTS ===\n');

  try {
    const testPhone = '9876599999';
    const randomSuffix = Math.floor(Math.random() * 10000);
    const customAreaId = `gps_19.08000_72.84000_${randomSuffix}`;

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

    // 3. Update Profile with Custom GPS Area
    console.log(`Step 3: PATCH /user/profile with Custom Area ID: ${customAreaId}...`);
    const updateRes = await fetch(PROFILE_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'John Custom',
        activeAreaId: customAreaId,
        activeArea: {
          id: customAreaId,
          name: 'Santa Cruz Custom',
          city: 'Mumbai',
          latitude: 19.08000,
          longitude: 72.84000,
        }
      }),
    });

    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.success) {
      throw new Error(`Failed Custom Profile Update: ${JSON.stringify(updateData)}`);
    }
    console.log('✓ Profile updated successfully with custom area!');
    console.log('  Updated Data:', updateData.data);

    // Verify properties match
    if (updateData.data.activeAreaId === customAreaId) {
      console.log('\n✓ Assertion Passed: Profile matched custom area ID perfectly.');
    } else {
      throw new Error('Updated properties do not match assertion!');
    }

    console.log('\n=== ALL DYNAMIC PROFILE VERIFICATION TESTS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('\n❌ Custom profile test execution failed with error:', err.message);
    process.exit(1);
  }
}

runTests();
