import { prisma } from '../lib/prisma';

async function test() {
  console.log('--- STARTING AUTH FLOW INTEGRATION TESTS ---');

  const testPhone = '+919998887770';

  // Cleanup any old test user/session/refresh token for this phone
  console.log('Cleaning up old test data...');
  const oldUser = await prisma.user.findUnique({ where: { phone: testPhone } });
  if (oldUser) {
    await prisma.refreshToken.deleteMany({ where: { userId: oldUser.id } });
    await prisma.user.delete({ where: { id: oldUser.id } });
  }
  await prisma.otpSession.deleteMany({ where: { phone: testPhone } });

  // 1. Request OTP
  console.log('\n[Test 1] Requesting OTP...');
  const requestRes = await fetch('http://localhost:3000/api/v1/auth/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: testPhone })
  });

  console.log(`Request OTP Status: ${requestRes.status}`);
  const requestJson: any = await requestRes.json();
  console.log('Request OTP Response:', JSON.stringify(requestJson, null, 2));

  if (requestRes.status !== 200 || !requestJson.success || !requestJson.sessionId) {
    throw new Error('Request OTP failed');
  }

  // Verify DB state for OTP session
  const otpSession = await prisma.otpSession.findUnique({
    where: { id: requestJson.sessionId }
  });
  console.log('OtpSession in DB:', otpSession);
  if (!otpSession || otpSession.phone !== testPhone || otpSession.code !== '123456') {
    throw new Error('OtpSession in database is invalid or missing');
  }
  console.log('✔ Test 1: Request OTP and DB storage PASSED.');

  // 2. Verify OTP
  console.log('\n[Test 2] Verifying OTP...');
  const verifyRes = await fetch('http://localhost:3000/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: requestJson.sessionId, code: '123456' })
  });

  console.log(`Verify OTP Status: ${verifyRes.status}`);
  const verifyJson: any = await verifyRes.json();
  console.log('Verify OTP Response:', JSON.stringify(verifyJson, null, 2));

  if (verifyRes.status !== 200 || !verifyJson.success || !verifyJson.token || !verifyJson.refreshToken) {
    throw new Error('Verify OTP failed');
  }

  // Verify OTP session is deleted from DB
  const deletedSession = await prisma.otpSession.findUnique({
    where: { id: requestJson.sessionId }
  });
  if (deletedSession) {
    throw new Error('Used OtpSession was not deleted from database');
  }

  // Verify User and RefreshToken exist in DB
  const dbUser = await prisma.user.findUnique({
    where: { phone: testPhone },
    include: { refreshTokens: true }
  });
  console.log('Created User in DB:', dbUser);
  if (!dbUser || dbUser.refreshTokens.length !== 1 || dbUser.refreshTokens[0].token !== verifyJson.refreshToken) {
    throw new Error('User or RefreshToken record in DB is missing or incorrect');
  }
  console.log('✔ Test 2: Verify OTP and user creation/JWT tokens PASSED.');

  // 3. Refresh Access Token (Rotation check)
  console.log('\n[Test 3] Refreshing Access Token...');
  const refreshRes = await fetch('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: verifyJson.refreshToken })
  });

  console.log(`Refresh Status: ${refreshRes.status}`);
  const refreshJson: any = await refreshRes.json();
  console.log('Refresh Response:', JSON.stringify(refreshJson, null, 2));

  if (refreshRes.status !== 200 || !refreshJson.success || !refreshJson.token || !refreshJson.refreshToken) {
    throw new Error('Token refresh failed');
  }

  // Verify that the old refresh token is deleted and the new one exists
  const oldTokenDb = await prisma.refreshToken.findUnique({
    where: { token: verifyJson.refreshToken }
  });
  if (oldTokenDb) {
    throw new Error('Old refresh token was not rotated (not deleted from DB)');
  }

  const newTokenDb = await prisma.refreshToken.findUnique({
    where: { token: refreshJson.refreshToken }
  });
  console.log('New Rotated RefreshToken in DB:', newTokenDb);
  if (!newTokenDb || newTokenDb.userId !== dbUser.id) {
    throw new Error('New rotated RefreshToken in DB is missing or invalid');
  }
  console.log('✔ Test 3: Token refresh and rotation check PASSED.');

  // Cleanup test user
  console.log('\nCleaning up integration test user...');
  await prisma.refreshToken.deleteMany({ where: { userId: dbUser.id } });
  await prisma.user.delete({ where: { id: dbUser.id } });

  console.log('\n--- ALL AUTH FLOW INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
}

test()
  .catch((e) => {
    console.error('\n❌ AUTH INTEGRATION TESTS FAILED:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
