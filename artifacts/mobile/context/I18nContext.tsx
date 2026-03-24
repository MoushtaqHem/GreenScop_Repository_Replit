import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ar';

const translations = {
  en: {
    // Auth
    appTagline: 'Identify plants with intelligence',
    welcomeBack: 'Welcome back',
    createAccount: 'Create account',
    emailAddress: 'Email address',
    password: 'Password',
    signIn: 'Sign In',
    register: 'Create Account',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',
    loginFailed: 'Login failed',
    registrationFailed: 'Registration failed',

    // Home
    goodMorning: 'Good morning',
    searchPlants: 'Search plants...',
    identifyPlant: 'Identify a Plant',
    tapToScan: 'Tap to scan with AI',
    featuredPlants: 'Featured Plants',
    recentScans: 'Recent Scans',
    seeAll: 'See all',
    noScansYet: 'No scans yet',
    scanToSeeHere: 'Scan a plant to see it here',
    healing: 'Healing',
    calming: 'Calming',
    refreshing: 'Refreshing',
    aromatic: 'Aromatic',

    // Garden
    myGarden: 'My Garden',
    gardenEmpty: 'Your garden is empty',
    gardenEmptyDesc: 'Save plants from your scans to build your garden',
    scanAPlant: 'Scan a plant',
    removePlant: 'Remove plant?',
    removePlantDesc: 'This will remove the plant from your garden.',
    remove: 'Remove',
    cancel: 'Cancel',
    plants: 'plants',
    plant: 'plant',

    // Favorites
    favorites: 'Favorites',
    savedPlants: 'saved plants',
    savedPlant: 'saved plant',
    noFavoritesYet: 'No favorites yet',
    noFavoritesDesc: 'After identifying a plant, tap the heart icon to save it here',
    removeFromFavorites: 'Remove from favorites?',
    removeFromFavoritesDesc: 'This will remove the plant from your favorites.',

    // Scan
    plantScanner: 'Plant Scanner',
    scanSubtitle: 'Take or upload a photo to identify',
    noImageSelected: 'No image selected',
    choosePhotoDesc: 'Choose a photo to identify your plant',
    camera: 'Camera',
    gallery: 'Gallery',
    identifyBtn: 'Identify Plant',
    analyzing: 'Analyzing...',
    tipsTitle: 'Tips for best results',
    tip1: 'Good lighting improves accuracy',
    tip2: 'Focus on leaves, flowers, or unique features',
    tip3: 'Fill the frame with the plant',
    signInRequired: 'Sign in required',
    signInToIdentify: 'Please sign in to identify plants',
    noImage: 'No image',
    selectPhotoFirst: 'Please select a photo first',
    imageError: 'Image error',
    imageReadError: 'Could not read the selected image. Please try again.',
    analysisFailed: 'Analysis failed',
    permissionRequired: 'Permission required',
    cameraPermission: 'Camera access is needed to scan plants',

    // Report
    about: 'About',
    benefits: 'Benefits',
    careInstructions: 'Care Instructions',
    nutritionalValues: 'Nutritional Values',
    per100g: 'Per 100g serving',
    nutrient: 'Nutrient',
    amount: 'Amount',
    dailyPct: 'Daily %',
    noReport: 'No report available',
    goBack: 'Go back',
    savedToGarden: 'Plant added to your garden',
    savedToFavorites: 'Plant added to favorites',
    saved: 'Saved',
    error: 'Error',
    couldNotSaveGarden: 'Could not save to garden',
    couldNotSaveFavorites: 'Could not save to favorites',

    // Settings
    settings: 'Settings',
    preferences: 'Preferences',
    darkMode: 'Dark Mode',
    comingSoon: 'Coming soon',
    notifications: 'Notifications',
    language: 'Language',
    currentLanguage: 'English',
    about: 'About',
    aboutApp: 'About GreenScope AI',
    version: 'Version 1.0.0',
    aiModel: 'AI Model',
    privacyPolicy: 'Privacy Policy',
    account: 'Account',
    signOut: 'Sign out',
    signOutTitle: 'Sign out?',
    signOutDesc: 'You will need to sign in again to use GreenScope AI.',
    footer: 'GreenScope AI · Powered by Gemini',

    // Tabs
    tabHome: 'Home',
    tabGarden: 'Garden',
    tabScan: 'Scan',
    tabFavorites: 'Favorites',
    tabSettings: 'Settings',
  },
  ar: {
    // Auth
    appTagline: 'تعرّف على النباتات بذكاء',
    welcomeBack: 'مرحباً بعودتك',
    createAccount: 'إنشاء حساب',
    emailAddress: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    signUp: 'إنشاء حساب',
    haveAccount: 'لديك حساب بالفعل؟',
    signInLink: 'تسجيل الدخول',
    loginFailed: 'فشل تسجيل الدخول',
    registrationFailed: 'فشل إنشاء الحساب',

    // Home
    goodMorning: 'صباح الخير',
    searchPlants: 'ابحث عن نبات...',
    identifyPlant: 'تعرّف على نبات',
    tapToScan: 'اضغط للمسح بالذكاء الاصطناعي',
    featuredPlants: 'النباتات المميزة',
    recentScans: 'عمليات المسح الأخيرة',
    seeAll: 'عرض الكل',
    noScansYet: 'لا توجد عمليات مسح بعد',
    scanToSeeHere: 'امسح نباتاً لرؤيته هنا',
    healing: 'علاجي',
    calming: 'مهدئ',
    refreshing: 'منعش',
    aromatic: 'عطري',

    // Garden
    myGarden: 'حديقتي',
    gardenEmpty: 'حديقتك فارغة',
    gardenEmptyDesc: 'احفظ النباتات من عمليات المسح لبناء حديقتك',
    scanAPlant: 'امسح نباتاً',
    removePlant: 'إزالة النبات؟',
    removePlantDesc: 'سيؤدي هذا إلى إزالة النبات من حديقتك.',
    remove: 'إزالة',
    cancel: 'إلغاء',
    plants: 'نباتات',
    plant: 'نبات',

    // Favorites
    favorites: 'المفضلة',
    savedPlants: 'نباتات محفوظة',
    savedPlant: 'نبات محفوظ',
    noFavoritesYet: 'لا توجد مفضلات بعد',
    noFavoritesDesc: 'بعد التعرف على نبات، اضغط على أيقونة القلب لحفظه هنا',
    removeFromFavorites: 'إزالة من المفضلة؟',
    removeFromFavoritesDesc: 'سيؤدي هذا إلى إزالة النبات من مفضلتك.',

    // Scan
    plantScanner: 'ماسح النباتات',
    scanSubtitle: 'التقط أو ارفع صورة للتعرف عليها',
    noImageSelected: 'لم يتم اختيار صورة',
    choosePhotoDesc: 'اختر صورة للتعرف على نباتك',
    camera: 'الكاميرا',
    gallery: 'المعرض',
    identifyBtn: 'تعرّف على النبات',
    analyzing: 'جارٍ التحليل...',
    tipsTitle: 'نصائح للحصول على أفضل النتائج',
    tip1: 'الإضاءة الجيدة تحسّن الدقة',
    tip2: 'ركّز على الأوراق أو الأزهار أو المميزات الفريدة',
    tip3: 'املأ الإطار بالنبات',
    signInRequired: 'يُرجى تسجيل الدخول',
    signInToIdentify: 'يرجى تسجيل الدخول للتعرف على النباتات',
    noImage: 'لا توجد صورة',
    selectPhotoFirst: 'يرجى اختيار صورة أولاً',
    imageError: 'خطأ في الصورة',
    imageReadError: 'تعذّر قراءة الصورة المختارة. يرجى المحاولة مرة أخرى.',
    analysisFailed: 'فشل التحليل',
    permissionRequired: 'إذن مطلوب',
    cameraPermission: 'يلزم الوصول إلى الكاميرا لمسح النباتات',

    // Report
    about: 'عن النبات',
    benefits: 'الفوائد',
    careInstructions: 'تعليمات العناية',
    nutritionalValues: 'القيم الغذائية',
    per100g: 'لكل 100 جرام',
    nutrient: 'العنصر الغذائي',
    amount: 'الكمية',
    dailyPct: 'النسبة اليومية',
    noReport: 'لا يوجد تقرير',
    goBack: 'العودة',
    savedToGarden: 'تمت إضافة النبات إلى حديقتك',
    savedToFavorites: 'تمت إضافة النبات إلى المفضلة',
    saved: 'تم الحفظ',
    error: 'خطأ',
    couldNotSaveGarden: 'تعذّر الحفظ في الحديقة',
    couldNotSaveFavorites: 'تعذّر الحفظ في المفضلة',

    // Settings
    settings: 'الإعدادات',
    preferences: 'التفضيلات',
    darkMode: 'الوضع الداكن',
    comingSoon: 'قريباً',
    notifications: 'الإشعارات',
    language: 'اللغة',
    currentLanguage: 'العربية',
    about: 'حول',
    aboutApp: 'حول GreenScope AI',
    version: 'الإصدار 1.0.0',
    aiModel: 'نموذج الذكاء الاصطناعي',
    privacyPolicy: 'سياسة الخصوصية',
    account: 'الحساب',
    signOut: 'تسجيل الخروج',
    signOutTitle: 'تسجيل الخروج؟',
    signOutDesc: 'ستحتاج إلى تسجيل الدخول مرة أخرى لاستخدام GreenScope AI.',
    footer: 'GreenScope AI · مدعوم بـ Gemini',

    // Tabs
    tabHome: 'الرئيسية',
    tabGarden: 'الحديقة',
    tabScan: 'المسح',
    tabFavorites: 'المفضلة',
    tabSettings: 'الإعدادات',
  },
} as const;

type TranslationKeys = keyof typeof translations.en;

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'greenscope_language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'ar' || stored === 'en') {
        setLangState(stored);
      }
    });
  }, []);

  const setLang = async (newLang: Language) => {
    setLangState(newLang);
    await AsyncStorage.setItem(STORAGE_KEY, newLang);
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key: TranslationKeys) => translations[lang][key] as string,
      isRTL: lang === 'ar',
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
