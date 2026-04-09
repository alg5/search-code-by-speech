export interface IProduct {
  id: number;
  scale_code: number;
  product_name: string; // key_en
  key_ru: string;
  key_he: string;
  category_code: string;
  processing_code: string;
  fuseScore?: number;
}
export type NewProduct = Omit<IProduct, 'id'>; // Пример для автогенерируемого ID

export interface IProductCategory {
  id?: number; // при вставке можно опустить
  code: string;
  name_en: string;
  name_ru?: string | null;
  name_he?: string | null;
  priority?: number | null;
}
export interface IProductProcessing {
  id?: number; // при вставке можно опустить
  code: string;
  name_en: string;
  name_ru?: string | null;
  name_he?: string | null;
}