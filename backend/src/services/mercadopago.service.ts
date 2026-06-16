import { MercadoPagoConfig, Preference } from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

let client: MercadoPagoConfig | null = null;

function getClient() {
  if (!client) {
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
    }
    client = new MercadoPagoConfig({ accessToken });
  }
  return client;
}

export async function createMercadoPagoCheckout(data: {
  title: string;
  description: string;
  amount: number;
  externalReference: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  commissionAmount: number;
}) {
  const preference = new Preference(getClient());

  const result = await preference.create({
    body: {
      items: [
        {
          id: data.externalReference,
          title: data.title,
          description: data.description,
          quantity: 1,
          currency_id: "BRL",
          unit_price: data.amount,
        },
      ],
      external_reference: data.externalReference,
      marketplace_fee: data.commissionAmount,
      back_urls: {
        success: data.successUrl,
        failure: data.failureUrl,
        pending: data.pendingUrl,
      },
      auto_return: "approved",
    },
  });

  return {
    checkoutUrl: result.init_point,
    preferenceId: result.id,
  };
}

export function verifyMercadoPagoWebhook(signature: string | undefined, body: unknown): boolean {
  if (!signature) return false;
  try {
    const request = body as Record<string, unknown>;
    if (request?.type === "payment" && request?.action === "payment.created") {
      return true;
    }
    if (request?.action === "payment.updated" || request?.action === "payment.approved") {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
