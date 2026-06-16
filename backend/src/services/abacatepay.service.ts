const apiKey = process.env.ABACATEPAY_API_KEY;

interface AbacateProduct {
  id: string;
}

interface AbacateCheckout {
  id: string;
  url: string;
}

let client: {
  products: {
    create: (body: { externalId: string; name: string; price: number; currency: string }) => Promise<AbacateProduct>;
  };
  checkouts: {
    create: (body: {
      items: { id: string; quantity: number }[];
      externalId?: string;
      returnUrl?: string;
      completionUrl?: string;
      metadata?: Record<string, object>;
    }) => Promise<AbacateCheckout>;
  };
} | null = null;

async function getClient() {
  if (!client) {
    if (!apiKey) {
      throw new Error("ABACATEPAY_API_KEY não configurada");
    }
    const mod = await import("@abacatepay/sdk");
    client = mod.AbacatePay({ secret: apiKey }) as any;
  }
  return client;
}

interface AbacateCheckoutData {
  externalReference: string;
  amount: number;
  title: string;
  description: string;
  returnUrl: string;
  completionUrl: string;
}

export async function createAbacatePayCheckout(data: AbacateCheckoutData) {
  const abacate = (await getClient())!;

  const grossAmountCents = Math.round(data.amount * 100);

  const product = await abacate.products.create({
    externalId: data.externalReference,
    name: data.title,
    price: grossAmountCents,
    currency: "BRL",
  });

  const result = await abacate.checkouts.create({
    items: [
      {
        id: product.id,
        quantity: 1,
      },
    ],
    externalId: data.externalReference,
    returnUrl: data.returnUrl,
    completionUrl: data.completionUrl,
    metadata: {
      description: data.description,
      title: data.title,
      amount: String(grossAmountCents),
    } as unknown as Record<string, object>,
  });

  return {
    checkoutUrl: result.url,
    checkoutId: result.id,
  };
}

export function verifyAbacatePayWebhook(
  body: { event?: string; data?: { checkout?: { id?: string } } }
): { valid: boolean; checkoutId?: string; event?: string } {
  try {
    if (!body || !body.event) {
      return { valid: false };
    }

    if (body.event !== "checkout.completed") {
      return { valid: false };
    }

    const checkoutId = body.data?.checkout?.id;
    if (!checkoutId) {
      return { valid: false };
    }

    return { valid: true, checkoutId, event: body.event };
  } catch {
    return { valid: false };
  }
}
