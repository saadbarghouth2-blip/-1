export type WebAuthSession = {
  userId: string;
  email: string | null;
};

export type ProfileRecord = {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  defaultAddress: string | null;
  defaultLat: number | null;
  defaultLng: number | null;
  locale: 'ar' | 'en';
  updatedAt: string | null;
};

export type SaveProfileInput = {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  defaultAddress: string;
  defaultLat: number;
  defaultLng: number;
  locale: 'ar' | 'en';
};

export type OrderSummary = {
  id: string;
  paymentReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  totalItems: number;
  finalTotal: number;
  createdAt: string;
};

export type CheckoutDraftItem = {
  productId: string;
  name: string;
  quantity: number;
  cartonQuantity?: number;
  unitPrice: number;
  lineTotal: number;
  image: string;
};

export type CheckoutDraftRecord = {
  reference: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
  locale: 'ar' | 'en';
  items: CheckoutDraftItem[];
};
