import { EbookListItem } from './ebook';

export interface Order {
  id: string;
  email: string;
  ebookId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string;
  createdAt: string;
  updatedAt: string;
  ebook: EbookListItem;
}
