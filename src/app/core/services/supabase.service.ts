
// src/app/supabase.service.ts

import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { AuthSession, createClient, SupabaseClient, User, Subscription } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { IProduct, IProductCategory, IProductProcessing, NewProduct } from '../../shared/models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthState {
  event: string; // ИСПРАВЛЕНО: event теперь string
  session: AuthSession | null;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService implements OnDestroy{
  public supabase: SupabaseClient; 
   private _supabaseAuthSubscription: Subscription; // rRenamed to avoid confusion with RxJS Subscription

  private _authState = new BehaviorSubject<AuthState | null>(null);
  public authStateChanges$: Observable<AuthState | null> = this._authState.asObservable();  

  // profile = signal<any | null>(null);
  isProfileLoading = signal(false);
  public isAdmin = signal(false);
  public isConsultant = signal(false);
  public isLoginComplete = signal(false);
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

  //subscribe to auth changes
  const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
    (event: string, session: AuthSession | null) => {
      console.log('Supabase Auth state changed:', event, session);

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

  ngOnDestroy(): void {
 if (this._supabaseAuthSubscription) {
      this._supabaseAuthSubscription.unsubscribe();
    }
     this._authState.complete();
  }

  // ---  CRUD for products --- 


  /**
   * Get products page with pagination
   * @param limit Number of rows per page
   * @param offset Offset (offset = (page-1)*limit)
   */
  async getProductsPage(limit: number, offset: number = 0): Promise<IProduct[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`*, category:product_categories(priority), processing:product_processing(priority)`)
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) {
      console.error('Error fetching products page:', error);
      return [];
    }
    return data ?? [];
  }

  /**
 * Get admin products page with partial match search, filters and pagination
 * Uses SQL function search_products_admin with LIKE matching
 * @param query Partial search query for scale_code, product_name, keys, categories
 * @param pageNum Page number (0-based)
 * @param pageSize Items per page
 * @param categoryFilter Optional category code filter
 * @param processingFilter Optional processing code filter
 */
async getAdminProductsPage(
  query: string = '',
  pageNum: number = 0,
  pageSize: number = 15,
  categoryFilter: string | null = null,
  processingFilter: string | null = null
): Promise<{ products: IProduct[]; totalCount: number }> {
  const { data, error } = await this.supabase.rpc('search_products_admin', {
    search_query: query,
    page_num: pageNum,
    page_size: pageSize,
    category_filter: categoryFilter,
    processing_filter: processingFilter
  });

  if (error) {
    console.error('Error fetching admin products:', error);
    return { products: [], totalCount: 0 };
  }

  if (!data || data.length === 0) {
    return { products: [], totalCount: 0 };
  }

  const totalCount = data[0]?.total_count ?? 0;

  const products: IProduct[] = data.map((row: any) => ({
    id: row.id,
    scale_code: row.scale_code,
    product_name: row.product_name,
    key_ru: row.key_ru,
    key_en: row.key_en,
    key_he: row.key_he,
    key_fr: row.key_fr,
    category_code: row.category_code,
    category_name: row.category_name,
    category_priority: row.category_priority,
    processing_code: row.processing_code,
    processing_name: row.processing_name,
    processing_priority: row.processing_priority,
  }));

  return { products, totalCount };
}

  /**
   * Smart search products via Supabase RPC
   * @param txtSearch Search text (string)
   * @param lang Current interface language (e.g., 'ru', 'he', 'en')
   * @param maxResults Maximum number of results (default 20)
   */
  async getProductsBySearch(txtSearch: string, lang: string, maxResults: number = 20) {
    const query = txtSearch?.trim() || '';

    // if query is too short, return empty result to avoid unnecessary RPC calls
    if (query.length < 2) {
      return [];
    }

    const params = {
      search_query: query,
      display_language: lang,
      max_results: Number(maxResults)
    };
    // console.log('[Supabase] Smart search products, parameters:', params);

    const { data, error } = await this.supabase
      .rpc('search_products_fuzzy', params);

    if (error) {
      console.error('Error:', error);
      return [];
    }
    console.log(`[Supabase] Found products: ${JSON.stringify(data)}`);
    return data ?? [];
  }

  async addProduct(product: NewProduct): Promise<IProduct> {
  const { data, error } = await this.supabase
    .from('products')
    .insert([product]) // <-- Convert ojbect to array for insert
    .select()         // 
    .single();        // 
  if (error) {
    console.error('Supabase error inserting product:', error);
    throw error;
  }

  return data; 
  }

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

// this method deletes a product and returns the deleted product data (if needed for undo or confirmation)
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
   return data;
}
// --- Methods Auth ---

  /**
   * Registers a new user.
   * @param email - User's email.
   * @param password - User's password.
   * @param fullName - User's full name (for saving in profiles).
   * @returns Supabase user data, if successful.
   */
  async signUp(email: string, password: string, fullName: string = ''): Promise<{ user: User | null, session: AuthSession | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // user_metadata will be passed to the handle_new_user trigger for full_name
        data: { full_name: fullName } 
      }
    });

    if (error) {
      console.error('Supabase SignUp Error:', error);
      throw error;
    }
    // Supabase by default requires email confirmation.
    // If you have disabled it, data.session will be immediately available.
    // If confirmation is enabled, data.session will be null until confirmed.
    return { user: data.user, session: data.session };
  }

  /**
   * Executes user login.
   * @param email - User's email.
   * @param password - User's password.
   * @returns Supabase session data, if successful.
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
    // Step 1: get email by username via RPC
    const { data: email, error: rpcError } = await this.supabase.rpc('get_email_by_username', {
      username_input: username
    });

    if (rpcError || !email) {
      throw new Error('Invalid username or user not found');
    }

    // Step 2: sign in with email and password
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
   * Executes user logout.
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Supabase SignOut Error:', error);
      throw error;
    }
  }

  /**
   * Gets the currently authenticated user.
   * @returns The user object or null if not authenticated.
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
   * Gets the current user session.
   * @returns The session object or null.
   */
  async getSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error('Supabase GetSession Error:', error);
      throw error;
    }
    return session;
  }

 

  // --- Profiles ---

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
      .select('id, full_name, role')
      .order('id', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  //#region Admin Panel
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
async getProductCategories(): Promise<IProductCategory[]> {
  const { data, error } = await this.supabase
    .from('product_categories')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data;
}

async insertProductCategory(category: IProductCategory): Promise<IProductCategory> {
  const { data, error } = await this.supabase
    .from('product_categories')
    .insert([category])
    .select()
    .single();
  if (error) throw error;
  return data;
}

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

async deleteProductCategory(id: number): Promise<void> {
  const { error } = await this.supabase
    .from('product_categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

  // #endregion Category CRUD

 
  // #region Processing CRUD
async getProductProcessing(): Promise<IProductProcessing[]> {
  const { data, error } = await this.supabase
    .from('product_processing')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data;
}

async insertProductProcessing(processing: IProductProcessing): Promise<IProductProcessing> {
  const { data, error } = await this.supabase
    .from('product_processing')
    .insert([processing])
    .select()
    .single();
  if (error) throw error;
  return data;
}

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

async deleteProductProcessing(id: number): Promise<void> {
  const { error } = await this.supabase
    .from('product_processing')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

  // #endregion Processing CRUD
 
  //#endregion

  // #region config

  async getConfigValue(key: string): Promise<string> {
  const { data } = await this.supabase
    .from('config')
    .select('value')
    .eq('key', key)
    .single();
  return data?.value ?? '';
}

async updateConfig(key: string, value: string): Promise<void> {
  await this.supabase
    .from('config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);
}

  // #endregion config

}
