import { getPaymentProvider } from '../../src/lib/payments/factory';
import { PaymentInitiateRequest } from '../../src/types/payment';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body: PaymentInitiateRequest = req.body;
    if (!body.vehicleId || !body.amount || !body.phone) {
      return res.status(400).json({ error: 'Missing required payment parameters: vehicleId, amount, phone' });
    }

    const provider = getPaymentProvider(body.provider);
    const result = await provider.initiatePayment(body);

    return res.status(200).json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: msg });
  }
}
