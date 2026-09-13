import { NextResponse } from "next/server";

const PAYMONGO_API = "https://api.paymongo.com/v1/checkout_sessions";

function getAuthHeader() {
  const key = process.env.PAYMONGO_SECRET_KEY!;
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

const SUPPORTED_PAYMONGO_METHOD_TYPES = [
  "card",
  "gcash",
  "paymaya",
  "grab_pay",
  "billease",
  "dob",
  "dob_ubp",
  "qrph",
] as const;

const DEFAULT_PAYMENT_METHOD_TYPES = ["card", "gcash", "paymaya"];

function getPaymentMethodTypes(): string[] {
  const configured = process.env.PAYMONGO_PAYMENT_METHOD_TYPES;
  if (!configured) return DEFAULT_PAYMENT_METHOD_TYPES;

  const requested = configured
    .split(",")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);

  const valid = requested.filter((type) =>
    (SUPPORTED_PAYMONGO_METHOD_TYPES as readonly string[]).includes(type),
  );

  if (valid.length === 0) {
    console.warn(
      "PAYMONGO_PAYMENT_METHOD_TYPES had no recognized values, falling back to defaults",
    );
    return DEFAULT_PAYMENT_METHOD_TYPES;
  }

  return valid;
}

export async function POST(req: Request) {
  try {
    const { amount, sender, receiver, bookingId, referenceId } =
      await req.json();

    const body = JSON.stringify({
      data: {
        attributes: {
          line_items: [
            {
              currency: "PHP",
              amount,
              name: "Booking Payment",
              description: `Booking payment • Ref: ${referenceId}`,
              quantity: 1,
            },
          ],
          payment_method_types: getPaymentMethodTypes(),
          description: `Booking payment from ${sender} to ${receiver}`,
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL_LIVE}/receipts/clientPayment?sender=${sender}&receiver=${receiver}&bookingId=${bookingId}&amount=${amount / 100}&refId=${referenceId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL_LIVE}/pages/client/posts`,
          reference_number: referenceId,
        },
      },
    });

    const response = await fetch(PAYMONGO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo error:", data);
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Payment gateway error" },
        { status: response.status },
      );
    }

    return NextResponse.json({
      checkoutUrl: data.data.attributes.checkout_url,
    });
  } catch (error: any) {
    console.error("PayMongo error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
