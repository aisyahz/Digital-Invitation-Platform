import type {
  CreateInvitationInput,
  InvitationModel,
  UpdateInvitationInput
} from '../models';

export interface InvitationRepository {
  findById(id: string): Promise<InvitationModel | null>;
  findBySlug(slug: string): Promise<InvitationModel | null>;
  findAll(): Promise<InvitationModel[]>;
  create(input: CreateInvitationInput): Promise<InvitationModel>;
  update(id: string, input: UpdateInvitationInput): Promise<InvitationModel>;
  delete(id: string): Promise<void>;
}
