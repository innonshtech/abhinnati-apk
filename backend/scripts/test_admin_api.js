const http = require('http');

async function run() {
  // 1. Admin Login
  const loginRes = await fetch('http://localhost:3000/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      identifier: process.env.ADMIN_IDENTIFIER || '9999999999', 
      password: process.env.ADMIN_PASSWORD || '' 
    })
  });

  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('Login status:', loginRes.status, 'Cookie captured:', !!cookieHeader);
  const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';

  // 2. Test GET /api/v1/admin/bookings
  const bookingsRes = await fetch('http://localhost:3000/api/v1/admin/bookings', {
    headers: { Cookie: cookie }
  });
  const bookingsData = await bookingsRes.json();
  console.log('GET /api/v1/admin/bookings status:', bookingsRes.status, 'Bookings count:', bookingsData.bookings?.length);

  // 3. Test POST /api/v1/admin/categories
  const newCatRes = await fetch('http://localhost:3000/api/v1/admin/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie
    },
    body: JSON.stringify({
      nameEn: 'Car Wash & Detailing',
      nameMr: 'कार धुणे आणि स्वच्छता',
      iconName: 'Car',
      displayOrder: 9
    })
  });
  const newCatData = await newCatRes.json();
  console.log('POST /api/v1/admin/categories status:', newCatRes.status, 'Created:', newCatData.category?.nameEn, 'Slug:', newCatData.category?.slug);

  // 4. Test GET /api/v1/admin/categories
  const catsRes = await fetch('http://localhost:3000/api/v1/admin/categories', {
    headers: { Cookie: cookie }
  });
  const catsData = await catsRes.json();
  console.log('GET /api/v1/admin/categories status:', catsRes.status, 'Total categories:', catsData.categories?.length);

  // 5. Test Admin Dashboard Page HTML compilation
  const dashRes = await fetch('http://localhost:3000/admin', {
    headers: { Cookie: cookie }
  });
  console.log('GET /admin page render status:', dashRes.status);
}

run().catch(console.error);
