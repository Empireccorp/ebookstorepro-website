export interface Ebook {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  shortDescription: string;
  longDescription?: string;
  priceDisplay: number;
  currency: string;
  stripePriceId?: string;
  coverUrl?: string;
  pdfUrl?: string;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EbookListItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  shortDescription: string;
  priceDisplay: number;
  currency: string;
  coverUrl?: string;
  createdAt: string;
}
