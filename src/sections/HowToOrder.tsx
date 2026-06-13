import { motion } from 'framer-motion';
import {
  Search, ShoppingCart, CreditCard, Truck, CheckCircle,
  ArrowRight, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { WHATSAPP_LINK } from '../lib/contact';
import { brands, products } from '../data/products';

interface HowToOrderProps {
  isRTL: boolean;
}

const orderSteps = [
  {
    icon: Search,
    titleAr: 'تصفح المنتجات',
    titleEn: 'Browse Products',
    descAr: 'اختر من بين أكثر من 41 منتج مياه من 18 علامة تجارية عالمية ومحلية موثوقة.',
    descEn: 'Choose from over 41 water products from 18 trusted international and local brands.',
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    num: '01',
  },
  {
    icon: ShoppingCart,
    titleAr: 'أضف للسلة',
    titleEn: 'Add to Cart',
    descAr: 'حدد الكمية المناسبة وأضف المنتجات لسلتك بكل سهولة عبر واتساب أو الموقع.',
    descEn: 'Choose the right quantity and add products to your cart easily via WhatsApp or our website.',
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    num: '02',
  },
  {
    icon: CreditCard,
    titleAr: '\u0623\u0643\u0645\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644',
    titleEn: 'Complete Transfer',
    descAr: '\u062d\u0648\u0651\u0644 \u0639\u0644\u0649 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064a \u062b\u0645 \u0623\u0631\u0633\u0644 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628 \u0644\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628 \u064a\u062f\u0648\u064a\u064b\u0627.',
    descEn: 'Transfer to the bank account, then send the receipt on WhatsApp so the order can be confirmed manually.',
    color: 'bg-violet-500',
    lightBg: 'bg-violet-50',
    num: '03',
  },
  {
    icon: Truck,
    titleAr: 'توصيل الرياض فقط',
    titleEn: 'Riyadh Delivery Only',
    descAr: 'خدمتنا مخصصة حالياً لمدينة الرياض لضمان استلام طلبك بارداً وبأسرع وقت ممكن خلال 24 ساعة.',
    descEn: 'Our service is currently dedicated to Riyadh to ensure you receive your order fresh and fast within 24h.',
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    num: '04',
  },
  {
    icon: CheckCircle,
    titleAr: 'استلم واستمتع!',
    titleEn: 'Receive & Enjoy!',
    descAr: 'استلم مياهك النقية والطازجة واستمتع بأعلى جودة مع ضمان كامل ورضا تام.',
    descEn: 'Receive your pure, fresh water and enjoy the highest quality with full guarantee and complete satisfaction.',
    color: 'bg-teal-500',
    lightBg: 'bg-teal-50',
    num: '05',
  },
];

export default function HowToOrder({ isRTL }: HowToOrderProps) {
  const resolvedOrderSteps = orderSteps.map((step, index) => (
    index === 0
      ? {
        ...step,
        descAr: `اختر من بين ${products.length} منتج مياه من ${brands.length} علامة تجارية موثوقة داخل الكتالوج الحالي.`,
        descEn: `Choose from ${products.length} water products across ${brands.length} trusted brands in the current catalog.`,
      }
      : step
  ));

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#f0f9ff] to-white overflow-hidden">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#153b66]/10 text-[#153b66] rounded-full text-sm font-medium mb-4"
          >
            <ShoppingCart className="w-4 h-4" />
            {isRTL ? 'كيف تطلب؟' : 'How to Order?'}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            {isRTL ? 'اطلب في 5 خطوات بسيطة' : 'Order in 5 Simple Steps'}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            {isRTL
              ? 'عملية سهلة وسريعة من التصفح حتى الاستلام'
              : 'An easy and fast process from browsing to delivery'}
          </p>
        </motion.div>

        {/* Steps - Vertical Timeline on Mobile, Horizontal on Desktop */}
        <div className="max-w-5xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4 relative">
            {/* Connector Line */}
            <div className="absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-300 via-emerald-300 via-violet-300 via-amber-300 to-teal-300 z-0" />
            
            {resolvedOrderSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center z-10"
              >
                {/* Step Circle */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className={`w-[72px] h-[72px] ${step.color} rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-5`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                {/* Step Number */}
                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold mb-3">
                  {step.num}
                </span>
                
                <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
                  {isRTL ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  {isRTL ? step.descAr : step.descEn}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Mobile Layout - Vertical */}
          <div className="lg:hidden space-y-4">
            {resolvedOrderSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex gap-4 items-start"
              >
                {/* Step Icon & Line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  {index < orderSteps.length - 1 && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-gray-200 to-gray-100 mt-2" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className={`${step.lightBg} rounded-2xl p-4 flex-1`}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {isRTL ? `خطوة ${step.num}` : `Step ${step.num}`}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800 mt-1 mb-1.5">
                    {isRTL ? step.titleAr : step.titleEn}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {isRTL ? step.descAr : step.descEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-12 sm:mt-16"
        >
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105 text-sm sm:text-base"
          >
            <span>{isRTL ? 'ابدأ التسوق الآن' : 'Start Shopping Now'}</span>
            <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-all hover:scale-105 text-sm sm:text-base"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{isRTL ? 'اطلب عبر واتساب' : 'Order via WhatsApp'}</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
