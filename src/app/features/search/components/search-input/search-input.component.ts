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
  imports: [    CommonModule, 
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

  constructor() {
    effect(() => {
      const data = this.products();
      console.log("SearchInputComponent:products", data);

      if (!data.length) return;
      this.initFuse();
    });
  }

  ngOnInit() {
    // инициализация реального голосового поиска
    this.speechService.init();
    
    this.speechService.onResult.subscribe(text => {
      console.log('🎤 Распознано:', text);
      this.searchText.set(text);
      this.search({ query: text });
    });

    this.speechService.onStatusChange.subscribe(status => {
      this.isListening = status;
    });
  }

  initFuse() {
    this.fuse = new Fuse(this.products(), {
      keys: [        { name: 'product_name', weight: 0.4 },
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

    if (name === query) score += 100;
    if (name.startsWith(query)) score += 50;

    for (const w of words) {
      if (name.includes(w)) score += 10;
    }

    score += Math.max(0, 20 - name.length / 5);

    return score;
  }

  search(event: any) {
    const query = (event?.query ?? '').toLowerCase().trim();
    if (!query) {
      this.results.set([]);
      return;
    }

    if (/^\d+$/.test(query)) {
      const exact = this.products().filter(p =>
        p.scale_code?.toString().startsWith(query)
      );
      this.results.set(exact.slice(0, 5));
      return;
    }

    const fuseResults = this.fuse.search(query);
    const productsFound: IProduct[] = fuseResults.map(r => r.item);

    const boosted: IProduct[] = [];
    const rest: IProduct[] = [];

    productsFound.forEach(p => {
      if (p.category_code === 'fruit_fresh' && p.processing_code === 'natural') {
        boosted.push(p);
      } else if (p.category_code === 'fruit_fresh') {
        boosted.push(p);
      } else {
        rest.push(p);
      }
    });

    const finalResults = [...boosted, ...rest];
    this.results.set(finalResults.slice(0, 10));
  }

  selectCode(event: any) {
    const product = event?.value;
    this.searchText.set(this.displayName(product));
    this.selectedProduct = product;
    console.log('Выбран продукт:', product);
  }

  // 🎤 Реальный голос
  startVoiceSearch() {
    this.speechService.toggle();
  }

  // ✅ НОВОЕ: Mock распознавание для DEV


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
    
    // ✅ КЛЮЧЕВОЙ МОМЕНТ: программно вызываем completeMethod!
    const event = { query: randomProduct };
    this.search(event); // ← вызовет поиск И покажет панель!
    
    console.log('📊 results():', this.results().length);
    this.isListening = false;
  }, 1500);
}







  onSearchTextChange(text: string) {
    this.searchTextValue = text;        // для ngModel
    this.searchText.set(text);          // для реактивности
    this.search({ query: text });       // твой поиск
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
