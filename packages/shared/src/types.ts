export type BrandSummary = {
  id: string;
  name: string;
  nameAr: string;
  logo?: string;
};

export type ContactConfig = {
  phoneRaw: string;
  phoneDisplay: string;
  phoneHref: string;
  phoneNumbers: Array<{
    raw: string;
    display: string;
    href: string;
    primary: boolean;
  }>;
  email: string;
  emailHref: string;
  whatsappLink: string;
};

export type CartSnapshotItem = {
  productId: string;
  quantity: number;
};

export type CheckoutLineItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
};

export type CheckoutPayload = {
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  items: CheckoutLineItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
  locale: 'ar' | 'en';
};

export type CheckoutResult = {
  status: 'success' | 'cancelled' | 'error';
  paymentId?: string;
  message?: string;
};
