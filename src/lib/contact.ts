import { formatSarPrice } from './utils';
import { BRAND_NAME_EN, BRAND_NAME_LOCKUP } from './brand';

export const CONTACT_PHONE_RAW = '966595546436';
export const CONTACT_PHONE_DISPLAY = '+966 59 554 6436';
export const CONTACT_PHONE_HREF = `tel:+${CONTACT_PHONE_RAW}`;
export const CONTACT_EMAIL = 'saadsaad50begiseralex6@gmail.com';
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
export const WHATSAPP_LINK = `https://wa.me/${CONTACT_PHONE_RAW}`;
export const BUSINESS_TAX_NUMBER = '311090145340000003';
export const BUSINESS_COMMERCIAL_REGISTRATION = '1010961465';
export const BUSINESS_ECOMMERCE_LICENSE = '0000203590';
export const BANK_TRANSFER_DETAILS = {
  bankNameAr: 'بنك الإنماء',
  bankNameEn: 'Alinma Bank',
  accountNameAr: 'شركة إشراق الوادي للتجارة شركة شخص واحد',
  accountNameEn: 'Ashraq Alwady Trading One Person Company',
  accountNumber: '68205125742000',
  iban: 'SA2205000068205125742000',
};

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
  notes?: string;
  items: OrderEmailItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
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

