// src/app/supabase.service.ts

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { IProduct } from '../../shared/models/product.model';
// import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl, 
      environment.supabaseKey
    );
  }

   async getAllProducts() {
     const { data, error } = await this.supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Ошибка при получении данных:', error);
      return null;
    }

    return data ?? [];
  }
//  async addProduct(product: IProduct): Promise<IProduct | null> {
//   const { data, error } = await this.supabase
//   // .from<IProduct>('products')
//   // .insert(product)
//   // .select() // здесь '*' по умолчанию
//   // .single();

//   // if (error) {
//   //   console.error('Ошибка при добавлении продукта:', error);
//   //   return null;
//   // }

//   return data;
// }


}
