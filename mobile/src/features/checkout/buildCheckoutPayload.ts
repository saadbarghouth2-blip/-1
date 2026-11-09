type CheckoutPayload = {
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    image?: string;
  }>;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
  locale: 'ar' | 'en';
};

import { getCartDeliveryRuleState, type Product } from '@riq/shared';

type CheckoutProduct = Product;

type CheckoutDraftInput = {
  locale: 'ar' | 'en';
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  items: Array<{ product: CheckoutProduct; quantity: number }>;
  discount?: number;
};

export function buildCheckoutPayload(input: CheckoutDraftInput): CheckoutPayload {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = getCartDeliveryRuleState(input.items).deliveryFee;
  const discount = input.discount ?? 0;

  return {
    customerName: input.customerName,
    phone: input.phone,
    email: input.email?.trim() || undefined,
    address: input.address?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    lat: input.lat,
    lng: input.lng,
    items: input.items.map((item) => ({
      productId: item.product.id,
      name: input.locale === 'ar' ? item.product.name.ar : item.product.name.en,
      quantity: item.quantity,
      unitPrice: item.product.price,
      lineTotal: item.product.price * item.quantity,
      image: item.product.image,
    })),
    totalItems: input.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    deliveryFee,
    discount,
    finalTotal: subtotal + deliveryFee - discount,
    locale: input.locale,
  };
}
