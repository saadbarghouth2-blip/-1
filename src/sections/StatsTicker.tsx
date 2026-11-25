import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Package, Users, MapPin, Truck, Star, Clock, ShieldCheck, Award,
  TrendingUp, Droplets, Building2, Medal
} from 'lucide-react';
import { brands, products } from '../data/products';

interface StatsTickerProps {
  isRTL: boolean;
}

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref as React.RefObject<HTMLElement>, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2500;
    const steps = 80;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isInView]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export default function StatsTicker({ isRTL }: StatsTickerProps) {
  const bigStats = [
    {
      icon: Package,
      value: products.length,
      suffix: '+',
      labelAr: 'منتج مختلف',
      labelEn: 'Different Products',
      descAr: 'تشكيلة واسعة من مختلف الأحجام والأنواع تلبي جميع الاحتياجات',
      descEn: 'A wide range of sizes and types to meet all needs',
      color: 'from-sky-500 to-blue-600',
    },
    {
      icon: Users,
      value: 50,
      suffix: 'K+',
      labelAr: 'عميل سعيد',
      labelEn: 'Happy Customers',
      descAr: 'يثقون بنا لتوفير المياه النقية لعائلاتهم ومؤسساتهم',
      descEn: 'Trust us to provide pure water for their families and businesses',
      color: 'from-emerald-500 to-green-600',
    },
    {
      icon: MapPin,
      value: 30,
      suffix: '+',
      labelAr: 'مدينة ومنطقة',
      labelEn: 'Cities & Regions',
      descAr: 'تغطية في الرياض والدمام والأحساء',
      descEn: 'Coverage in Riyadh, Dammam and Al-Ahsa',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Award,
      value: brands.length,
      suffix: '+',
      labelAr: 'علامة تجارية موثوقة',
      labelEn: 'Trusted Brands',
      descAr: 'نختار فقط أفضل العلامات المحلية والعالمية',
      descEn: 'We only select the best local and international brands',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const miniStats = [
    { icon: Truck, valueAr: '24 ساعة', valueEn: '24 Hours', labelAr: 'متوسط التوصيل', labelEn: 'Avg. Delivery' },
    { icon: Star, valueAr: '4.8/5', valueEn: '4.8/5', labelAr: 'تقييم العملاء', labelEn: 'Customer Rating' },
    { icon: Clock, valueAr: '10+', valueEn: '10+', labelAr: 'سنوات خبرة', labelEn: 'Years Experience' },
    { icon: ShieldCheck, valueAr: '100%', valueEn: '100%', labelAr: 'نقاء مضمون', labelEn: 'Purity Guaranteed' },
    { icon: TrendingUp, valueAr: '15%', valueEn: '15%', labelAr: 'خصم الاشتراك', labelEn: 'Subscription Discount' },
    { icon: Droplets, valueAr: '7', valueEn: '7', labelAr: 'مراحل تنقية', labelEn: 'Filtration Stages' },
    { icon: Building2, valueAr: '500+', valueEn: '500+', labelAr: 'شركة عميلة', labelEn: 'Corporate Clients' },
    { icon: Medal, valueAr: '4', valueEn: '4', labelAr: 'شهادات اعتماد', labelEn: 'Certifications' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-[#0a1628] via-[#0e2a4a] to-[#0c2340] text-white overflow-hidden relative">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-cyan-400/8 blur-3xl" />
      <div className="absolute -right-12 bottom-10 h-64 w-64 rounded-full bg-sky-500/8 blur-3xl" />

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-cyan-200 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-white/10"
          >
            <TrendingUp className="w-4 h-4" />
            {isRTL ? 'أرقام تتحدث' : 'Numbers That Speak'}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {isRTL ? 'أرقامنا تتحدث عن جودتنا' : 'Our Numbers Speak for Quality'}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            {isRTL
              ? 'سنوات من العمل والتطوير المستمر جعلتنا من أكبر موزعي المياه في المملكة'
              : 'Years of work and continuous development made us one of the largest water distributors in the Kingdom'}
          </p>
        </motion.div>

        {/* Big Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {bigStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 group overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white font-semibold text-sm sm:text-base mb-1">
                  {isRTL ? stat.labelAr : stat.labelEn}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {isRTL ? stat.descAr : stat.descEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mini Stats Marquee */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm py-4 sm:py-5">
          <motion.div
            className="flex gap-6 sm:gap-8 will-change-transform"
            animate={{ x: isRTL ? ['0%', '50%'] : ['0%', '-50%'] }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            style={{ width: 'max-content' }}
          >
            {[...miniStats, ...miniStats, ...miniStats, ...miniStats, ...miniStats, ...miniStats, ...miniStats, ...miniStats].map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-3 flex-shrink-0 px-4"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base whitespace-nowrap">
                    {isRTL ? stat.valueAr : stat.valueEn}
                  </p>
                  <p className="text-slate-400 text-[10px] sm:text-xs whitespace-nowrap">
                    {isRTL ? stat.labelAr : stat.labelEn}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
