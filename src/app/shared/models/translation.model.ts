import { LangCode, LANGS } from "./constants";


export interface ILang {
  code: LangCode;       // код языка
  label: string;        // текстовое название
  iconClass?: string;    // for flag-icons
}
export interface TranslationValue {
  en: string;
  ru: string;
  he: string;
}

export interface ITranslations {
  [key: string]: TranslationValue;
}