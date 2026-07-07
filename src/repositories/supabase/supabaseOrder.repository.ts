import { isSupabaseConfigured, supabase } from '../../services/supabaseClient.js';
import type { OrderRepository } from '../order.repository';
import type {
  CreateOrderInput,
  OrderModel,
  UpdateOrderInput
} from '../../models';

const TABLE_NAME = 'orders';

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using order repositories.');
  }

  return supabase;
}

function toModel(row: any): OrderModel {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    editToken: row.edit_token,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone
    },
    templateId: row.template_id,
    packageId: row.package_id,
    planName: row.plan_name,
    paymentStatus: row.payment_status,
    totalAmount: row.total_amount,
    currency: row.currency,
    receiptUrl: row.receipt_url,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at
  };
}

function toInsert(input: CreateOrderInput) {
  return {
    invitation_id: input.invitationId,
    edit_token: input.editToken,
    customer_name: input.customer.name,
    customer_email: input.customer.email,
    customer_phone: input.customer.phone,
    template_id: input.templateId,
    package_id: input.packageId,
    plan_name: input.planName,
    payment_status: input.paymentStatus,
    total_amount: input.totalAmount,
    currency: input.currency,
    receipt_url: input.receiptUrl,
    status: input.status
  };
}

function toUpdate(input: UpdateOrderInput) {
  return {
    invitation_id: input.invitationId,
    edit_token: input.editToken,
    customer_name: input.customer?.name,
    customer_email: input.customer?.email,
    customer_phone: input.customer?.phone,
    template_id: input.templateId,
    package_id: input.packageId,
    plan_name: input.planName,
    payment_status: input.paymentStatus,
    total_amount: input.totalAmount,
    currency: input.currency,
    receipt_url: input.receiptUrl,
    status: input.status,
    published_at: input.publishedAt
  };
}

function compact(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

function throwSupabaseError(action: string, error: { message?: string }) {
  throw new Error(`Failed to ${action}: ${error.message || 'Unknown Supabase error'}`);
}

export const supabaseOrderRepository: OrderRepository = {
  async findById(id) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throwSupabaseError(`find order by id ${id}`, error);
    return data ? toModel(data) : null;
  },

  async findAll() {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throwSupabaseError('list orders', error);
    return (data || []).map(toModel);
  },

  async findByInvitationId(invitationId) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('invitation_id', invitationId)
      .maybeSingle();

    if (error) throwSupabaseError(`find order for invitation ${invitationId}`, error);
    return data ? toModel(data) : null;
  },

  async create(input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .insert(compact(toInsert(input)))
      .select('*')
      .single();

    if (error) throwSupabaseError('create order', error);
    return toModel(data);
  },

  async update(id, input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .update(compact(toUpdate(input)))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throwSupabaseError(`update order ${id}`, error);
    return toModel(data);
  },

  async delete(id) {
    const { error } = await getClient()
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throwSupabaseError(`delete order ${id}`, error);
  }
};
