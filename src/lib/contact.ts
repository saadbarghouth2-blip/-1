import { formatSarPrice } from './utils';
import { BRAND_NAME_EN, BRAND_NAME_LOCKUP } from './brand';

export const CONTACT_PHONE_RAW = '966570323534';
export const CONTACT_PHONE_DISPLAY = '+966 57 032 3534';
export const CONTACT_PHONE_HREF = `tel:+${CONTACT_PHONE_RAW}`;
export const CONTACT_ADDITIONAL_PHONES = [
  {
    raw: '966573734946',
    display: '+966 57 373 4946',
    href: 'tel:+966573734946',
  },
];
export const CONTACT_PHONE_NUMBERS = [
  {
    raw: CONTACT_PHONE_RAW,
    display: CONTACT_PHONE_DISPLAY,
    href: CONTACT_PHONE_HREF,
    primary: true,
  },
  ...CONTACT_ADDITIONAL_PHONES.map((phone) => ({ ...phone, primary: false })),
];
export const CONTACT_EMAIL = 'saadsaad50begiseralex6@gmail.com';
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
export const WHATSAPP_PHONE_RAW = '966505457251';
export const WHATSAPP_PHONE_DISPLAY = '+966 50 545 7251';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE_RAW}`;
export const TIKTOK_LINK = 'https://www.tiktok.com/@moya.ksaa?_r=1&_t=ZS-96ucaLw51Tc';
export const BUSINESS_LEGAL_NAME_AR = '\u0634\u0631\u0643\u0629 \u0625\u0634\u0631\u0627\u0642 \u0627\u0644\u0648\u0627\u062f\u064a \u0644\u0644\u062a\u062c\u0627\u0631\u0629 \u0634\u0631\u0643\u0629 \u0634\u062e\u0635 \u0648\u0627\u062d\u062f';
export const BUSINESS_LEGAL_NAME_EN = 'Ashraq Alwady Trading One Person Company';
export const BUSINESS_ADDRESS_AR = '\u0627\u0644\u0631\u064a\u0627\u0636\u060c \u062d\u064a \u0647\u0627\u0631\u0648\u0646 \u0627\u0644\u0631\u0634\u064a\u062f\u060c \u0634\u0627\u0631\u0639 53\u060c \u0645\u0628\u0646\u0649 6149\u060c \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0628\u0631\u064a\u062f\u064a 14264\u060c \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0641\u0631\u0639\u064a 2909\u060c \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629';
export const BUSINESS_ADDRESS_EN = 'Building 6149, 53 Street, Harun Al Rashid District, Riyadh 14264, Saudi Arabia';
export const BUSINESS_TAX_NUMBER = '312711661800003';
export const BUSINESS_NATIONAL_UNIFIED_NUMBER = '7030837798';
export const BUSINESS_COMMERCIAL_REGISTRATION = BUSINESS_NATIONAL_UNIFIED_NUMBER;
export const BUSINESS_LICENSE_NUMBER = '1010826701';
export const BUSINESS_ECOMMERCE_LICENSE = '0000203590';
export const BUSINESS_REGISTRATION_STATUS_AR = '\u0646\u0634\u0637';
export const BUSINESS_REGISTRATION_STATUS_EN = 'Active';
export const BANK_TRANSFER_DETAILS = {
  bankNameAr: '\u0628\u0646\u0643 \u0627\u0644\u0625\u0646\u0645\u0627\u0621',
  bankNameEn: 'Alinma Bank',
  accountNameAr: BUSINESS_LEGAL_NAME_AR,
  accountNameEn: BUSINESS_LEGAL_NAME_EN,
  accountNumber: '68205125742000',
  iban: 'SA2205000068205125742000',
};

export type ManualPaymentMethod = 'cash_on_delivery' | 'bank_transfer' | 'pos_on_delivery';

export const MANUAL_PAYMENT_METHODS: Array<{
  id: ManualPaymentMethod;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
}> = [
  {
    id: 'cash_on_delivery',
    labelAr: '\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    labelEn: 'Pay on delivery',
    descriptionAr: '\u064a\u062a\u0645 \u0627\u0644\u062f\u0641\u0639 \u0643\u0627\u0634 \u0644\u0645\u0646\u062f\u0648\u0628 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0639\u0646\u062f \u0648\u0635\u0648\u0644 \u0627\u0644\u0637\u0644\u0628.',
    descriptionEn: 'Pay cash to the delivery representative when the order arrives.',
  },
  {
    id: 'bank_transfer',
    labelAr: '\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a',
    labelEn: 'Bank transfer',
    descriptionAr: '\u062d\u0648\u0651\u0644 \u0639\u0644\u0649 \u0627\u0644\u062d\u0633\u0627\u0628 \u0648\u0623\u0631\u0633\u0644 \u0635\u0648\u0631\u0629 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628.',
    descriptionEn: 'Transfer to the bank account and send a receipt photo on WhatsApp.',
  },
  {
    id: 'pos_on_delivery',
    labelAr: '\u0634\u0628\u0643\u0629 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    labelEn: 'Card machine on delivery',
    descriptionAr: '\u0633\u064a\u062d\u0636\u0631 \u0627\u0644\u0645\u0646\u062f\u0648\u0628 \u0628\u0645\u0643\u064a\u0646\u0629 \u0634\u0628\u0643\u0629 \u0644\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0648\u0635\u0648\u0644 \u0627\u0644\u0637\u0644\u0628.',
    descriptionEn: 'The delivery representative will bring a card machine.',
  },
];

export function getManualPaymentMethodLabel(method: ManualPaymentMethod | undefined, isRTL: boolean) {
  const paymentMethod = MANUAL_PAYMENT_METHODS.find((item) => item.id === method);

  if (!paymentMethod) {
    return isRTL ? '\u063a\u064a\u0631 \u0645\u062d\u062f\u062f' : 'Not selected';
  }

  return isRTL ? paymentMethod.labelAr : paymentMethod.labelEn;
}

const EMAILJS_SERVICE_ID = 'service_62zna42';
const EMAILJS_TEMPLATE_ID = 'template_l26577p';
const EMAILJS_PUBLIC_KEY = 'WjU-HjPCfXZgkiice';
const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

type ContactEmailPayload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRTL: boolean;
};

type OrderEmailItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderEmailPayload = {
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  items: OrderEmailItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
  paymentMethod?: ManualPaymentMethod;
  isRTL: boolean;
};

function formatTimestamp() {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
}

function withFallback(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function buildGoogleMapsLink(lat?: number, lng?: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return '';
  }

  return `https://maps.google.com/?q=${lat},${lng}`;
}

