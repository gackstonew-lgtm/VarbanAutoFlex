import { PaymentProvider } from './types';
import { MpesaProvider } from './mpesa';
import { PayHeroProvider } from './payhero';
import { TestPaymentProvider } from './test-provider';
import { PaymentProviderType } from '../../types/payment';

export function getPaymentProvider(forcedProvider?: PaymentProviderType): PaymentProvider {
  const providerName = (forcedProvider || process.env.PAYMENT_PROVIDER || 'test').toLowerCase();

  switch (providerName) {
    case 'mpesa':
      return new MpesaProvider();
    case 'payhero':
      return new PayHeroProvider();
    case 'test':
    default:
      return new TestPaymentProvider();
  }
}
