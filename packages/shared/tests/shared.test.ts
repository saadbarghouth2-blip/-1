import { describe, expect, it } from 'vitest';
import {
  WHATSAPP_PHONE_RAW,
  buildContactWhatsAppLink,
  buildOrderWhatsAppLink,
  formatSarPrice,
  localizeText,
  products,
} from '../src';

describe('shared helpers', () => {
  it('localizes Arabic and English text', () => {
    expect(localizeText({ ar: 'مياه', en: 'Water' }, true)).toBe('مياه');
    expect(localizeText({ ar: 'مياه', en: 'Water' }, false)).toBe('Water');
  });

  it('formats SAR values for both locales', () => {
    expect(formatSarPrice(15, true)).toContain('ر.س');
    expect(formatSarPrice(15, false)).toBe('SAR 15.00');
  });

  it('creates a whatsapp link containing the customer name', () => {
    const link = buildContactWhatsAppLink(
      {
        name: 'Sara',
        email: 'sara@example.com',
        phone: '0500000000',
        subject: 'Order',
        message: 'Need a delivery today',
      },
      false
    );

    expect(link).toContain('api.whatsapp.com/send');
    expect(link).toContain(`phone=${WHATSAPP_PHONE_RAW}`);
    expect(decodeURIComponent(link)).toContain('Sara');
  });

  it('compacts very large whatsapp orders so the link stays practical', () => {
    const link = buildOrderWhatsAppLink({
      customerName: 'Sara',
      phone: '0500000000',
      address: 'Riyadh',
      items: Array.from({ length: 80 }, (_, index) => ({
        name: `Water carton product with a very long display name ${index + 1}`,
        quantity: 2,
        unitPrice: 10,
        lineTotal: 20,
      })),
      totalItems: 160,
      subtotal: 1600,
      deliveryFee: 0,
      discount: 0,
      finalTotal: 1600,
      isRTL: false,
    });

    const message = new URL(link).searchParams.get('text') ?? '';
    expect(message).toContain('Compact summary');
    expect(message).toContain('+ 45 more cart items');
    expect(message).not.toContain('Unit price');
  });

  it('exposes the shared catalog', () => {
    expect(products.length).toBeGreaterThan(10);
  });
});