function buildTemplateLocaleParams(isRTL: boolean) {
  return {
    lang: isRTL ? 'ar' : 'en',
    direction: isRTL ? 'rtl' : 'ltr',
    text_align: isRTL ? 'right' : 'left',
    intro_overline: isRTL ? 'Ø¥Ø´Ø¹Ø§Ø± Ø¥Ø¯Ø§Ø±ÙŠ Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹' : 'Administrative website notification',
    brand_name: BRAND_NAME_LOCKUP,
    intro_text: isRTL
      ? 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø±Ø³Ø§Ù„Ø© Ø£Ùˆ Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹ØŒ ÙˆÙŠÙ…ÙƒÙ†Ùƒ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„ØªÙØ§ØµÙŠÙ„ ÙˆØ§Ù„Ø±Ø¯ Ø¨Ø³Ø±Ø¹Ø© Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ§Ù„ÙŠØ©.'
      : 'A new message or order has been received from the website. You can review the details and respond quickly using the information below.',
    time_label: isRTL ? 'ÙˆÙ‚Øª Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…' : 'Received at',
    sender_info_label: isRTL ? 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø±Ø³Ù„' : 'Sender details',
    name_label: isRTL ? 'Ø§Ù„Ø§Ø³Ù…' : 'Name',
    phone_label: isRTL ? 'Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ' : 'Phone number',
    email_label: isRTL ? 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ' : 'Email address',
    subject_label: isRTL ? 'Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹' : 'Subject',
    source_label: isRTL ? 'Ù…ØµØ¯Ø± Ø§Ù„Ø±Ø³Ø§Ù„Ø©' : 'Message source',
    message_label: isRTL ? 'Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ø³Ø§Ù„Ø©' : 'Message content',
    order_details_label: isRTL ? 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨' : 'Order details',
    total_items_label: isRTL ? 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù‚Ø·Ø¹' : 'Total items',
    subtotal_label: isRTL ? 'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„ÙØ±Ø¹ÙŠ' : 'Subtotal',
    delivery_fee_label: isRTL ? 'Ø±Ø³ÙˆÙ… Ø§Ù„ØªÙˆØµÙŠÙ„' : 'Delivery fee',
    discount_label: isRTL ? 'Ø§Ù„Ø®ØµÙ…' : 'Discount',
    order_total_label: isRTL ? 'Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ' : 'Final total',
    address_label: isRTL ? 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù†' : 'Address',
    notes_label: isRTL ? 'Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª' : 'Notes',
    reply_button_label: isRTL ? 'Ø±Ø¯ Ø³Ø±ÙŠØ¹ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø±Ø³Ù„' : 'Quick reply to sender',
    whatsapp_admin_label: isRTL ? 'ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©' : 'Admin WhatsApp',
    footer_note: isRTL
      ? 'Ù‡Ø°Ù‡ Ø±Ø³Ø§Ù„Ø© Ø¢Ù„ÙŠØ© ØªÙ… Ø¥Ù†Ø´Ø§Ø¤Ù‡Ø§ Ù…Ù† Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ù…ÙˆÙ‚Ø¹ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø±Ø³Ù„ Ø¨Ø§Ù„Ø£Ø¹Ù„Ù‰ Ø¹Ù†Ø¯ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©.'
      : 'This is an automated message generated from the website form. Please use the sender details above when following up.',
    auto_reply_subject: isRTL ? 'Ø§Ø³ØªÙ„Ù…Ù†Ø§ Ø±Ø³Ø§Ù„ØªÙƒ Ø¨Ù†Ø¬Ø§Ø­' : 'We received your message successfully',
    auto_reply_overline: isRTL ? 'Ø±Ø³Ø§Ù„Ø© ØªØ£ÙƒÙŠØ¯ ØªÙ„Ù‚Ø§Ø¦ÙŠØ©' : 'Automatic confirmation message',
    auto_reply_heading: isRTL ? 'Ø´ÙƒØ±Ù‹Ø§ Ù„ØªÙˆØ§ØµÙ„Ùƒ Ù…Ø¹Ù†Ø§' : 'Thank you for contacting us',
    auto_reply_greeting: isRTL ? 'Ù…Ø±Ø­Ø¨Ù‹Ø§ {{name}}ØŒ' : 'Hello {{name}},',
    auto_reply_intro: isRTL
      ? 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø±Ø³Ø§Ù„ØªÙƒ Ø¨Ù†Ø¬Ø§Ø­ØŒ ÙˆÙØ±ÙŠÙ‚Ù†Ø§ Ø³ÙŠÙ‚ÙˆÙ… Ø¨Ù…Ø±Ø§Ø¬Ø¹ØªÙ‡Ø§ ÙˆØ§Ù„Ø±Ø¯ Ø¹Ù„ÙŠÙƒ ÙÙŠ Ø£Ù‚Ø±Ø¨ ÙˆÙ‚Øª Ù…Ù…ÙƒÙ†.'
      : 'Your message has been received successfully, and our team will review it and get back to you as soon as possible.',
    auto_reply_summary_label: isRTL ? 'Ù…Ù„Ø®Øµ Ø±Ø³Ø§Ù„ØªÙƒ' : 'Your message summary',
    auto_reply_request_type_label: isRTL ? 'Ù†ÙˆØ¹ Ø§Ù„Ø·Ù„Ø¨' : 'Request type',
    auto_reply_time_label: isRTL ? 'ÙˆÙ‚Øª Ø§Ù„Ø¥Ø±Ø³Ø§Ù„' : 'Sent at',
    auto_reply_message_label: isRTL ? 'Ù†Øµ Ø§Ù„Ø±Ø³Ø§Ù„Ø©' : 'Message',
    auto_reply_order_note: isRTL
      ? 'Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø±Ø³Ø§Ù„ØªÙƒ ØªØ®Øµ Ø·Ù„Ø¨Ù‹Ø§ Ø¬Ø¯ÙŠØ¯Ù‹Ø§ØŒ ÙØ³ÙŠØªÙ… Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„ØªÙØ§ØµÙŠÙ„ ÙˆØ®Ø·ÙˆØ§Øª Ø§Ù„ØªÙ†ÙÙŠØ°.'
      : 'If your message is about a new order, we will contact you to confirm the details and the next steps.',
    auto_reply_support_label: isRTL ? 'Ù„Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø³Ø±ÙŠØ¹' : 'For quick contact',
    auto_reply_signature: isRTL ? 'ÙØ±ÙŠÙ‚ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ - Ù…ØªØ¬Ø± Ø±ÙŠÙ‚' : `Customer Support Team - ${BRAND_NAME_EN}`,
  };
}

