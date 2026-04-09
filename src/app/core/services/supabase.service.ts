// src/app/supabase.service.ts

import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { AuthSession, createClient, SupabaseClient, User, Subscription } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { IProduct, IProductCategory, IProductProcessing, NewProduct } from '../../shared/models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';

// <--- НОВОЕ: Определение локального типа для состояния аутентификации
// Тип `event` теперь `string`
export interface AuthState {
  event: string; // ИСПРАВЛЕНО: event теперь string
  session: AuthSession | null;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService implements OnDestroy{
  public supabase: SupabaseClient; 
   private _supabaseAuthSubscription: Subscription; // Переименовал, чтобы не путать с RxJS Subscription

  private _authState = new BehaviorSubject<AuthState | null>(null);
  public authStateChanges$: Observable<AuthState | null> = this._authState.asObservable();  

  // profile = signal<any | null>(null);
  isProfileLoading = signal(false);
  public isAdmin = signal(false);
  public profile = signal<{ role: string; full_name: string; preferences: any } | null>(null);
  hasRole = (roles: string[]) => computed(() => {
    const role = this.profile()?.role;
    return roles.includes(role);
  });

constructor() {
  this.supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  // Подписка на изменения auth
  const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
    (event: string, session: AuthSession | null) => {
      console.log('Supabase Auth state changed:', event, session);

      // Обновляем BehaviorSubject
      this._authState.next({ event, session });

      if (event === 'SIGNED_OUT') {
        this.profile.set(null);
        this.isAdmin.set(false);
      }

      if (event === 'SIGNED_IN' && session?.user) {
        // ✅ Загружаем профиль через отдельный вызов, не внутри lock
        this.loadProfileAfterSignIn(session.user.id);
      }
    }
  );

  this._supabaseAuthSubscription = subscription;
}

// Функция загрузки профиля **вне onAuthStateChange**
private async loadProfileAfterSignIn(userId: string) {
  this.isProfileLoading.set(true);
  try {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role, full_name, preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;

    this.profile.set(data);
    this.isAdmin.set(data.role === 'admin' || data.role === 'superadmin');
  } catch (e) {
    console.error('Failed to load profile', e);
    this.profile.set(null);
    this.isAdmin.set(false);
  } finally {
    this.isProfileLoading.set(false);
  }
}

  // --- МЕТОД ЖИЗНЕННОГО ЦИКЛА ДЛЯ ОЧИСТКИ ---
  // Этот метод будет вызван автоматически, когда сервис уничтожается,
  // и отменит подписку, предотвращая утечки памяти.
  ngOnDestroy(): void {
 if (this._supabaseAuthSubscription) {
      this._supabaseAuthSubscription.unsubscribe();
    }
    // Завершаем BehaviorSubject
    this._authState.complete();
  }
  // --- МЕТОДЫ CRUD ДЛЯ ПРОДУКТОВ 
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
  async addProduct(product: NewProduct): Promise<IProduct> {
  // `product` - это один объект. Мы оборачиваем его в массив [product].
  const { data, error } = await this.supabase
    .from('products')
    .insert([product]) // <-- Оборачиваем объект в массив!
    .select()         // <-- Говорим Supabase вернуть вставленную строку
    .single();        // <-- Так как мы вставили 1 объект, мы ожидаем 1 объект в ответе.
                      //     .single() извлечет его из массива и выдаст ошибку, если вернется не 1 запись.

  if (error) {
    console.error('Supabase error inserting product:', error);
    throw error;
  }

  return data; // `data` теперь будет иметь тип IProduct, а не IProduct[]
  }
// async updateProduct1(id: number, updates: Partial<IProduct>): Promise<IProduct> {
//     const { data, error } = await this.supabase
//       .from('products')
//       .update(updates)
//       .eq('id', id)
//       .select()
//       .single();

//     if (error) {
//       throw error;
//     }

//     return data;
// }

async updateProduct(product: IProduct): Promise<IProduct> {
  if (!product.id) throw new Error('Product ID is required');
  const { data, error } = await this.supabase
    .from('products')
    .update(product)
    .eq('id', product.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}



async deleteProduct(id: number): Promise<void> {
  const { error } = await this.supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Эта версия вернет удаленный объект или null, если ничего не найдено
async deleteProductAndGetData(id: number): Promise<IProduct | null> {
  const { data, error } = await this.supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select()  // <-- Возвращаем данные удаленной строки
    .single(); // <-- Ожидаем одну запись

  if (error) {
    console.error('Supabase error deleting product:', error);
    throw error;
  }
  
  // data будет содержать удаленный объект или null, если строка с таким id не была найдена
  return data;
}
// --- МЕТОДЫ АУТЕНТИФИКАЦИИ ---

  /**
   * Регистрирует нового пользователя.
   * @param email - Email пользователя.
   * @param password - Пароль пользователя.
   * @param fullName - Полное имя пользователя (для сохранения в profiles).
   * @returns Данные пользователя Supabase, если успешно.
   */
  async signUp(email: string, password: string, fullName: string = ''): Promise<{ user: User | null, session: AuthSession | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // user_metadata будет передано в триггер handle_new_user для full_name
        data: { full_name: fullName } 
      }
    });

