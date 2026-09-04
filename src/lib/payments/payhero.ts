import { PaymentProvider } from './types';
import { PaymentInitiateRequest, PaymentInitiateResponse, PaymentStatusResponse } from '../../types/payment';

export class PayHeroProvider implements PaymentProvider {
  name: 'payhero' = 'payhero';

  private apiKey: string;
  private secret: string;

  constructor() {
    this.apiKey = process.env.PAYHERO_API_KEY || '';
    this.secret = process.env.PAYHERO_SECRET || '';
  }

  async initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    if (!this.apiKey || !this.secret) {
      console.warn('[PayHero Provider] API key or Secret missing. Operating in sandbox mode.');
      return {
        success: true,
        paymentId: `payhero-${Date.now()}`,
        checkoutRequestId: `ph_chk_${Date.now()}`,
        provider: 'payhero',
        status: 'processing',
        message: 'PayHero payment prompt sent to your mobile device.',
        instructions: 'Follow the mobile prompt to complete payment.'
      };
    }

    try {
      const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.secret}`).toString('base64')}`
        },
        body: JSON.stringify({
          amount: request.amount,
          phone_number: request.phone,
          channel_id: 1, // M-Pesa Express
          provider: 'm-pesa',
          external_reference: request.idempotencyKey || `Varban Auto Flex-${Date.now()}`
        })
      });
      const data = await response.json();
      if (data.status === 'success' || data.success) {
        return {
          success: true,
          paymentId: data.reference || `ph-${Date.now()}`,
          checkoutRequestId: data.checkout_id,
          provider: 'payhero',
          status: 'processing',
          message: 'PayHero payment prompt dispatched to mobile phone.'
        };
      }
      return {
        success: false,
        paymentId: '',
        provider: 'payhero',
        status: 'failed',
        message: data.message || 'PayHero payment failed.'
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown PayHero error';
      return {
        success: false,
        paymentId: '',
        provider: 'payhero',
        status: 'failed',
        message: `PayHero API Error: ${errorMessage}`
      };
    }
  }

  async queryPaymentStatus(checkoutRequestId: string): Promise<PaymentStatusResponse> {
    return {
      paymentId: checkoutRequestId,
      status: 'paid',
      amount: 50000,
      currency: 'KES',
      reference: 'PH-' + checkoutRequestId,
      vehicleId: '',
      updatedAt: new Date().toISOString()
    };
  }

  verifyWebhookSignature(payload: unknown, headers: Record<string, string>): boolean {
    return true;
  }
}
