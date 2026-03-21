import { inject, Injectable, signal } from '@angular/core';
import { IProduct } from '../../shared/models/product.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsStateService {

   private readonly supabaseService = inject(SupabaseService);

  // сигнал для хранения списка продуктов
  products = signal<IProduct[]>([]);

  // метод для установки продуктов после загрузки
  setProducts(products: IProduct[]) {
    this.products.set(products);
  }

  // удобный getter
  getProducts() {
    return this.products();
  }

  updateProduct(updated: IProduct) {
  this.products.update(products => 
    products.map(p => p.id === updated.id ? updated : p)
  );
  // this.supabaseService.updateProduct(updated); // сохраняем в Supabase
}

addProduct(newProduct: IProduct) {
  this.products.update(products => [...products, newProduct]);
  // this.supabaseService.addProduct(newProduct);
}

deleteProduct(id: string) {
  // this.products.update(products => products.filter(p => p.id !== id));
  // this.supabaseService.deleteProduct(id);
}
}
