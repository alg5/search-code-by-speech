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
export const MyGreenPreset = definePreset(lara, {
    semantic: {
        primary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',  // основной зелёный
            600: '#16a34a',
            700: '#15803d',  // hover
            800: '#166534',
            900: '#14532d',
            950: '#052e16'
        },
        secondary: {
            50: '#f5f5f5',
            100: '#e0e0e0',
            200: '#bdbdbd',
            300: '#9e9e9e',
            400: '#757575',
            500: '#15803d',  // secondary button
            600: '#424242',
            700: '#14532d',  // secondary hover
            800: '#212121',
            900: '#111111',
            950: '#0a0a0a'
        },
        success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16'
        },
        info: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
        },
        warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03'
        },
        danger: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a'
        },
        surface: {
            0: '#ffffff',
            50: '#f8faf8',   // почти белый с зелёным оттенком
            100: '#f0fdf4',  // светло-зелёный
            200: '#dcfce7',
            300: '#bbf7d0',
            400: '#86efac',
            500: '#4ade80',
            600: '#22c55e',
            700: '#16a34a',
            800: '#15803d',
            900: '#166534',
            950: '#052e16'
        }
    },
    colorScheme: {
        light: {
            surface: {
                ground: '#f0fdf4',       // фон страницы
                section: '#ffffff',      // фон секций
                card: '#ffffff',         // фон карточек
                overlay: '#ffffff',      // фон модалок/дропдаунов
                border: '#bbf7d0',       // границы
                hover: '#dcfce7',        // hover фон
                text: '#166534',         // основной текст
                textSecondary: '#15803d', // вторичный текст
                textMuted: '#16a34a'    // приглушённый текст
            },
            primary: {
                color: '#22c55e',
                contrastColor: '#ffffff',
                hoverColor: '#16a34a',
                activeColor: '#15803d'
            },
            secondary: {
                color: '#15803d',
                contrastColor: '#ffffff',
                hoverColor: '#14532d',
                activeColor: '#166534'
            },
            content: {
                background: '#ffffff',
                borderRadius: '8px'
            }
        },
        dark: {
            surface: {
                ground: '#052e16',       // тёмный фон страницы
                section: '#14532d',      // фон секций
                card: '#166534',         // фон карточек
                overlay: '#166534',      // фон модалок
                border: '#15803d',       // границы
                hover: '#14532d',        // hover
                text: '#f0fdf4',         // текст
                textSecondary: '#dcfce7',
                textMuted: '#bbf7d0'
            },
            primary: {
                color: '#4ade80',
                contrastColor: '#052e16',
                hoverColor: '#86efac',
                activeColor: '#bbf7d0'
            },
            secondary: {
                color: '#22c55e',
                contrastColor: '#052e16',
                hoverColor: '#4ade80',
                activeColor: '#86efac'
            },
            content: {
                background: '#14532d',
                borderRadius: '8px'
            }
        }
    }
});



export type LangCode = 'en' | 'ru' | 'he' | 'fr';

export const LANGS: ILang[] = [
  { code: 'en', label: 'English', iconClass: 'fi fi-gb' },
  { code: 'ru', label: 'Русский', iconClass: 'fi fi-ru' },
  { code: 'he', label: 'עברית', iconClass: 'fi fi-il' },
  { code: 'fr', label: 'Français', iconClass: 'fi fi-fr ' }
];

