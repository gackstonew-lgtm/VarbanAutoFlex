import { PaymentInitiateRequest, PaymentInitiateResponse, PaymentStatusResponse, PaymentProviderType } from '../../types/payment';

export interface PaymentProvider {
  name: PaymentProviderType;
  initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  queryPaymentStatus(checkoutRequestId: string): Promise<PaymentStatusResponse>;
  verifyWebhookSignature(payload: unknown, headers: Record<string, string>): boolean;
}