    if (error) {
      console.error('Supabase SignUp Error:', error);
      throw error;
    }
    // Supabase по умолчанию требует подтверждение почты.
    // Если вы это отключили, то data.session будет сразу доступен.
    // Если подтверждение включено, data.session будет null до подтверждения.
    return { user: data.user, session: data.session };
  }

  /**
   * Выполняет вход пользователя.
   * @param email - Email пользователя.
   * @param password - Пароль пользователя.
   * @returns Данные сессии пользователя Supabase, если успешно.
   */
  async signIn(email: string, password: string): Promise<{ user: User | null, session: AuthSession | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Supabase SignIn Error:', error);
      throw error;
    }
    return { user: data.user, session: data.session };
  }
  async signInWithUsername(username: string, password: string): Promise<{ user: User | null, session: AuthSession | null }> {
  try {
    // Шаг 1: получить email по username через RPC
    const { data: email, error: rpcError } = await this.supabase.rpc('get_email_by_username', {
      username_input: username
    });

    if (rpcError || !email) {
      throw new Error('Invalid username or user not found');
    }

    // Шаг 2: войти с email и password
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    return { user: data.user, session: data.session };
  } catch (err: any) {
    throw new Error(err.message || 'Sign in failed');
  }
}


  /**
   * Выполняет выход пользователя.
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Supabase SignOut Error:', error);
      throw error;
    }
  }

  /**
   * Получает текущего авторизованного пользователя.
   * @returns Объект пользователя или null, если не авторизован.
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Supabase GetUser Error:', error);
      throw error;
    }
    return user;
  }

  /**
   * Получает текущую сессию пользователя.
   * @returns Объект сессии или null.
   */
  async getSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error('Supabase GetSession Error:', error);
      throw error;
    }
    return session;
  }

  // --- СЛУШАТЕЛЬ СОСТОЯНИЙ АУТЕНТИФИКАЦИИ ---
  // Это очень полезно для отслеживания изменений в состоянии аутентификации (вход/выход)
  // и реагирования на них в приложении.
  // public authChanges = this.supabase.auth.onAuthStateChange(
  //   (event, session) => {
  //     console.log('Auth state changed:', event, session);
  //     // Здесь вы можете добавить свою логику, например, обновить observable в сервисе
  //     // или отправить событие, которое слушают компоненты.
  //   }
  // );

  // --- ПРОФИЛИ ---

  async getProfile(): Promise<{ role: string; full_name: string; preferences: any } | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role, full_name, preferences')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  }

  async updateProfile(updates: { full_name?: string; preferences?: any }): Promise<{ role: string; full_name: string; preferences: any } | null> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    const body: any = {};
    if (updates.full_name !== undefined) body.full_name = updates.full_name;
    if (updates.preferences !== undefined) body.preferences = updates.preferences;
    const { data, error } = await this.supabase
      .from('profiles')
      .update(body)
      .eq('id', user.id)
      .select('role, full_name, preferences')
      .single();
    if (error) throw error;
    return data;
  }
  
async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ id: string; role: string; full_name: string } | null> {
  const { data, error } = await this.supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id, role, full_name')
    .single();
  if (error) throw error;
  return data;
}

