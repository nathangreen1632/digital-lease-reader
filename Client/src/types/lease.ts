export interface Lease {
  id: number;
  originalFileName: string;
  uploadedAt: string;
  filePath?: string;
  userId?: number;
  // Add any additional fields your backend includes
}
