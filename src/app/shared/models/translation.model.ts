import { LangCode, LANGS } from "./constants";


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

export interface ITranslations {
  [key: string]: TranslationValue;
}
