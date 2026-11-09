import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const orderMaybeSingle = vi.fn();
  const orderSelect = vi.fn(() => ({ maybeSingle: orderMaybeSingle }));
  const orderUpsert = vi.fn(() => ({ select: orderSelect }));
  const existingMaybeSingle = vi.fn();
  const existingUserEq = vi.fn(() => ({ maybeSingle: existingMaybeSingle }));
  const existingReferenceEq = vi.fn(() => ({ eq: existingUserEq }));
  const existingSelect = vi.fn(() => ({ eq: existingReferenceEq }));
  const itemUpsert = vi.fn();
  const getSession = vi.fn();
  const signInAnonymously = vi.fn();
  const from = vi.fn((table: string) => table === 'orders'
    ? { upsert: orderUpsert, select: existingSelect }
    : { upsert: itemUpsert });

  return {
    client: { auth: { getSession, signInAnonymously }, from },
    from,
    getSession,
    signInAnonymously,
    orderMaybeSingle,
    existingMaybeSingle,
    orderUpsert,
    itemUpsert,
  };
});

vi.mock('../lib/supabase', () => ({
  getSupabaseClient: () => mocks.client,
  getSupabaseConfigError: () => '',
  isSupabaseConfigured: () => true,
}));

import { persistSubmittedWebOrder } from './webAccount';

describe('persistSubmittedWebOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.signInAnonymously.mockResolvedValue({
      data: { session: { user: { id: 'guest-user', email: null } } },
      error: null,
    });
    mocks.orderMaybeSingle.mockResolvedValue({ data: { id: 'order-1' }, error: null });
    mocks.existingMaybeSingle.mockResolvedValue({ data: { id: 'order-1' }, error: null });
    mocks.itemUpsert.mockResolvedValue({ error: null });
  });

  it('creates an anonymous checkout session and stores the order without changing the schema', async () => {
    const orderId = await persistSubmittedWebOrder(null, {
      reference: 'web-order-1',
      customerName: 'Test Customer',
      customerPhone: '0500000000',
      customerAddress: 'Riyadh - Test address',
      subtotal: 200,
      deliveryFee: 25,
      discount: 0,
      finalTotal: 225,
      locale: 'ar',
      items: [{
        productId: 'water-1',
        name: 'Water carton',
        quantity: 15,
        cartonQuantity: 15,
        unitPrice: 10,
        lineTotal: 150,
        image: '/water.jpg',
      }],
    }, {
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'unpaid',
    });

    expect(orderId).toBe('order-1');
    expect(mocks.signInAnonymously).toHaveBeenCalledOnce();
    expect(mocks.orderUpsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'guest-user',
      payment_reference: 'web-order-1',
      customer_notes: JSON.stringify({
        source: 'website',
        channel: 'whatsapp',
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'unpaid',
      }),
    }), { onConflict: 'payment_reference', ignoreDuplicates: true });
    expect(mocks.itemUpsert).toHaveBeenCalledWith([
      expect.objectContaining({ order_id: 'order-1', product_id: 'water-1' }),
    ], { onConflict: 'order_id,product_id', ignoreDuplicates: true });
  });

  it('reuses the original immutable order when the same reference is submitted again', async () => {
    mocks.orderMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const orderId = await persistSubmittedWebOrder(null, {
      reference: 'web-order-1',
      customerName: 'Changed name must not overwrite the sale',
      customerPhone: '0500000000',
      customerAddress: 'Riyadh',
      subtotal: 200,
      deliveryFee: 0,
      discount: 0,
      finalTotal: 200,
      locale: 'ar',
      items: [],
    }, {
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'unpaid',
    });

    expect(orderId).toBe('order-1');
    expect(mocks.existingMaybeSingle).toHaveBeenCalledOnce();
  });
});
