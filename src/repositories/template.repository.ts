import type {
  CreateTemplateInput,
  TemplateModel,
  UpdateTemplateInput
} from '../models';

export interface TemplateRepository {
  findById(id: string): Promise<TemplateModel | null>;
  findByKey(key: string): Promise<TemplateModel | null>;
  findAll(): Promise<TemplateModel[]>;
  listActive(): Promise<TemplateModel[]>;
  create(input: CreateTemplateInput): Promise<TemplateModel>;
  update(id: string, input: UpdateTemplateInput): Promise<TemplateModel>;
  delete(id: string): Promise<void>;
}
