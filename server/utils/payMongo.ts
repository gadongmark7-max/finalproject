const PAYMONGO_API = "https://api.paymongo.com/v1";

export class PaymentError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface PaidCheckout {
  refId: string;
  amount: number;
  metadata: Record<string, string>;
}

export const getPaidCheckout = async (
  sessionId: unknown,
): Promise<PaidCheckout | null> => {
  const secret = process.env.PAYMONGO_SECRET_KEY;
  if (!secret) {
    console.error("PAYMONGO_SECRET_KEY is not set; cannot verify payments");
    throw new PaymentError(500, "payment verification is not configured");
  }
  if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9]+$/.test(sessionId)) {
    throw new PaymentError(400, "invalid checkout session");
  }

  const response = await fetch(
    `${PAYMONGO_API}/checkout_sessions/${sessionId}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}`,
      },
    },
  );
  if (response.status === 404)
    throw new PaymentError(404, "checkout session not found");
  if (!response.ok) {
    console.error(
      "PayMongo lookup failed:",
      response.status,
      await response.text(),
    );
    throw new PaymentError(502, "could not verify payment");
  }

  const { data } = (await response.json()) as { data: any };
  const attributes = data?.attributes ?? {};
  const paidPayment = (attributes.payments ?? []).find(
    (payment: any) => payment?.attributes?.status === "paid",
  );
  if (!paidPayment) return null;

  return {
    refId: String(attributes.reference_number ?? ""),
    amount: Number(paidPayment.attributes.amount) / 100,
    metadata: attributes.metadata ?? {},
  };
};
