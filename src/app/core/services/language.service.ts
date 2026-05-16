import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ILang, ITranslations, TranslationValue } from '../../shared/models/translation.model';
import { Translations } from '../../shared/models/constants';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly http = inject(HttpClient);

  // ✅ Загруженные языки из assets/languages.json (замена хардкода LANGS)
  languages = signal<ILang[]>([]);
  
  currentLang = signal<ILang | null>(null);
  
  // ✅ Доступные коды языков для Fuse и других компонентов
  availableLangCodes = computed(() => this.languages().map(l => l.code));

  // ✅ Добавляем Observable для совместимости
  langChanges$ = toObservable(this.currentLang);

  private readonly STORAGE_KEY = 'spr_lang';
  private _translations: ITranslations = Translations;

  constructor() {
    this.loadLanguages();
  }

  private loadLanguages(): void {
    this.http.get<ILang[]>('assets/config/languages.json').subscribe({
      next: (data) => {
        this.languages.set(data);
        
        // Восстанавливаем сохранённый язык или ставим первый из JSON
        const saved = localStorage.getItem(this.STORAGE_KEY);
        const savedLang = saved ? data.find(l => l.code === saved) : null;
        
        this.currentLang.set(savedLang ?? data[0] ?? null);
      },
      error: (err) => {
        console.error('Failed to load languages:', err);
        // Fallback — минимальный набор если JSON не загрузился
        const fallback: ILang[] = [
          { code: 'en', label: 'English', iconClass: 'fi fi-gb' },
          { code: 'ru', label: 'Русский', iconClass: 'fi fi-ru' }
        ];
        this.languages.set(fallback);
        
        const saved = localStorage.getItem(this.STORAGE_KEY);
        const savedLang = saved ? fallback.find(l => l.code === saved) : null;
        this.currentLang.set(savedLang ?? fallback[0]);
      }
    });
  }

  setLang(lang: ILang) {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang.code);
  }

  getLang(): ILang | null {
    return this.currentLang();
  }

  // ✅ Замена getAllLangs() — теперь из JSON
  getAllLangs(): ILang[] {
    return this.languages();
  }

  langCode = computed(() => this.currentLang()?.code ?? 'ru');

  langEffect = effect(() => {
    const lang = this.currentLang();
    if (lang) {
      console.log('Язык изменился на:', lang.label);
    }
  });

  /**
   * Translation with {{variables}} support
   */
  translate(
    key: string,
    fallback: string = '',
    variables?: Record<string, string | number>
  ): string {
    const lang = this.langCode();
    const value: TranslationValue | undefined = Translations[key];

    if (!value) {
      return fallback || key;
    }

    let translatedText = (value[lang] ?? fallback) || key;

    if (variables) {
      for (const varKey in variables) {
        if (Object.prototype.hasOwnProperty.call(variables, varKey)) {
          const regex = new RegExp(`{{\\s*${varKey}\\s*}}`, 'g');
          translatedText = translatedText.replace(
            regex,
            String(variables[varKey])
          );
        }
      }
    }

    return translatedText;
  }
}