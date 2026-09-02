import { NextResponse } from 'next/server';

const PAYMONGO_API = 'https://api.paymongo.com/v1/checkout_sessions';

function getAuthHeader() {
  const key = process.env.PAYMONGO_SECRET_KEY!;
  return `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
}

export async function POST(req: Request) {
  try {
    const { amount, sender, receiver, referenceId } = await req.json();

    const body = JSON.stringify({
      data: {
        attributes: {
          line_items: [
            {
              currency: 'PHP',
              amount,          // already in centavos from payMongo.ts
              name: 'Refund Payment',
              description: `Refund payment • Ref: ${referenceId}`,
              quantity: 1,
            },
          ],
          payment_method_types: ['gcash'],
          description: `Refund payment from ${sender} to ${receiver}`,
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL_LIVE}/receipts/refundsPayment?sender=${sender}&receiver=${receiver}&amount=${amount / 100}&refId=${referenceId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL_LIVE}/pages/artist/booking`,
          reference_number: referenceId,
        },
      },
    });

    const response = await fetch(PAYMONGO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayMongo error:', data);
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || 'Payment gateway error' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      checkoutUrl: data.data.attributes.checkout_url,
    });
  } catch (error: any) {
    console.error('PayMongo error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
