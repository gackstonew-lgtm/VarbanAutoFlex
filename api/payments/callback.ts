export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const callbackData = req.body;
    console.log('[Payment Callback Received]', JSON.stringify(callbackData));

    // Process Daraja / PayHero STK Push response
    const stkCallback = callbackData?.Body?.stkCallback;
    if (stkCallback) {
      const resultCode = stkCallback.ResultCode;
      const checkoutRequestId = stkCallback.CheckoutRequestID;

      if (resultCode === 0) {
        console.log(`[STK Push Success] CheckoutRequestID: ${checkoutRequestId}`);
      } else {
        console.warn(`[STK Push Failed] ${stkCallback.ResultDesc}`);
      }
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Callback processing error';
    return res.status(500).json({ error: msg });
  }
}
