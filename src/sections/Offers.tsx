import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Clock, Percent, ArrowRight } from 'lucide-react';

export default function Offers() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const isRTL = i18n.language === 'ar';

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const offers = [
    {
      id: 1,
      title: isRTL ? 'خصم 20% على مياه نوفا' : '20% Off Nova Water',
      description: isRTL
        ? 'احصل على أفضل العروض الموسمية على مياه نوفا الفاخرة'
        : 'Get the best seasonal offers on premium Nova water',
      discount: '20%',
      image: '/images/products_processed/WhatsApp_Image_2026-03-22_at_9.01.01_PM_2.jpg',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 2,
      title: isRTL ? 'عرض خاص على بيرين' : 'Special Berain Offer',
      description: isRTL
        ? 'اشتري 3 واحصل على 1 مجاناً على مياه بيرين 600 مل'
        : 'Buy 3 get 1 free on Berain 600ml water',
      discount: '3+1',
      image: '/images/products_processed/WhatsApp_Image_2026-03-22_at_9.01.00_PM.jpg',
      color: 'from-[#153b66] to-[#2b648c]',
      bgColor: 'bg-blue-50',
    },
    {
      id: 3,
      title: isRTL ? 'توصيل مجاني' : 'Free Delivery',
      description: isRTL
        ? 'توصيل مجاني عند طلب 20 كرتونة أو أكثر'
        : 'Free delivery on orders of 20 cartons or more',
      discount: 'FREE',
      image: '/images/products_processed/WhatsApp_Image_2026-03-22_at_9.00.47_PM.jpg',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <section
      id="offers"
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-white to-[#edf4fa] overflow-hidden"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRTL ? 'عروض محدودة' : 'Limited Time'}</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('offers.title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('offers.subtitle')}
          </p>
        </motion.div>

        {/* Featured Offer - Split Screen */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="relative bg-gradient-to-br from-[#153b66] to-[#0c2340] rounded-3xl overflow-hidden mb-12"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Content Side */}
            <motion.div
              style={{ y: contentY }}
              className="p-8 lg:p-12 flex flex-col justify-center"
            >
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 w-fit"
              >
                <Clock className="w-4 h-4" />
                <span>{isRTL ? 'عرض محدود الوقت' : 'Limited Time Offer'}</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="text-3xl lg:text-4xl font-bold text-white mb-4"
              >
                {offers[0].title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 }}
                className="text-white/80 text-lg mb-8"
              >
                {offers[0].description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8, type: 'spring' }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#153b66]">{offers[0].discount}</span>
                </div>
                <div>
                  <div className="text-white/60 text-sm">{isRTL ? 'خصم' : 'Discount'}</div>
                  <div className="text-white text-2xl font-bold">{isRTL ? 'لفترة محدودة' : 'Limited Time'}</div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-white text-[#153b66] rounded-full font-semibold w-fit group"
              >
                <span>{t('offers.orderNow')}</span>
                <ArrowRight
                  className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                    isRTL ? 'rotate-180' : ''
                  }`}
                />
              </motion.button>
            </motion.div>

            {/* Image Side */}
            <motion.div
              style={{ y: imageY }}
              className="relative h-64 lg:h-auto"
            >
              <motion.div
                initial={{ clipPath: isRTL ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
                animate={isInView ? { clipPath: 'inset(0 0% 0 0%)' } : {}}
                transition={{ delay: 0.4, duration: 1 }}
                className="absolute inset-0"
              >
                <img
                  src={offers[0].image}
                  alt={offers[0].title}
                  className="w-full h-full object-contain p-8"
                />
              </motion.div>
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </motion.div>
          </div>

          {/* Animated Badge */}
          <motion.div
            animate={{ rotateY: [0, 15, 0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 right-8 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="text-center text-white">
              <Percent className="w-6 h-6 mx-auto" />
              <span className="text-sm font-bold">{offers[0].discount}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Other Offers Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {offers.slice(1).map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + index * 0.2 }}
              whileHover={{ y: -10 }}
              className={`relative ${offer.bgColor} rounded-3xl p-6 overflow-hidden group`}
            >
              <div className="flex items-center gap-6">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${offer.color} flex items-center justify-center flex-shrink-0`}
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-16 h-16 object-contain"
                  />
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{offer.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${offer.color} text-white rounded-full text-sm font-medium`}
                  >
                    <span>{t('offers.orderNow')}</span>
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/50 rounded-full blur-2xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
