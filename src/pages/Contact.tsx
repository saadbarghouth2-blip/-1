import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Phone, Mail, MapPin, Clock, Send, MessageCircle, 
  Check, ChevronDown, ChevronUp, Truck, Headphones, Shield,
  Instagram, Twitter, Facebook, ExternalLink, Sparkles,
  TimerReset, BadgeCheck, Activity, Music2
} from 'lucide-react';
import {
  buildContactWhatsAppLink,
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_HREF,
  CONTACT_PHONE_NUMBERS,
  sendContactEmail,
  TIKTOK_LINK,
  WHATSAPP_LINK,
} from '../lib/contact';
import { SITE_ADDRESS_AR, SITE_ADDRESS_EN } from '../lib/site';
import DeliveryCoverage from '../sections/DeliveryCoverage';
import FAQSection from '../sections/FAQSection';

export default function Contact() {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const isRTL = i18n.language === 'ar';
  const fullBleedSectionClassName = '-mx-3 sm:-mx-4 lg:-mx-8 xl:-mx-16';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>('order');
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await sendContactEmail({
        ...formData,
        isRTL,
      });

      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch {
      setSubmitError(
        isRTL
          ? 'تعذر إرسال الرسالة الآن. جرّب واتساب أو أعد المحاولة.'
          : 'Unable to send the message right now. Please try again or use WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: isRTL ? 'الهاتف' : 'Phone',
      content: CONTACT_PHONE_NUMBERS.map((phone) => phone.display).join(' / '),
      subContent: isRTL ? 'متاح على مدار الساعة' : 'Available 24/7',
      color: 'from-green-400 to-green-600',
      action: CONTACT_PHONE_HREF,
    },
    {
      icon: Mail,
      title: isRTL ? 'البريد الإلكتروني' : 'Email',
      content: CONTACT_EMAIL,
      subContent: isRTL ? 'نرد خلال 24 ساعة' : 'Reply within 24 hours',
      color: 'from-blue-400 to-blue-600',
      action: CONTACT_EMAIL_HREF,
    },
    {
      icon: MapPin,
      title: isRTL ? 'العنوان' : 'Address',
      content: isRTL ? SITE_ADDRESS_AR : SITE_ADDRESS_EN,
      subContent: isRTL ? 'توصيل لجميع المناطق' : 'Delivery to all areas',
      color: 'from-red-400 to-red-600',
      action: '#',
    },
    {
      icon: Clock,
      title: isRTL ? 'ساعات العمل' : 'Working Hours',
      content: isRTL ? '24 ساعة / 7 أيام' : '24 hours / 7 days',
      subContent: isRTL ? 'خدمة توصيل مستمرة' : 'Continuous delivery service',
      color: 'from-purple-400 to-purple-600',
      action: '#',
    },
  ];

  const faqs = [
    {
      q: isRTL ? 'ما هي سياسة الطلب والتوصيل؟' : 'What is the order and delivery policy?',
      a: isRTL
        ? 'الحد الأدنى للطلب 10 كراتين. رسوم التوصيل 20 ريال للطلبات الأقل من 20 كرتون، والتوصيل مجاني من 20 كرتون أو أكثر. التوصيل للأرضي بدون رسوم إضافية، الدور الأول 10 ريالات، الدور الثاني 20 ريالا، والأدوار الأعلى يتم الاتفاق عليها حسب حالة الموقع. يجب تسجيل الطلب قبل موعد التوصيل بيوم واحد على الأقل، والتوصيل داخل الرياض من 8:00 صباحا حتى 8:00 مساء وفق المواعيد المتاحة وجدول التشغيل.'
        : 'Minimum order is 10 cartons. Delivery is 20 SAR for orders below 20 cartons, and free from 20 cartons or more. Ground-floor delivery has no extra fee, first floor is 10 SAR, second floor is 20 SAR, and higher floors are quoted by site conditions. Orders should be placed at least one day before delivery. Riyadh delivery runs from 8:00 AM to 8:00 PM according to available slots and the operating schedule.',
    },
    {
      q: isRTL ? 'ما هي مناطق التوصيل المتاحة؟' : 'What are the available delivery areas?',
      a: isRTL 
        ? 'نوفر خدمة التوصيل لجميع مناطق المملكة العربية السعودية بما في ذلك الرياض، جدة، الدمام، مكة المكرمة، المدينة المنورة، وجميع المدن الأخرى. التوصيل داخل المدن الرئيسية يستغرق 24-48 ساعة، بينما المناطق البعيدة قد تستغرق 3-5 أيام عمل.'
        : 'We provide delivery service to all regions of Saudi Arabia including Riyadh, Jeddah, Dammam, Makkah, Madinah, and all other cities. Delivery within major cities takes 24-48 hours, while remote areas may take 3-5 business days.',
    },
    {
      q: isRTL ? 'كم تستغرق عملية التوصيل؟' : 'How long does delivery take?',
      a: isRTL
        ? 'التوصيل داخل المدن الرئيسية (الرياض، جدة، الدمام، مكة، المدينة) يستغرق 24-48 ساعة. أما المناطق البعيدة فقد تستغرق 3-5 أيام عمل. نحن نعمل على تقليل وقت التوصيل قدر الإمكان.'
        : 'Delivery within major cities (Riyadh, Jeddah, Dammam, Makkah, Madinah) takes 24-48 hours. Remote areas may take 3-5 business days. We work to minimize delivery time as much as possible.',
    },
    {
      q: isRTL ? 'ما هي طرق الدفع المتاحة؟' : 'What payment methods are available?',
      a: isRTL
        ? '\u0627\u0644\u0645\u062a\u0627\u062d \u062d\u0627\u0644\u064a\u064b\u0627 \u0647\u0648 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0628\u0646\u0643\u064a \u0627\u0644\u064a\u062f\u0648\u064a \u0645\u0639 \u0625\u0631\u0633\u0627\u0644 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628. \u0628\u0648\u0627\u0628\u0627\u062a \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0645\u062a\u0648\u0642\u0641\u0629 \u0645\u0624\u0642\u062a\u064b\u0627 \u0644\u062d\u064a\u0646 \u0627\u062e\u062a\u064a\u0627\u0631 \u0623\u0646\u0633\u0628 \u0628\u0648\u0627\u0628\u0629 \u062f\u0641\u0639.'
        : 'Manual bank transfer is currently available, with the transfer receipt sent on WhatsApp. Online payment gateways are paused temporarily until we choose the best payment provider.',
    },
    {
      q: isRTL ? 'هل يوجد حد أدنى للطلب؟' : 'Is there a minimum order?',
      a: isRTL
        ? 'الحد الأدنى للتوصيل هو 10 كراتين. رسوم التوصيل 20 ريال للطلبات من 10 إلى 19 كرتونة، والتوصيل مجاني عند طلب 20 كرتونة أو أكثر.'
        : 'The minimum delivery order is 10 cartons. Delivery costs 20 SAR for orders from 10 to 19 cartons, and it is free from 20 cartons or more.',
    },
    {
      q: isRTL ? 'هل يمكنني إرجاع المنتج؟' : 'Can I return the product?',
      a: isRTL
        ? 'نعم، يمكنك إرجاع المنتج خلال 7 أيام من استلامه إذا كان غير مستخدم وفي حالته الأصلية. المنتجات التالفة يمكن استبدالها فوراً دون أي تكلفة إضافية.'
        : 'Yes, you can return the product within 7 days of receipt if unused and in original condition. Damaged products can be replaced immediately without any additional cost.',
    },
    {
      q: isRTL ? 'هل المياه معتمدة من الهيئات الصحية؟' : 'Is the water certified by health authorities?',
      a: isRTL
        ? 'نعم، جميع منتجاتنا معتمدة من الهيئة العامة للغذاء والدواء السعودية وتحمل شهادات الجودة العالمية. نحن نلتزم بأعلى معايير الجودة والسلامة.'
        : 'Yes, all our products are certified by the Saudi Food and Drug Authority and carry international quality certificates. We adhere to the highest quality and safety standards.',
    },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', color: 'from-purple-500 to-pink-500', label: 'Instagram' },
    { icon: Twitter, href: '#', color: 'from-blue-400 to-blue-600', label: 'Twitter' },
    { icon: Facebook, href: '#', color: 'from-blue-600 to-blue-800', label: 'Facebook' },
    { icon: Music2, href: TIKTOK_LINK, color: 'from-slate-900 to-slate-700', label: 'TikTok' },
    { icon: MessageCircle, href: WHATSAPP_LINK, color: 'from-green-500 to-green-600', label: 'WhatsApp' },
  ];

  const inquiryTopics = [
    {
      id: 'order',
      title: isRTL ? 'طلب جديد' : 'New order',
      desc: isRTL ? 'طلب سريع مع تحديد الكمية والمنطقة' : 'Fast order with quantity and area details',
      subject: 'order',
      message: isRTL ? 'مرحباً، أريد تنفيذ طلب جديد وأحتاج معرفة الأنسب من حيث الكمية ووقت التوصيل.' : 'Hello, I want to place a new order and need help choosing the right quantity and delivery time.',
      icon: Sparkles,
    },
    {
      id: 'business',
      title: isRTL ? 'توريد للشركات' : 'Business supply',
      desc: isRTL ? 'للفنادق والمكاتب والفعاليات الكبيرة' : 'For hotels, offices, and large events',
      subject: 'inquiry',
      message: isRTL ? 'أرغب في عرض توريد دوري للشركة/المؤسسة مع تفاصيل الأسعار والكميات.' : 'I would like a recurring supply quote for my company with pricing and quantity details.',
      icon: BadgeCheck,
    },
    {
      id: 'support',
      title: isRTL ? 'دعم ومتابعة' : 'Support',
      desc: isRTL ? 'استفسار عن طلب حالي أو متابعة حالة التوصيل' : 'Track a current order or ask about delivery status',
      subject: 'other',
      message: isRTL ? 'أحتاج متابعة طلب حالي وأرغب في معرفة حالته بالتفصيل.' : 'I need to follow up on an existing order and would like a detailed status update.',
      icon: Activity,
    },
  ];

  const responseHighlights = [
    {
      icon: TimerReset,
      title: isRTL ? 'استجابة أولية سريعة' : 'Fast first response',
      desc: isRTL ? 'نبدأ الرد على الرسائل بشكل سريع ونرتب الأولوية حسب نوع الطلب.' : 'We respond quickly and prioritize requests based on urgency and type.',
    },
    {
      icon: Truck,
      title: isRTL ? 'توجيه أوضح للطلب' : 'Clearer order guidance',
      desc: isRTL ? 'نساعد العميل في اختيار المقاس والكمية الأنسب حسب الاستخدام.' : 'We help shoppers choose the most suitable size and quantity for their use case.',
    },
    {
      icon: Headphones,
      title: isRTL ? 'متابعة بشرية مستمرة' : 'Human follow-up',
      desc: isRTL ? 'ليس مجرد نموذج تواصل، بل متابعة فعلية حتى إغلاق الطلب أو الاستفسار.' : 'This is not just a form, but an actual follow-up path until the request is resolved.',
    },
  ];

  return (
    <main ref={sectionRef} className="min-h-screen relative z-10 py-16 sm:py-20">
      <div className="w-full px-3 sm:px-4 lg:px-8 xl:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10 sm:mb-12"
        >
          <motion.span 
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            className="inline-block px-4 py-2 bg-[#153b66]/10 text-[#153b66] rounded-full text-sm font-medium mb-4"
          >
            {isRTL ? 'تواصل معنا' : 'Get in Touch'}
          </motion.span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            {isRTL ? 'اتصل بنا' : 'Contact Us'}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            {isRTL 
              ? 'نحن هنا لمساعدتك. تواصل معنا للاستفسارات والطلبات وسنكون سعداء بخدمتك'
              : 'We are here to help. Contact us for inquiries and orders, we will be happy to serve you'}
          </p>
        </motion.div>

        {/* Contact Experience */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.95fr]"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#153b66] via-[#245780] to-[#4f7fa5] p-6 text-white shadow-[0_25px_70px_-30px_rgba(21,59,102,0.55)] sm:p-8">
            <div className="absolute -left-8 top-0 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span>{isRTL ? 'تجربة تواصل أغنى وأوضح' : 'A richer and clearer contact experience'}</span>
              </div>
              <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                {isRTL ? 'كل وسيلة تواصل هنا صُممت لتقرب العميل من القرار والطلب' : 'Every contact touchpoint here is designed to move shoppers closer to action'}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                {isRTL
                  ? 'بدل صفحة تواصل تقليدية فقط، أضفنا طبقات توضح سرعة الرد، أفضل قناة للتواصل، ونوع الرسالة المناسب حسب احتياج العميل.'
                  : 'Instead of a plain contact page, we added layers that explain response speed, the best channel to use, and the right message path based on customer intent.'}
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {responseHighlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.24 + index * 0.08 }}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <item.icon className="mb-3 h-4 w-4 text-white sm:h-5 sm:w-5" />
                    <h3 className="mb-1 text-sm font-bold sm:text-base">{item.title}</h3>
                    <p className="text-xs leading-6 text-white/75 sm:text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-100 bg-white p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="mb-4">
              <p className="text-sm font-medium text-[#153b66]">{isRTL ? 'ابدأ من هنا' : 'Start here'}</p>
              <h3 className="text-xl font-bold text-gray-900">
                {isRTL ? 'اختر نوع رسالتك وسنجهز الصياغة مبدئيًا' : 'Choose your request type and we will prefill the message'}
              </h3>
            </div>

            <div className="space-y-3">
              {inquiryTopics.map((topic) => (
                <motion.button
                  key={topic.id}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    setActiveTopic(topic.id);
                    setFormData((current) => ({
                      ...current,
                      subject: topic.subject,
                      message: topic.message,
                    }));
                  }}
                  className={`w-full rounded-2xl border p-4 text-start transition-all ${
                    activeTopic === topic.id
                      ? 'border-[#153b66]/20 bg-[#edf4fa]'
                      : 'border-gray-100 bg-gray-50/80 hover:border-sky-100 hover:bg-sky-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-start">
                      <p className="text-base font-bold text-gray-900">{topic.title}</p>
                      <p className="mt-1 text-xs leading-6 text-gray-500">{topic.desc}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#153b66] to-[#2b648c] text-white sm:h-11 sm:w-11">
                      <topic.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-10 grid grid-cols-1 gap-3 sm:mb-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
        >
          {contactInfo.map((item, index) => (
            <motion.a
              key={index}
              href={item.action}
              whileHover={{ y: -5, scale: 1.02 }}
              className="flex h-full flex-col rounded-xl bg-white p-4 shadow-lg transition-all hover:shadow-xl sm:rounded-2xl sm:p-6"
            >
              <div className={`w-9 h-9 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                <item.icon className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="break-words text-sm font-medium text-[#153b66] sm:text-base">{item.content}</p>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">{item.subContent}</p>
            </motion.a>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                {isRTL ? 'أرسل لنا رسالة' : 'Send us a Message'}
              </h2>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-10 sm:py-16"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-14 h-14 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Check className="w-7 h-7 sm:w-10 sm:h-10 text-green-500" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                      {isRTL ? 'تم إرسال رسالتك!' : 'Your message has been sent!'}
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base">
                      {isRTL ? 'سنقوم بالرد عليك في أقرب وقت ممكن' : 'We will reply to you as soon as possible'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
                          {isRTL ? 'الاسم' : 'Name'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#153b66] focus:ring-2 focus:ring-[#153b66]/20 outline-none transition-all text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
                          {isRTL ? 'البريد الإلكتروني' : 'Email'} *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your email'}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#153b66] focus:ring-2 focus:ring-[#153b66]/20 outline-none transition-all text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
                          {isRTL ? 'الهاتف' : 'Phone'}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={isRTL ? 'رقم هاتفك' : 'Your phone number'}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#153b66] focus:ring-2 focus:ring-[#153b66]/20 outline-none transition-all text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
                          {isRTL ? 'الموضوع' : 'Subject'}
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#153b66] focus:ring-2 focus:ring-[#153b66]/20 outline-none transition-all text-sm sm:text-base"
                        >
                          <option value="">{isRTL ? 'اختر الموضوع' : 'Select subject'}</option>
                          <option value="order">{isRTL ? 'طلب جديد' : 'New Order'}</option>
                          <option value="inquiry">{isRTL ? 'استفسار' : 'Inquiry'}</option>
                          <option value="complaint">{isRTL ? 'شكوى' : 'Complaint'}</option>
                          <option value="suggestion">{isRTL ? 'اقتراح' : 'Suggestion'}</option>
                          <option value="other">{isRTL ? 'أخرى' : 'Other'}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
                        {isRTL ? 'الرسالة' : 'Message'} *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#153b66] focus:ring-2 focus:ring-[#153b66]/20 outline-none transition-all resize-none text-sm sm:text-base"
                      />
                    </div>

                    {submitError && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {submitError}
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg transition-all disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>{isRTL ? 'إرسال الرسالة' : 'Send Message'}</span>
                        </>
                      )}
                    </motion.button>
                    <a
                      href={buildContactWhatsAppLink(formData, isRTL)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 sm:text-base"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{isRTL ? 'أو أرسلها عبر واتساب' : 'Or send it via WhatsApp'}</span>
                    </a>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column - WhatsApp, Features, FAQ */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* WhatsApp CTA */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 text-center sm:text-start">
                  <h3 className="text-lg sm:text-xl font-bold mb-1">
                    {isRTL ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {isRTL ? 'رد سريع على استفساراتك' : 'Quick response to your inquiries'}
                  </p>
                </div>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-green-600 rounded-full font-semibold hover:bg-green-50 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  {isRTL ? 'تواصل الآن' : 'Chat Now'}
                </a>
              </div>
            </motion.div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
              {[
                { icon: Truck, text: isRTL ? 'توصيل سريع' : 'Fast Delivery', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: Headphones, text: isRTL ? 'دعم 24/7' : '24/7 Support', color: 'text-purple-500', bg: 'bg-purple-50' },
                { icon: Shield, text: isRTL ? 'جودة مضمونة' : 'Quality Guaranteed', color: 'text-green-500', bg: 'bg-green-50' },
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -3 }}
                  className={`${feature.bg} flex items-center gap-3 rounded-xl p-3 text-start sm:block sm:p-4 sm:text-center`}
                >
                  <feature.icon className={`h-5 w-5 flex-shrink-0 sm:mx-auto sm:mb-2 sm:h-8 sm:w-8 ${feature.color}`} />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                {isRTL ? 'تابعنا على' : 'Follow Us'}
              </h3>
              <div className="flex gap-2 sm:gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center text-white`}
                  >
                    <social.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h3>
              <div className="space-y-2">
                {faqs.filter((_, index) => ![1, 2].includes(index)).map((faq, index) => (
                  <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="flex w-full items-start justify-between p-3 text-start transition-colors hover:bg-gray-50 sm:p-4"
                    >
                      <span className="pr-2 text-xs font-medium leading-6 text-gray-800 sm:text-sm">{faq.q}</span>
                      {openFaq === index ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-3 sm:px-4 pb-3 sm:pb-4 text-gray-600 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-10 sm:mt-12"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
              {isRTL ? 'موقعنا' : 'Our Location'}
            </h3>
            <div className="h-48 sm:h-64 bg-gradient-to-br from-[#edf4fa] to-[#f0f9ff] rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-[#153b66] mx-auto mb-2" />
                <p className="text-gray-600 text-sm sm:text-base">
                  {isRTL ? SITE_ADDRESS_AR : SITE_ADDRESS_EN}
                </p>
                <a 
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#153b66] mt-2 text-sm hover:underline"
                >
                  {isRTL ? 'فتح في الخرائط' : 'Open in Maps'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <div
          id="delivery-coverage"
          className={`${fullBleedSectionClassName} mt-12 scroll-mt-28 sm:mt-16 sm:scroll-mt-32`}
        >
          <DeliveryCoverage isRTL={isRTL} />
        </div>

        <div
          id="faq"
          className={`${fullBleedSectionClassName} scroll-mt-28 sm:scroll-mt-32`}
        >
          <FAQSection isRTL={isRTL} />
        </div>
      </div>
    </main>
  );
}
