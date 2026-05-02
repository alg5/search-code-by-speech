// search-input.component.ts
import { Component, computed, effect, EventEmitter, inject, OnInit, Input, Output, signal, ViewChild, ElementRef } from '@angular/core';
import { LanguageService } from '../../../../core/services/language.service';
import { SpeechRecognitionService } from '../../../../core/services/speech-recognition.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { ProductsStateService } from '../../../../core/services/products-state.service';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import Fuse from 'fuse.js';
import { IProduct } from '../../../../shared/models/product.model';
import { environment } from '../../../../../environments/environment';

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
export class SearchInputComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly productsState = inject(ProductsStateService);
  private readonly speechService = inject(SpeechRecognitionService);

  @Input() term = '';
  @Output() searchSubmit = new EventEmitter<string>();
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  @ViewChild('autoComplete', { read: ElementRef }) autoCompleteRef!: ElementRef;

  searchText = signal('');
  results = signal<IProduct[]>([]);
  products = this.productsState.products;

  fuse!: Fuse<IProduct>;
  lang = computed(() => this.languageService.getLang().code);

  selectedProduct: IProduct | null = null;
  isListening = false;

  // ✅ НОВОЕ: переменная для видимости кнопки Mock
  isDev = environment.enableMockSpeech;
  searchTextValue = ''; // обычная переменная для ngModel
  isSearchActive = false; // для управления классами и стилями
  
  constructor() {
    effect(() => {
      const data = this.products();
      console.log("SearchInputComponent:products", data);

      if (!data.length) return;
      this.initFuse();
    });
  }

  ngOnInit(): void {
    console.log(' SearchInputComponent: ngOnInit');
    // инициализация реального голосового поиска
    this.speechService.init();


    console.log('[COMPONENT] speechService instance:', this.speechService);
    // ✅ Подписка на реальные результаты речи
    this.speechService.onResult.subscribe(text => {
      console.log('🎤 [VOICE] Распознано:', text);

      // вставляем в сигнал и обычное поле для ngModel
      this.searchText.set(text);
      this.searchTextValue = text;

      // вызываем твой умный поиск
      this.search({ query: text });

      // 🔥 принудительно открыть dropdown
      setTimeout(() => {
        this.autoComplete?.show();
      }, 10);
    });

    this.speechService.onStatusChange.subscribe(status => {
      this.isListening = status;
    });
  }

  // initFuse() {
  //   this.fuse = new Fuse(this.products(), {
  //     keys: [
  //       { name: 'product_name', weight: 0.4 },
  //       { name: 'key_ru', weight: 0.3 },
  //       { name: 'key_he', weight: 0.3 },
  //       {
  //         name: 'scale_code',
  //         weight: 0.5,
  //         getFn: (obj) => String(obj.scale_code)
  //       }
  //     ],
  //     threshold: 0.3,
  //     ignoreLocation: true,
  //     minMatchCharLength: 2
  //   });
  // }



    //  threshold: 0.45,

initFuse() {
  this.fuse = new Fuse(this.products(), {
    includeScore: true,
    keys: [
      { name: 'key_ru', weight: 1.0 }, // Увеличиваем вес главного ключа до максимума
      { name: 'product_name', weight: 0.5 },
      { name: 'key_he', weight: 0.5 }
    ],
    threshold: 0.2,       // БЫЛО 0.3. Сделали строже, чтобы отсечь лишние хвосты букв
    location: 0,          // Ищем с начала строки
    distance: 30,         // Чем дальше лишние буквы от начала, тем хуже score
    ignoreLocation: false, // ВАЖНО: теперь нам ВАЖНО, где находится совпадение
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
  hasExactWord(text: string, query: string): boolean {
    const normalizedText = this.normalize(text);
    const normalizedQuery = this.normalize(query);

    const words = normalizedText.split(/[\s()]+/);

    return words.some(word =>
      word === normalizedQuery ||            // точное
      word.startsWith(normalizedQuery) ||    // манг → манго
      this.isOneCharDiff(word, normalizedQuery) // манга ~ манго
    );
  }
  isOneCharDiff(a: string, b: string): boolean {
    if (Math.abs(a.length - b.length) > 1) return false;

    let diff = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] !== b[i]) diff++;
      if (diff > 1) return false;
    }

    return true;
  }

  scoreProduct(p: IProduct, query: string, words: string[]): number {
    const name = this.normalize(this.displayName(p));

    let score = 0;

    if (name === query) score += 100;
    if (name.startsWith(query)) score += 50;

    for (const w of words) {
      if (name.includes(w)) score += 10;
    }

    score += Math.max(0, 20 - name.length / 5);

    return score;
  }

 //original search method with new sorting logic
