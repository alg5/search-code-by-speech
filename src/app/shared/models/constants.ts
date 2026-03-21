import { ILang, ITranslations } from "./translation.model";

export type LangCode = 'en' | 'ru' | 'he';

export const LANGS: ILang[] = [
  { code: 'en', label: 'English', iconClass: 'fi fi-gb' },
  { code: 'ru', label: 'Русский', iconClass: 'fi fi-ru' },
  { code: 'he', label: 'עברית', iconClass: 'fi fi-il' }
];

export const translations: ITranslations = {
  'search.placeholder': { en: 'Search', ru: 'Поиск', he: 'חיפוש' },
  'admin.title': { en: 'Admin Dashboard', ru: 'Панель администратора', he: 'לוח ניהול' },
  'button.save': { en: 'Save', ru: 'Сохранить', he: 'שמור' },
  'button.cancel': { en: 'Cancel', ru: 'Отмена', he: 'ביטול' },
  'message.loading': { en: 'Loading...', ru: 'Загрузка...', he: 'טוען...' },
  'search.title': { en: 'title...', ru: 'title...', he: 'title...' },
};