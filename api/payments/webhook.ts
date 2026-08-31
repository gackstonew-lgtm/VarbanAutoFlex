import { getPaymentProvider } from '../../src/lib/payments/factory';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const provider = getPaymentProvider();
    const isValid = provider.verifyWebhookSignature(req.body, req.headers);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Webhook Signature' });
    }

    console.log('[Webhook Authenticated & Processed]', req.body);
    return res.status(200).json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return res.status(500).json({ error: msg });
  }
}
