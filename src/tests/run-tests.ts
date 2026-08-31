import { getPaymentProvider } from '../lib/payments/factory.js';
import { VehicleService } from '../lib/supabase/client.js';
import { EmailService } from '../lib/email/resend.js';

async function runVerificationSuite() {
  console.log('====================================================');
  console.log('RUNNING YARDLY PLATFORM INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Payment Provider Factory & Test Mode Execution
  try {
    const testProvider = getPaymentProvider('test');
    const paymentRes = await testProvider.initiatePayment({
      vehicleId: 'v1000000-0000-0000-0000-000000000001',
      amount: 50000,
      phone: '0712345678',
      email: 'test@yardly.co.ke',
      fullName: 'Test Buyer'
    });
    assert(paymentRes.success === true && paymentRes.status === 'paid', 'Test Mode M-Pesa Payment Initiation');
  } catch (e) {
    assert(false, `Test Mode Payment Exception: ${e}`);
  }

  // TEST 2: Payment Provider Failure Simulation (phone ending in 0000)
  try {
    const testProvider = getPaymentProvider('test');
    const paymentRes = await testProvider.initiatePayment({
      vehicleId: 'v1000000-0000-0000-0000-000000000001',
      amount: 50000,
      phone: '0712340000',
      email: 'test@yardly.co.ke',
      fullName: 'Decline Buyer'
    });
    assert(paymentRes.success === false && paymentRes.status === 'failed', 'Payment Decline Handling (0000)');
  } catch (e) {
    assert(false, `Payment Failure Handling Exception: ${e}`);
  }

  // TEST 3: Vehicle Service Filtering Engine
  try {
    const toyotaSUVList = await VehicleService.filterVehicles({
      make: 'Toyota',
      bodyType: 'SUV'
    });
    assert(toyotaSUVList.length > 0 && toyotaSUVList.every(v => v.make === 'Toyota' && v.body_type === 'SUV'), 'Vehicle Filtering by Make & Body Type');
  } catch (e) {
    assert(false, `Vehicle Filter Exception: ${e}`);
  }

  // TEST 4: Price Sorting (Price High -> Low)
  try {
    const sortedList = await VehicleService.filterVehicles({
      sortBy: 'price_high'
    });
    assert(sortedList[0].price >= sortedList[sortedList.length - 1].price, 'Vehicle Sorting by Price High to Low');
  } catch (e) {
    assert(false, `Price Sort Exception: ${e}`);
  }

  // TEST 5: Email HTML Generation
  try {
    const html = EmailService.generateReservationEmailHtml('Jane Doe', '2019 Toyota Harrier', 50000, 'res-101');
    assert(html.includes('Jane Doe') && html.includes('Toyota Harrier') && html.includes('50,000'), 'Transactional Reservation Email HTML Generation');
  } catch (e) {
    assert(false, `Email HTML Generation Exception: ${e}`);
  }

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerificationSuite();
