import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const LANGUAGE_STORAGE_KEY = 'riq-mobile-language';
const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;

function isSupportedLanguage(
  language: string | null
): language is (typeof SUPPORTED_LANGUAGES)[number] {
  return !!language && SUPPORTED_LANGUAGES.includes(language as (typeof SUPPORTED_LANGUAGES)[number]);
}

const resources = {
  ar: {
    translation: {
      tabs: {
        home: 'الرئيسية',
        products: 'المنتجات',
        brands: 'العلامات',
        offers: 'العروض',
        cart: 'السلة',
      },
      common: {
        sar: 'ر.س',
        addToCart: 'أضف للسلة',
        viewDetails: 'عرض التفاصيل',
        continue: 'متابعة',
        checkout: 'إتمام الطلب',
        contact: 'تواصل معنا',
        about: 'عن المتجر',
        loading: 'جارٍ التحميل',
        empty: 'لا توجد بيانات',
        clear: 'تفريغ',
        language: 'EN',
        retry: 'إعادة المحاولة',
        send: 'إرسال',
        backToHome: 'العودة للرئيسية',
        placeOrder: 'تنفيذ الطلب',
        locateMe: 'موقعي الحالي',
        openMap: 'فتح الخريطة',
      },
      home: {
        overline: 'تطبيق متجر ريق',
        title: 'نسخة موبايل أسرع للطلب ومتابعة السلة',
        subtitle: 'كل منتجات المياه والعروض والعلامات في تجربة موبايل أصلية ومباشرة.',
        featured: 'منتجات مختارة',
        brands: 'علامات بارزة',
        statsProducts: 'منتج',
        statsBrands: 'علامة',
      },
      products: {
        title: 'المنتجات',
        subtitle: 'ابحث وفلتر بسرعة حسب الفئة أو العلامة.',
        search: 'ابحث عن منتج أو علامة...',
      },
      brands: {
        title: 'العلامات التجارية',
        subtitle: 'استكشف الماركات وعدد المنتجات المتاحة بكل علامة.',
      },
      offers: {
        title: 'العروض الخاصة',
        subtitle: 'أفضل الباقات والعروض الجاهزة للطلب السريع.',
      },
      cart: {
        title: 'سلة الطلب',
        subtitle: 'راجع الكميات قبل الدفع أو التواصل.',
        emptyTitle: 'السلة فارغة',
        emptyBody: 'ابدأ بإضافة المنتجات ثم ارجع هنا لإكمال الطلب.',
        subtotal: 'المجموع الفرعي',
        delivery: 'رسوم التوصيل',
        total: 'الإجمالي النهائي',
        freeDelivery: 'توصيل مجاني فوق 100 ر.س',
      },
      checkout: {
        title: 'بيانات الطلب',
        subtitle: 'أدخل البيانات الأساسية وحدد العنوان قبل الدفع.',
        paymentTitle: '\u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0628\u0646\u0643\u064a \u0639\u0628\u0631 \u0635\u0641\u062d\u0629 \u0627\u0644\u0648\u064a\u0628',
        paymentSubtitle: '\u0633\u064a\u062a\u0645 \u0641\u062a\u062d \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0628\u0646\u0643\u064a \u0648\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628 \u064a\u062f\u0648\u064a\u064b\u0627 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628.',
        resultSuccess: '\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628',
        resultCancelled: 'تم إلغاء الدفع',
        resultError: 'تعذر إكمال الدفع',
      },
      contact: {
        title: 'التواصل والدعم',
        subtitle: 'واتساب، اتصال، بريد إلكتروني، أو رسالة مباشرة من التطبيق.',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        phone: 'رقم الجوال',
        subject: 'الموضوع',
        message: 'الرسالة',
      },
      about: {
        title: 'عن ريق',
        subtitle: 'منصة مياه مركزة على السرعة والوضوح وتنوع العلامات.',
      },
    },
  },
  en: {
    translation: {
      tabs: {
        home: 'Home',
        products: 'Products',
        brands: 'Brands',
        offers: 'Offers',
        cart: 'Cart',
      },
      common: {
        sar: 'SAR',
        addToCart: 'Add to cart',
        viewDetails: 'View details',
        continue: 'Continue',
        checkout: 'Checkout',
        contact: 'Contact',
        about: 'About',
        loading: 'Loading',
        empty: 'No data yet',
        clear: 'Clear',
        language: 'AR',
        retry: 'Retry',
        send: 'Send',
        backToHome: 'Back to home',
        placeOrder: 'Place order',
        locateMe: 'Use my location',
        openMap: 'Open map',
      },
      home: {
        overline: 'Riq Store app',
        title: 'A faster native mobile flow for browsing and ordering water',
        subtitle: 'Products, brands, offers, cart, and checkout in one native experience.',
        featured: 'Featured products',
        brands: 'Highlighted brands',
        statsProducts: 'Products',
        statsBrands: 'Brands',
      },
      products: {
        title: 'Products',
        subtitle: 'Search and filter quickly by category or brand.',
        search: 'Search by product or brand...',
      },
      brands: {
        title: 'Brands',
        subtitle: 'Explore brands and how many products each one offers.',
      },
      offers: {
        title: 'Special offers',
        subtitle: 'Best bundled deals ready for a quick checkout.',
      },
      cart: {
        title: 'Your cart',
        subtitle: 'Review quantities before payment or support contact.',
        emptyTitle: 'Your cart is empty',
        emptyBody: 'Start adding products, then come back here to complete the order.',
        subtotal: 'Subtotal',
        delivery: 'Delivery fee',
        total: 'Final total',
        freeDelivery: 'Free delivery above SAR 100',
      },
      checkout: {
        title: 'Checkout details',
        subtitle: 'Fill in the basics and pin the address before payment.',
        paymentTitle: 'Bank transfer via the web bridge',
        paymentSubtitle: 'Bank transfer details and manual WhatsApp confirmation open inside the WebView.',
        resultSuccess: 'Payment completed successfully',
        resultCancelled: 'Payment was cancelled',
        resultError: 'Payment could not be completed',
      },
      contact: {
        title: 'Support and contact',
        subtitle: 'WhatsApp, phone, email, or a direct message from the app.',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        subject: 'Subject',
        message: 'Message',
      },
      about: {
        title: 'About Riq',
        subtitle: 'A focused bottled-water storefront built around speed, clarity, and variety.',
      },
    },
  },
};

let languagePreferenceHydrated = false;

i18n.on('languageChanged', (language) => {
  if (!languagePreferenceHydrated || !isSupportedLanguage(language)) {
    return;
  }

  AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language).catch(() => {});
});

export const i18nReady = i18n.use(initReactI18next).init({
  resources,
  lng: 'ar',
  fallbackLng: 'ar',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  interpolation: {
    escapeValue: false,
  },
});

void i18nReady.then(async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (isSupportedLanguage(storedLanguage) && storedLanguage !== i18n.language) {
      await i18n.changeLanguage(storedLanguage);
    }
  } catch {
  } finally {
    languagePreferenceHydrated = true;
  }
});

export default i18n;
