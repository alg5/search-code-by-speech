import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  OnInit,
  Input,
  Output,
  signal,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LanguageService } from '../../../../core/services/language.service';
import { SpeechRecognitionService } from '../../../../core/services/speech-recognition.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { IProduct, IRecentProduct } from '../../../../shared/models/product.model';
import { TooltipModule } from 'primeng/tooltip';
import { AdminSearchSettingsComponent } from '../admin-search-settings/admin-search-settings.component';

@Component({
  selector: 'spr-search-input',
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    ToastModule,
    TooltipModule,
    TranslatePipe,
    AdminSearchSettingsComponent
  ],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  providers: [TranslatePipe],
})
export class SearchInputComponent implements OnInit {
  private searchTextChanged$ = new Subject<string>();
  private readonly languageService = inject(LanguageService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly speechService = inject(SpeechRecognitionService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslatePipe);

  @Input() term = '';
  @Output() searchSubmit = new EventEmitter<string>();
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  @ViewChild('autoComplete', { read: ElementRef }) autoCompleteRef!: ElementRef;

  searchText = signal('');
  results = signal<IProduct[]>([]);
  settingsOpen = signal(false);
  isListening = signal(false);
  isLoading = signal(false);
  

  // micError and hasMicrophone are kept separate for future expansion:
  // - micError: microphone not found
  // - hasMicrophone: microphone hardware availability
  // TODO: add case for "browser does not support speech recognition"
  micError = signal(false);
  hasMicrophone = signal(false);

  isAdmin = this.supabaseService.isAdmin;
  lang = computed(() => this.languageService.langCode());

  selectedProduct = signal<IProduct | IRecentProduct | null>(null);

  searchTextValue = '';

  recentProducts = signal<IRecentProduct[]>([]);
  private readonly RECENT_KEY = 'recent_products';
  private readonly MAX_RECENT = 3;

  constructor() {
    effect(() => {
        const lang = this.lang();
        const isLoaded = this.languageService.isLangLoaded();
        
        if (isLoaded && lang) {
          this.loadRecentProducts();
        }
    });
  }

  ngOnInit(): void {
    this.speechService.init();
    // this.loadRecentProducts();

    // Проверяем наличие микрофона при загрузке компонента
    this.speechService.checkMicrophone().then((hasMic) => {
      this.micError.set(!hasMic);
      this.hasMicrophone.set(hasMic);
      
      if (!hasMic) {
        console.warn('⚠️ Microphone not available on this device');
      }
    });
    
    // На мобильном браузере запрашиваем разрешение на микрофон при загрузке
    if (/iPhone|iPad|Android|Mobile/.test(navigator.userAgent)) {
      console.log('📱 Mobile device detected, requesting microphone access...');
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(stream => {
          // Закрываем поток - нам просто нужно разрешение
          stream.getTracks().forEach(track => track.stop());
          console.log('✅ Microphone permission granted');
        })
        .catch(err => {
          console.warn('⚠️ Microphone permission denied:', err);
        });
    }

    // Debounce for search input
    this.searchTextChanged$
      .pipe(debounceTime(300))
      .subscribe((text) => {
        console.log('debounced search:', text);
        this.search({ query: text });
      });

    this.speechService.onResult.subscribe((text) => {
      this.searchText.set(text);
      this.searchTextValue = text;
      this.searchTextChanged$.next(text);
      setTimeout(() => {
        this.autoComplete?.show();
      }, 10);
    });

    this.speechService.onStatusChange.subscribe((status) => {
      this.isListening.set(status);
    });

    // Subscribe to speech errors and show them to user
    this.speechService.onError.subscribe((err) => {
      console.log(' Speech Service Error:', err);
      
      if (err && err.toLowerCase().includes('microphone')) {
        this.micError.set(true);
        this.messageService.add({
          severity: 'error',
          summary: 'Microphone Not Available',
          detail: 'Please grant microphone permission in browser settings',
          sticky: true,
        });
        return;
      }
      
      if (err === 'start_error') {
        this.messageService.add({
          severity: 'warn',
          summary: 'Voice Recognition Error',
          detail: 'Failed to start voice recognition. Please ensure microphone permission is granted and try again.',
          sticky: true,
        });
        return;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Voice Error',
        detail: err,
        sticky: true,
      });
    });
  }

  // Load recent products from localStorage
  private loadRecentProducts(): void {
    try {
      const recentKeyLang = `${this.RECENT_KEY}_${this.lang()}`;
      const saved = localStorage.getItem(recentKeyLang);
      if (!saved) return;

      const items = JSON.parse(saved) as IRecentProduct[];

      // Validate structure - must have both fields
      const valid = items.filter(
        (item): item is IRecentProduct =>
          typeof item.scale_code === 'number' &&
          typeof item.display_name === 'string'
      );

      this.recentProducts.set(valid);
    } catch (e) {
      console.warn('Failed to load recent products', e);
      this.recentProducts.set([]);
    }
  }

