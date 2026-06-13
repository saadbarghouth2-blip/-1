import type { LocalizedText } from '@riq/shared';

export type MobileRichItem = {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
};

export type MobileStatItem = {
  id: string;
  value: string;
  label: LocalizedText;
};

export type MobileFaqItem = {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
};

export type ContactTopicPreset = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  subject: string;
  message: LocalizedText;
};

export const storefrontContent = {
  home: {
    trustBadges: [
      {
        id: 'quality',
        title: { ar: 'جودة واضحة', en: 'Clear quality' },
        body: {
          ar: 'المنتجات منظمة بعلامات معروفة ومعلومات تكفي لاختيار أسرع.',
          en: 'The catalog is organized around known brands with enough detail for faster decisions.',
        },
      },
      {
        id: 'speed',
        title: { ar: 'طلب أسرع', en: 'Faster ordering' },
        body: {
          ar: '\u0645\u0646 \u0627\u0644\u062a\u0635\u0641\u062d \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629 \u062b\u0645 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0628\u0646\u0643\u064a \u0628\u062f\u0648\u0646 \u062a\u0634\u062a\u064a\u062a \u0623\u0648 \u062e\u0637\u0648\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629.',
          en: 'From browsing to cart to checkout without noisy detours or extra steps.',
        },
      },
      {
        id: 'support',
        title: { ar: 'دعم مباشر', en: 'Direct support' },
        body: {
          ar: 'واتساب واتصال وبريد ورسالة داخل التطبيق حسب نوع احتياجك.',
          en: 'WhatsApp, phone, email, and in-app messaging depending on what you need.',
        },
      },
    ],
    howToOrder: [
      {
        id: 'browse',
        title: { ar: 'اختر ما يناسبك', en: 'Pick the right fit' },
        body: {
          ar: 'تصفح حسب الفئة أو العلامة ثم افتح المنتج لمعرفة الحجم والاستخدام المناسب.',
          en: 'Browse by category or brand, then open the product for size and usage details.',
        },
      },
      {
        id: 'cart',
        title: { ar: 'راجع السلة', en: 'Review the cart' },
        body: {
          ar: 'عدّل الكميات بسرعة وراجع إجمالي الطلب ورسوم التوصيل قبل الإكمال.',
          en: 'Adjust quantities quickly and review totals and delivery before continuing.',
        },
      },
      {
        id: 'checkout',
        title: { ar: '\u062b\u0628\u0651\u062a \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0623\u0643\u0645\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644', en: 'Confirm the address and transfer' },
        body: {
          ar: '\u0623\u062f\u062e\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0648\u062d\u062f\u062f \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0627\u0644\u062e\u0631\u064a\u0637\u0629 \u062b\u0645 \u0627\u0641\u062a\u062d \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0628\u0646\u0643\u064a.',
          en: 'Fill in the essentials, pin the location on the map, then open the bank transfer details.',
        },
      },
    ],
    deliveryCoverage: [
      {
        id: 'homes',
        title: { ar: 'للاستخدام اليومي', en: 'For everyday use' },
        body: {
          ar: 'أحجام مناسبة للمنازل والطلبات المتكررة مع مسار شراء سريع.',
          en: 'Sizes suited for homes and repeat orders with a quick buying path.',
        },
      },
      {
        id: 'offices',
        title: { ar: 'للمكاتب والجهات', en: 'For offices and teams' },
        body: {
          ar: 'خيارات أوضح للطلبات الأكبر والاحتياج المستمر خلال الأسبوع.',
          en: 'Clearer options for larger supply needs and recurring office demand.',
        },
      },
      {
        id: 'events',
        title: { ar: 'للمناسبات والضيافة', en: 'For events and hospitality' },
        body: {
          ar: 'عروض وعبوات صغيرة وزجاجية لتجهيز الضيافة بشكل أنيق ومنظم.',
          en: 'Offers plus small and glass formats for more polished event hospitality.',
        },
      },
    ],
    testimonials: [
      {
        id: 'family',
        title: { ar: 'تجربة عائلية ثابتة', en: 'Reliable family ordering' },
        body: {
          ar: 'التطبيق يجعل إعادة الطلب أسهل لأن كل العلامات والقياسات واضحة من أول مرة.',
          en: 'The app makes repeat ordering easier because brands and sizes are clear from the first visit.',
        },
      },
      {
        id: 'office',
        title: { ar: 'أنسب للمكاتب', en: 'Better for office supply' },
        body: {
          ar: 'صار أسرع أن نراجع الكميات ونكمل الطلب بدل الرجوع لعدة صفحات.',
          en: 'It is faster to review quantities and place the order without jumping through extra pages.',
        },
      },
      {
        id: 'support',
        title: { ar: 'تواصل أوضح', en: 'Clearer support' },
        body: {
          ar: 'وجود الموضوعات الجاهزة وواتساب داخل التطبيق اختصر وقت المتابعة.',
          en: 'Preset inquiry topics and WhatsApp access inside the app reduced follow-up time.',
        },
      },
    ],
  },
  sharedFaqs: [
    {
      id: 'delivery-speed',
      question: { ar: 'كم يستغرق التوصيل؟', en: 'How long does delivery take?' },
      answer: {
        ar: 'مدة التوصيل تختلف حسب المنطقة، لكن التطبيق يركز على جعل تجهيز الطلب نفسه أسرع وأوضح قبل المتابعة.',
        en: 'Delivery timing depends on the area, but the app is built to make order preparation faster and clearer before handoff.',
      },
    },
    {
      id: 'payment-methods',
      question: { ar: 'كيف يتم الدفع؟', en: 'How does payment work?' },
      answer: {
        ar: '\u064a\u062a\u0645 \u0627\u0644\u062a\u0623\u0643\u064a\u062f \u062d\u0627\u0644\u064a\u064b\u0627 \u0628\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a \u064a\u062f\u0648\u064a \u0648\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u064a\u0635\u0627\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628.',
        en: 'Checkout is currently confirmed with a manual bank transfer and receipt sent on WhatsApp.',
      },
    },
    {
      id: 'bulk-orders',
      question: { ar: 'هل التطبيق مناسب للطلبات الكبيرة؟', en: 'Is the app suitable for larger orders?' },
      answer: {
        ar: 'نعم، خاصة في العروض والجالونات والعبوات المناسبة للمكاتب والجهات والفعاليات.',
        en: 'Yes, especially for offers, gallons, and formats that work well for offices, teams, and events.',
      },
    },
    {
      id: 'contact-options',
      question: { ar: 'ما أسرع وسيلة للتواصل؟', en: 'What is the fastest contact option?' },
      answer: {
        ar: 'واتساب هو الأسرع غالبا، لكن يمكنك أيضًا الاتصال أو إرسال بريد أو رسالة مباشرة من التطبيق.',
        en: 'WhatsApp is usually the fastest, but you can also call, email, or send a direct in-app message.',
      },
    },
    {
      id: 'catalog-coverage',
      question: { ar: 'هل التطبيق فيه نفس تنوع الموقع؟', en: 'Does the app cover the same variety as the website?' },
      answer: {
        ar: 'التطبيق يغطي أهم محتوى الموقع ومساراته الأساسية لكن بصياغة أبسط وأنسب للموبايل.',
        en: 'The app covers the key website content and primary flows, but in a simpler mobile-first form.',
      },
    },
  ],
  about: {
    intro: {
      title: { ar: 'تجربة موبايل مبنية على نفس المتجر', en: 'A mobile experience built on the same store' },
      body: {
        ar: 'نسخة الموبايل تجمع بين تنوع العلامات وسرعة الوصول للمعلومة والطلب، لكن بتجربة أصلية للهاتف بدل نسخ صفحات الويب كما هي.',
        en: 'The mobile build combines brand variety, faster access to information, and ordering speed, but in a phone-native flow instead of mirroring web pages one-to-one.',
      },
    },
    stats: [
      {
        id: 'products',
        value: '40+',
        label: { ar: 'منتج متاح', en: 'Available products' },
      },
      {
        id: 'brands',
        value: '18+',
        label: { ar: 'علامة بارزة', en: 'Strong brands' },
      },
      {
        id: 'flows',
        value: '5',
        label: { ar: 'مسارات أساسية', en: 'Core flows' },
      },
      {
        id: 'support',
        value: '24/7',
        label: { ar: 'قنوات دعم', en: 'Support access' },
      },
    ],
    pillars: [
      {
        id: 'clarity',
        title: { ar: 'وضوح قبل كل شيء', en: 'Clarity first' },
        body: {
          ar: 'نرتب المعلومات داخل التطبيق بحيث تعرف الفرق بين الأحجام والعلامات والاستخدام المناسب بسرعة.',
          en: 'Information is arranged so you can compare sizes, brands, and use cases quickly.',
        },
      },
      {
        id: 'catalog',
        title: { ar: 'تنوع يخدم القرار', en: 'Variety that supports decisions' },
        body: {
          ar: 'التنوع ليس مجرد عدد، بل تغطية لاستخدامات يومية ومكتبية وضيافة وعروض أكبر.',
          en: 'Variety is not just about count, but about covering daily, office, hospitality, and larger-order needs.',
        },
      },
      {
        id: 'support',
        title: { ar: 'خدمة تكمّل البيع', en: 'Support that completes the sale' },
        body: {
          ar: 'بعد التصفح والاختيار، تظل قنوات الدعم قريبة لتقليل التردد وتسريع التنفيذ.',
          en: 'After browsing and choosing, support stays close to reduce hesitation and speed up execution.',
        },
      },
    ],
    values: [
      {
        id: 'quality',
        title: { ar: 'جودة يمكن الوثوق بها', en: 'Quality you can trust' },
        body: {
          ar: 'اختيار العلامات وتنظيم المحتوى مبني على وضوح المنتج لا على الزخرفة فقط.',
          en: 'Brand selection and content organization are built around product clarity, not visual noise alone.',
        },
      },
      {
        id: 'speed',
        title: { ar: 'سرعة عملية', en: 'Practical speed' },
        body: {
          ar: '\u0643\u0644 \u0634\u0627\u0634\u0629 \u0647\u062f\u0641\u0647\u0627 \u062a\u0642\u0644\u064a\u0644 \u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0642\u0631\u0627\u0631\u060c \u0645\u0646 \u0627\u0644\u0628\u062d\u062b \u0648\u062d\u062a\u0649 \u0641\u062a\u062d \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u062d\u0648\u064a\u0644.',
          en: 'Each screen is meant to reduce decision friction from search through bank transfer handoff.',
        },
      },
      {
        id: 'coverage',
        title: { ar: 'تغطية أوسع للاستخدامات', en: 'Broader use-case coverage' },
        body: {
          ar: 'المحتوى يخاطب المنازل والمكاتب والفعاليات بدل حصر التطبيق في مسار واحد فقط.',
          en: 'The content speaks to homes, offices, and events instead of limiting the app to a single shopping path.',
        },
      },
      {
        id: 'consistency',
        title: { ar: 'اتساق بين الويب والموبايل', en: 'Consistency across web and mobile' },
        body: {
          ar: 'البيانات الأساسية نفسها مستخدمة في المنصتين مع صياغة مناسبة للهاتف.',
          en: 'The same core data powers both platforms, with a presentation tailored for mobile.',
        },
      },
    ],
    timeline: [
      {
        id: 'catalog',
        title: { ar: 'بداية من الكتالوج', en: 'Starting with the catalog' },
        body: {
          ar: 'أول خطوة كانت نقل المنتجات والعلامات والسلة إلى تجربة أصلية داخل التطبيق.',
          en: 'The first step was moving products, brands, and cart flows into a native in-app experience.',
        },
      },
      {
        id: 'checkout',
        title: { ar: '\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a \u0645\u0624\u0642\u062a', en: 'Temporary bank transfer' },
        body: {
          ar: '\u062a\u0645 \u0625\u064a\u0642\u0627\u0641 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062f\u0641\u0639 \u0648\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0628\u0646\u0643\u064a \u0644\u062d\u064a\u0646 \u0627\u062e\u062a\u064a\u0627\u0631 \u0623\u0641\u0636\u0644 \u0628\u0648\u0627\u0628\u0629.',
          en: 'The payment gateway is paused in favor of bank transfer until the best provider is selected.',
        },
      },
      {
        id: 'content',
        title: { ar: 'توسيع المحتوى المهم', en: 'Expanding the important content' },
        body: {
          ar: 'بعد اكتمال الأساس، تمت إضافة أقسام الثقة، التعريف، التغطية، والدعم داخل التطبيق.',
          en: 'Once the core flows were ready, trust, discovery, coverage, and support content were added inside the app.',
        },
      },
      {
        id: 'next',
        title: { ar: 'جاهز للتوسع لاحقًا', en: 'Ready for future expansion' },
        body: {
          ar: 'الهيكل الحالي يسمح لاحقًا بإضافة حسابات أو تتبع أو مزايا أخرى بدون إعادة بناء كاملة.',
          en: 'The current structure leaves room for accounts, tracking, or other features later without a full rebuild.',
        },
      },
    ],
    certifications: [
      {
        id: 'catalog-clarity',
        title: { ar: 'تنظيم واضح للبيانات', en: 'Clear data organization' },
        body: {
          ar: 'الأحجام والعدد والفئة والسعر معروضة بشكل سريع ومفهوم.',
          en: 'Size, count, category, and price are surfaced in a quick and readable way.',
        },
      },
      {
        id: 'mobile-first',
        title: { ar: 'تصميم موبايل-فرست', en: 'Mobile-first design' },
        body: {
          ar: 'الأقسام الطويلة أعيد تجميعها لتناسب التمرير القصير والشاشات الضيقة.',
          en: 'Long-form sections were regrouped to fit short scroll patterns and narrow screens.',
        },
      },
      {
        id: 'shared-data',
        title: { ar: 'بيانات مشتركة', en: 'Shared product data' },
        body: {
          ar: 'الكتالوج نفسه مستخدم في الويب والموبايل لتقليل التكرار والتباين.',
          en: 'The same catalog powers both web and mobile to reduce drift and duplication.',
        },
      },
      {
        id: 'support-ready',
        title: { ar: 'جاهزية للتواصل', en: 'Support-ready' },
        body: {
          ar: 'الدعم ليس صفحة منفصلة فقط، بل جزء ظاهر من الرحلة داخل التطبيق.',
          en: 'Support is not just a standalone page, but a visible part of the in-app journey.',
        },
      },
    ],
  },
  contact: {
    responseHighlights: [
      {
        id: 'fast-response',
        title: { ar: 'استجابة أولية أسرع', en: 'Faster first response' },
        body: {
          ar: 'القنوات المباشرة والموضوعات الجاهزة تقلل وقت كتابة الرسالة وتوضّح المقصود من البداية.',
          en: 'Direct channels and preset topics reduce message-writing time and clarify intent from the start.',
        },
      },
      {
        id: 'clear-routing',
        title: { ar: 'توجيه أوضح للطلب', en: 'Clearer routing for requests' },
        body: {
          ar: 'كل نوع تواصل يقربك من الإجراء المناسب: استفسار، توريد، أو متابعة.',
          en: 'Each topic gets you closer to the right path: inquiry, supply request, or follow-up.',
        },
      },
      {
        id: 'human-followup',
        title: { ar: 'متابعة بشرية بعد الإرسال', en: 'Human follow-up after sending' },
        body: {
          ar: 'النموذج ليس نهاية الرحلة، بل بداية لتواصل أوضح وأسرع.',
          en: 'The form is not the end of the journey, but the start of a clearer follow-up.',
        },
      },
    ],
    topicPresets: [
      {
        id: 'order',
        title: { ar: 'طلب جديد', en: 'New order' },
        description: {
          ar: 'مناسب إذا كنت تريد المساعدة في اختيار منتج أو كمية قبل تنفيذ الطلب.',
          en: 'Best if you want help choosing the right product or quantity before ordering.',
        },
        subject: 'order',
        message: {
          ar: 'مرحبًا، أريد تنفيذ طلب جديد وأحتاج مساعدة في اختيار المقاس أو الكمية المناسبة.',
          en: 'Hello, I want to place a new order and need help choosing the right size or quantity.',
        },
      },
      {
        id: 'business',
        title: { ar: 'توريد للشركات', en: 'Business supply' },
        description: {
          ar: 'للجهات والمكاتب أو الطلبات المتكررة والأحجام الأكبر.',
          en: 'For offices, organizations, recurring orders, and larger-volume requests.',
        },
        subject: 'inquiry',
        message: {
          ar: 'مرحبًا، أحتاج عرضًا لتوريد دوري أو طلب أكبر يشمل تفاصيل الكميات والأسعار.',
          en: 'Hello, I need a quote for recurring supply or a larger order with quantity and pricing details.',
        },
      },
      {
        id: 'support',
        title: { ar: 'متابعة أو دعم', en: 'Support and follow-up' },
        description: {
          ar: 'للاستفسار عن طلب قائم أو طلب مساعدة سريعة من الفريق.',
          en: 'For checking on an existing order or requesting direct help from the team.',
        },
        subject: 'other',
        message: {
          ar: 'مرحبًا، أحتاج متابعة طلب قائم أو مساعدة مباشرة بخصوص حالة الطلب.',
          en: 'Hello, I need help following up on an existing order or getting a direct status update.',
        },
      },
    ],
  },
} as const;
