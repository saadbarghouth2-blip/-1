import {
  BUSINESS_ADDRESS_EN,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_RAW,
  TIKTOK_LINK,
  WHATSAPP_LINK,
} from './contact';

export const SITE_NAME_EN = 'Riq Store';
export const SITE_NAME_AR = 'متجر ريق';
export const SITE_SHORT_NAME_AR = 'ريق';
export const SITE_NAME_LOCKUP = 'متجر ريق - Riq Store';
export const SITE_ALTERNATE_NAMES = ['ريق', 'ريق.com', 'متجر ريق', 'Riq Store', 'riq', 'xn--wgb8axa.com'];
export const SITE_DEFAULT_IMAGE = '/images/96e4912f-19c6-4e22-aa20-512a75f63282.jpg';
export const SITE_ADDRESS_EN = BUSINESS_ADDRESS_EN;
export const SITE_ADDRESS_AR = 'الرياض، حي هارون الرشيد، شارع 53، مبنى 6149، الرمز البريدي 14264، الرقم الفرعي 2909، المملكة العربية السعودية';
export const SITE_SOCIAL_LINKS = [WHATSAPP_LINK, TIKTOK_LINK];
export const SITE_PHONE = CONTACT_PHONE_DISPLAY;
export const SITE_PHONE_RAW = `+${CONTACT_PHONE_RAW}`;
export const SITE_EMAIL = CONTACT_EMAIL;

export const SITE_DEFAULT_DESCRIPTION = {
  ar: 'ريق هو الموقع الرسمي لمتجر ريق لتوصيل المياه المعبأة في الرياض. اطلب منتجات المياه والعروض من ريق.com مع خدمة توصيل سريعة وموثوقة.',
  en: 'Riq Store is the official website for bottled water delivery in Riyadh. Order water products and offers from Riq.com with fast, trusted service.',
};

export function normalizeSiteUrl(value?: string) {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.replace(/\/+$/, '');
}

export function normalizeBasePath(value?: string) {
  if (!value || value === '/') {
    return '/';
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export const BASE_PATH = normalizeBasePath(import.meta.env.VITE_BASE_PATH);

export function getRouterBasename() {
  return BASE_PATH === '/' ? '/' : BASE_PATH.slice(0, -1);
}

export function normalizeCanonicalPath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
}

export function withBasePath(pathname: string) {
  const normalizedPath = normalizeCanonicalPath(pathname);

  if (BASE_PATH === '/') {
    return normalizedPath;
  }

  const base = getRouterBasename();
  if (normalizedPath === '/') {
    return base;
  }

  return `${base}/${normalizedPath.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/');
}

export function getConfiguredSiteUrl() {
  return normalizeSiteUrl(import.meta.env.VITE_SITE_URL);
}

export function getSiteOrigin() {
  const configuredSiteUrl = getConfiguredSiteUrl();

  if (import.meta.env.PROD && configuredSiteUrl) {
    return configuredSiteUrl;
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return configuredSiteUrl;
}

export function toAbsoluteUrl(path: string, origin = getSiteOrigin()) {
  if (!path) {
    return origin;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!origin) {
    return normalizedPath;
  }

  return new URL(normalizedPath, `${origin}/`).toString();
}
