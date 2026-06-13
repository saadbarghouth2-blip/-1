import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Music2,
  ArrowUp,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import LogoMark from '../components/LogoMark';
import {
  BUSINESS_COMMERCIAL_REGISTRATION,
  BUSINESS_LEGAL_NAME_AR,
  BUSINESS_LEGAL_NAME_EN,
  BUSINESS_LICENSE_NUMBER,
  BUSINESS_REGISTRATION_STATUS_AR,
  BUSINESS_REGISTRATION_STATUS_EN,
  BUSINESS_TAX_NUMBER,
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_PHONE_NUMBERS,
  TIKTOK_LINK,
} from '../lib/contact';
import { BRAND_NAME_AR, BRAND_NAME_EN, BRAND_NAME_LOCKUP } from '../lib/brand';

function VatLogo() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-[#0f6b5a] text-white" aria-hidden="true">
      <div className="flex flex-1 items-center justify-center px-2 text-center text-[0.58rem] font-black leading-tight">
        TAX
      </div>
      <div className="bg-[#d6a529] px-2 py-1 text-center text-sm font-black leading-none">
        VAT
      </div>
    </div>
  );
}

function OfficialImageLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-contain"
      loading="lazy"
      decoding="async"
    />
  );
}

export default function Footer() {
  const { i18n } = useTranslation();
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-50px' });
  const isRTL = i18n.language === 'ar';

  const footerQuickLinks = [
    { label: isRTL ? '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629' : 'Home', href: '/' },
    { label: isRTL ? '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a' : 'Products', href: '/products' },
    { label: isRTL ? '\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a' : 'Brands', href: '/brands' },
    { label: isRTL ? '\u0627\u0644\u0639\u0631\u0648\u0636' : 'Offers', href: '/offers' },
    { label: isRTL ? '\u0645\u0646 \u0646\u062d\u0646' : 'About', href: '/about' },
    { label: isRTL ? '\u0643\u064a\u0641 \u0623\u0637\u0644\u0628\u061f' : 'How to Order?', href: '/products#how-to-order' },
  ];

  const footerServiceLinks = [
    { label: isRTL ? '\u0644\u0645\u0627\u0630\u0627 \u062a\u062b\u0642 \u0641\u064a\u0646\u0627\u061f' : 'Why Trust Us?', href: '/about#why-trust-us' },
    { label: isRTL ? '\u0644\u0645\u0627\u0630\u0627 \u062a\u062e\u062a\u0627\u0631 \u0645\u062a\u062c\u0631 \u0631\u064a\u0642\u061f' : 'Why Choose Riq?', href: '/about#why-choose-riq' },
    { label: isRTL ? '\u0643\u064a\u0641 \u0646\u0636\u0645\u0646 \u0644\u0643 \u0623\u0646\u0642\u0649 \u0645\u064a\u0627\u0647\u061f' : 'How We Ensure Pure Water?', href: '/about#water-process' },
    { label: isRTL ? '\u0627\u0639\u0631\u0641 \u0627\u0644\u0641\u0631\u0642 \u0628\u064a\u0646 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0645\u064a\u0627\u0647' : 'Water Types Guide', href: '/products#water-comparison' },
    { label: isRTL ? '\u0627\u0644\u062a\u0648\u0635\u064a\u0644' : 'Delivery Coverage', href: '/contact#delivery-coverage' },
    { label: isRTL ? '\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629' : 'FAQ', href: '/contact#faq' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Music2, href: TIKTOK_LINK, label: 'TikTok' },
  ];

  const paymentMethods: Array<{
    name: string;
    src: string;
    frameClassName: string;
    imageClassName: string;
  }> = [];

  const officialDetails = [
    {
      label: isRTL ? '\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629' : 'Company Name',
      value: isRTL ? BUSINESS_LEGAL_NAME_AR : BUSINESS_LEGAL_NAME_EN,
      logo: <LogoMark scaleClassName="scale-[1.05]" />,
      accent: 'text-[#bae6fd]',
      logoFrameClassName:
        'flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-white/10 p-2 ring-1 ring-white/10 sm:h-16 sm:w-16',
    },
    {
      label: isRTL ? '\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0636\u0631\u064a\u0628\u064a' : 'Tax Number',
      value: BUSINESS_TAX_NUMBER,
      logo: <VatLogo />,
      accent: 'text-[#8ad8ff]',
      logoFrameClassName:
        'flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-white/10 p-1 ring-1 ring-white/10 sm:h-16 sm:w-16',
    },
    {
      label: isRTL ? '\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0648\u0637\u0646\u064a \u0627\u0644\u0645\u0648\u062d\u062f' : 'Unified National No.',
      value: BUSINESS_COMMERCIAL_REGISTRATION,
      logo: (
        <OfficialImageLogo
          src="/images/ministry-of-commerce-logo.svg"
          alt={isRTL ? '\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u0629' : 'Ministry of Commerce'}
        />
      ),
      accent: 'text-[#7dd3fc]',
      logoFrameClassName:
        'flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-white p-2 ring-1 ring-white/10 sm:h-16 sm:w-16',
    },
    {
      label: isRTL ? '\u0631\u0642\u0645 \u0627\u0644\u0633\u062c\u0644 / \u0627\u0644\u0631\u062e\u0635\u0629' : 'CR / License Number',
      value: BUSINESS_LICENSE_NUMBER,
      logo: (
        <OfficialImageLogo
          src="/images/images.png"
          alt={isRTL ? '\u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0633\u0639\u0648\u062f\u064a \u0644\u0644\u0623\u0639\u0645\u0627\u0644' : 'Saudi Business Center'}
        />
      ),
      accent: 'text-[#5eead4]',
      logoFrameClassName:
        'flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-white p-0.5 ring-1 ring-white/10 sm:h-16 sm:w-16',
    },
    {
      label: isRTL ? '\u062d\u0627\u0644\u0629 \u0627\u0644\u0633\u062c\u0644' : 'Registration Status',
      value: isRTL ? BUSINESS_REGISTRATION_STATUS_AR : BUSINESS_REGISTRATION_STATUS_EN,
      logo: (
        <OfficialImageLogo
          src="/images/ministry-of-commerce-logo.svg"
          alt={isRTL ? '\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u0629' : 'Ministry of Commerce'}
        />
      ),
      accent: 'text-[#86efac]',
      logoFrameClassName:
        'flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-white p-2 ring-1 ring-white/10 sm:h-16 sm:w-16',
    },
  ];
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#0c2340] to-[#0a1628] text-white"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: 10 + ((i * 17) % 30),
              height: 10 + ((i * 17) % 30),
              left: `${(i * 23) % 100}%`,
              bottom: -50,
            }}
            animate={{
              y: [0, -900],
              x: [0, Math.sin(i) * 50],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 10 + (i % 8),
              repeat: Infinity,
              delay: i * 0.45,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="absolute left-0 right-0 top-0">
        <motion.svg
          viewBox="0 0 1440 60"
          fill="none"
          className="w-full"
          preserveAspectRatio="none"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path fill="#edf4fa" d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" />
        </motion.svg>
      </div>

      <div className="relative z-10 w-full px-4 pb-14 pt-24 sm:px-6 sm:pb-10 lg:px-12 xl:px-20">
        <div className="mb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="group mb-8 flex items-center gap-4">
              <div className="flex h-20 w-24 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-[#153b66] via-[#1f4f7b] to-[#5a87aa] p-2 shadow-2xl shadow-cyan-500/40 ring-1 ring-white/15 transition-transform group-hover:scale-110 sm:h-24 sm:w-28">
                <LogoMark scaleClassName="scale-[1.18]" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black leading-none tracking-tight sm:text-3xl">{BRAND_NAME_EN}</div>
                <div className="text-sm font-semibold leading-none text-white/75 sm:text-base">{BRAND_NAME_AR}</div>
              </div>
            </Link>
            <p className="mb-6 leading-relaxed text-white/70">
              {isRTL
                ? '\u0648\u062c\u0647\u062a\u0643 \u0627\u0644\u0623\u0648\u0644\u0649 \u0644\u0644\u0645\u064a\u0627\u0647 \u0627\u0644\u0645\u0639\u0628\u0623\u0629 \u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062c\u0648\u062f\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0631\u064a\u0627\u0636. \u0646\u0648\u0641\u0631 \u0644\u0643 \u0645\u0646\u062a\u062c\u0627\u062a \u0645\u0648\u062b\u0648\u0642\u0629 \u0645\u0646 \u0639\u0644\u0627\u0645\u0627\u062a \u0645\u062d\u0644\u064a\u0629 \u0648\u0639\u0627\u0644\u0645\u064a\u0629 \u0645\u0639 \u062a\u062c\u0631\u0628\u0629 \u0637\u0644\u0628 \u0633\u0647\u0644\u0629 \u0648\u0633\u0631\u064a\u0639\u0629.'
                : 'Your first destination for high-quality bottled water in Riyadh, with trusted local and international brands and a smoother ordering experience.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#153b66] sm:h-10 sm:w-10"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="mb-6 text-lg font-bold">{isRTL ? '\u0631\u0648\u0627\u0628\u0637 \u0633\u0631\u064a\u0639\u0629' : 'Quick Links'}</h3>
            <ul className="space-y-3">
              {footerQuickLinks.map((link) => (
                <motion.li key={link.href} whileHover={{ x: isRTL ? -5 : 5 }}>
                  <Link to={link.href} className="group inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                    <span className="h-0.5 w-0 bg-[#2b648c] transition-all group-hover:w-4" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="mb-6 text-lg font-bold">{isRTL ? '\u062e\u062f\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621' : 'Customer Service'}</h3>
            <ul className="space-y-3">
              {footerServiceLinks.map((link) => (
                <motion.li key={link.href} whileHover={{ x: isRTL ? -5 : 5 }}>
                  <Link to={link.href} className="group inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                    <span className="h-0.5 w-0 bg-[#2b648c] transition-all group-hover:w-4" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="mb-6 text-lg font-bold">{isRTL ? '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627' : 'Contact Us'}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 sm:h-10 sm:w-10">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">{isRTL ? '\u0627\u0644\u0647\u0627\u062a\u0641' : 'Phone'}</p>
                  <a href={CONTACT_PHONE_HREF} className="font-medium transition-colors hover:text-[#8ad8ff]">
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                  <div className="mt-2 flex flex-col gap-1">
                    {CONTACT_PHONE_NUMBERS.filter((phone) => !phone.primary).map((phone) => (
                      <a
                        key={phone.raw}
                        href={phone.href}
                        className="text-sm font-medium text-white/75 transition-colors hover:text-[#8ad8ff]"
                      >
                        {phone.display}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 sm:h-10 sm:w-10">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">{isRTL ? '\u0627\u0644\u0628\u0631\u064a\u062f' : 'Email'}</p>
                  <a href={CONTACT_EMAIL_HREF} className="break-all font-medium transition-colors hover:text-[#8ad8ff]">
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 sm:h-10 sm:w-10">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">{isRTL ? '\u0627\u0644\u0639\u0646\u0648\u0627\u0646' : 'Address'}</p>
                  <p className="font-medium">{isRTL ? '\u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0645\u062a\u0627\u062d \u062f\u0627\u062e\u0644 \u0627\u0644\u0631\u064a\u0627\u0636' : 'Delivery available in Riyadh'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-6"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="mb-5">
            <h3 className="text-xl font-black text-white sm:text-2xl">
              {isRTL ? '\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0631\u0633\u0645\u064a\u0629 \u0644\u0644\u0645\u062a\u062c\u0631' : 'Official Store Details'}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {officialDetails.map((detail, index) => (
              <motion.div
                key={detail.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.08 }}
                className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4"
              >
                <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white/75">{detail.label}</p>
                    <p className={`mt-3 break-all text-lg font-black sm:text-xl ${detail.accent}`}>{detail.value}</p>
                  </div>
                  <div className={detail.logoFrameClassName}>{detail.logo}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <div className="flex flex-col items-center gap-5 md:flex-row">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="text-center text-sm font-medium text-white/85 md:text-right"
            >
              © 2024 {BRAND_NAME_LOCKUP}. {isRTL ? '\u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629' : 'All Rights Reserved'}.
            </motion.p>
            <div dir="ltr" className="flex max-w-full items-center justify-center gap-2 overflow-x-auto pb-1 sm:gap-3 md:justify-start">
              {paymentMethods.map((paymentMethod) => (
                <div
                  key={paymentMethod.name}
                  className={`flex shrink-0 items-center justify-center rounded-xl ${paymentMethod.frameClassName}`}
                >
                  <img
                    src={paymentMethod.src}
                    alt={paymentMethod.name}
                    className={paymentMethod.imageClassName}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>

          <motion.button
            type="button"
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#153b66] to-[#2b648c] shadow-lg transition-shadow hover:shadow-xl sm:h-12 sm:w-12"
          >
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#153b66]/10 blur-3xl" />
      <div className="absolute right-0 top-1/2 h-48 w-48 rounded-full bg-[#2b648c]/5 blur-3xl" />
    </footer>
  );
}

