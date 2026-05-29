import { LangCode } from './constants';

export interface ILang {
  code: LangCode;
  label: string;
  iconClass?: string;
}

export interface TranslationValue {
  en: string;
  ru: string;
  he: string;
  fr?: string;
}

export type ITranslations = Record<string, TranslationValue>;