  // Save recent products to localStorage
  private saveRecentProducts(): void {
    try {
      const items = this.recentProducts().map((p) => ({
        scale_code: p.scale_code,
        display_name: p.display_name,
      }));
      const recentKeyLang = `${this.RECENT_KEY}_${this.lang()}`;
      localStorage.setItem(recentKeyLang, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save recent products', e);
    }
  }

  // Add product to recent list (keeps MAX_RECENT items)
  addToRecent(product: IRecentProduct): void {
    const current = this.recentProducts();
    const filtered = current.filter((p) => p.scale_code !== product.scale_code);
    const updated = [product, ...filtered].slice(0, this.MAX_RECENT);

    this.recentProducts.set(updated);
    this.saveRecentProducts();
  }

  // Select product from recent chips
  selectFromRecent(product: IRecentProduct): void {
    this.selectedProduct.set(product);
    this.searchText.set(product.display_name);
    this.searchTextValue = product.display_name;

    if (this.isListening()) {
      this.speechService.stop();
    }
  }

  // Search products via server
  async search(event: any) {
    const query = event?.query ?? '';
    const currentLang = this.lang();

    this.isLoading.set(true);
    try {
      const results = await this.supabaseService.getProductsBySearch(query, currentLang);
      this.results.set(results);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Select product from autocomplete dropdown
  selectCode(event: any) {
    const product = event?.value as IProduct;
    if (!product) return;

    this.searchText.set(this.displayName(product));
    this.searchTextValue = this.displayName(product);
    this.selectedProduct.set(product);

    // Save minimal data to recent
    this.addToRecent({
      scale_code: product.scale_code,
      display_name: this.displayName(product),
    });

    // Remove focus to close keyboard
    setTimeout(() => {
      (document.activeElement as HTMLElement)?.blur();
      window.scrollTo(0, 0);
    }, 100);

    // Stop microphone
    if (this.isListening()) {
      this.speechService.stop();
    }

    // Clear field after delay
    setTimeout(() => {
      this.searchText.set('');
      this.searchTextValue = '';
      this.results.set([]);
    }, 1500);
  }

  // Toggle voice search
  startVoiceSearch() {
    if (this.micError()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Microphone Not Available',
        detail: 'Please grant microphone permission in browser settings',
        sticky: true,
      });
      return;
    }
    this.speechService.toggle();
  }

  // Handle search text input changes
  onSearchTextChange(text: string) {
    this.searchTextValue = text;
    this.searchText.set(text);
    console.log('onSearchTextChange:', text);

    if (text.length >= 2) {
      this.searchTextChanged$.next(text);
    } else if (!text) {
      this.results.set([]);
    }
  }

  // Get field name based on current language
  get fieldName(): string {
    return `key_${this.lang()}`;
  }

  // Get display name for product (supports both IProduct and IRecentProduct)
  displayName(p: IProduct | IRecentProduct): string {
    if ('display_name' in p && p.display_name) {
      return p.display_name;
    }
    const key = `key_${this.lang()}` as keyof IProduct;
    return (p as IProduct)[key] as string;
  }

  // Get product details for admin tooltip
  getProductDetails(p: IProduct | IRecentProduct): string {
    if (!this.isAdmin()) return '';
    const product = p as IProduct;

    const base = product.base_priority ?? '';
    const score = product.final_score ?? '';

    const baseLabel = this.translate.transform('search.tooltip.basePriority');
    const scoreLabel = this.translate.transform('search.tooltip.fuzzyScore');

    const scoreFormatted = score !== '' ? Number(score).toFixed(2) : '';

    const details = [
      base !== '' ? `${baseLabel}: ${base}` : '',
      scoreFormatted !== '' ? `${scoreLabel}: ${scoreFormatted}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    return details;
  }

  // Submit search term
  submit() {
    this.searchSubmit.emit(this.term);
  }

  // Copy scale code to clipboard
  copyCode(code: number) {
    const formattedCode = code.toString().padStart(3, '0');
    navigator.clipboard.writeText(formattedCode).then(() => {
      console.log('Code copied:', formattedCode);
    });
  }

  // Toggle settings panel
  toggleSettings() {
    this.settingsOpen.update((v) => !v);
  }

  // Refresh page (clear cache and reload)
  refreshPage() {
    // Hard reload to bypass cache
    window.location.reload();
  }

  // Handle weights saved event from settings
  onWeightsSaved(): void {
    const currentQuery = this.searchTextValue;
    if (currentQuery && currentQuery.length >= 2) {
      this.search({ query: currentQuery });
    }
    this.settingsOpen.set(false);
  }
  clearSearch() {
    this.searchText.set('');
    this.searchTextValue = '';
    this.results.set([]);
    this.autoComplete?.hide();
  }
}