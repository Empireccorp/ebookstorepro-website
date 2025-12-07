import { buildApiUrl } from '../config/api';

interface CreateCheckoutSessionRequest {
  email: string;
  ebookSlug: string;
  affiliateCode?: string;
}

interface CreateCheckoutSessionResponse {
  status: string;
  data: {
    sessionId: string;
    url: string;
  };
  message?: string;
  error?: string;
}

export const checkoutApi = {
  /**
   * Cria uma sessão de checkout no Stripe
   */
  async createCheckoutSession(
    email: string,
    ebookSlug: string,
    affiliateCode?: string
  ): Promise<CreateCheckoutSessionResponse> {
    const response = await fetch(buildApiUrl('checkout/create-session'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        ebookSlug,
        affiliateCode,
      } as CreateCheckoutSessionRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    return response.json();
  },
};
