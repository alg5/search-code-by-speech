export interface IProduct {
  id: number;
  scale_code: number;
  product_name: string; // key_en
  key_ru: string;
  key_he: string;
  category_code: string;
  processing_code: string;
}
export type NewProduct = Omit<IProduct, 'id'>; // Пример для автогенерируемого ID