//TODO Check if use
/**
 * Обновляет профиль пользователя: имя, email, пароль, preferences (опционально).
 * Возвращает объект профиля и пользователя (с новым email, если изменён).
 */
  // async updateProfileFull(opts: {
  //   full_name?: string;
  //   preferences?: any;
  //   email?: string;
  //   password?: string;
  //   }): Promise<{
  //     profile: { full_name: string; preferences: any; role: string } | null;
  //     user: { email: string } | null;
  //   }> {
  //     const user = await this.getCurrentUser();
  //     if (!user) throw new Error('Not authenticated');

  //     // Обновление email/password через auth API
  //     let updatedUserInfo: { email: string } | null = null;
  //     if (opts.email || opts.password) {
  //       const { data, error } = await this.supabase.auth.update({
  //         email: opts.email,
  //         password: opts.password
  //       });
  //       if (error) {
  //         throw error;
  //       }
  //       updatedUserInfo = { email: data.user?.email ?? user.email };
  //     }

  //     // Обновление таблицы profiles
  //     const profileUpdates: any = {};
  //     if (opts.full_name !== undefined) profileUpdates.full_name = opts.full_name;
  //     if (opts.preferences !== undefined) profileUpdates.preferences = opts.preferences;

  //     let updatedProfile: { full_name: string; preferences: any; role: string } | null = null;
  //     if (Object.keys(profileUpdates).length > 0) {
  //       const { data, error } = await this.supabase
  //         .from('profiles')
  //         .update(profileUpdates)
  //         .eq('id', user.id)
  //         .select('full_name, preferences, role')
  //         .single();
  //       if (error) {
  //         throw error;
  //       }
  //       updatedProfile = data;
  //     }

  //     return {
  //       profile: updatedProfile,
  //       user: updatedUserInfo
  //     };
  // }

  async changeUserRole(userId: string, newRole: 'user' | 'admin' | 'superadmin'): Promise<{ id: string; role: string; full_name: string } | null> {
    const current = await this.getProfile();
    if (!current || current.role !== 'superadmin') {
      throw new Error('Not authorized');
    }
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select('id, role, full_name')
      .single();
    if (error) throw error;
    return data;
  }

  async getAllProfiles(): Promise<Array<{ id: string; full_name: string; role: string }>> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, full_name, role');
    if (error) throw error;
    return data ?? [];
  }

  //#region Admin Panel --- МЕТОДЫ ДЛЯ РАБОТЫ С КАТЕГОРИЯМИ И ОБРАБОТКОЙ (ПО АНАЛОГИИ С ПРОДУКТАМИ) ---
  async getDashboardCounts() {
    const [products, categories, processing, users] = await Promise.all([
      this.supabase.from('products').select('id', { count: 'exact', head: true }),
      this.supabase.from('product_categories').select('id', { count: 'exact', head: true }),
      this.supabase.from('product_processing').select('id', { count: 'exact', head: true }),
      this.supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    return {
      products: products.count ?? 0,
      categories: categories.count ?? 0,
      processing: processing.count ?? 0,
      users: users.count ?? 0,
    };
  }

  // #region Category CRUD
// Получить все категории
async getProductCategories(): Promise<IProductCategory[]> {
  const { data, error } = await this.supabase
    .from('product_categories')
    .select('*')
    .order('priority', { ascending: true });
  if (error) throw error;
  return data;
}

// Вставка новой категории
async insertProductCategory(category: IProductCategory): Promise<IProductCategory> {
  const { data, error } = await this.supabase
    .from('product_categories')
    .insert([category])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Обновление категории
async updateProductCategory(category: IProductCategory): Promise<IProductCategory> {
  if (!category.id) throw new Error('Category ID is required');
  const { data, error } = await this.supabase
    .from('product_categories')
    .update(category)
    .eq('id', category.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Удаление категории
async deleteProductCategory(id: number): Promise<void> {
  const { error } = await this.supabase
    .from('product_categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

  // #endregion Category CRUD

  // *******************************

  // #region Processing CRUD
// Получить все cпособы обработки
async getProductProcessing(): Promise<IProductProcessing[]> {
  const { data, error } = await this.supabase
    .from('product_processing')
    .select('*')
    .order('code', { ascending: true });
  if (error) throw error;
  return data;
}

// Вставка нового способа обработки
async insertProductProcessing(processing: IProductProcessing): Promise<IProductProcessing> {
  const { data, error } = await this.supabase
    .from('product_processing')
    .insert([processing])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Обновление способа обработки
async updateProductProcessing(processing: IProductProcessing): Promise<IProductProcessing> {
  if (!processing.id) throw new Error('Processing ID is required');
  const { data, error } = await this.supabase
    .from('product_processing')
    .update(processing)
    .eq('id', processing.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Удаление способа обработки
async deleteProductProcessing(id: number): Promise<void> {
  const { error } = await this.supabase
    .from('product_processing')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

  // #endregion Processing CRUD
 
  //#endregion
}
