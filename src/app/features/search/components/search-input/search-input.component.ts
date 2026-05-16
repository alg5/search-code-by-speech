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
  lang = computed(() => this.languageService.langCode());

  selectedProduct: IProduct | null = null;
  isListening = false;

  isDev = environment.enableMockSpeech;
  searchTextValue = '';
  isSearchActive = false;
  
  // ✅ Недавние продукты (карточки)
  recentProducts = signal<IProduct[]>([]);
  private readonly RECENT_KEY = 'recent_products';
  private readonly MAX_RECENT = 3;

  constructor() {
    effect(() => {
      const data = this.products();
      const currentLang = this.lang();
      
      console.log(`[Fuse] Rebuilding for lang: ${currentLang}, products: ${data.length}`);
      
      if (!data.length) return;
      this.initFuse();
    });
  }

  ngOnInit(): void {
    this.speechService.init();
    this.loadRecentProducts();

    this.speechService.onResult.subscribe(text => {
      this.searchText.set(text);
      this.searchTextValue = text;
      this.search({ query: text });
      
      setTimeout(() => {
        this.autoComplete?.show();
      }, 10);
    });

    this.speechService.onStatusChange.subscribe(status => {
      this.isListening = status;
    });
  }

// ✅ Загрузка недавних продуктов из localStorage
private loadRecentProducts(): void {
  try {
    const saved = localStorage.getItem(this.RECENT_KEY);
    if (!saved) return;
    
    const codes = JSON.parse(saved) as number[];
    
    // Ждём загрузки продуктов из Supabase
    const tryLoad = () => {
      const products = this.products();
      if (!products.length) {
        setTimeout(tryLoad, 300); // пробуем снова через 300мс
        return;
      }
      
      const found = codes
        .map(code => products.find(p => p.scale_code === code))
        .filter((p): p is IProduct => !!p);
      
      this.recentProducts.set(found);
    };
    
    tryLoad();
  } catch (e) {
    console.warn('Failed to load recent products', e);
  }
}

  private saveRecentProducts(): void {
    try {
      const codes = this.recentProducts().map(p => p.scale_code);
      localStorage.setItem(this.RECENT_KEY, JSON.stringify(codes));
    } catch (e) {
      console.warn('Failed to save recent products', e);
    }
  }

  addToRecent(product: IProduct): void {
    const current = this.recentProducts();
    const filtered = current.filter(p => p.scale_code !== product.scale_code);
    const updated = [product, ...filtered].slice(0, this.MAX_RECENT);
    
    this.recentProducts.set(updated);
    this.saveRecentProducts();
  }

  selectFromRecent(product: IProduct): void {
    this.selectedProduct = product;
    this.searchText.set(this.displayName(product));
    this.searchTextValue = this.displayName(product);
    
    if (this.isListening) {
      this.speechService.stop();
    }
  }

  initFuse() {
    const currentLang = this.lang();
    const allLangs = this.languageService.availableLangCodes();
    
    const keys = allLangs.map(lang => ({
      name: `key_${lang}` as const,
      weight: lang === currentLang ? 1.0 : 0.5
    }));

    this.fuse = new Fuse(this.products(), {
      includeScore: true,
      keys,
      threshold: 0.2,
      location: 0,
      distance: 30,
      ignoreLocation: false,
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

  search(event: any) {
    const query = (event?.query ?? '')?.toLowerCase().trim();

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

    const productsWithWeights = fuseResults.map(r => {
      const item = r.item;
      const fuseScore = r.score ?? 0;
      const catPriority = item.category?.priority ?? 0;
      const procPriority = item.processing?.priority ?? 0;
      const basePriority = (catPriority * 2) + (procPriority * 0.5);
      const confidence = Math.pow(1 - fuseScore, 3);
      const firstWord = (item.key_ru ?? '').split(',')[0].trim();
      const lengthDiff = Math.abs(firstWord.length - query.length);
      const lengthFactor = 1 / (1 + lengthDiff);
      const finalWeight = basePriority * confidence * lengthFactor;

      return { ...item, finalWeight };
    });

    productsWithWeights.sort((a, b) => b.finalWeight - a.finalWeight);

    const finalResultsClean = productsWithWeights
      .map(({ finalWeight, ...rest }) => rest)
      .slice(0, 20);

    this.results.set(finalResultsClean);
  }

  // selectCode(event: any) {
  //   const product = event?.value;
  //   if (!product) return;
    
  //   this.searchText.set(this.displayName(product));
  //   this.searchTextValue = this.displayName(product);
  //   this.selectedProduct = product;
    
  //   this.addToRecent(product);
    
  //   if (this.isListening) {
  //     this.speechService.stop();
  //   }
    
  //   setTimeout(() => {
  //     this.searchText.set('');
  //     this.searchTextValue = '';
  //     this.results.set([]);
  //   }, 1500);
  // }
selectCode(event: any) {
  const product = event?.value;
  if (!product) return;
  
  this.searchText.set(this.displayName(product));
  this.searchTextValue = this.displayName(product);
  this.selectedProduct = product;
  this.addToRecent(product);
  
  // ✅ Убираем фокус со ВСЕГО — клавиатура точно закроется
  setTimeout(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0); // дополнительно — скроллим к результату
  }, 100);
  
  // Останавливаем микрофон
  if (this.isListening) {
    this.speechService.stop();
  }
  
  // Очищаем поле через 1.5 сек
  setTimeout(() => {
    this.searchText.set('');
    this.searchTextValue = '';
    this.results.set([]);
  }, 1500);
}

  startVoiceSearch() {
    this.speechService.toggle();
  }

  startMockSpeech() {
    if (!this.fuse) return;

    this.isListening = true;
    const products = ['яблоко', 'банан', 'молоко', 'курица', 'хлеб', 'помидор'];
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    setTimeout(() => {
      this.searchTextValue = randomProduct;
      this.searchText.set(randomProduct);
      
      const event = { query: randomProduct };
      this.search(event);

      setTimeout(() => {
        this.autoComplete?.show();
      }, 0);

      this.isListening = false;
    }, 1500);
  }

  onSearchTextChange(text: string) {
    this.searchTextValue = text;
    this.searchText.set(text);
    
    if (text.length >= 2) {
      this.search({ query: text });
    } else if (!text) {
      this.results.set([]);
    }
  }

  get fieldName(): string {
    return `key_${this.lang()}`;
  }

  displayName(p: IProduct): string {
    const key = `key_${this.lang()}` as keyof IProduct;
    return (p[key] as string) || p.product_name;
  }

  submit() {
    this.searchSubmit.emit(this.term);
  }

  copyCode(code: number) {
    const formattedCode = code.toString().padStart(3, '0');
    navigator.clipboard.writeText(formattedCode).then(() => {
      console.log('Код скопирован:', formattedCode);
    });
  }
}