export const Translations: ITranslations = {
  'header.greeting': { en: 'Hello', ru: 'Привет', he: 'שלום', fr: 'Bonjour' },
  // 'header.visitTimeDescription': { en: 'Your visit time is', ru: 'Время вашего визита', he: 'זמן הביקור שלך הוא' },
  'header.guest': { en: 'Guest', ru: 'Гость', he: 'אורח', fr: 'Invité' },
  'header.user.dashboard': { en: 'User Dashboard', ru: 'Личный кабинет', he: 'איזור אישי', fr: 'Tableau de bord de l\'utilisateur' }, 
  'header.admin.dashboard': { en: 'Admin Dashboard', ru: 'Панель администратора', he: 'לוח ניהול', fr: 'Tableau de bord de l\'administrateur' } ,
  'header.subtitle': {
      "en": "Food codes for NK695-compatible smart scales",
      "ru": "Коды продуктов для умных весов NK695 и совместимых моделей",
      "he": "קודי מזון למשקלי NK695 ולדגמים תואמים",
      "fr": "Codes alimentaires pour balances intelligentes NK695 et modèles compatibles"
    },
 
  'search.placeholder': { en: 'Search', ru: 'Поиск', he: 'חיפוש', fr: 'Rechercher' },
  'search.title': { en: 'Search code of product', ru: 'Поиск кода продукта', he: 'חיפוש קוד המוצר', fr: 'Rechercher le code du produit' },
  'search.subtitle': { en: 'Turn on the microphone for voice search', ru: 'Включите микрофон для голосового поиска', he: 'הפעל את המיקרופון לחיפוש קולי', fr: 'Allumez le microphone pour la recherche vocale' },
  'search.subtitle2': { en: 'Speak now...', ru: 'Говорите...', he: 'תדבר עכשיו...', fr: 'Parlez maintenant...' },
  'search.noResults': { en: 'No results found', ru: 'Результаты не найдены', he: 'לא נמצאו תוצאות', fr: 'Aucun résultat trouvé' },
  'search.error': { en: 'An error occurred while searching. Please try again.', ru: 'Произошла ошибка при поиске. Пожалуйста, попробуйте снова.', he: 'אירעה שגיאה במהלך החיפוש. אנא נסה שוב.', fr: 'Une erreur est survenue lors de la recherche. Veuillez réessayer.' },
  'search.tooltip.microphone.on': { en: 'Turn on microphone', ru: 'Включить микрофон', he: 'הפל מיקרופון', fr: 'Allumer le microphone' },
  'search.tooltip.microphone.off': { en: 'Turn off microphone', ru: 'Выключить микрофон', he: 'כבה מיקרופון', fr: 'Éteindre le microphone' },
  'search.copy': { en: 'Copy code', ru: 'Скопировать код', he: 'העתק קוד', fr: 'Copier le code' },
  'search.recent.title': { en: 'Recent products', ru: 'Недавние продукты', he: 'מוצרים אחרונים', fr: 'Produits récents' },
  'button.save': { en: 'Save', ru: 'Сохранить', he: 'שמור', fr: 'Enregistrer' },
  'button.cancel': { en: 'Cancel', ru: 'Отмена', he: 'ביטול', fr: 'Annuler' },

  'message.loading': { en: 'Loading...', ru: 'Загрузка...', he: 'טוען...', fr: 'Chargement...' },
  'message.error': { en: 'Error', ru: 'Ошибка', he: 'שגיאה', fr: 'Erreur' },
  'message.success': { en: 'Operation completed successfully.', ru: 'Операция успешно завершена.', he: 'הפעולה הושלמה בהצלחה.', fr: 'Opération terminée avec succès.' },
  'message.fieldRequired': { en: 'This field is required.', ru: 'Это поле обязательно.', he: 'שדה זה נדרש.', fr: 'Ce champ est requis.' },
  'message.yes': { en: 'Yes', ru: 'Да', he: 'כן', fr: 'Oui' },
  'message.no': { en: 'No', ru: 'Нет', he: 'לא', fr: 'Non' },
  'message.unexpectedError': { en: 'An unexpected error occurred. Please try again.', ru: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.', he: 'אירעה שגיאה בלתי צפויה. אנא נסה שוב.', fr: 'Une erreur inattendue est survenue. Veuillez réessayer.' },
  'message.error.categories.deleteHasProducts': { en: 'Cannot delete category because it has associated products.', ru: 'Невозможно удалить категорию, потому что у нее есть связанные продукты.', he: 'לא ניתן למחוק קטגוריה כי יש לה מוצרים משויכים.', fr: 'Impossible de supprimer la catégorie car elle a des produits associés.' },
    'message.error.categories.duplicateCode': {
    ru: 'Категория "{{code}}" уже существует.',
    en: 'Category "{{code}}" already exists.',
    he: 'קטגוריה "{{code}}" כבר קיימת.',
    fr: 'La catégorie "{{code}}" existe déjà.'
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
'message.success.products.updated': {
  en: 'Product updated successfully',
  ru: 'Продукт успешно обновлён',
  he: 'המוצר עודכן בהצלחה',
  fr: 'Produit mis à jour avec succès'
},

  'caption.name.en': { en: 'English Name (EN)', ru: 'Английское название (EN)', he:   ' (EN)שם (אנגלית)' },
  'caption.name.ru': { en: 'Russian Name (RU)', ru: 'Русское название (RU)', he:   ' (RU)שם (רוסית)' },
  'caption.name.he': { en: 'Hebrew Name (HE)', ru: 'Название на иврите (HE)', he:   ' (HE)שם (עברית)' },
  'caption.name.fr': { en: 'French Name (FR)', ru: 'Французское название (FR)', he:   ' (FR)שם (צרפתית)' },
  'caption.priority': { en: 'Priority', ru: 'Приоритет', he: 'עדיפות' },
  'caption.translations': { 
  en: 'Translations', 
  ru: 'Переводы', 
  he: 'תרגומים', 
  fr: 'Traductions' 
},
'caption.allLanguagesRequired': { 
  en: '(all languages are required)', 
  ru: '(все языки обязательны)', 
  he: '(כל השפות נדרשות)', 
  fr: '(toutes les langues sont requises)' 
},
'caption.classification': { 
  en: 'Classification', 
  ru: 'Классификация', 
  he: 'סיווג', 
  fr: 'Classification' 
},
'caption.basePriority': { 
  en: 'Base Priority', 
  ru: 'Базовый приоритет', 
  he: 'עדיפות בסיסית', 
  fr: 'Priorité de base' 
},
'caption.current': { 
  en: 'Current', 
  ru: 'Текущий', 
  he: 'נוכחי', 
  fr: 'Actuel' 
},
'caption.new': { 
  en: 'New', 
  ru: 'Новый', 
  he: 'חדש', 
  fr: 'Nouveau' 
},

  'column.id': { en: 'ID', ru: 'ID', he: 'ID' },
  'column.code': { en: 'Code', ru: 'Код', he: 'קוד' },
  'column.productCode': { en: 'Scale Code', ru: 'Код продукта', he: 'קוד סולם' },
  'column.productName': { en: 'Product Name', ru: 'Название продукта', he: 'שם המוצר' },
  'column.nameEn': { en: 'Name EN', ru: 'Название EN', he: 'שם אנגלית' },
  'column.nameRu': { en: 'Name RU', ru: 'Название RU', he: 'שם רוסית' },
  'column.nameHe': { en: 'Name HE', ru: 'Название HE', he: 'שם עברית' },
  'column.nameFr': { en: 'Name FR', ru: 'Название FR', he: 'שם צרפתית' },
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
  'admin.products.notFound': { en: 'No products found.', ru: 'Продукты не найдены.', he: 'לא נמצאו מוצרים.' },
  'admin.categories.notFound': { en: 'No categories found.', ru: 'Категории не найдены.', he: 'לא נמצאו קטגוריות.' },

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
  'breadcrumb.admin': { en: 'Admin', ru: 'Админ', he: 'אדמין', fr: 'Admin' },
  'breadcrumb.user': { en: 'User', ru: 'Пользователь', he: 'משתמש', fr: 'Utilisateur' },
  'breadcrumb.dashboard': { en: 'Dashboard', ru: 'Панель управления', he: 'לוח מחוונים', fr: 'Tableau de bord' },
  'breadcrumb.profile': { en: 'Profile', ru: 'Профиль', he: 'פרופיל', fr: 'Profil' },
  'breadcrumb.products': { en: 'Products', ru: 'Продукты', he: 'מוצרים', fr: 'Produits' },
  'breadcrumb.categories': { en: 'Categories', ru: 'Категории', he: 'קטגוריות', fr: 'Catégories' },
  'breadcrumb.processing': { en: 'Processing Types', ru: 'Способы обработки', he: 'סוגי עיבוד', fr: 'Types de traitement' },
  'breadcrumb.users': { en: 'Users', ru: 'Пользователи', he: 'משתמשים', fr: 'Utilisateurs' },
  'breadcrumb.auth': { en: 'Auth', ru: 'Авторизация', he: 'אימות', fr: 'Auth' },
  'breadcrumb.guest': { en: 'Guest', ru: 'Гость', he: 'אורח', fr: 'Invité' }
 
};
