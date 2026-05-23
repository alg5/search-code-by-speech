

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
//   display_name?: string;

//   category?: {
//     priority?: number;  // optional to match IProductCategory
//   };

//   processing?: {
//     priority?: number;  // optional to match IProductProcessing
//   };

//   fuseScore?: number;
//   base_priority?: number; 
//   final_score?: number;
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
  display_name?: string;

  // Flat fields from server (for display)
  category_name?: string;
  category_priority?: number;
  processing_name?: string;
  processing_priority?: number;
  base_priority?: number;
  final_score?: number;
  matched_via?: string;

  // Nested objects (for admin editing)
  category?: {
    code?: string;
    name_ru?: string;
    name_en?: string;
    name_he?: string;
    name_fr?: string;
    priority?: number;
  };

  processing?: {
    code?: string;
    name_ru?: string;
    name_en?: string;
    name_he?: string;
    name_fr?: string;
    priority?: number;
  };

}
export interface IRecentProduct {
  scale_code: number;
  display_name: string;
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