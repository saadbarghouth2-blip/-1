import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeliveryCoverageProps { isRTL: boolean; }

const cities = [
  { id: 'riyadh', ar: 'الرياض', en: 'Riyadh', active: true },
  { id: 'dammam', ar: 'الدمام', en: 'Dammam', active: true },
  { id: 'al-ahsa', ar: 'الأحساء', en: 'Al-Ahsa', active: true },
  { id: 'jeddah', ar: 'جدة', en: 'Jeddah', active: false },
  { id: 'makkah', ar: 'مكة المكرمة', en: 'Makkah', active: false },
  { id: 'madinah', ar: 'المدينة المنورة', en: 'Madinah', active: false },
];

export default function DeliveryCoverage({ isRTL }: DeliveryCoverageProps) {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-[#edf4fa] via-white to-white py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800"><Truck className="h-4 w-4" /> {isRTL ? 'تغطية التوصيل' : 'Delivery coverage'}</span>
          <h2 className="mt-5 text-3xl font-black text-[#153b66] sm:text-4xl">{isRTL ? 'نوصل طلبك للمدن المتاحة' : 'We deliver to available cities'}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{isRTL ? 'الرياض والدمام والأحساء متاحة الآن. المدن الأخرى تظهر بوضوح فور اعتماد المنتجات الخاصة بها.' : 'Riyadh, Dammam and Al-Ahsa are available now. Other cities will be activated as soon as their products are approved.'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }} className="mt-10 overflow-hidden rounded-[2rem] border border-[#153b66]/10 bg-white shadow-xl shadow-[#153b66]/10">
          <div className="flex flex-col gap-4 bg-gradient-to-l from-[#153b66] via-[#205785] to-[#2b648c] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-sm font-bold text-white/75">{isRTL ? 'مدينة التوصيل' : 'Delivery city'}</p>
              <h3 className="mt-2 text-2xl font-black sm:text-3xl">{isRTL ? 'اختر المدينة المناسبة لطلبك' : 'Choose the city for your order'}</h3>
              <p className="mt-2 text-sm text-white/80">{isRTL ? 'موعد التوصيل المتوقع: خلال 24 إلى 48 ساعة.' : 'Expected delivery: within 24 to 48 hours.'}</p>
            </div>
            <MapPin className="h-12 w-12 text-[#8ad8ff] sm:h-14 sm:w-14" />
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
            {cities.map((city, index) => (
              <motion.div key={city.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} className={`rounded-2xl border p-4 text-center ${city.active ? 'border-emerald-200 bg-emerald-50/70' : 'border-amber-200 bg-amber-50/60'}`}>
                <div className="flex items-center justify-center gap-2">
                  {city.active ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Clock className="h-5 w-5 text-amber-700" />}
                  <p className={`font-black ${city.active ? 'text-[#153b66]' : 'text-amber-800'}`}>{isRTL ? city.ar : city.en}</p>
                </div>
                <p className={`mt-1 text-xs font-semibold ${city.active ? 'text-emerald-700' : 'text-amber-700'}`}>{city.active ? (isRTL ? 'متاح للتوصيل الآن' : 'Available now') : (isRTL ? 'بانتظار اعتماد المنتجات' : 'Awaiting product approval')}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3 border-t border-slate-100 p-6 text-center sm:flex-row sm:justify-between sm:text-start">
            <p className="text-sm font-bold text-[#153b66]">{isRTL ? 'رسوم التوصيل 25 ريال قبل بلوغ حد التوصيل المجاني.' : 'Delivery costs 25 SAR before the free-delivery threshold.'}</p>
            <Link to="/checkout" className="inline-flex items-center justify-center rounded-xl bg-[#153b66] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0f2f53]">{isRTL ? 'ابدأ طلبك الآن' : 'Start your order'}</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
