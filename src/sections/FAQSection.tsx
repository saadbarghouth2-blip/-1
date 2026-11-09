import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQSectionProps {
  isRTL: boolean;
}

const faqs = [
  {
    qAr: 'ما هي سياسة الطلب والتوصيل داخل الرياض؟',
    qEn: 'What is the order and delivery policy in Riyadh?',
    aAr: 'الحد الأدنى 15 كرتون للمياه العادية، و20 ربطة لرفا مكة المحددة، و10 كراتين للمياه الزجاجية. رسوم التوصيل داخل الرياض 25 ريال. التوصيل مجاني من 20 كرتون عادي أو 35 ربطة أو 15 كرتون زجاج، وجميع العروض توصيلها مجاني. مدة التوصيل من 24 إلى 48 ساعة.',
    aEn: 'Minimums are 15 regular cartons, 20 specified Rafa Makkah bundles, or 10 glass cartons. Riyadh delivery costs 25 SAR. Delivery is free from 20 regular cartons, 35 bundles, or 15 glass cartons, and every offer includes free delivery. Delivery takes 24 to 48 hours.',
    category: 'delivery',
  },
  {
    qAr: 'ما هي المناطق التي يشملها التوصيل؟',
    qEn: 'Which areas does delivery cover?',
    aAr: 'التوصيل متاح حاليًا داخل حدود مدينة الرياض. الدمام مضافة كمدينة قادمة، لكن الطلب إليها لن يتفعل قبل اعتماد قائمة المنتجات المتاحة هناك.',
    aEn: 'Delivery is currently available within Riyadh city limits. Dammam is listed as an upcoming city, but checkout will remain disabled until its available product list is approved.',
    category: 'delivery',
  },
  {
    qAr: 'ما هو الحد الأدنى للطلب؟',
    qEn: 'What is the minimum order?',
    aAr: 'الحد الأدنى 15 كرتون للمياه العادية، و20 ربطة لرفا مكة 250 مل ×24 أو 330 مل ×20، و10 كراتين للمياه الزجاجية.',
    aEn: 'The minimum is 15 regular cartons, 20 Rafa Makkah bundles (250ml ×24 or 330ml ×20), or 10 glass-water cartons.',
    category: 'order',
  },
  {
    qAr: 'كيف أطلب بالجملة لشركتي أو مناسبتي؟',
    qEn: 'How do I order in bulk for my company or event?',
    aAr: 'نقدم عروضاً خاصة للشركات والفعاليات والمناسبات. تواصل معنا عبر واتساب أو صفحة التواصل وسيقوم فريقنا بإعداد عرض مخصص يناسب احتياجاتك من حيث الكمية ونوع المياه وجدول التوصيل. نوفر أيضاً خدمة الاشتراك الشهري.',
    aEn: 'We offer special deals for companies, events, and occasions. Contact us via WhatsApp or the contact page and our team will prepare a customized offer that suits your needs in terms of quantity, water type, and delivery schedule. We also offer monthly subscription service.',
    category: 'order',
  },
  {
    qAr: 'هل المياه آمنة للأطفال والرضع؟',
    qEn: 'Is the water safe for children and infants?',
    aAr: 'نعم، جميع منتجاتنا معتمدة من هيئة الغذاء والدواء السعودية (SFDA) وتتوافق مع معايير منظمة الصحة العالمية. المياه تمر بعمليات تنقية متعددة المراحل وفحوصات جودة يومية لضمان سلامتها الكاملة لجميع الأعمار.',
    aEn: 'Yes, all our products are certified by the Saudi Food and Drug Authority (SFDA) and comply with World Health Organization standards. Water undergoes multi-stage purification processes and daily quality checks to ensure complete safety for all ages.',
    category: 'quality',
  },
  {
    qAr: 'ما هي سياسة الإرجاع والاستبدال؟',
    qEn: 'What is the return and exchange policy?',
    aAr: 'نقدم سياسة إرجاع مرنة لمدة 7 أيام من تاريخ الاستلام. إذا وجدت أي خلل بالمنتج أو لم يكن مطابقاً لطلبك، نستبدله فوراً دون أي تكلفة إضافية. رضاك هو أولويتنا القصوى.',
    aEn: 'We offer a flexible 7-day return policy from the date of receipt. If you find any defect in the product or it does not match your order, we will replace it immediately at no additional cost. Your satisfaction is our top priority.',
    category: 'returns',
  },
  {
    qAr: 'هل يتوفر توصيل في نفس اليوم؟',
    qEn: 'Is same-day delivery available?',
    aAr: 'مدة التوصيل المعتمدة داخل حدود مدينة الرياض من 24 إلى 48 ساعة بعد تأكيد الطلب وتوفر المنتجات.',
    aEn: 'The standard delivery time within Riyadh city limits is 24 to 48 hours after order confirmation and availability checks.',
    category: 'delivery',
  },
  {
    qAr: 'ما طرق الدفع المتاحة؟',
    qEn: 'What payment methods are available?',
    aAr: 'المتاح حاليًا الدفع عند الاستلام أو التحويل البنكي أو شبكة مع المندوب. الدفع الإلكتروني سيُفعّل بعد استلام حساب شركة المدفوعات ومفاتيح الإنتاج وبيانات Webhook للتحقق من حالة العملية.',
    aEn: 'Cash on delivery, bank transfer, and a card machine with the driver are currently available. Online payment will be enabled after receiving the provider account, production keys, and webhook verification details.',
    category: 'payment',
  },
  {
    qAr: 'هل تقدمون خدمة الاشتراك الشهري؟',
    qEn: 'Do you offer monthly subscription service?',
    aAr: 'نعم! نوفر خدمة الاشتراك الشهري بأسعار مخفضة تصل إلى 15% عن السعر العادي. يمكنك تحديد الكمية والنوع وموعد التوصيل الذي يناسبك، مع إمكانية تعديل أو إلغاء الاشتراك في أي وقت.',
    aEn: 'Yes! We offer a monthly subscription service with discounted prices up to 15% off the regular price. You can specify the quantity, type, and delivery schedule that suits you, with the ability to modify or cancel the subscription at any time.',
    category: 'order',
  },
];

