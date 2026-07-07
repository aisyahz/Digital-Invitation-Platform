export type OrderStatus = 'draft' | 'pending_payment' | 'paid' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderCustomerInfo {
  name: string;
  email?: string;
  phone?: string;
}

export interface OrderModel {
  id: string;
  invitationId: string;
  customer: OrderCustomerInfo;
  packageId: string;
  planName: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export type CreateOrderInput = Omit<
  OrderModel,
  'id' | 'createdAt' | 'updatedAt' | 'paidAt'
>;

export type UpdateOrderInput = Partial<
  Omit<OrderModel, 'id' | 'invitationId' | 'createdAt' | 'updatedAt'>
>;
