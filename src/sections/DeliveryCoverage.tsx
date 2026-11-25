import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeliveryCoverageProps { isRTL: boolean; }

export default function DeliveryCoverage({ isRTL }: DeliveryCoverageProps) {
  const benefits = [
    { icon: MapPin, ar: 'نغطي جميع مناطق المملكة', en: 'Coverage across Saudi Arabia' },
    { icon: Clock, ar: 'موعد متوقع خلال 24 إلى 48 ساعة', en: 'Expected in 24–48 hours' },
    { icon: Truck, ar: 'للمنازل والمكاتب وطلبات الجملة', en: 'Home, office and bulk orders' },
  ];

  return (
    <section className="overflow-hidden bg-gradient-to-b from-[#edf4fa] via-white to-white py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800"><Truck className="h-4 w-4" /> {isRTL ? 'تغطية التوصيل' : 'Delivery coverage'}</span>
          <h2 className="mt-5 text-3xl font-black text-[#153b66] sm:text-4xl">{isRTL ? 'نوصل طلبك إلى أي مكان داخل المملكة' : 'We deliver anywhere in Saudi Arabia'}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{isRTL ? 'عنوان الشركة في الرياض، بينما خدمة التوصيل متاحة في جميع أنحاء المملكة العربية السعودية دون حصرها في مدن محددة.' : 'Our company address is in Riyadh, while delivery is available across Saudi Arabia without limiting service to selected cities.'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }} className="mt-10 overflow-hidden rounded-[2rem] border border-[#153b66]/10 bg-white shadow-xl shadow-[#153b66]/10">
          <div className="bg-gradient-to-l from-[#153b66] via-[#205785] to-[#2b648c] p-6 text-white sm:p-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-white/75">{isRTL ? 'نطاق الخدمة' : 'Service area'}</p><h3 className="mt-2 text-2xl font-black sm:text-3xl">{isRTL ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</h3></div><CheckCircle2 className="h-14 w-14 text-[#8ad8ff]" /></div></div>
          <div className="grid gap-px bg-slate-100 sm:grid-cols-3">{benefits.map(({ icon: Icon, ar, en }) => <div key={en} className="bg-white p-5 text-center sm:p-6"><Icon className="mx-auto h-6 w-6 text-[#2b648c]" /><p className="mt-3 text-sm font-bold text-slate-700">{isRTL ? ar : en}</p></div>)}</div>
          <div className="p-6 text-center"><Link to="/checkout" className="inline-flex items-center justify-center rounded-xl bg-[#153b66] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0f2f53]">{isRTL ? 'ابدأ طلبك الآن' : 'Start your order'}</Link></div>
        </motion.div>
      </div>
    </section>
  );
}
