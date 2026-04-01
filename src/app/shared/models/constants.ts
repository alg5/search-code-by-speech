import { ILang, ITranslations } from "./translation.model";

export type LangCode = 'en' | 'ru' | 'he';

export const LANGS: ILang[] = [
  { code: 'en', label: 'English', iconClass: 'fi fi-gb' },
  { code: 'ru', label: 'Русский', iconClass: 'fi fi-ru' },
  { code: 'he', label: 'עברית', iconClass: 'fi fi-il' }
];

export const Translations: ITranslations = {
  'header.greeting': { en: 'Hello', ru: 'Привет', he: 'שלום' },
  // 'header.visitTimeDescription': { en: 'Your visit time is', ru: 'Время вашего визита', he: 'זמן הביקור שלך הוא' },
  'header.guest': { en: 'Guest', ru: 'Гость', he: 'אורח' },
 
  'search.placeholder': { en: 'Search', ru: 'Поиск', he: 'חיפוש' },
  'search.title': { en: 'Search code of product', ru: 'Поиск кода продукта', he: 'חיפוש קוד המוצר' },
  'search.subtitle': { en: 'Turn on the microphone for voice search', ru: 'Включите микрофон для голосового поиска', he: 'הפעל את המיקרופון לחיפוש קולי' },
  'search.subtitle2': { en: 'Speak now...', ru: 'Говорите...', he: 'תדבר עכשיו...' },
  'search.noResults': { en: 'No results found', ru: 'Результаты не найдены', he: 'לא נמצאו תוצאות' },
  'search.error': { en: 'An error occurred while searching. Please try again.', ru: 'Произошла ошибка при поиске. Пожалуйста, попробуйте снова.', he: 'אירעה שגיאה במהלך החיפוש. אנא נסה שוב.' },
  'search.tooltip.microphone.on': { en: 'Turn on microphone', ru: 'Включить микрофон', he: 'הפל מיקרופון' },
  'search.tooltip.microphone.off': { en: 'Turn off microphone', ru: 'Выключить микрофон', he: 'כבה מיקרופון' },

  'admin.title': { en: 'Admin Dashboard', ru: 'Панель администратора', he: 'לוח ניהול' },
  'button.save': { en: 'Save', ru: 'Сохранить', he: 'שמור' },
  'button.cancel': { en: 'Cancel', ru: 'Отмена', he: 'ביטול' },
  'message.loading': { en: 'Loading...', ru: 'Загрузка...', he: 'טוען...' },
   'admin.products': { en: 'Products', ru: 'Продукты', he: 'מוצרים' },
  'admin.categories': { en: 'Categories', ru: 'Категории', he: 'קטגוריות' },
  'admin.processing': { en: 'Processing Types', ru: 'Типы обработки', he: 'סוגי עיבוד' },
  'admin.users': { en: 'Users', ru: 'Пользователи', he: 'משתמשים' },
  'admin.dashboard': { en: 'Dashboard', ru: 'Главная панель', he: 'לוח מחוצנים' },
 
  // --- переводы для AuthComponent ---
  'auth.signUp': { en: 'Sign Up', ru: 'Регистрация', he: 'הרשמה' },
  'auth.signIn': { en: 'Sign In', ru: 'Войти', he: 'התחברות' },
  'auth.signOut': { en: 'Log Out', ru: 'Выход', he: 'התנתק' },
  'auth.fullName': { en: 'Full Name', ru: 'Имя', he: 'שם מלא' },
  'auth.email': { en: 'Email', ru: 'Email', he: 'אימייל' },
  'auth.password': { en: 'Password', ru: 'Пароль', he: 'סיסמה' },
  'auth.fullNameRequired': { en: 'Full Name is required.', ru: 'שם מלא נדרש.', he: 'שם מלא נדרש.' },
  'auth.emailRequired': { en: 'Email is required.', ru: 'Email обязателен.', he: 'אימייל נדרש.' },
  'auth.emailInvalid': { en: 'Invalid email format.', ru: 'Неверный формат email.', he: 'פורמט אימייל לא חוקי.' },
  'auth.passwordRequired': { en: 'Password is required.', ru: 'Пароль обязателен.', he: 'סיסמה נדרשת.' },
  'auth.passwordMinLength': { en: 'Password must be at least {requiredLength} characters long.', ru: 'Пароль должен быть не менее {requiredLength} символов.', he: 'הסיסמה חייבת להיות באורך של לפחות {requiredLength} תווים.' },
  'auth.signUpButton': { en: 'Create Account', ru: 'Создать учетную запись', he: 'צור חשבון' },
  'auth.signInButton': { en: 'Log In', ru: 'Вход', he: 'התחבר' },
  'auth.alreadyHaveAccount': { en: 'Already have an account? Log In', ru: 'У вас есть учетная запись? Войти', he: 'כבר יש חשבון? התחבר' },
  'auth.noAccount': { en: "Don't have an account? Sign Up", ru: 'Нет учетной записи? Зарегистрироваться', he: 'אין חשבון? הרשם' },
  'auth.forgotPassword': { en: 'Forgot password?', ru: 'Забыли пароль?', he: 'שכחת סיסמה?' },
  'auth.formInvalid': { en: 'Please fill in all required fields correctly.', ru: 'Пожалуйста , заполните все обязательные поля корректно.', he: 'אנא מלא את כל השדות הנדרשים כראוי.' },
  'auth.signUpSuccess': { en: 'Account created successfully! Redirecting...', ru: 'Учётная запись создана успешно! Переадресация...', he: 'החשבון נוצר בהצלחה! מועבר...' },
  'auth.signUpCheckEmail': { en: 'Account created. Please check your email to confirm your account.', ru: 'Учетная запись создана. Пожалуйста, проверьте ваш email, чтобы активировать ваш аккаунт.', he: 'החשבון נוצר. אנא בדוק את האימייל שלך כדי לאשר את חשבונך.' },
  'auth.signInSuccess': { en: 'Logged in successfully! Redirecting...', ru: 'Регистрация в системе прошла успешно! Переадресация...', he: 'התחברת בהצלחה! מועבר...' },
  'auth.genericError': { en: 'An unexpected error occurred. Please try again.', ru: 'Извините, произошла неожиданная ошибка. Пожалуйста, попробуйте еще раз.', he: 'אירעה שגיאה בלתי צפויה. אנא נסה שוב.' },

  // --- переводы для PrimeNG ---
  'primeng.accept': { en: 'Yes', ru: 'Да', he: 'כן' },
  'primeng.reject': { en: 'No', ru: 'Нет', he: 'לא' },
  'primeng.choose': { en: 'Choose', ru: 'Выбрать', he: 'בחר' },
  'primeng.upload': { en: 'Upload', ru: 'Загрузить', he: 'העלה' },
  'primeng.cancel': { en: 'Cancel', ru: 'Отмена', he: 'ביטול' },
  // 

};
