import { motion } from 'framer-motion';
import {
  ShieldCheck, Truck, RotateCcw, Headphones, ThumbsUp,
  Leaf, CreditCard, Timer, BadgeCheck, Gem
} from 'lucide-react';

interface TrustBadgesProps {
  isRTL: boolean;
}

const badges = [
  {
    icon: ShieldCheck,
    titleAr: 'SFDA معتمد',
    titleEn: 'SFDA Approved',
    descAr: 'جميع منتجاتنا معتمدة من هيئة الغذاء والدواء',
    descEn: 'All our products are approved by the Saudi FDA',
  },
  {
    icon: Truck,
    titleAr: 'شحن مجاني',
    titleEn: 'Free Shipping',
    descAr: 'للطلبات فوق 200 ريال في الرياض',
    descEn: 'On orders above SAR 200 in Riyadh',
  },
  {
    icon: RotateCcw,
    titleAr: 'إرجاع سهل',
    titleEn: 'Easy Returns',
    descAr: 'سياسة إرجاع مرنة خلال 7 أيام',
    descEn: 'Flexible 7-day return policy',
  },
  {
    icon: Headphones,
    titleAr: 'دعم مباشر',
    titleEn: 'Live Support',
    descAr: 'فريقنا جاهز عبر واتساب والهاتف',
    descEn: 'Our team is available via WhatsApp & phone',
  },
  {
    icon: ThumbsUp,
    titleAr: 'ضمان الجودة',
    titleEn: 'Quality Guarantee',
    descAr: 'فحص يومي وشهادات جودة عالمية',
    descEn: 'Daily testing with international certifications',
  },
  {
    icon: Leaf,
    titleAr: 'صديق للبيئة',
    titleEn: 'Eco-Friendly',
    descAr: 'عبوات قابلة لإعادة التدوير بنسبة 100%',
    descEn: '100% recyclable packaging',
  },
  {
    icon: CreditCard,
    titleAr: '\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a',
    titleEn: 'Bank Transfer',
    descAr: '\u062a\u0623\u0643\u064a\u062f \u064a\u062f\u0648\u064a \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u062f\u0648\u0646 \u0631\u0633\u0648\u0645 \u0628\u0648\u0627\u0628\u0629 \u062f\u0641\u0639',
    descEn: 'Manual WhatsApp confirmation with no payment gateway fees',
  },
  {
    icon: Timer,
    titleAr: 'توصيل فوري',
    titleEn: 'Express Delivery',
    descAr: 'نفس اليوم في الرياض قبل 2 مساءً',
    descEn: 'Same day in Riyadh before 2 PM',
  },
  {
    icon: BadgeCheck,
    titleAr: 'ISO معتمد',
    titleEn: 'ISO Certified',
    descAr: 'معتمدون بشهادة ISO 22000 لسلامة الغذاء',
    descEn: 'Certified with ISO 22000 for food safety',
  },
  {
    icon: Gem,
    titleAr: 'خدمة متميزة',
    titleEn: 'Premium Service',
    descAr: 'تجربة تسوق فاخرة من الطلب حتى التسليم',
    descEn: 'Premium shopping experience from order to delivery',
  },
];

export default function TrustBadges({ isRTL }: TrustBadgesProps) {
  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {isRTL ? 'ليش تثق فينا؟' : 'Why Trust Us?'}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            {isRTL
              ? '10 أسباب تجعلنا خيارك الأول للمياه المعبأة'
              : '10 reasons that make us your #1 choice for bottled water'}
          </p>
        </motion.div>

        {/* Badges Grid - 2 columns mobile, 5 columns desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="group bg-gradient-to-br from-[#f8fcff] to-white rounded-2xl p-4 sm:p-5 border border-[#edf4fa] hover:border-[#153b66]/20 hover:shadow-lg hover:shadow-[#153b66]/5 transition-all text-center"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 mx-auto mb-3 bg-gradient-to-br from-[#edf4fa] to-[#d6e3ef] rounded-xl flex items-center justify-center group-hover:from-[#153b66] group-hover:to-[#2b648c] transition-all duration-300">
                <badge.icon className="w-4 h-4 sm:w-6 sm:h-6 text-[#153b66] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">{isRTL ? badge.titleAr : badge.titleEn}</h3>
              <p className="text-gray-500 text-[10px] sm:text-xs leading-relaxed">
                {isRTL ? badge.descAr : badge.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
