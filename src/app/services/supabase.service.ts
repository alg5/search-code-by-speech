// src/app/supabase.service.ts

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
// import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Создаем клиент Supabase при инициализации сервиса
    this.supabase = createClient(
      environment.supabaseUrl, 
      environment.supabaseKey
    );
  }

  // Метод для получения всех продуктов
   async getAllProducts() {
    // Делаем запрос к таблице 'products' и выбираем все колонки ('*')
    const { data, error } = await this.supabase
      .from('products')
      .select('*');

    // Если есть ошибка, выводим ее в консоль
    if (error) {
      console.error('Ошибка при получении данных:', error);
      return null;
    }

    // Если все хорошо, возвращаем данные
    return data;
  }
}
