import { Component, computed, effect, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { LanguageService } from '../../../../core/services/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { ProductsStateService } from '../../../../core/services/products-state.service';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import Fuse from 'fuse.js';
import { IProduct } from '../../../../shared/models/product.model';

@Component({
  selector: 'spr-search-input',
  imports: [
    CommonModule, 
    FormsModule, 
    AutoCompleteModule,
    TranslatePipe
  ],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
})
export class SearchInputComponent {
  private readonly languageService = inject(LanguageService);
  private readonly supabaseService = inject(SupabaseService);
  private  readonly productsState = inject(ProductsStateService);

  @Input() term = '';
  @Output() searchSubmit = new EventEmitter<string>();

  searchText = signal('');
  results = signal<IProduct[]>([]);
  products = this.productsState.products; // прямо сигнал, без computed
  
  fuse!: Fuse<IProduct>;
  lang = computed(() => this.languageService.getLang().code);
  // выбранный объект
  selectedProduct: IProduct | null = null;

  constructor() {
    // effect(() => {
    // const data = this.products();
    //  console.log("SearchInputComponent:products" , data);

    // if (!data.length) return;

    //  this.initFuse();
    
    //  });
      effect(() => {
      const data = this.products();
      console.log("SearchInputComponent:products" , data);

      if (!data.length) return;
      this.initFuse();
      // this.fuse = new Fuse(data, {
      //   keys: [
      //     'product_name',
      //     'key_ru',
      //     'key_he',
      //     {
      //       name: 'scale_code',
      //       getFn: (obj) => String(obj.scale_code)
      //     }
      //   ],
      //   threshold: 0.45,
      //   ignoreLocation: true,
      //   minMatchCharLength: 2

      // });
    });

  }
 initFuse() {
  this.fuse = new Fuse(this.products(), {
    keys: [
      { name: 'product_name', weight: 0.4 },
      { name: 'key_ru', weight: 0.3 },
      { name: 'key_he', weight: 0.3 },
      {
        name: 'scale_code',
        weight: 0.5,
        getFn: (obj) => String(obj.scale_code)
      }
    ],
    threshold: 0.45,
    ignoreLocation: true,
    minMatchCharLength: 2
  });
}
normalize(text: string): string {
  return text
    ?.toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
scoreProduct(p: IProduct, query: string, words: string[]): number {
  const name = this.normalize(this.displayName(p));

  let score = 0;

  // 🔥 1. точное совпадение
  if (name === query) score += 100;

  // 🔥 2. начинается с запроса (ОЧЕНЬ важно для "яблоки")
  if (name.startsWith(query)) score += 50;

  // 🔥 3. содержит слово (каждое слово даёт баллы)
  for (const w of words) {
    if (name.includes(w)) score += 10;
  }

  // 🔥 4. бонус за короткое название (простые продукты вверх)
  score += Math.max(0, 20 - name.length / 5);

  return score;
}


// 🔍 умный поиск
// search(event: any) {
//   const query = (event?.query ?? '')
//     .toLowerCase()
//     .replace(/ё/g, 'е')
//     .trim();
//   if (!query) {
//     this.results.set([]);
//     return;
//   }

//   // если это код — ищем строго
//   if (/^\d+$/.test(query)) {
//     const exact = this.products().filter(p =>
//       p.scale_code?.toString().startsWith(query)
//     );
//     this.results.set(exact.slice(0, 5));
//     return;
//   }

//   const fuseResults = this.fuse.search(query);

//   this.results.set(
//     fuseResults.map(r => r.item).slice(0, 15)
//   );
// }
search(event: any) {
  // нормализуем запрос
  const query = (event?.query ?? '').toLowerCase().trim();
  if (!query) {
    this.results.set([]);
    return;
  }

  // если это код — ищем строго
  if (/^\d+$/.test(query)) {
    const exact = this.products().filter(p =>
      p.scale_code?.toString().startsWith(query)
    );
    this.results.set(exact.slice(0, 5));
    return;
  }

  // 🔍 Fuse поиск
  const fuseResults = this.fuse.search(query);

  // вытаскиваем реальные продукты из FuseResult
  const productsFound: IProduct[] = fuseResults.map(r => r.item);

  // 🔝 Boost: сначала natural + fruit_fresh, потом остальные
  const boosted: IProduct[] = [];
  const rest: IProduct[] = [];

  productsFound.forEach(p => {
    if (p.category_code === 'fruit_fresh' && p.processing_code === 'natural') {
      boosted.push(p);          // на первое место
    } else if (p.category_code === 'fruit_fresh') {
      boosted.push(p);          // на второе место
    } else {
      rest.push(p);             // остальные
    }
  });

  // объединяем
  const finalResults = [...boosted, ...rest];

  // сохраняем в сигнал для p-autoComplete
  this.results.set(finalResults.slice(0, 10)); // топ-10
}

// выбор продукта

  selectCode(event: any) {
    const product = event?.value;
    this.searchText.set(this.displayName(product)); // в инпуте строка
    this.selectedProduct = product;                  // объект для логики
    console.log('Выбран продукт:', product);
  }
// 🎤 голос
  startVoiceSearch() {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = this.lang();

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      this.searchText.set(text);
      this.search(text);
    };

    recognition.start();
  }

  // отображение названия
 
  get fieldName(): string {
    const lang = this.lang();
    return lang === 'en'
      ? 'product_name'
      : lang === 'ru'
      ? 'key_ru'
      : 'key_he';
  }

 displayName(p: IProduct) {
    switch (this.lang()) {
      case 'ru': return p.key_ru;
      case 'he': return p.key_he;
      default: return p.product_name;
    }
  }
  submit() {
    this.searchSubmit.emit(this.term);
  }
}
