import { computed, effect, Injectable, signal } from '@angular/core';
import { ILang, ITranslations, TranslationValue } from '../../shared/models/translation.model';
import { LANGS, Translations } from '../../shared/models/constants';

@Injectable({ providedIn: 'root' })
export class LanguageService {

  currentLang = signal<ILang>(LANGS[0]);

  private readonly STORAGE_KEY = 'spr_lang';
  private _translations: ITranslations = Translations;

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const lang = LANGS.find(l => l.code === saved);
      if (lang) {
        this.currentLang.set(lang);
      }
    }
  }

  setLang(lang: ILang) {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang.code);
  }

  getLang(): ILang {
    return this.currentLang();
  }

  getAllLangs(): ILang[] {
    return LANGS;
  }

  langCode = computed(() => this.currentLang().code);

  langEffect = effect(() => {
    console.log('Язык изменился на:', this.currentLang().label);
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

    // ✅ FIX: support {{var}} format
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