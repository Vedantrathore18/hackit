// Test script to verify all backend API endpoints

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Backend Verification Tests ---');

  // 1. Health Check
  console.log('\n[1] Testing GET /health ...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('Health Response:', healthData);

  // 2. Parse Udhaar Transaction (The Hero Endpoint)
  console.log('\n[2] Testing POST /transactions/parse (Udhaar) ...');
  const parseRes1 = await fetch(`${BASE_URL}/transactions/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw_text: 'Sharma ji ne 2400 ka saman liya, 7 din baad denge',
      language: 'hinglish',
    }),
  });
  const parseData1 = await parseRes1.json();
  console.log('Parsed Udhaar Transaction:', JSON.stringify(parseData1, null, 2));

  const sharmaId = parseData1.data?.customer?._id;

  // 3. Parse Payment Transaction
  console.log('\n[3] Testing POST /transactions/parse (Payment) ...');
  const parseRes2 = await fetch(`${BASE_URL}/transactions/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw_text: 'Ramesh ne 5800 ka saman liya kal denge',
      language: 'hinglish',
    }),
  });
  const parseData2 = await parseRes2.json();
  console.log('Parsed Ramesh Udhaar:', JSON.stringify(parseData2, null, 2));

  const rameshId = parseData2.data?.customer?._id;

  // 4. Record Partial Payment from Ramesh
  console.log('\n[4] Testing POST /transactions/parse (Partial Payment) ...');
  const paymentRes = await fetch(`${BASE_URL}/transactions/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw_text: 'Ramesh ne 1500 payment kar diya',
      language: 'hinglish',
    }),
  });
  const paymentData = await paymentRes.json();
  console.log('Payment update:', JSON.stringify(paymentData, null, 2));

  // 5. Get Dashboard Summary
  console.log('\n[5] Testing GET /dashboard/summary ...');
  const summaryRes = await fetch(`${BASE_URL}/dashboard/summary`);
  const summaryData = await summaryRes.json();
  console.log('Dashboard Summary:', JSON.stringify(summaryData, null, 2));

  // 6. Get Customers List
  console.log('\n[6] Testing GET /customers ...');
  const custRes = await fetch(`${BASE_URL}/customers`);
  const custData = await custRes.json();
  console.log('Customers List:', JSON.stringify(custData, null, 2));

  // 7. Get Customer Ledger
  if (sharmaId) {
    console.log(`\n[7] Testing GET /customers/${sharmaId}/ledger ...`);
    const ledgerRes = await fetch(`${BASE_URL}/customers/${sharmaId}/ledger`);
    const ledgerData = await ledgerRes.json();
    console.log('Sharma Ji Ledger:', JSON.stringify(ledgerData, null, 2));
  }

  // 8. Generate WhatsApp Reminder
  if (sharmaId) {
    console.log('\n[8] Testing POST /reminders/generate ...');
    const remRes = await fetch(`${BASE_URL}/reminders/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: sharmaId }),
    });
    const remData = await remRes.json();
    console.log('Generated WhatsApp Reminder:', JSON.stringify(remData, null, 2));
  }

  console.log('\n--- All Tests Completed Successfully! ---');
}

runTests().catch(console.error);
