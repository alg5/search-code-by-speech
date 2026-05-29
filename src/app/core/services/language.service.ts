import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ILang, ITranslations, TranslationValue } from '../../shared/models/translation.model';
import { Translations } from '../../shared/models/constants';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly http = inject(HttpClient);

  languages = signal<ILang[]>([]);
  currentLang = signal<ILang | null>(null);
  isLangLoaded = signal(false);

  availableLangCodes = computed(() => this.languages().map((l) => l.code));
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
        this.restoreLanguage(data);
        this.isLangLoaded.set(true);
      },
      error: () => {
        const fallback: ILang[] = [
          { code: 'en', label: 'English', iconClass: 'fi fi-gb' },
          { code: 'ru', label: 'Русский', iconClass: 'fi fi-ru' },
        ];
        this.languages.set(fallback);
        this.restoreLanguage(fallback);
        this.isLangLoaded.set(true);
      },
    });
  }

  private restoreLanguage(available: ILang[]): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const savedLang = saved ? available.find((l) => l.code === saved) : null;
    this.currentLang.set(savedLang ?? available[0] ?? null);
  }

  setLang(lang: ILang): void {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang.code);
  }

  getLang(): ILang | null {
    return this.currentLang();
  }

  getAllLangs(): ILang[] {
    return this.languages();
  }

  langCode = computed(() => this.currentLang()?.code ?? this.availableLangCodes()[0] ?? 'en');

  translate(
    key: string,
    fallback: string = '',
    variables?: Record<string, string | number>,
  ): string {
    const lang = this.langCode();
    const value: TranslationValue | undefined = this._translations[key];

    if (!value) {
      return fallback || key;
    }

    let translatedText = (value[lang] ?? fallback) || key;

    if (variables) {
      for (const varKey in variables) {
        if (Object.prototype.hasOwnProperty.call(variables, varKey)) {
          const regex = new RegExp(`{{\\s*${varKey}\\s*}}`, 'g');
          translatedText = translatedText.replace(regex, String(variables[varKey]));
        }
      }
    }

    return translatedText;
  }
}