function sendEmail(templateParams: Record<string, string>) {
  return fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    }),
  }).then(async (response) => {
    if (response.ok) {
      return;
    }

    const errorText = (await response.text()).trim();
    throw new Error(errorText || 'EmailJS request failed');
  });
}

export function buildContactWhatsAppLink(
  payload: Omit<ContactEmailPayload, 'isRTL'>,
  isRTL: boolean
) {
  const fallback = isRTL ? 'ØºÙŠØ± Ù…ØªÙˆÙØ±' : 'Not provided';
  const lines = [
    isRTL ? 'Ø±Ø³Ø§Ù„Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹' : 'New website message',
    `${isRTL ? 'Ø§Ù„Ø§Ø³Ù…' : 'Name'}: ${payload.name || fallback}`,
    `${isRTL ? 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ' : 'Email'}: ${payload.email || fallback}`,
    `${isRTL ? 'Ø§Ù„Ù‡Ø§ØªÙ' : 'Phone'}: ${withFallback(payload.phone, fallback)}`,
  ];

  if (payload.subject?.trim()) {
    lines.push(`${isRTL ? 'Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹' : 'Subject'}: ${payload.subject.trim()}`);
  }

  lines.push('');
  lines.push(`${isRTL ? 'Ø§Ù„Ø±Ø³Ø§Ù„Ø©' : 'Message'}:`);
  lines.push(payload.message || fallback);

  return `${WHATSAPP_LINK}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildOrderWhatsAppLink(payload: OrderEmailPayload) {
  const fallback = payload.isRTL ? '\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631' : 'Not provided';
  const locationUrl = buildGoogleMapsLink(payload.lat, payload.lng);
  const paymentMethodLabel = getManualPaymentMethodLabel(payload.paymentMethod, payload.isRTL);
  const orderItems = payload.items
    .map((item, index) => {
      const unitPrice = formatSarPrice(item.unitPrice, payload.isRTL);
      const lineTotal = formatSarPrice(item.lineTotal, payload.isRTL);

      return payload.isRTL
        ? `${index + 1}. ${item.name}\n   \u0627\u0644\u0643\u0645\u064a\u0629: ${item.quantity}\n   \u0633\u0639\u0631 \u0627\u0644\u0648\u062d\u062f\u0629: ${unitPrice}\n   \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a: ${lineTotal}`
        : `${index + 1}. ${item.name}\n   Quantity: ${item.quantity}\n   Unit price: ${unitPrice}\n   Line total: ${lineTotal}`;
    })
    .join('\n\n');

  const bankTransferLines =
    payload.paymentMethod === 'bank_transfer'
      ? [
          '',
          payload.isRTL ? '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0628\u0646\u0643\u064a' : 'Bank transfer details',
          `${payload.isRTL ? '\u0627\u0644\u0628\u0646\u0643' : 'Bank'}: ${
            payload.isRTL ? BANK_TRANSFER_DETAILS.bankNameAr : BANK_TRANSFER_DETAILS.bankNameEn
          }`,
          `${payload.isRTL ? '\u0627\u0633\u0645 \u0627\u0644\u062d\u0633\u0627\u0628' : 'Account holder'}: ${
            payload.isRTL ? BANK_TRANSFER_DETAILS.accountNameAr : BANK_TRANSFER_DETAILS.accountNameEn
          }`,
          `${payload.isRTL ? '\u0631\u0642\u0645 \u0627\u0644\u062d\u0633\u0627\u0628' : 'Account number'}: ${BANK_TRANSFER_DETAILS.accountNumber}`,
          `IBAN: ${BANK_TRANSFER_DETAILS.iban}`,
          payload.isRTL
            ? '\u0645\u0644\u062d\u0648\u0638\u0629: \u0628\u0639\u062f \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u064a\u064f\u0631\u062c\u0649 \u0625\u0631\u0633\u0627\u0644 \u0635\u0648\u0631\u0629 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0639\u0644\u0649 \u0646\u0641\u0633 \u0645\u062d\u0627\u062f\u062b\u0629 \u0648\u0627\u062a\u0633\u0627\u0628 \u0644\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628.'
            : 'Note: after transfer, please send a receipt photo in this same WhatsApp chat to confirm the order.',
        ]
      : [];

  const lines = [
    payload.isRTL ? '\u0637\u0644\u0628 \u062c\u062f\u064a\u062f - \u0645\u062a\u062c\u0631 \u0631\u064a\u0642' : 'New order - Riq Store',
    payload.isRTL ? '------------------------' : '----------------------',
    '',
    payload.isRTL ? '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u064a\u0644' : 'Customer details',
    `${payload.isRTL ? '\u0627\u0644\u0627\u0633\u0645' : 'Name'}: ${withFallback(payload.customerName, fallback)}`,
    `${payload.isRTL ? '\u0627\u0644\u062c\u0648\u0627\u0644' : 'Phone'}: ${withFallback(payload.phone, fallback)}`,
    `${payload.isRTL ? '\u0627\u0644\u0628\u0631\u064a\u062f' : 'Email'}: ${withFallback(payload.email, fallback)}`,
    `${payload.isRTL ? '\u0648\u0642\u062a \u0627\u0644\u0637\u0644\u0628' : 'Order time'}: ${formatTimestamp()}`,
    '',
    payload.isRTL ? '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0648\u0635\u064a\u0644' : 'Delivery details',
    `${payload.isRTL ? '\u0627\u0644\u0639\u0646\u0648\u0627\u0646' : 'Address'}: ${withFallback(payload.address, fallback)}`,
    `${payload.isRTL ? '\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639' : 'Location link'}: ${locationUrl || fallback}`,
    '',
    payload.isRTL ? '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639' : 'Payment method',
    `${payload.isRTL ? '\u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631' : 'Selected'}: ${paymentMethodLabel}`,
    ...bankTransferLines,
    '',
    payload.isRTL ? '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a' : 'Order items',
    orderItems || fallback,
    '',
    payload.isRTL ? '\u0645\u0644\u062e\u0635 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629' : 'Invoice summary',
    `${payload.isRTL ? '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0643\u0631\u0627\u062a\u064a\u0646' : 'Total cartons'}: ${payload.totalItems}`,
    `${payload.isRTL ? '\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064a' : 'Subtotal'}: ${formatSarPrice(payload.subtotal, payload.isRTL)}`,
    `${payload.isRTL ? '\u0631\u0633\u0648\u0645 \u0627\u0644\u062a\u0648\u0635\u064a\u0644' : 'Delivery fee'}: ${formatSarPrice(payload.deliveryFee, payload.isRTL)}`,
    `${payload.isRTL ? '\u0627\u0644\u062e\u0635\u0645' : 'Discount'}: ${formatSarPrice(payload.discount, payload.isRTL)}`,
    `${payload.isRTL ? '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0646\u0647\u0627\u0626\u064a' : 'Final total'}: ${formatSarPrice(payload.finalTotal, payload.isRTL)}`,
  ];

  if (payload.notes?.trim()) {
    lines.push('');
    lines.push(payload.isRTL ? '\u0645\u0644\u0627\u062d\u0638\u0627\u062a' : 'Notes');
    lines.push(payload.notes.trim());
  }

  lines.push('');
  lines.push(
    payload.isRTL
      ? '\u064a\u0631\u062c\u0649 \u062a\u0623\u0643\u064a\u062f \u062a\u0648\u0641\u0631 \u0627\u0644\u0637\u0644\u0628 \u0648\u0645\u0648\u0639\u062f \u0627\u0644\u062a\u0648\u0635\u064a\u0644.'
      : 'Please confirm item availability and delivery time.'
  );

  return `${WHATSAPP_LINK}?text=${encodeURIComponent(lines.join('\n'))}`;
}
export function openWhatsAppLink(url: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const popup = window.open('', '_blank');

  if (popup) {
    popup.opener = null;
    popup.location.href = url;
    popup.focus();
    return;
  }

  window.location.assign(url);
}

export function sendContactEmail(payload: ContactEmailPayload) {
  const fallback = payload.isRTL ? 'ØºÙŠØ± Ù…ØªÙˆÙØ±' : 'Not provided';
  const resolvedPhone = withFallback(payload.phone, fallback);
  const resolvedSubject = withFallback(
    payload.subject,
    payload.isRTL ? 'Ø±Ø³Ø§Ù„Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù…Ù† Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªÙˆØ§ØµÙ„' : 'New contact form message'
  );
  const composedMessage = [
    `${payload.isRTL ? 'Ø§Ù„Ø§Ø³Ù…' : 'Name'}: ${payload.name}`,
    `${payload.isRTL ? 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ' : 'Email'}: ${payload.email}`,
    `${payload.isRTL ? 'Ø§Ù„Ù‡Ø§ØªÙ' : 'Phone'}: ${resolvedPhone}`,
    `${payload.isRTL ? 'Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹' : 'Subject'}: ${resolvedSubject}`,
    '',
    `${payload.isRTL ? 'Ù†Øµ Ø§Ù„Ø±Ø³Ø§Ù„Ø©' : 'Message body'}:`,
    payload.message,
  ].join('\n');
  const localeParams = buildTemplateLocaleParams(payload.isRTL);

  return sendEmail({
    title: payload.isRTL ? 'Ø±Ø³Ø§Ù„Ø© ØªÙˆØ§ØµÙ„ Ø¬Ø¯ÙŠØ¯Ø©' : 'New contact message',
    request_type: payload.isRTL ? 'Ø±Ø³Ø§Ù„Ø© ØªÙˆØ§ØµÙ„' : 'Contact message',
    source: payload.isRTL ? 'ØµÙØ­Ø© Ø§Ù„ØªÙˆØ§ØµÙ„' : 'Contact page',
    time: formatTimestamp(),
    name: payload.name,
    from_name: payload.name,
    email: payload.email,
    from_email: payload.email,
    reply_to: payload.email,
    phone: resolvedPhone,
    subject: resolvedSubject,
    message: composedMessage,
    user_message: payload.message,
    to_email: CONTACT_EMAIL,
    whatsapp_number: WHATSAPP_PHONE_DISPLAY,
    ...localeParams,
  });
}