//   search(event: any) {
//   const query = (event?.query ?? '')?.toLowerCase().trim();

//   if (!query) {
//     this.results.set([]);
//     return;
//   }

//   // 🔢 поиск по числовому коду
//   if (/^\d+$/.test(query)) {
//     const exact = this.products().filter(p =>
//       p.scale_code?.toString().startsWith(query)
//     );
//     this.results.set(exact.slice(0, 5));
//     return;
//   }

//   // 🔍 поиск через Fuse.js
//   const fuseResults = this.fuse.search(query);

//   const productsFound: IProduct[] = fuseResults.map(r => ({
//     ...r.item,
//     fuseScore: r.score ?? 0
//   }));

//   // 🔥 НОВАЯ сортировка (без групп, через приоритеты)
//   productsFound.sort((a, b) => {

//     // 1. сначала релевантность (меньше = лучше)
//     const scoreDiff = (a.fuseScore ?? 0) - (b.fuseScore ?? 0);
//     if (scoreDiff !== 0) return scoreDiff;

//     // 2. потом категория
//     const aCat = a.category?.priority ?? 0;
//     const bCat = b.category?.priority ?? 0;
//     if (bCat !== aCat) return bCat - aCat;

//     // 3. потом обработка
//     const aProc = a.processing?.priority ?? 0;
//     const bProc = b.processing?.priority ?? 0;
//     if (bProc !== aProc) return bProc - aProc;

//     return 0;
//   });

//   // 🧹 удаляем временное поле fuseScore
//   const finalResultsClean = productsFound.map(({ fuseScore, ...rest }) => rest);

//   // 🎯 топ-20
//   this.results.set(finalResultsClean.slice(0, 20));

//   console.log('📊 search results for query:', query, finalResultsClean.slice(0, 20));
// }


// новый search метод с комбинированным весом jn gemini

// search(event: any) {
//   const query = (event?.query ?? '')?.toLowerCase().trim();

//   if (!query) {
//     this.results.set([]);
//     return;
//   }

//   // 🔢 1. Поиск по числовому коду (оставляем без изменений)
//   if (/^\d+$/.test(query)) {
//     const exact = this.products().filter(p =>
//       p.scale_code?.toString().startsWith(query)
//     );
//     this.results.set(exact.slice(0, 5));
//     return;
//   }

//   // 🔍 2. Поиск через Fuse.js
//   const fuseResults = this.fuse.search(query);

//   // 🛠 3. Расчет итогового веса (Комбинируем релевантность текста и приоритеты)
//   const productsWithWeights = fuseResults.map(r => {
//     const item = r.item;
//     const fuseScore = r.score ?? 0;

//     // Вычисляем базовый приоритет из твоей формулы
//     const catPriority = item.category?.priority ?? 0;
//     const procPriority = item.processing?.priority ?? 0;
//     const basePriority = (catPriority * 10) + procPriority;

//     /**
//      * confidence (уверенность): инвертируем fuseScore.
//      * Если score = 0 (идеал), confidence = 1.
//      * Если score = 0.3 (край нашего threshold), confidence = 0.7.
//      */
//     const confidence = 1 - fuseScore;

//     /**
//      * finalWeight: Основной показатель для сортировки.
//      * Приоритет категории теперь умножается на качество совпадения букв.
//      */
//     const finalWeight = basePriority * confidence;

//     return {
//       ...item,
//       finalWeight
//     };
//   });

//   // 🚀 4. Сортировка: от самого тяжелого веса к самому легкому
//   productsWithWeights.sort((a, b) => b.finalWeight - a.finalWeight);

