export type OrderStatus = 'draft' | 'pending_payment' | 'pending_approval' | 'published' | 'archived';
export type PaymentStatus = 'unpaid' | 'pending_approval' | 'paid';

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OrderModel {
  id: string;
  invitationId?: string;
  editToken?: string;
  customer: OrderCustomerInfo;
  templateId?: string;
  packageId?: string;
  planName?: string;
  paymentStatus: PaymentStatus;
  totalAmount?: number;
  currency?: string;
  receiptUrl?: string;
  status: OrderStatus;
  createdAt: string;
  publishedAt?: string;
}

export type CreateOrderInput = Omit<
  OrderModel,
  'id' | 'createdAt' | 'publishedAt'
>;

export type UpdateOrderInput = Partial<
  Omit<OrderModel, 'id' | 'createdAt'>
>;
