import { ILang, ITranslations } from "./translation.model";
import { definePreset } from "@primeuix/themes";
import lara from '@primeuix/themes/lara';


export const MyBootstrapLikePreset = definePreset(lara, {
    semantic: {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6', // item color
            600: '#2563eb',
            700: '#16254F', // item hover color
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
        },
        secondary: {
            50: '#f5f5f5',
            100: '#e0e0e0',
            200: '#bdbdbd',
            300: '#9e9e9e',
            400: '#757575',
            500: '#16254F', // secondary button color
            600: '#424242',
            700: '#16254F', // secondary hover color
            800: '#212121',
            900: '#111111',
            950: '#0a0a0a'
        }
    }
});




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
  'header.user.dashboard': { en: 'User Dashboard', ru: 'Личный кабинет', he: 'איזור אישי' }, 
  'header.admin.dashboard': { en: 'Admin Dashboard', ru: 'Панель администратора', he: 'לוח ניהול' } ,

 
  'search.placeholder': { en: 'Search', ru: 'Поиск', he: 'חיפוש' },
  'search.title': { en: 'Search code of product', ru: 'Поиск кода продукта', he: 'חיפוש קוד המוצר' },
  'search.subtitle': { en: 'Turn on the microphone for voice search', ru: 'Включите микрофон для голосового поиска', he: 'הפעל את המיקרופון לחיפוש קולי' },
  'search.subtitle2': { en: 'Speak now...', ru: 'Говорите...', he: 'תדבר עכשיו...' },
  'search.noResults': { en: 'No results found', ru: 'Результаты не найдены', he: 'לא נמצאו תוצאות' },
  'search.error': { en: 'An error occurred while searching. Please try again.', ru: 'Произошла ошибка при поиске. Пожалуйста, попробуйте снова.', he: 'אירעה שגיאה במהלך החיפוש. אנא נסה שוב.' },
  'search.tooltip.microphone.on': { en: 'Turn on microphone', ru: 'Включить микрофон', he: 'הפל מיקרופון' },
  'search.tooltip.microphone.off': { en: 'Turn off microphone', ru: 'Выключить микрофон', he: 'כבה מיקרופון' },

  'button.save': { en: 'Save', ru: 'Сохранить', he: 'שמור' },
  'button.cancel': { en: 'Cancel', ru: 'Отмена', he: 'ביטול' },
  
  'message.loading': { en: 'Loading...', ru: 'Загрузка...', he: 'טוען...' },
  'message.error': { en: 'Error', ru: 'Ошибка', he: 'שגיאה' },
  'message.success': { en: 'Operation completed successfully.', ru: 'Операция успешно завершена.', he: 'הפעולה הושלמה בהצלחה.' },
  'message.fieldRequired': { en: 'This field is required.', ru: 'Это поле обязательно.', he: 'שדה זה נדרש.' },
  'message.yes': { en: 'Yes', ru: 'Да', he: 'כן' },
  'message.no': { en: 'No', ru: 'Нет', he: 'לא' },
  'message.unexpectedError': { en: 'An unexpected error occurred. Please try again.', ru: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.', he: 'אירעה שגיאה בלתי צפויה. אנא נסה שוב.' },
  'message.error.categories.deleteHasProducts': { en: 'Cannot delete category because it has associated products.', ru: 'Невозможно удалить категорию, потому что у нее есть связанные продукты.', he: 'לא ניתן למחוק קטגוריה כי יש לה מוצרים משויכים.' },
    'message.error.categories.duplicateCode': {
    ru: 'Категория "{{code}}" уже существует.',
    en: 'Category "{{code}}" already exists.',
    he: 'קטגוריה "{{code}}" כבר קיימת.'
    },
    'message.error.processing.duplicateCode': {
    ru: 'Способ обработки "{{code}}" уже существует.',
    en: 'Processing type "{{code}}" already exists.',
    he: 'סוג עיבוד "{{code}}" כבר קיים  .'
    },

    'message.error.processing.deleteHasProducts': { en: 'Cannot delete processing type because it has associated products.', ru: 'Невозможно удалить способ обработки, потому что у него есть связанные продукты.', he: 'לא ניתן למחוק סוג עיבוד כי יש לו מוצרים משויכים.' },
    'message.success.processing.created': { en: 'Processing type created successfully.', ru: 'Способ обработки успешно создан.', he: 'סוג העיבוד נוצר בהצלחה.' },
    'message.success.processing.deleted': { en: 'Processing type deleted successfully.', ru: 'Способ обработки успешно удален.', he: 'סוג העיבוד נמחק בהצלחה.' },
    'message.success.processing.updated': { en: 'Processing type updated successfully.', ru: 'Способ обработки успешно обновлен.', he: 'סוג העיבוד עודכן בהצלחה.' },


  'message.success.categories.created': { en: 'Category created successfully.', ru: 'Категория успешно создана.', he: 'הקטגוריה נוצרה בהצלחה.' },
  'message.success.categories.deleted': { en: 'Category deleted successfully.', ru: 'Категория успешно удалена.', he: 'הקטגוריה נמחקה בהצלחה.' },
  'message.success.categories.updated': { en: 'Category updated successfully.', ru: 'Категория успешно обновлена.', he: 'הקטגוריה עודכנה בהצלחה.' },


  'caption.name.en': { en: 'English Name (EN)', ru: 'Английское название (EN)', he:   ' (EN)שם (אנגלית)' },
  'caption.name.ru': { en: 'Russian Name (RU)', ru: 'Русское название (RU)', he:   ' (RU)שם (רוסית)' },
  'caption.name.he': { en: 'Hebrew Name (HE)', ru: 'Название на иврите (HE)', he:   ' (HE)שם (עברית)' },
  'caption.priority': { en: 'Priority', ru: 'Приоритет', he: 'עדיפות' },

  'column.id': { en: 'ID', ru: 'ID', he: 'ID' },
  'column.code': { en: 'Code', ru: 'Код', he: 'קוד' },
  'column.productCode': { en: 'Scale Code', ru: 'Код продукта', he: 'קוד סולם' },
  'column.productName': { en: 'Product Name', ru: 'Название продукта', he: 'שם המוצר' },
  'column.nameEn': { en: 'Name EN', ru: 'Название EN', he: 'שם אנגלית' },
  'column.nameRu': { en: 'Name RU', ru: 'Название RU', he: 'שם רוסית' },
  'column.nameHe': { en: 'Name HE', ru: 'Название HE', he: 'שם עברית' },
  'column.priority': { en: 'Priority', ru: 'Приоритет', he: 'עדיפות' },
  'column.actions': { en: 'Actions', ru: 'Действия', he: 'פעולות' },
  'column.categoryCode': { en: 'Category Code', ru: 'Код категории', he: 'קוד קטגוריה' },
  'column.processingCode': { en: 'Processing Code', ru: 'Код обработки', he: 'קוד עיבוד' },

  'admin.title': { en: 'Admin Dashboard', ru: 'Панель администратора', he: 'לוח ניהול' },
  'admin.products': { en: 'Products', ru: 'Продукты', he: 'מוצרים' },
  'admin.categories': { en: 'Categories', ru: 'Категории', he: 'קטגוריות' },
  'admin.processing': { en: 'Processing Types', ru: 'Способы обработки', he: 'סוגי עיבוד' },
  'admin.users': { en: 'Users', ru: 'Пользователи', he: 'משתמשים' },
  'admin.dashboard': { en: 'Dashboard', ru: 'Главная панель', he: 'לוח מחוצנים' },
  'admin.categories.notFound': { en: 'No categories found.', ru: 'Категории не найдены.', he: 'לא נמצאו קטגוריות.' },
  
  'admin.categories.total': { en: 'Total Categories', ru: 'Всего категорий ', he: 'סה"כ קטגוריות' },
  'admin.categories.add': { en: 'Add Category', ru: 'Добавить категорию', he: 'הוסף קטגוריה' },
  'admin.categories.edit': { en: 'Edit Category', ru: 'Редактировать категорию', he: 'ערוך קטגוריה' },
  'admin.categories.delete': { en: 'Delete Category', ru: 'Удалить категорию', he: 'מחק קטגוריה' },
  'admin.categories.confirmDelete': { en: 'Are you sure you want to delete this category?', ru: 'Вы уверены, что хотите удалить эту категорию?', he: 'האם אתה בטוח שברצונך למחוק קטגוריה זו?' },
  'admin.categories.without': { en: 'Without category', ru: 'Без категории', he: 'ללא קטגוריה' },
  'admin.categories.all': { en: 'All categories', ru: 'Все категории', he: 'כל הקטגוריות' },

  'admin.processing.total': { en: 'Total Processing Types', ru: 'Всего способов обработки', he: 'סה"כ סוגי עיבוד' },
  'admin.processing.add': { en: 'Add Processing Type', ru: 'Добавить способ обработки', he: 'הוסף סוג עיבוד' },
  'admin.processing.without': { en: 'Without processing type', ru: 'Без способа обработки', he: 'ללא סוג עיבוד' },
  'admin.processing.all': { en: 'All processing types', ru: 'Все способы обработки', he: 'כל סוגי העיבוד' },


  'admin.products.total': { en: 'Total Products', ru: 'Всего продуктов', he: 'סה"כ מוצרים' },
  'admin.products.add': { en: 'Add Product', ru: 'Добавить продукт', he: 'הוסף מוצר' },
  'admin.products.edit': { en: 'Edit Product', ru: 'Редактировать продукт', he: 'ערוך מוצר' },
  'admin.products.delete': { en: 'Delete Product', ru: 'Удалить продукт', he: 'מחק מוצר' },
  'admin.products.confirmDelete': { en: 'Are you sure you want to delete this product?', ru: 'Вы уверены, что хотите удалить этот продукт?', he: 'האם אתה בטוח שברצונך למחוק מוצר זה?' },


  'admin.processing.edit': { en: 'Edit Processing Type', ru: 'Редактировать способ обработки', he: 'ערוך סוג עיבוד' },
  'admin.processing.delete': { en: 'Delete Processing Type', ru: 'Удалить способ обработки', he: 'מחק סוג עיבוד' },

  'admin.processing.confirmDelete': { en: 'Are you sure you want to delete this processing type?', ru: 'Вы уверены, что хотите удалить этот тип обработки?', he: 'האם אתה בטוח שברצונך למחוק סוג עיבוד זה?' },
  'admin.processing.notFound': { en: 'No processing types found.', ru: 'Способы обработки не найдены.', he: 'לא נמצאו סוגי עיבוד.' },

 

  
  // --- переводы для AuthComponent ---
  'auth.signUp': { en: 'Sign Up', ru: 'Регистрация', he: 'הרשמה' },
  'auth.signIn': { en: 'Sign In', ru: 'Войти', he: 'התחברות' },
  'auth.signOut': { en: 'Log Out', ru: 'Выход', he: 'התנתק' },
  'auth.fullName': { en: 'Full Name', ru: 'Имя', he: 'שם מלא' },
  'auth.email': { en: 'Email', ru: 'Email', he: 'אימייל' },
  'auth.password': { en: 'Password', ru: 'Пароль', he: 'סיסמה' },
  'auth.fullNameRequired': { en: 'Full Name is required.', ru: 'Имя обязательно.', he: 'שם מלא נדרש.' },
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

  // --- переводы для Header ---
  
 
};