//   // 🧹 5. Очистка временного поля и ограничение выборки
//   const finalResults = productsWithWeights
//     .map(({ finalWeight, ...rest }) => rest)
//     .slice(0, 20);

//   this.results.set(finalResults);

//   console.log(`📊 Результаты для "${query}":`, finalResults);
// }

search(event: any) {
  const query = (event?.query ?? '')?.toLowerCase().trim();

  if (!query) {
    this.results.set([]);
    return;
  }

  // 🔢 1. Поиск по числовому коду (Scale Code)
  if (/^\d+$/.test(query)) {
    const exact = this.products().filter(p =>
      p.scale_code?.toString().startsWith(query)
    );
    this.results.set(exact.slice(0, 5));
    return;
  }

  // 🔍 2. Поиск через Fuse.js
  const fuseResults = this.fuse.search(query);

  // 🛠 3. Расчет итогового веса с учетом лингвистики и приоритетов
  const productsWithWeights = fuseResults.map(r => {
    const item = r.item;
    const fuseScore = r.score ?? 0;

    const catPriority = item.category?.priority ?? 0;
    const procPriority = item.processing?.priority ?? 0;

    // Базовый приоритет (научная ценность из базы)
    const basePriority = (catPriority * 2) + (procPriority * 0.5);

    // Уверенность Fuse (возводим в куб для резкого разделения результатов)
    const confidence = Math.pow(1 - fuseScore, 3);

    /**
     * 📏 БОНУС ЗА СООТВЕТСТВИЕ ДЛИНЕ (Length Matching)
     * Берем первое слово из названия (до запятой), чтобы сравнивать "Манго" с "Манга",
     * а не "Манго, свежее, без косточки..." с "Манга".
     */
    const firstWord = (item.key_ru ?? '').split(',')[0].trim();
    const lengthDiff = Math.abs(firstWord.length - query.length);
    
    // Коэффициент длины: если длины равны — 1.0, если разница в 3 буквы — 0.25
    const lengthFactor = 1 / (1 + lengthDiff);

    // Итоговый вес: Приоритет * Точность букв * Соответствие длине
    const finalWeight = basePriority * confidence * lengthFactor;

    return {
      ...item,
      finalWeight
    };
  });

  // 🚀 4. Сортировка: от самого высокого веса к самому низкому
  productsWithWeights.sort((a, b) => b.finalWeight - a.finalWeight);

  // 🧹 5. Очистка и ограничение выборки (20 записей)
  const finalResultsClean = productsWithWeights
    .map(({ finalWeight, ...rest }) => rest)
    .slice(0, 20);

  this.results.set(finalResultsClean);

  console.log(`📊 Search for "${query}":`, finalResultsClean);
}



  selectCode(event: any) {
    const product = event?.value;
    this.searchText.set(this.displayName(product));
    this.searchTextValue = this.displayName(product); // для ngModel
    this.selectedProduct = product;
    console.log('✅ Выбран продукт:', product);
  }

  startVoiceSearch() {
    this.speechService.toggle();
  }

  startMockSpeech() {
    console.log('🚀 [MOCK] Старт!');

    if (!this.fuse) {
      console.error('❌ Fuse не готов!');
      return;
    }

    this.isListening = true;
    const products = ['яблоко', 'банан', 'молоко', 'курица', 'хлеб', 'помидор'];
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    setTimeout(() => {
      console.log('🎤 [MOCK] Распознано:', randomProduct);

      this.searchTextValue = randomProduct;
      this.searchText.set(randomProduct);

      const event = { query: randomProduct };
      this.search(event);

      setTimeout(() => {
        this.autoComplete?.show();
      }, 0);

      console.log('📊 results():', this.results().length);
      this.isListening = false;
    }, 1500);
  }

 onSearchTextChange(text: string) {
  this.searchTextValue = text;        // для ngModel
  this.searchText.set(text);          // для реактивности
  this.search({ query: text });       // твой умный поиск
  console.log('🔹 onSearchTextChange triggered, text=', text);
  console.log('🔹 onSearchTextChange, searchTextValue=', this.searchTextValue, 'results=', this.results().map(r => this.displayName(r)));
}

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