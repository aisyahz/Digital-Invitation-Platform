import type {
  CreateRsvpInput,
  RsvpModel,
  UpdateRsvpInput
} from '../models';

export interface RsvpRepository {
  findById(id: string): Promise<RsvpModel | null>;
  findAll(invitationId?: string): Promise<RsvpModel[]>;
  findByInvitationId(invitationId: string): Promise<RsvpModel[]>;
  create(input: CreateRsvpInput): Promise<RsvpModel>;
  update(id: string, input: UpdateRsvpInput): Promise<RsvpModel>;
  delete(id: string): Promise<void>;
}
