import { createHmac, timingSafeEqual } from "crypto";

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
  paymentId: string | null;
  amount: number;
  metadata: Record<string, string>;
}

export interface CheckoutSessionInfo {
  id: string;
  status: string;
  metadata: Record<string, string>;
  paid: PaidCheckout | null;
}

const authHeader = () => {
  const secret = process.env.PAYMONGO_SECRET_KEY;
  if (!secret) {
    console.error("PAYMONGO_SECRET_KEY is not set; cannot reach PayMongo");
    throw new PaymentError(500, "payment verification is not configured");
  }
  return `Basic ${Buffer.from(`${secret}:`).toString("base64")}`;
};

export const getCheckoutSession = async (
  sessionId: unknown,
): Promise<CheckoutSessionInfo> => {
  const authorization = authHeader();
  if (!isCheckoutSessionId(sessionId)) {
    throw new PaymentError(400, "invalid checkout session");
  }

  const response = await fetch(
    `${PAYMONGO_API}/checkout_sessions/${sessionId}`,
    {
      headers: { Authorization: authorization },
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
  const metadata = attributes.metadata ?? {};
  const paidPayment = (attributes.payments ?? []).find(
    (payment: any) => payment?.attributes?.status === "paid",
  );

  return {
    id: sessionId,
    status: String(attributes.status ?? ""),
    metadata,
    paid: paidPayment
      ? {
          refId: String(attributes.reference_number ?? ""),
          paymentId:
            typeof paidPayment.id === "string" ? paidPayment.id : null,
          amount: Number(paidPayment.attributes.amount) / 100,
          metadata,
        }
      : null,
  };
};

export const getPaidCheckout = async (
  sessionId: unknown,
): Promise<PaidCheckout | null> => (await getCheckoutSession(sessionId)).paid;

export const isCheckoutSessionId = (value: unknown): value is string =>
  typeof value === "string" && /^cs_[A-Za-z0-9]+$/.test(value);

export const verifyWebhookSignature = (
  rawBody: Buffer | undefined,
  header: unknown,
  secret: string,
) => {
  if (!rawBody || typeof header !== "string") return false;
  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );
  const timestamp = parts.t;
  if (!timestamp) return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");
  return [parts.te, parts.li].some((signature) => {
    if (!signature || signature.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  });
};

export type ProviderRefundStatus = "pending" | "succeeded" | "failed";

export interface ProviderRefund {
  id: string;
  status: ProviderRefundStatus;
  rawStatus: string;
  amount: number;
  paymentId: string | null;
}

const PAYMONGO_REFUNDS_API = "https://api.paymongo.com/refunds";

export const isRefundId = (value: unknown): value is string =>
  typeof value === "string" && /^ref_[A-Za-z0-9]+$/.test(value);

export const isPaymentId = (value: unknown): value is string =>
  typeof value === "string" && /^pay_[A-Za-z0-9]+$/.test(value);

const toProviderRefund = (data: any): ProviderRefund => {
  const attributes = data?.attributes ?? {};
  const rawStatus = String(attributes.status ?? "");
  const status: ProviderRefundStatus =
    rawStatus === "succeeded"
      ? "succeeded"
      : rawStatus === "failed"
        ? "failed"
        : "pending";
  return {
    id: String(data?.id ?? ""),
    status,
    rawStatus,
    amount: Number(attributes.amount ?? 0) / 100,
    paymentId:
      typeof attributes.payment_id === "string" ? attributes.payment_id : null,
  };
};

const paymongoErrorDetail = async (response: Response) => {
  try {
    const body = (await response.json()) as any;
    const first = body?.errors?.[0];
    return {
      code: typeof first?.code === "string" ? first.code : null,
      detail:
        typeof first?.detail === "string" ? first.detail : "PayMongo error",
    };
  } catch {
    return { code: null, detail: "PayMongo error" };
  }
};

export class ProviderRefundError extends PaymentError {
  constructor(
    status: number,
    message: string,
    public code: string | null,
    public definitive: boolean,
  ) {
    super(status, message);
  }
}

export const createRefund = async (params: {
  paymentId: string;
  amount: number;
  notes?: string;
  metadata?: Record<string, string>;
}): Promise<ProviderRefund> => {
  const authorization = authHeader();
  if (!isPaymentId(params.paymentId)) {
    throw new ProviderRefundError(400, "invalid payment reference", null, true);
  }
  const centavos = Math.round(params.amount * 100);
  if (!(centavos >= 100)) {
    throw new ProviderRefundError(
      400,
      "PayMongo refunds must be at least ₱1.00",
      null,
      true,
    );
  }

  let response: Response;
  try {
    response = await fetch(PAYMONGO_REFUNDS_API, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: centavos,
            payment_id: params.paymentId,
            reason: "requested_by_customer",
            ...(params.notes ? { notes: params.notes.slice(0, 255) } : {}),
            ...(params.metadata ? { metadata: params.metadata } : {}),
          },
        },
      }),
    });
  } catch (e) {
    console.error("PayMongo refund request failed:", e);
    throw new ProviderRefundError(
      502,
      "Could not reach PayMongo",
      null,
      false,
    );
  }

  if (!response.ok) {
    const { code, detail } = await paymongoErrorDetail(response);
    console.error("PayMongo refund rejected:", response.status, code, detail);
    throw new ProviderRefundError(
      response.status >= 500 ? 502 : 422,
      detail,
      code,
      response.status < 500,
    );
  }

  const { data } = (await response.json()) as { data: any };
  return toProviderRefund(data);
};

export const getRefund = async (refundId: string): Promise<ProviderRefund> => {
  const authorization = authHeader();
  if (!isRefundId(refundId)) {
    throw new PaymentError(400, "invalid refund reference");
  }
  const response = await fetch(`${PAYMONGO_REFUNDS_API}/${refundId}`, {
    headers: { Authorization: authorization },
  });
  if (response.status === 404) throw new PaymentError(404, "refund not found");
  if (!response.ok) {
    const { detail } = await paymongoErrorDetail(response);
    console.error("PayMongo refund lookup failed:", response.status, detail);
    throw new PaymentError(502, "could not verify refund");
  }
  const { data } = (await response.json()) as { data: any };
  return toProviderRefund(data);
};
