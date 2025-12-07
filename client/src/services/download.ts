import { DownloadLink } from '../types/download';

import { buildApiUrl } from '../config/api';

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const downloadApi = {
  /**
   * Gera um link temporário de download para um pedido
   */
  async generateDownloadLink(orderId: string): Promise<DownloadLink> {
    const response = await fetch(`buildApiUrl('downloads/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate download link';
    }

    const result: ApiResponse<DownloadLink> = await response.json();
    return result.data;
  },

  /**
   * Retorna a URL completa de download
   */
  getDownloadUrl(token: string): string {
    return `buildApiUrl('downloads/${token}`;
  },
};