export function sendOrderEmail(payload: OrderEmailPayload) {
  const fallback = payload.isRTL ? 'ØºÙŠØ± Ù…ØªÙˆÙØ±' : 'Not provided';
  const locationUrl = buildGoogleMapsLink(payload.lat, payload.lng);
  const orderItems = payload.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.quantity} | ${formatSarPrice(
          item.unitPrice,
          payload.isRTL
        )} | ${formatSarPrice(item.lineTotal, payload.isRTL)}`
    )
    .join('\n');

  const composedMessage = [
    `${payload.isRTL ? 'Ø§Ù„Ø§Ø³Ù…' : 'Name'}: ${payload.customerName}`,
    `${payload.isRTL ? 'Ø§Ù„Ù‡Ø§ØªÙ' : 'Phone'}: ${payload.phone}`,
    `${payload.isRTL ? 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ' : 'Email'}: ${withFallback(
      payload.email,
      fallback
    )}`,
    `${payload.isRTL ? 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù†' : 'Address'}: ${withFallback(
      payload.address,
      fallback
    )}`,
    `${payload.isRTL ? 'Ù„ÙŠÙ†Ùƒ Ø§Ù„Ù…ÙˆÙ‚Ø¹' : 'Location link'}: ${locationUrl || fallback}`,
    `${payload.isRTL ? 'Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª' : 'Notes'}: ${withFallback(
      payload.notes,
      fallback
    )}`,
    '',
    `${payload.isRTL ? 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨' : 'Order items'}:`,
    orderItems,
    '',
    `${payload.isRTL ? 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙƒØ±Ø§ØªÙŠÙ†' : 'Total cartons'}: ${payload.totalItems}`,
    `${payload.isRTL ? 'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„ÙØ±Ø¹ÙŠ' : 'Subtotal'}: ${formatSarPrice(
      payload.subtotal,
      payload.isRTL
    )}`,
    `${payload.isRTL ? 'Ø±Ø³ÙˆÙ… Ø§Ù„ØªÙˆØµÙŠÙ„' : 'Delivery fee'}: ${formatSarPrice(
      payload.deliveryFee,
      payload.isRTL
    )}`,
    `${payload.isRTL ? 'Ø§Ù„Ø®ØµÙ…' : 'Discount'}: ${formatSarPrice(
      payload.discount,
      payload.isRTL
    )}`,
    `${payload.isRTL ? 'Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ' : 'Final total'}: ${formatSarPrice(
      payload.finalTotal,
      payload.isRTL
    )}`,
  ].join('\n');
  const localeParams = buildTemplateLocaleParams(payload.isRTL);

  return sendEmail({
    title: payload.isRTL ? 'Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ø§Ù„Ø³Ù„Ø©' : 'New cart order',
    request_type: payload.isRTL ? 'Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯' : 'New order',
    source: payload.isRTL ? 'ØµÙØ­Ø© Ø§Ù„Ø³Ù„Ø©' : 'Cart page',
    time: formatTimestamp(),
    name: payload.customerName,
    from_name: payload.customerName,
    email: withFallback(payload.email, fallback),
    from_email: withFallback(payload.email, fallback),
    reply_to: withFallback(payload.email, CONTACT_EMAIL),
    phone: payload.phone,
    subject: payload.isRTL ? 'Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹' : 'New order from website',
    message: composedMessage,
    order_items: orderItems,
    order_total: formatSarPrice(payload.finalTotal, payload.isRTL),
    subtotal: formatSarPrice(payload.subtotal, payload.isRTL),
    delivery_fee: formatSarPrice(payload.deliveryFee, payload.isRTL),
    discount: formatSarPrice(payload.discount, payload.isRTL),
    total_items: String(payload.totalItems),
    address: withFallback(payload.address, fallback),
    location_link: locationUrl || fallback,
    notes: withFallback(payload.notes, fallback),
    to_email: CONTACT_EMAIL,
    whatsapp_number: WHATSAPP_PHONE_DISPLAY,
    ...localeParams,
  });
}

