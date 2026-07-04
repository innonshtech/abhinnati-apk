const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'boilerplate_secret_key_for_abhinnati_jwt';

async function test() {
  console.log('--- STARTING ONBOARDING API INTEGRATION TESTS ---');

  // 1. Fetch a seed user from the database to test with
  const testUser = await prisma.user.findFirst();
  if (!testUser) {
    console.error('No users found in database. Seed the database first.');
    process.exit(1);
  }
  console.log(`Using test user: ID=${testUser.id}, Phone=${testUser.phone}, Role=${testUser.role}`);

  // 2. Generate a valid JWT token
  const token = jwt.sign(
    { userId: testUser.id, phone: testUser.phone, role: testUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  console.log('Generated JWT token successfully.');

  // 3. Define the endpoints to test
  const endpoints = [
    'http://localhost:3000/api/v1/user/profile',
    'http://localhost:3000/api/user/profile'
  ];

  for (const endpoint of endpoints) {
    console.log(`\nTesting endpoint: ${endpoint}`);

    // --- TEST 1: SUCCESS CASE ---
    console.log('Test 1: Valid profile creation (Sneha Patil)');
    const successRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: 'Sneha Patil',
        profileImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // 1x1 pixel PNG
      })
    });

    console.log(`Response Status: ${successRes.status}`);
    const successJson = await successRes.json();
    console.log('Response Body:', JSON.stringify(successJson, null, 2));

    if (successRes.status !== 201 || !successJson.success) {
      throw new Error(`Test 1 Failed: Expected 201 and success:true`);
    }

    if (successJson.data.fullName !== 'Sneha Patil') {
      throw new Error(`Test 1 Failed: Expected fullName to be "Sneha Patil", got "${successJson.data.fullName}"`);
    }

    if (successJson.data.displayName !== 'Sneha P.') {
      throw new Error(`Test 1 Failed: Expected displayName to be "Sneha P.", got "${successJson.data.displayName}"`);
    }

    if (successJson.data.onboardingStep !== 'permissions') {
      throw new Error(`Test 1 Failed: Expected onboardingStep to be "permissions", got "${successJson.data.onboardingStep}"`);
    }

    console.log('Test 1 PASSED.');

    // --- TEST 2: VALIDATION FAILURE CASE (NAME WITH NUMBERS) ---
    console.log('Test 2: Invalid profile name validation (Sneha123)');
    const failRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: 'Sneha123'
      })
    });

    console.log(`Response Status: ${failRes.status}`);
    const failJson = await failRes.json();
    console.log('Response Body:', JSON.stringify(failJson, null, 2));

    if (failRes.status !== 400 || failJson.success) {
      throw new Error(`Test 2 Failed: Expected 400 validation error`);
    }
    console.log('Test 2 PASSED.');

    // --- TEST 3: UNAUTHORIZED CASE ---
    console.log('Test 3: Missing Auth Header');
    const authFailRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: 'Valid Name'
      })
    });

    console.log(`Response Status: ${authFailRes.status}`);
    const authFailJson = await authFailRes.json();
    console.log('Response Body:', JSON.stringify(authFailJson, null, 2));

    if (authFailRes.status !== 401 || authFailJson.success) {
      throw new Error(`Test 3 Failed: Expected 401 Unauthorized`);
    }
    console.log('Test 3 PASSED.');
  }

  // 4. Verify in Database that test user record was updated
  console.log('\nVerifying database state for test user...');
  const dbUser = await prisma.user.findUnique({
    where: { id: testUser.id }
  });

  console.log('Database User Record:', {
    id: dbUser.id,
    name: dbUser.name,
    fullName: dbUser.fullName,
    displayName: dbUser.displayName,
    profileImage: dbUser.profileImage,
    onboardingStep: dbUser.onboardingStep
  });

  if (dbUser.fullName !== 'Sneha Patil' || dbUser.displayName !== 'Sneha P.' || dbUser.onboardingStep !== 'permissions') {
    throw new Error('Database state does not match expected updates!');
  }
  console.log('Database state verification PASSED.');

  console.log('\n--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
}

test()
  .catch((e) => {
    console.error('\n❌ TEST RUN FAILED:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
