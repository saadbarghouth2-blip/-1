export const BRAND_NAME_EN = 'Riq Store';
export const BRAND_NAME_AR = 'متجر ريق';
export const BRAND_SHORT_NAME_AR = 'ريق';
export const BRAND_NAME_LOCKUP = 'متجر ريق - Riq Store';

export const BRAND_LOGO_SRC = '/WhatsApp%20Image%202026-11-06%20at%204.11.00%20PM.jpeg';
export const BRAND_LOGO_ALT = `${BRAND_NAME_LOCKUP} Logo`;

export function getBrandName(isRTL: boolean) {
  return isRTL ? BRAND_NAME_AR : BRAND_NAME_EN;
}
