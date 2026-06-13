import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_NUMBERS,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_PHONE_RAW,
  WHATSAPP_LINK,
} from '../../../src/lib/contact';
import type { ContactConfig } from './types';

export * from '../../../src/lib/contact';

export const CONTACT_CONFIG: ContactConfig = {
  phoneRaw: CONTACT_PHONE_RAW,
  phoneDisplay: CONTACT_PHONE_DISPLAY,
  phoneHref: CONTACT_PHONE_HREF,
  phoneNumbers: CONTACT_PHONE_NUMBERS,
  email: CONTACT_EMAIL,
  emailHref: CONTACT_EMAIL_HREF,
  whatsappLink: WHATSAPP_LINK,
};
