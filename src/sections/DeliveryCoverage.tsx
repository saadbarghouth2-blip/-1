import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Truck, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeliveryCoverageProps {
  isRTL: boolean;
}

const regions = [
  {
    id: 'riyadh',
    nameAr: 'الرياض',
    nameEn: 'Riyadh',
    descAr: 'التوصيل متاح للطلبات المنزلية والمكتبية والجملة داخل نطاق المدينة.',
    descEn: 'Delivery is available for home, office and bulk orders within the city.',
    deliveryAr: 'خلال 24 إلى 48 ساعة',
    deliveryEn: 'Within 24 to 48 hours',
    statusAr: 'متاح الآن',
    statusEn: 'Available now',
    areasAr: ['طلبات المنازل', 'المكاتب', 'الضيافة', 'طلبات الجملة'],
    areasEn: ['Home orders', 'Offices', 'Hospitality', 'Bulk orders'],
    accent: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'dammam',
    nameAr: 'الدمام',
    nameEn: 'Dammam',
    descAr: 'مرحلة التوسع الحالية لخدمة الطلبات المنزلية والتجارية.',
    descEn: 'Our current expansion phase for home and commercial orders.',
    deliveryAr: 'خلال 24 إلى 48 ساعة',
    deliveryEn: 'Within 24 to 48 hours',
    statusAr: 'متاح الآن',
    statusEn: 'Available now',
    areasAr: ['طلبات المنازل', 'المكاتب', 'الضيافة', 'طلبات الجملة'],
    areasEn: ['Home orders', 'Offices', 'Hospitality', 'Bulk orders'],
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'al-ahsa',
    nameAr: 'الأحساء',
    nameEn: 'Al-Ahsa',
    descAr: 'مرحلة التوسع الحالية لخدمة المنازل والجهات التجارية والطلبات الكبيرة.',
    descEn: 'Our current expansion phase for homes, businesses and larger orders.',
    deliveryAr: 'خلال 24 إلى 48 ساعة',
    deliveryEn: 'Within 24 to 48 hours',
    statusAr: 'متاح الآن',
    statusEn: 'Available now',
    areasAr: ['طلبات المنازل', 'المكاتب', 'الضيافة', 'طلبات الجملة'],
    areasEn: ['Home orders', 'Offices', 'Hospitality', 'Bulk orders'],
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'jeddah',
    nameAr: 'جدة',
    nameEn: 'Jeddah',
    descAr: 'قيد التجهيز ضمن خطة التوسع التالية بعد تقييم المرحلة الحالية.',
    descEn: 'Being prepared for the next expansion phase after the current rollout.',
    deliveryAr: 'سيتم الإعلان قريبًا',
    deliveryEn: 'Coming soon',
    statusAr: 'قريبًا',
    statusEn: 'Coming soon',
    areasAr: ['إطلاق عند الجاهزية'],
    areasEn: ['Launch upon readiness'],
    accent: 'from-amber-500 to-orange-600',
  },
  {
    id: 'holy-cities',
    nameAr: 'مكة المكرمة والمدينة المنورة',
    nameEn: 'Makkah and Madinah',
    descAr: 'قيد التخطيط للتوسع المستقبلي، وسيتم الإعلان عن التفعيل عند الجاهزية.',
    descEn: 'Planned for future expansion; availability will be announced when ready.',
    deliveryAr: 'سيتم الإعلان قريبًا',
    deliveryEn: 'Coming soon',
    statusAr: 'قريبًا',
    statusEn: 'Coming soon',
    areasAr: ['إطلاق عند الجاهزية'],
    areasEn: ['Launch upon readiness'],
    accent: 'from-rose-500 to-pink-600',
  },
];

