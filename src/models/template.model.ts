export type TemplateStatus = 'active' | 'archived';

export interface TemplateModel {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  folder: string;
  price: string;
  status: TemplateStatus;
  config?: Record<string, unknown>;
  createdAt: string;
  version: number;
  previewImage?: string;
  coverImage?: string;
  configFile?: string;
  animation?: string;
}

export type CreateTemplateInput = Omit<
  TemplateModel,
  'id' | 'createdAt'
>;

export type UpdateTemplateInput = Partial<
  Omit<TemplateModel, 'id' | 'createdAt'>
>;
