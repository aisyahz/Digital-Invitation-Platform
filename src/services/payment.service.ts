import { storageService } from './storage.service.js';
import { orderService } from './order.service.js';

export const paymentService = {
  /**
   * Processes a manual payment: Uploads receipt file, updates order status to pending_approval.
   */
  async submitManualPayment(orderId: string, receiptFile: File) {
    try {
      // 1. Upload receipt to Supabase Storage receipts bucket
      const publicUrl = await storageService.uploadReceipt(receiptFile);

      // 2. Update order record in database with receipt URL and pending status
      const updatedOrder = await orderService.updateOrderPayment(orderId, publicUrl);
      
      return {
        success: true,
        order: updatedOrder,
        receiptUrl: publicUrl
      };
    } catch (err) {
      console.error('Error in manual payment submission:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  },

  /**
   * Admin approves the payment and publishes the invitation
   */
  async approvePayment(orderId: string) {
    try {
      const order = await orderService.approveOrder(orderId);
      return { success: true, order };
    } catch (err) {
      console.error('Error approving payment:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Admin rejects the payment and asks the user to upload receipt again
   */
  async rejectPayment(orderId: string) {
    try {
      const order = await orderService.rejectOrder(orderId);
      return { success: true, order };
    } catch (err) {
      console.error('Error rejecting payment:', err);
      return { success: false, error: err };
    }
  }
};
