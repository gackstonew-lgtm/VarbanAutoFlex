import { PaymentProvider } from './types';
import { PaymentInitiateRequest, PaymentInitiateResponse, PaymentStatusResponse } from '../../types/payment';

export class TestPaymentProvider implements PaymentProvider {
  name: 'test' = 'test';

  async initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    // Instant test mode response supporting fast automated testing and sandbox demonstration
    const isSuccess = !request.phone.endsWith('0000'); // End with 0000 to test failure state
    const paymentId = `pay-test-${Date.now()}`;
    const checkoutRequestId = `chk_test_${Date.now()}`;

    if (!isSuccess) {
      return {
        success: false,
        paymentId: '',
        provider: 'test',
        status: 'failed',
        message: 'Test mode simulated payment decline (number ends with 0000).'
      };
    }

    return {
      success: true,
      paymentId,
      checkoutRequestId,
      provider: 'test',
      status: 'paid',
      message: 'Test Mode Deposit Processed Successfully! Reservation is confirmed.',
      instructions: 'Deposit processed in test environment. No real funds charged.'
    };
  }

  async queryPaymentStatus(checkoutRequestId: string): Promise<PaymentStatusResponse> {
    return {
      paymentId: checkoutRequestId,
      status: 'paid',
      amount: 50000,
      currency: 'KES',
      reference: 'TEST-REC-' + checkoutRequestId.slice(-6),
      vehicleId: '',
      updatedAt: new Date().toISOString()
    };
  }

  verifyWebhookSignature(payload: unknown, headers: Record<string, string>): boolean {
    return true;
  }
}
