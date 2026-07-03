import { supabase } from './supabaseClient.js';

export const storageService = {
  /**
   * Uploads a file to a specific Supabase storage bucket.
   * Returns the public URL of the uploaded file.
   */
  async uploadFile(bucket: 'templates' | 'gallery' | 'receipts' | 'music' | 'avatars', path: string, file: File | Blob): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (error) throw error;

      // Retrieve the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error(`Failed to upload file to bucket ${bucket}:`, err);
      // Fallback url for demo/sandbox if storage is unconfigured
      return URL.createObjectURL(file);
    }
  },

  /**
   * Helper specifically for uploading receipts with organized year/month/orderId folder structure
   */
  async uploadReceipt(file: File, orderId?: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'png';
    const resolvedOrderId = orderId || (crypto.randomUUID ? crypto.randomUUID() : `sim-order-${Math.floor(100000 + Math.random() * 900000)}`);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Path structure: receipts/2026/07/order-id/receipt.png
    const path = `receipts/${year}/${month}/${resolvedOrderId}/receipt.${fileExt}`;
    return this.uploadFile('receipts', path, file);
  }
};
