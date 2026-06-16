declare module "@abacatepay/sdk" {
  interface AbacateCheckoutItem {
    id: string;
    quantity: number;
  }

  interface AbacateCheckoutCreateParams {
    items: AbacateCheckoutItem[];
    customerId?: string;
    externalId?: string;
    returnUrl?: string;
    completionUrl?: string;
    methods?: string[];
    metadata?: Record<string, string>;
  }

  interface AbacateCheckoutData {
    id: string;
    url: string;
    amount: number;
    status: string;
    devMode: boolean;
    createdAt: string;
  }

  interface AbacateCheckoutResponse {
    success: boolean;
    error: string | null;
    data: AbacateCheckoutData;
  }

  interface AbacatePayInstance {
    checkouts: {
      create(params: AbacateCheckoutCreateParams): Promise<AbacateCheckoutResponse>;
    };
  }

  export function AbacatePay(options: { secret: string }): AbacatePayInstance;
}
