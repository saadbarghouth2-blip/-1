import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_NUMBERS,
  WHATSAPP_LINK,
} from '../lib/contact';
import { SITE_ADDRESS_AR, SITE_ADDRESS_EN } from '../lib/site';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const isRTL = i18n.language === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert(isRTL ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: isRTL ? 'الهاتف' : 'Phone',
      content: CONTACT_PHONE_NUMBERS.map((phone) => phone.display).join(' / '),
      subContent: isRTL ? 'متاح على مدار الساعة' : 'Available 24/7',
    },
    {
      icon: Mail,
      title: isRTL ? 'البريد الإلكتروني' : 'Email',
      content: CONTACT_EMAIL,
      subContent: isRTL ? 'نرد خلال 24 ساعة' : 'Reply within 24 hours',
    },
    {
      icon: MapPin,
      title: isRTL ? 'العنوان' : 'Address',
      content: isRTL ? SITE_ADDRESS_AR : SITE_ADDRESS_EN,
      subContent: isRTL ? 'توصيل لجميع المناطق' : 'Delivery to all areas',
    },
    {
      icon: Clock,
      title: isRTL ? 'ساعات العمل' : 'Working Hours',
      content: isRTL ? '24 ساعة / 7 أيام' : '24 hours / 7 days',
      subContent: isRTL ? 'خدمة توصيل مستمرة' : 'Continuous delivery service',
    },
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-[#edf4fa] to-white"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 bg-[#153b66]/10 text-[#153b66] rounded-full text-sm font-medium mb-4"
          >
            {isRTL ? 'تواصل معنا' : 'Get in Touch'}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('nav.contact')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {isRTL
              ? 'نحن هنا لمساعدتك. تواصل معنا للاستفسارات والطلبات'
              : 'We are here to help. Contact us for inquiries and orders'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                    className="w-14 h-14 bg-gradient-to-br from-[#153b66] to-[#2b648c] rounded-xl flex items-center justify-center mb-4"
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-[#153b66] font-medium">{item.content}</p>
                  <p className="text-gray-500 text-sm">{item.subContent}</p>
                </motion.div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">
                    {isRTL ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {isRTL ? 'رد سريع على استفساراتك' : 'Quick response to your inquiries'}
                  </p>
                </div>
                <motion.a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-green-600 rounded-full font-semibold"
                >
                  {isRTL ? 'تواصل الآن' : 'Chat Now'}
                </motion.a>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {isRTL ? 'أرسل لنا رسالة' : 'Send us a Message'}
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {isRTL ? 'الاسم' : 'Name'}
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                    className="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-[#153b66] focus:ring-[#153b66]"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your email'}
                      className="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-[#153b66] focus:ring-[#153b66]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {isRTL ? 'الهاتف' : 'Phone'}
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={isRTL ? 'رقم هاتفك' : 'Your phone number'}
                      className="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-[#153b66] focus:ring-[#153b66]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {isRTL ? 'الرسالة' : 'Message'}
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-[#153b66] focus:ring-[#153b66] resize-none"
                    required
                  />
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isRTL ? 'إرسال الرسالة' : 'Send Message'}</span>
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
