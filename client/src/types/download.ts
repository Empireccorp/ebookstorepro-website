export interface DownloadLink {
  downloadToken: string;
  downloadUrl: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  remainingDownloads: number;
}
