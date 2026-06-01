export const BRAND_NAME_EN = 'Riq Store';
export const BRAND_NAME_AR = 'متجر ريق';
export const BRAND_SHORT_NAME_AR = 'ريق';
export const BRAND_NAME_LOCKUP = 'متجر ريق - Riq Store';

export const BRAND_LOGO_SRC = '/images/96e4912f-19c6-4e22-aa20-512a75f63282.jpg';
export const BRAND_LOGO_ALT = `${BRAND_NAME_LOCKUP} Logo`;

export function getBrandName(isRTL: boolean) {
  return isRTL ? BRAND_NAME_AR : BRAND_NAME_EN;
}
