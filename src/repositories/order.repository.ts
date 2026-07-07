import type {
  CreateOrderInput,
  OrderModel,
  UpdateOrderInput
} from '../models';

export interface OrderRepository {
  findById(id: string): Promise<OrderModel | null>;
  findAll(): Promise<OrderModel[]>;
  findByInvitationId(invitationId: string): Promise<OrderModel | null>;
  create(input: CreateOrderInput): Promise<OrderModel>;
  update(id: string, input: UpdateOrderInput): Promise<OrderModel>;
  delete(id: string): Promise<void>;
}