export default function DeliveryCoverage({ isRTL }: DeliveryCoverageProps) {
  const [activeRegion, setActiveRegion] = useState(0);
  const region = regions[activeRegion];

  return (
    <section className="overflow-hidden bg-gradient-to-b from-[#edf4fa] via-white to-white py-16 sm:py-24">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center sm:mb-16"
        >
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
          >
            <Truck className="h-4 w-4" />
            {isRTL ? 'تغطية التوصيل' : 'Delivery Coverage'}
          </motion.span>
          <h2 className="mb-4 text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl lg:text-5xl">
            {isRTL ? 'توصيل ريق في المدن المتاحة' : 'Riq delivery in available cities'}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
            {isRTL
              ? 'التوصيل متاح الآن في الرياض والدمام والأحساء، مع توسع مخطط لجدة ومكة المكرمة والمدينة المنورة.'
              : 'Delivery is currently available in Riyadh, Dammam and Al-Ahsa, with Jeddah, Makkah and Madinah planned next.'}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.4fr_1fr]">
          <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-4 lg:mx-0 lg:flex-col lg:overflow-x-visible lg:px-0 lg:pb-0 lg:snap-none">
            {regions.map((entry, index) => (
              <motion.button
                key={entry.id}
                onClick={() => setActiveRegion(index)}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: isRTL ? -4 : 4 }}
                className={`flex min-w-[160px] flex-shrink-0 snap-center items-center gap-3 rounded-2xl px-4 py-4 text-start transition-all duration-300 lg:min-w-0 ${
                  activeRegion === index
                    ? `bg-gradient-to-r ${entry.accent} text-white shadow-lg`
                    : 'border border-gray-100 bg-white text-gray-700 shadow-sm hover:bg-gray-50'
                }`}
              >
                <MapPin className={`h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 ${activeRegion === index ? 'text-white' : 'text-gray-400'}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold sm:text-base">{isRTL ? entry.nameAr : entry.nameEn}</p>
                  <p className={`truncate text-xs ${activeRegion === index ? 'text-white/70' : 'text-gray-400'}`}>
                    {isRTL ? entry.statusAr : entry.statusEn}
                  </p>
                </div>
                <ChevronRight className={`ms-auto h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4 ${activeRegion === index ? 'text-white/60' : 'text-gray-300'} ${isRTL ? 'rotate-180' : ''}`} />
              </motion.button>
            ))}
          </div>

          <motion.div
            key={activeRegion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl"
          >
            <div className={`bg-gradient-to-r ${region.accent} p-6 text-white sm:p-8`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="mb-2 text-2xl font-bold sm:text-3xl">
                    {isRTL ? region.nameAr : region.nameEn}
                  </h3>
                  <p className="max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
                    {isRTL ? region.descAr : region.descEn}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:h-20 sm:w-20"
                >
                  <MapPin className="h-6 w-6 text-white sm:h-10 sm:w-10" />
                </motion.div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
                  <Clock className="mb-2 h-4 w-4 text-[#153b66] sm:h-5 sm:w-5" />
                  <p className="text-xs text-gray-500">{isRTL ? 'مدة التوصيل' : 'Delivery Time'}</p>
                  <p className="mt-1 text-sm font-bold text-gray-800">{isRTL ? region.deliveryAr : region.deliveryEn}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
                  <CheckCircle2 className="mb-2 h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
                  <p className="text-xs text-gray-500">{isRTL ? 'الحالة' : 'Status'}</p>
                  <p className="mt-1 text-sm font-bold text-green-600">{isRTL ? region.statusAr : region.statusEn}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 sm:col-span-1">
                  <Truck className="mb-2 h-4 w-4 text-amber-500 sm:h-5 sm:w-5" />
                  <p className="text-xs text-gray-500">{isRTL ? 'نوع الخدمة' : 'Service Type'}</p>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {isRTL ? 'توصيل مبرد + جملة' : 'Refrigerated + Bulk'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <MapPin className="h-4 w-4 text-[#153b66]" />
                  {isRTL ? 'المناطق المغطاة' : 'Covered Areas'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(isRTL ? region.areasAr : region.areasEn).map((area, index) => (
                    <motion.span
                      key={area}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl bg-[#edf4fa] px-3.5 py-2 text-xs font-medium text-[#153b66] sm:text-sm"
                    >
                      {area}
                    </motion.span>
                  ))}
                  <span className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-medium text-gray-400 sm:text-sm">
                    {isRTL ? '+ مناطق أخرى' : '+ more areas'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  to="/products"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#153b66] to-[#2b648c] py-3 text-center text-sm font-semibold text-white transition-all hover:shadow-lg sm:text-base"
                >
                  {isRTL ? 'اطلب الآن' : 'Order Now'}
                </Link>
                <Link
                  to="/contact"
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:text-base"
                >
                  {isRTL ? 'استفسر عن منطقتك' : 'Ask About Your Area'}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
