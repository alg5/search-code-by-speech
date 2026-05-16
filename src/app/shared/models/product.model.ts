
// export interface IProduct {
//   id: number;
//   scale_code: number;
//   product_name: string;

//   key_en: string;
//   key_ru: string;
//   key_he: string;
//   key_fr: string;
//   category_code: string;
//   processing_code: string;

//   category?: {
//     priority: number;
//   };

//   processing?: {
//     priority: number;
//   };

//   fuseScore?: number;
// }

export interface IProduct {
  id: number;
  scale_code: number;
  product_name: string;

  key_en: string;
  key_ru: string;
  key_he: string;
  key_fr: string;
  category_code: string;
  processing_code: string;

  category?: {
    priority?: number;  // optional to match IProductCategory
  };

  processing?: {
    priority?: number;  // optional to match IProductProcessing
  };

  fuseScore?: number;
}
export type NewProduct = Omit<IProduct, 'id'>; // Пример для автогенерируемого ID

export interface IProductCategory {
  id?: number; // при вставке можно опустить
  code: string;
  name_en: string;
  name_ru?: string | null;
  name_he?: string | null;
  name_fr?: string | null;
  priority?: number | null;
}
export interface IProductProcessing {
  id?: number; // при вставке можно опустить
  code: string;
  name_en: string;
  name_ru?: string | null;
  name_he?: string | null;
  name_fr?: string | null;
  priority?: number | null;
}