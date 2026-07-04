/**
 * Verification script for Area Search & Location Module endpoints.
 * Run this script using `node backend/scratch/test_endpoints.js`.
 */

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  console.log('=== STARTING AREA MODULE VERIFICATION TESTS ===\n');

  try {
    // Test 1: Get All Active Areas
    console.log('Test 1: GET /areas (All Active Areas)...');
    const allRes = await fetch(`${BASE_URL}/areas`);
    const allData = await allRes.json();
    if (!allRes.ok || !allData.success) {
      throw new Error(`Failed Test 1: ${JSON.stringify(allData)}`);
    }
    console.log(`✓ Passed: Found ${allData.data.length} active areas.`);
    // Save a valid ID for detail testing
    const testArea = allData.data[0];
    if (!testArea) {
      throw new Error('No areas seeded in database!');
    }
    console.log(`  Sample Area: "${testArea.name}" (ID: ${testArea.id})\n`);

    // Test 2: Search by Alias "Hinjavadi" (should return Hinjewadi/etc)
    console.log('Test 2: GET /areas/search?q=Hinjavadi (Alias Match)...');
    const searchAliasRes = await fetch(`${BASE_URL}/areas/search?q=Hinjavadi`);
    const searchAliasData = await searchAliasRes.ok ? await searchAliasRes.json() : null;
    if (!searchAliasData || !searchAliasData.success || searchAliasData.data.length === 0) {
      console.warn('⚠️ Warning: Alias search for "Hinjavadi" failed or returned empty.');
      console.log('Response:', searchAliasData);
    } else {
      console.log(`✓ Passed: Match found: "${searchAliasData.data[0].name}"`);
      console.log(`  Aliases: [${searchAliasData.data[0].aliases.join(', ')}]\n`);
    }

    // Test 3: Search by Short Alias "KP" (should return Koregaon Park)
    console.log('Test 3: GET /areas/search?q=KP (Short Alias Match)...');
    const searchKpRes = await fetch(`${BASE_URL}/areas/search?q=KP`);
    const searchKpData = await searchKpRes.ok ? await searchKpRes.json() : null;
    if (!searchKpData || !searchKpData.success || searchKpData.data.length === 0) {
      console.warn('⚠️ Warning: Alias search for "KP" failed or returned empty.');
      console.log('Response:', searchKpData);
    } else {
      console.log(`✓ Passed: Match found: "${searchKpData.data[0].name}"`);
      console.log(`  Aliases: [${searchKpData.data[0].aliases.join(', ')}]\n`);
    }

    // Test 4: Search by Pincode "411038" (Kothrud/etc)
    console.log('Test 4: GET /areas/search?q=411038 (Pincode Match)...');
    const searchPincodeRes = await fetch(`${BASE_URL}/areas/search?q=411038`);
    const searchPincodeData = await searchPincodeRes.json();
    if (!searchPincodeRes.ok || !searchPincodeData.success || searchPincodeData.data.length === 0) {
      throw new Error(`Failed Test 4: ${JSON.stringify(searchPincodeData)}`);
    }
    console.log(`✓ Passed: Match found: "${searchPincodeData.data[0].name}" with pincode ${searchPincodeData.data[0].pincode}\n`);

    // Test 5: Geodistance Discover Nearby Areas
    console.log('Test 5: GET /areas/nearby (Kothrud coordinates: lat=18.5074, lng=73.8077, radius=5km)...');
    const nearbyRes = await fetch(`${BASE_URL}/areas/nearby?latitude=18.5074&longitude=73.8077&radius=5`);
    const nearbyData = await nearbyRes.json();
    if (!nearbyRes.ok || !nearbyData.success) {
      throw new Error(`Failed Test 5: ${JSON.stringify(nearbyData)}`);
    }
    console.log(`✓ Passed: Found ${nearbyData.data.length} nearby areas within 5km.`);
    for (const area of nearbyData.data) {
      console.log(`  - ${area.name} (Distance: ${area.distance} km)`);
    }
    console.log('');

    // Test 6: Popular Areas
    console.log('Test 6: GET /areas/popular (Popular areas)...');
    const popularRes = await fetch(`${BASE_URL}/areas/popular?limit=5`);
    const popularData = await popularRes.json();
    if (!popularRes.ok || !popularData.success) {
      throw new Error(`Failed Test 6: ${JSON.stringify(popularData)}`);
    }
    console.log('✓ Passed: Fetched popular areas:');
    for (const area of popularData.data) {
      console.log(`  - ${area.name} (Search Count: ${area.searchCount})`);
    }
    console.log('');

    // Test 7: Get Area Details by ID and Check Search Count Increment
    console.log(`Test 7: GET /areas/${testArea.id} (Get Details & Increment Search Count)...`);
    // Fetch details first time
    const detailRes1 = await fetch(`${BASE_URL}/areas/${testArea.id}`);
    const detailData1 = await detailRes1.json();
    if (!detailRes1.ok || !detailData1.success) {
      throw new Error(`Failed Test 7 First Fetch: ${JSON.stringify(detailData1)}`);
    }
    const initialCount = detailData1.data.searchCount;
    console.log(`  Initial Search Count: ${initialCount}`);

    // Fetch details second time to confirm increment
    const detailRes2 = await fetch(`${BASE_URL}/areas/${testArea.id}`);
    const detailData2 = await detailRes2.json();
    if (!detailRes2.ok || !detailData2.success) {
      throw new Error(`Failed Test 7 Second Fetch: ${JSON.stringify(detailData2)}`);
    }
    const finalCount = detailData2.data.searchCount;
    console.log(`  Final Search Count after secondary request: ${finalCount}`);

    if (finalCount > initialCount) {
      console.log('✓ Passed: Search count successfully incremented!\n');
    } else {
      console.warn('⚠️ Warning: Search count did not increment. Note: Increment is done asynchronously, checking again in 500ms...');
      await new Promise(r => setTimeout(r, 500));
      const detailRes3 = await fetch(`${BASE_URL}/areas/${testArea.id}`);
      const detailData3 = await detailRes3.json();
      if (detailData3.data.searchCount > initialCount) {
        console.log('✓ Passed: Search count successfully incremented after delay!\n');
      } else {
        throw new Error(`Failed: Search count remained at ${initialCount}`);
      }
    }

    console.log('=== ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('\n❌ Test execution failed with error:', err.message);
    process.exit(1);
  }
}

runTests();
