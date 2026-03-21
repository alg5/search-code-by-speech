
import { computed, effect, Injectable, signal } from '@angular/core';
import { ILang, TranslationValue } from '../../shared/models/translation.model';
import { LANGS, translations } from '../../shared/models/constants';
// import { ILang, LANGS } from '../../shared/constants';

@Injectable({ providedIn: 'root' })

export class LanguageService {
  // сигнал хранит текущий язык как ILang
  currentLang = signal<ILang>(LANGS[0]); // по умолчанию English

  private readonly STORAGE_KEY = 'spr_lang';

    constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const lang = LANGS.find(l => l.code === saved);
      if (lang) {
        this.currentLang.set(lang);
      }
    }
  }

  // переключить язык
  setLang(lang: ILang) {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang.code);
  }

  // получить текущий язык
  getLang(): ILang {
    return this.currentLang();
  }

  // вернуть все языки
  getAllLangs(): ILang[] {
    return LANGS;
  }

   // вычисляемый код текущего языка
  langCode = computed(() => this.currentLang().code);

  // эффект для отладки или синхронизации других сервисов
  langEffect = effect(() => {
    console.log('Язык изменился на:', this.currentLang().label);
  });

  /**
   * Перевод текста по ключу
   * @param key — ключ перевода, например 'search.placeholder'
   * @param fallback — текст по умолчанию, если ключ не найден
   */
  translate(key: string, fallback: string = ''): string {
    const lang = this.langCode();
    const value: TranslationValue | undefined = translations[key];
    if (!value) return fallback || key;
    return (value[lang] ?? fallback) || key;
  }

}