const categories = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'delivery', labelAr: 'التوصيل', labelEn: 'Delivery' },
  { id: 'order', labelAr: 'الطلبات', labelEn: 'Orders' },
  { id: 'quality', labelAr: 'الجودة', labelEn: 'Quality' },
  { id: 'returns', labelAr: 'الإرجاع', labelEn: 'Returns' },
  { id: 'payment', labelAr: 'الدفع', labelEn: 'Payment' },
];

export default function FAQSection({ isRTL }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const currentFaqs = faqs.filter((_, index) => ![1, 6].includes(index));
  const filtered = activeCategory === 'all' ? currentFaqs : currentFaqs.filter(f => f.category === activeCategory);

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#f0f9ff]">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4"
          >
            <HelpCircle className="w-4 h-4" />
            {isRTL ? 'أسئلة شائعة' : 'FAQ'}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            {isRTL ? 'أسئلة يسألها عملاؤنا دائماً' : 'Questions Our Customers Always Ask'}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            {isRTL
              ? 'إجابات مفصّلة لأكثر الأسئلة شيوعاً حول خدماتنا ومنتجاتنا'
              : 'Detailed answers to the most common questions about our services and products'}
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center mb-8 sm:mb-10 snap-x snap-mandatory">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenIndex(0); }}
              className={`flex-shrink-0 snap-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#153b66] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-[#edf4fa] hover:border-[#153b66]/20'
              }`}
            >
              {isRTL ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filtered.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={`${activeCategory}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#153b66]/20 bg-white shadow-lg shadow-[#153b66]/5'
                    : 'border-gray-100 bg-white/80 hover:border-[#153b66]/10'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-start"
                >
                  <div className={`flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 transition-colors ${
                    isOpen
                      ? 'bg-gradient-to-br from-[#153b66] to-[#2b648c] text-white'
                      : 'bg-[#edf4fa] text-[#153b66]'
                  }`}>
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <span className={`flex-1 font-semibold text-sm sm:text-base transition-colors ${
                    isOpen ? 'text-[#153b66]' : 'text-gray-800'
                  }`}>
                    {isRTL ? faq.qAr : faq.qEn}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 ${isOpen ? 'text-[#153b66]' : 'text-gray-400'}`}
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-4 pb-5 sm:px-5 sm:pb-6">
                        <div className="ps-11 sm:ps-14">
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {isRTL ? faq.aAr : faq.aEn}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-[#153b66]/5 to-[#2b648c]/5 rounded-2xl p-6 sm:p-8 border border-[#153b66]/10">
            <div className="w-10 h-10 bg-gradient-to-br from-[#153b66] to-[#2b648c] rounded-xl flex items-center justify-center sm:w-12 sm:h-12">
              <MessageCircle className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            </div>
            <div className="text-center sm:text-start">
              <p className="font-bold text-gray-800">
                {isRTL ? 'ما لقيت إجابتك؟' : "Didn't find your answer?"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {isRTL ? 'تواصل معنا مباشرة وسنرد عليك خلال دقائق' : 'Contact us directly and we will respond within minutes'}
              </p>
            </div>
            <Link
              to="/contact"
              className="px-6 py-3 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base whitespace-nowrap"
            >
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
