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
    missingFields: 'Missing fields',
    enterEmailPassword: 'Please enter your email and password',
    unexpectedError: 'An unexpected error occurred',

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
    couldNotAnalyze: 'Could not analyze plant',
    permissionRequired: 'Permission required',
    cameraPermission: 'Camera access is needed to scan plants',

    // Report — basic
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

    // Report — hero / badges
    nonToxic: 'Non-toxic',
    toxic: 'Toxic',
    difficult: 'Difficult',

    // Report — PDF
    sharePdf: 'Share PDF',
    downloadPdf: 'Download PDF',
    exportPdf: 'Export PDF',
    exportPdfMsg: 'Full report export coming soon.',
    shareBenefitsLabel: 'Benefits',
    shareCareLabel: 'Care',

    // Report — sections
    similarPlants: 'Similar plant photos',
    noSimilarPhotos: 'No similar photos for this plant',
    searchAgain: 'Search again',
    smartTools: 'Smart tools',
    arPreview: 'AR Preview',
    tryInRoom: 'Try in your room',
    soilHelperShort: 'Soil helper',
    mixesAndRecipes: 'Mixes & recipes',
    localAlerts: 'Local alerts',
    fromCommunity: 'From community',
    lightMeter: 'Light meter',
    checkLighting: 'Check lighting',
    avoidContact: 'Avoid contact',
    careGuide: 'Care guide',
    watering: 'Watering',
    lightLabel: 'Light',
    soilLabel: 'Soil',
    temperature: 'Temperature',
    difficulty: 'Difficulty',
    easy: 'Easy',
    waterEveryDefault: 'Every 3-4 weeks',
    lightLevelDefault: 'Low to bright indirect light',
    soilTypeDefault: 'Standard potting mix',
    botanicalDescription: 'Botanical description',
    distributionAreas: 'Distribution areas',
    nutritionalValue: 'Nutritional value',
    per100gShort: 'Values per 100 grams',
    medicalBenefits: 'Medical benefits',
    usageMethods: 'Usage methods',

    // Report — warnings
    warnings: 'Warnings',
    toxicity: 'Toxicity',
    toxicPlant: 'Toxic plant',
    danger: 'Danger',
    safetyShield: 'Safety shield',
    forPets: 'For pets',
    forChildren: 'For children',
    callDoctorEmergency: 'Call a doctor immediately if swallowed',
    possibleSymptoms: 'Possible symptoms',

    // Safety values (normalized)
    safetySafe: 'Safe',
    safetyCaution: 'Caution',
    safetyUnsafe: 'Unsafe',

    // Report — bottom bar
    communityAlertsShort: 'Community alerts',

    // Report — modals
    soilAndPottingHelper: 'Soil & potting helper',
    idealSoilRecipe: 'Ideal soil recipe',
    idealPh: 'Ideal pH',
    wateringTip: 'Watering tip',
    drainageTip: 'Drainage tip',
    localCommunityAlerts: 'Local community alerts',
    noAlertsCurrently: 'No alerts at the moment.',
    pointCameraAtPlant:
      "Point your phone's camera at the plant location to measure light intensity.",
    featureInDevelopment: 'This feature is in development and will be available soon.',
    arPreviewDesc: 'Try placing the plant in your room with augmented reality.',

    // Settings
    settings: 'Settings',
    preferences: 'Preferences',
    darkMode: 'Dark Mode',
    on: 'On',
    off: 'Off',
    comingSoon: 'Coming soon',
    notifications: 'Notifications',
    language: 'Language',
    currentLanguage: 'English',
    aboutSection: 'About',
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

    // Admin — API Keys
    apiKeysTitle: 'API Keys Management',
    addNewKey: 'Add new key',
    keyNamePlaceholder: 'Key name (e.g.: OPENAI_API_KEY)',
    keyValuePlaceholder: 'Key value',
    enterKeyValue: 'Enter the key value',
    noValueSet: '— No value set —',
    save: 'Save',
    keyUpdated: 'Key updated',
    saveFailed: 'Save failed',
    keyNameRequired: 'Key name is required',
    addFailed: 'Add failed',
    deleteKey: 'Delete key',
    confirmDeleteKey: 'Are you sure you want to delete this key?',
    delete: 'Delete',
    deleteFailed: 'Delete failed',
    editReplace: 'Edit / Replace',
    add: 'Add',

    // Admin — Users
    usersManagement: 'User Management',
    searchByEmail: 'Search by email...',
    usersOf: 'of',
    usersWord: 'users',
    noMatchingUsers: 'No matching users',
    userActive: 'Active',
    userWarned: 'Warned',
    userBanned: 'Banned',
    tierFree: 'Free',
    tierPaid: 'Paid',
    filterAll: 'All',
    filterFree: 'Free',
    filterPaid: 'Paid',
    filterBanned: 'Banned',
    loadFailed: 'Load failed',
    updateFailed: 'Update failed',
    deleteUserTitle: 'Delete user',
    confirmDeleteUser: 'Permanently delete this user?',
    defaultWarningMsg: 'You have received a warning from the administration.',
    roleAdmin: 'Admin',
    roleUser: 'User',
    warn: 'Warn',
    unban: 'Unban',
    ban: 'Ban',
    convertToFree: 'Convert to free',
    upgradeToPaid: 'Upgrade to paid',
    reactivate: 'Reactivate',
    yourAccount: '(Your account)',
    sendWarningTitle: 'Send Warning',
    warningTextPlaceholder: 'Warning text',
    sendWarningBtn: 'Send warning',
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
    missingFields: 'حقول ناقصة',
    enterEmailPassword: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور',
    unexpectedError: 'حدث خطأ غير متوقع',

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
    couldNotAnalyze: 'تعذّر تحليل النبات',
    permissionRequired: 'إذن مطلوب',
    cameraPermission: 'يلزم الوصول إلى الكاميرا لمسح النباتات',

    // Report — basic
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
    saved: 'تمت الإضافة',
    error: 'خطأ',
    couldNotSaveGarden: 'تعذّر الحفظ في الحديقة',
    couldNotSaveFavorites: 'تعذّر الحفظ في المفضلة',

    // Report — hero / badges
    nonToxic: 'غير سام',
    toxic: 'سام',
    difficult: 'صعب',

    // Report — PDF
    sharePdf: 'مشاركة PDF',
    downloadPdf: 'تحميل PDF',
    exportPdf: 'تصدير PDF',
    exportPdfMsg: 'سيتم تصدير التقرير الكامل قريباً.',
    shareBenefitsLabel: 'الفوائد',
    shareCareLabel: 'العناية',

    // Report — sections
    similarPlants: 'صور نباتات مشابهة',
    noSimilarPhotos: 'لا توجد صور مشابهة لهذا النبات',
    searchAgain: 'إعادة البحث',
    smartTools: 'أدوات ذكية',
    arPreview: 'معاينة AR',
    tryInRoom: 'تجربة في غرفتك',
    soilHelperShort: 'مساعد التربة',
    mixesAndRecipes: 'خلطات ووصفات',
    localAlerts: 'التنبيهات المحلية',
    fromCommunity: 'من المجتمع',
    lightMeter: 'مقياس الضوء',
    checkLighting: 'افحص الإضاءة',
    avoidContact: 'تجنب الملامسة',
    careGuide: 'دليل العناية',
    watering: 'الري',
    lightLabel: 'الإضاءة',
    soilLabel: 'التربة',
    temperature: 'الحرارة',
    difficulty: 'الصعوبة',
    easy: 'سهل',
    waterEveryDefault: 'كل 3-4 أسابيع',
    lightLevelDefault: 'إضاءة من خفيفة إلى ساطعة غير مباشرة',
    soilTypeDefault: 'خليط تربة قياسي',
    botanicalDescription: 'الوصف النباتي',
    distributionAreas: 'أماكن الانتشار',
    nutritionalValue: 'القيمة الغذائية',
    per100gShort: 'القيم لكل 100 جرام',
    medicalBenefits: 'الفوائد الطبية',
    usageMethods: 'طرق الاستخدام',

    // Report — warnings
    warnings: 'التحذيرات',
    toxicity: 'السمية',
    toxicPlant: 'نبات سام',
    danger: 'الخطر',
    safetyShield: 'درع الحماية',
    forPets: 'للحيوانات الأليفة',
    forChildren: 'للأطفال',
    callDoctorEmergency: 'اتصل بالطبيب فوراً عند الابتلاع',
    possibleSymptoms: 'الأعراض المحتملة',

    // Safety values (normalized)
    safetySafe: 'آمن',
    safetyCaution: 'حذر',
    safetyUnsafe: 'غير آمن',

    // Report — bottom bar
    communityAlertsShort: 'تنبيهات المجتمع',

    // Report — modals
    soilAndPottingHelper: 'مساعد التربة والتقصيص',
    idealSoilRecipe: 'وصفة التربة المثالية',
    idealPh: 'درجة الحموضة المثالية',
    wateringTip: 'نصيحة الري',
    drainageTip: 'نصيحة التصريف',
    localCommunityAlerts: 'تنبيهات المجتمع المحلي',
    noAlertsCurrently: 'لا توجد تنبيهات حالياً.',
    pointCameraAtPlant: 'وجّه كاميرا هاتفك نحو موقع النبات لقياس شدة الإضاءة.',
    featureInDevelopment: 'هذه الميزة قيد التطوير وستتوفر قريباً.',
    arPreviewDesc: 'تجربة وضع النبات في غرفتك بتقنية الواقع المعزز.',

    // Settings
    settings: 'الإعدادات',
    preferences: 'التفضيلات',
    darkMode: 'الوضع الداكن',
    on: 'مفعّل',
    off: 'معطّل',
    comingSoon: 'قريباً',
    notifications: 'الإشعارات',
    language: 'اللغة',
    currentLanguage: 'العربية',
    aboutSection: 'حول',
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

    // Admin — API Keys
    apiKeysTitle: 'إدارة مفاتيح API',
    addNewKey: 'إضافة مفتاح جديد',
    keyNamePlaceholder: 'اسم المفتاح (مثال: OPENAI_API_KEY)',
    keyValuePlaceholder: 'قيمة المفتاح',
    enterKeyValue: 'أدخل قيمة المفتاح',
    noValueSet: '— لم يتم تعيين قيمة —',
    save: 'حفظ',
    keyUpdated: 'تم تحديث المفتاح',
    saveFailed: 'فشل الحفظ',
    keyNameRequired: 'اسم المفتاح مطلوب',
    addFailed: 'فشل الإضافة',
    deleteKey: 'حذف المفتاح',
    confirmDeleteKey: 'هل أنت متأكد من حذف هذا المفتاح؟',
    delete: 'حذف',
    deleteFailed: 'فشل الحذف',
    editReplace: 'تعديل / استبدال',
    add: 'إضافة',

    // Admin — Users
    usersManagement: 'إدارة المستخدمين',
    searchByEmail: 'ابحث بالبريد الإلكتروني...',
    usersOf: 'من أصل',
    usersWord: 'مستخدم',
    noMatchingUsers: 'لا يوجد مستخدمون مطابقون',
    userActive: 'نشط',
    userWarned: 'تنبيه',
    userBanned: 'محظور',
    tierFree: 'مجانية',
    tierPaid: 'مدفوعة',
    filterAll: 'الكل',
    filterFree: 'مجاني',
    filterPaid: 'مدفوع',
    filterBanned: 'موقوف',
    loadFailed: 'فشل التحميل',
    updateFailed: 'فشل التحديث',
    deleteUserTitle: 'حذف المستخدم',
    confirmDeleteUser: 'هل تريد حذف هذا المستخدم نهائياً؟',
    defaultWarningMsg: 'تم توجيه تنبيه إليك من الإدارة.',
    roleAdmin: 'مدير',
    roleUser: 'مستخدم',
    warn: 'تنبيه',
    unban: 'إلغاء الحظر',
    ban: 'حظر',
    convertToFree: 'تحويل إلى مجانية',
    upgradeToPaid: 'ترقية إلى مدفوعة',
    reactivate: 'إعادة تفعيل',
    yourAccount: '(حسابك الحالي)',
    sendWarningTitle: 'توجيه تنبيه',
    warningTextPlaceholder: 'نص التنبيه',
    sendWarningBtn: 'إرسال التنبيه',
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
