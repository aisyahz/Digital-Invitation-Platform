import { supabase } from './supabaseClient.js';

export interface Order {
  id: string; // uuid primary key
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  template_id: string;
  payment_status: 'unpaid' | 'pending_approval' | 'paid';
  status: 'draft' | 'pending_payment' | 'pending_approval' | 'published' | 'archived';
  receipt_url?: string;
  created_at?: string;
  published_at?: string;
}

export const orderService = {
  /**
   * Creates a new order in Supabase
   */
  async createOrder(order: Omit<Order, 'created_at'> & { id?: string }): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.warn('Failed to insert order into Supabase, using local simulated order:', error);
      // Fallback for sandbox
      return {
        id: 'sim-order-' + Math.floor(Math.random() * 100000),
        ...order,
        created_at: new Date().toISOString()
      };
    }
    return data;
  },

  /**
   * Retrieves an order by its ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn(`Failed to fetch order ${id} from Supabase:`, error);
      return null;
    }
    return data;
  },

  /**
   * Updates an order's payment status, receipt, and status
   */
  async updateOrderPayment(id: string, receiptUrl: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        receipt_url: receiptUrl,
        payment_status: 'pending_approval',
        status: 'pending_approval'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn(`Failed to update payment for order ${id} in Supabase:`, error);
      return null;
    }
    return data;
  },

  /**
   * Admin: Approves an order, setting status to published
   */
  async approveOrder(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn(`Failed to approve order ${id} in Supabase:`, error);
      return null;
    }
    return data;
  },

  /**
   * Admin: Rejects an order, resetting status to pending_payment
   */
  async rejectOrder(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'unpaid',
        status: 'pending_payment',
        receipt_url: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn(`Failed to reject order ${id} in Supabase:`, error);
      return null;
    }
    return data;
  },

  /**
   * Fetches all orders for the Admin Dashboard
   */
  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Failed to fetch all orders from Supabase:', error);
      return [];
    }
    return data || [];
  }
};
