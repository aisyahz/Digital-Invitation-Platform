export type TemplateStatus = 'active' | 'inactive' | 'archived';

export interface TemplateModel {
  id: string;
  key: string;
  name: string;
  category: string;
  previewImage: string;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
  description?: string;
  price?: number;
}

export type CreateTemplateInput = Omit<TemplateModel, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTemplateInput = Partial<
  Omit<TemplateModel, 'id' | 'key' | 'createdAt' | 'updatedAt'>
>;
