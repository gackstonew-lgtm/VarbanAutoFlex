export type PaymentProviderType = 'mpesa' | 'payhero' | 'card' | 'test';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentInitiateRequest {
  vehicleId: string;
  amount: number;
  phone: string; // E.164 or 07.../01... format
  email: string;
  fullName: string;
  provider?: PaymentProviderType;
  idempotencyKey?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  paymentId: string;
  checkoutRequestId?: string;
  provider: PaymentProviderType;
  status: PaymentStatus;
  message: string;
  instructions?: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  reference?: string;
  vehicleId: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  reservation_id?: string;
  vehicle_id: string;
  user_id?: string;
  amount: number;
  currency: string;
  provider: PaymentProviderType;
  checkout_request_id?: string;
  merchant_request_id?: string;
  mpesa_receipt_number?: string;
  phone_number: string;
  status: PaymentStatus;
  idempotency_key: string;
  raw_response?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
