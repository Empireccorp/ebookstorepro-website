import { Ebook, EbookListItem } from '../types/ebook';
import { buildApiUrl } from '../config/api';

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const ebookApi = {
  /**
   * Busca todos os ebooks ativos
   */
  async getAllEbooks(): Promise<EbookListItem[]> {
    const response = await fetch(buildApiUrl('ebooks'));
    if (!response.ok) {
      throw new Error('Failed to fetch ebooks');
    }
    const result: ApiResponse<EbookListItem[]> = await response.json();
    return result.data;
  },

  /**
   * Busca um ebook específico pelo slug
   */
  async getEbookBySlug(slug: string): Promise<Ebook> {
    const response = await fetch(buildApiUrl(`ebooks/${slug}`));
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Ebook not found');
      }
      throw new Error('Failed to fetch ebook');
    }
    const result: ApiResponse<Ebook> = await response.json();
    return result.data;
  },
};