function buildTemplateLocaleParams(isRTL: boolean) {
  return {
    lang: isRTL ? 'ar' : 'en',
    direction: isRTL ? 'rtl' : 'ltr',
    text_align: isRTL ? 'right' : 'left',
    intro_overline: isRTL ? 'إشعار إداري من الموقع' : 'Administrative website notification',
    brand_name: BRAND_NAME_LOCKUP,
    intro_text: isRTL
      ? 'تم استلام رسالة أو طلب جديد من الموقع، ويمكنك مراجعة التفاصيل والرد بسرعة من البيانات التالية.'
      : 'A new message or order has been received from the website. You can review the details and respond quickly using the information below.',
    time_label: isRTL ? 'وقت الاستلام' : 'Received at',
    sender_info_label: isRTL ? 'بيانات المرسل' : 'Sender details',
    name_label: isRTL ? 'الاسم' : 'Name',
    phone_label: isRTL ? 'رقم الهاتف' : 'Phone number',
    email_label: isRTL ? 'البريد الإلكتروني' : 'Email address',
    subject_label: isRTL ? 'الموضوع' : 'Subject',
    source_label: isRTL ? 'مصدر الرسالة' : 'Message source',
    message_label: isRTL ? 'محتوى الرسالة' : 'Message content',
    order_details_label: isRTL ? 'تفاصيل الطلب' : 'Order details',
    total_items_label: isRTL ? 'إجمالي القطع' : 'Total items',
    subtotal_label: isRTL ? 'المجموع الفرعي' : 'Subtotal',
    delivery_fee_label: isRTL ? 'رسوم التوصيل' : 'Delivery fee',
    discount_label: isRTL ? 'الخصم' : 'Discount',
    order_total_label: isRTL ? 'الإجمالي النهائي' : 'Final total',
    address_label: isRTL ? 'العنوان' : 'Address',
    notes_label: isRTL ? 'الملاحظات' : 'Notes',
    reply_button_label: isRTL ? 'رد سريع على المرسل' : 'Quick reply to sender',
    whatsapp_admin_label: isRTL ? 'واتساب الإدارة' : 'Admin WhatsApp',
    footer_note: isRTL
      ? 'هذه رسالة آلية تم إنشاؤها من نموذج الموقع، يرجى الاعتماد على بيانات المرسل بالأعلى عند المتابعة.'
      : 'This is an automated message generated from the website form. Please use the sender details above when following up.',
    auto_reply_subject: isRTL ? 'استلمنا رسالتك بنجاح' : 'We received your message successfully',
    auto_reply_overline: isRTL ? 'رسالة تأكيد تلقائية' : 'Automatic confirmation message',
    auto_reply_heading: isRTL ? 'شكرًا لتواصلك معنا' : 'Thank you for contacting us',
    auto_reply_greeting: isRTL ? 'مرحبًا {{name}}،' : 'Hello {{name}},',
    auto_reply_intro: isRTL
      ? 'تم استلام رسالتك بنجاح، وفريقنا سيقوم بمراجعتها والرد عليك في أقرب وقت ممكن.'
      : 'Your message has been received successfully, and our team will review it and get back to you as soon as possible.',
    auto_reply_summary_label: isRTL ? 'ملخص رسالتك' : 'Your message summary',
    auto_reply_request_type_label: isRTL ? 'نوع الطلب' : 'Request type',
    auto_reply_time_label: isRTL ? 'وقت الإرسال' : 'Sent at',
    auto_reply_message_label: isRTL ? 'نص الرسالة' : 'Message',
    auto_reply_order_note: isRTL
      ? 'إذا كانت رسالتك تخص طلبًا جديدًا، فسيتم التواصل معك لتأكيد التفاصيل وخطوات التنفيذ.'
      : 'If your message is about a new order, we will contact you to confirm the details and the next steps.',
    auto_reply_support_label: isRTL ? 'للتواصل السريع' : 'For quick contact',
    auto_reply_signature: isRTL ? 'فريق خدمة العملاء - متجر ريق' : `Customer Support Team - ${BRAND_NAME_EN}`,
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
  const fallback = isRTL ? 'غير متوفر' : 'Not provided';
  const lines = [
    isRTL ? 'رسالة جديدة من الموقع' : 'New website message',
    `${isRTL ? 'الاسم' : 'Name'}: ${payload.name || fallback}`,
    `${isRTL ? 'البريد الإلكتروني' : 'Email'}: ${payload.email || fallback}`,
    `${isRTL ? 'الهاتف' : 'Phone'}: ${withFallback(payload.phone, fallback)}`,
  ];

  if (payload.subject?.trim()) {
    lines.push(`${isRTL ? 'الموضوع' : 'Subject'}: ${payload.subject.trim()}`);
  }

  lines.push('');
  lines.push(`${isRTL ? 'الرسالة' : 'Message'}:`);
  lines.push(payload.message || fallback);

  return `${WHATSAPP_LINK}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildOrderWhatsAppLink(payload: OrderEmailPayload) {
  const fallback = payload.isRTL ? 'غير متوفر' : 'Not provided';
  const orderItems = payload.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.quantity} - ${formatSarPrice(
          item.lineTotal,
          payload.isRTL
        )}`
    )
    .join('\n');

  const lines = [
    payload.isRTL ? 'طلب جديد من الموقع' : 'New website order',
    `${payload.isRTL ? 'الاسم' : 'Name'}: ${payload.customerName}`,
    `${payload.isRTL ? 'الهاتف' : 'Phone'}: ${payload.phone}`,
    `${payload.isRTL ? 'البريد الإلكتروني' : 'Email'}: ${withFallback(
      payload.email,
      fallback
    )}`,
    `${payload.isRTL ? 'العنوان' : 'Address'}: ${withFallback(
      payload.address,
      fallback
    )}`,
    '',
    `${payload.isRTL ? 'تفاصيل الطلب' : 'Order details'}:`,
    orderItems,
    '',
    `${payload.isRTL ? 'إجمالي القطع' : 'Total items'}: ${payload.totalItems}`,
    `${payload.isRTL ? 'الإجمالي النهائي' : 'Final total'}: ${formatSarPrice(
      payload.finalTotal,
      payload.isRTL
    )}`,
  ];

  if (payload.notes?.trim()) {
    lines.push(`${payload.isRTL ? 'ملاحظات' : 'Notes'}: ${payload.notes.trim()}`);
  }

  return `${WHATSAPP_LINK}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function sendContactEmail(payload: ContactEmailPayload) {
  const fallback = payload.isRTL ? 'غير متوفر' : 'Not provided';
  const resolvedPhone = withFallback(payload.phone, fallback);
  const resolvedSubject = withFallback(
    payload.subject,
    payload.isRTL ? 'رسالة جديدة من نموذج التواصل' : 'New contact form message'
  );
  const composedMessage = [
    `${payload.isRTL ? 'الاسم' : 'Name'}: ${payload.name}`,
    `${payload.isRTL ? 'البريد الإلكتروني' : 'Email'}: ${payload.email}`,
    `${payload.isRTL ? 'الهاتف' : 'Phone'}: ${resolvedPhone}`,
    `${payload.isRTL ? 'الموضوع' : 'Subject'}: ${resolvedSubject}`,
    '',
    `${payload.isRTL ? 'نص الرسالة' : 'Message body'}:`,
    payload.message,
  ].join('\n');
  const localeParams = buildTemplateLocaleParams(payload.isRTL);

  return sendEmail({
    title: payload.isRTL ? 'رسالة تواصل جديدة' : 'New contact message',
    request_type: payload.isRTL ? 'رسالة تواصل' : 'Contact message',
    source: payload.isRTL ? 'صفحة التواصل' : 'Contact page',
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
    whatsapp_number: CONTACT_PHONE_DISPLAY,
    ...localeParams,
  });
}

export function sendOrderEmail(payload: OrderEmailPayload) {
  const fallback = payload.isRTL ? 'غير متوفر' : 'Not provided';
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
    `${payload.isRTL ? 'الاسم' : 'Name'}: ${payload.customerName}`,
    `${payload.isRTL ? 'الهاتف' : 'Phone'}: ${payload.phone}`,
    `${payload.isRTL ? 'البريد الإلكتروني' : 'Email'}: ${withFallback(
      payload.email,
      fallback
    )}`,
    `${payload.isRTL ? 'العنوان' : 'Address'}: ${withFallback(
      payload.address,
      fallback
    )}`,
    `${payload.isRTL ? 'الملاحظات' : 'Notes'}: ${withFallback(
      payload.notes,
      fallback
    )}`,
    '',
    `${payload.isRTL ? 'تفاصيل الطلب' : 'Order items'}:`,
    orderItems,
    '',
    `${payload.isRTL ? 'إجمالي القطع' : 'Total items'}: ${payload.totalItems}`,
    `${payload.isRTL ? 'المجموع الفرعي' : 'Subtotal'}: ${formatSarPrice(
      payload.subtotal,
      payload.isRTL
    )}`,
    `${payload.isRTL ? 'رسوم التوصيل' : 'Delivery fee'}: ${formatSarPrice(
      payload.deliveryFee,
      payload.isRTL
    )}`,
    `${payload.isRTL ? 'الخصم' : 'Discount'}: ${formatSarPrice(
      payload.discount,
      payload.isRTL
    )}`,
    `${payload.isRTL ? 'الإجمالي النهائي' : 'Final total'}: ${formatSarPrice(
      payload.finalTotal,
      payload.isRTL
    )}`,
  ].join('\n');
  const localeParams = buildTemplateLocaleParams(payload.isRTL);

  return sendEmail({
    title: payload.isRTL ? 'طلب جديد من السلة' : 'New cart order',
    request_type: payload.isRTL ? 'طلب جديد' : 'New order',
    source: payload.isRTL ? 'صفحة السلة' : 'Cart page',
    time: formatTimestamp(),
    name: payload.customerName,
    from_name: payload.customerName,
    email: withFallback(payload.email, fallback),
    from_email: withFallback(payload.email, fallback),
    reply_to: withFallback(payload.email, CONTACT_EMAIL),
    phone: payload.phone,
    subject: payload.isRTL ? 'طلب جديد من الموقع' : 'New order from website',
    message: composedMessage,
    order_items: orderItems,
    order_total: formatSarPrice(payload.finalTotal, payload.isRTL),
    subtotal: formatSarPrice(payload.subtotal, payload.isRTL),
    delivery_fee: formatSarPrice(payload.deliveryFee, payload.isRTL),
    discount: formatSarPrice(payload.discount, payload.isRTL),
    total_items: String(payload.totalItems),
    address: withFallback(payload.address, fallback),
    notes: withFallback(payload.notes, fallback),
    to_email: CONTACT_EMAIL,
    whatsapp_number: CONTACT_PHONE_DISPLAY,
    ...localeParams,
  });
}
