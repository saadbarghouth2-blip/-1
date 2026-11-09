import type { CheckoutPayload } from '@riq/shared';
import { persistCompletedOrder, upsertUserProfile } from './account';

const mockGetSupabaseClient = jest.fn();
const mockGetSupabaseConfigError = jest.fn(() => 'Missing Supabase config');
const mockIsSupabaseConfigured = jest.fn(() => true);

jest.mock('./supabase', () => ({
  getSupabaseClient: () => mockGetSupabaseClient(),
  getSupabaseConfigError: () => mockGetSupabaseConfigError(),
  isSupabaseConfigured: () => mockIsSupabaseConfigured(),
}));

describe('account service', () => {
  beforeEach(() => {
    mockGetSupabaseClient.mockReset();
    mockGetSupabaseConfigError.mockClear();
    mockIsSupabaseConfigured.mockReturnValue(true);
  });

  it('upserts the saved mobile profile with normalized column names', async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'maha@example.com',
        full_name: 'Maha',
        phone: '0500000000',
        default_address: 'Riyadh',
        default_lat: 24.7,
        default_lng: 46.6,
        locale: 'en',
        created_at: '2026-04-16T00:00:00.000Z',
        updated_at: '2026-04-16T00:00:00.000Z',
      },
      error: null,
    });
    const select = jest.fn(() => ({
      single,
    }));
    const upsert = jest.fn(() => ({
      select,
    }));

    mockGetSupabaseClient.mockReturnValue({
      from: jest.fn(() => ({
        upsert,
      })),
    });

    const result = await upsertUserProfile({
      userId: 'user-1',
      email: 'maha@example.com',
      fullName: 'Maha',
      phone: '0500000000',
      defaultAddress: 'Riyadh',
      defaultLat: 24.7,
      defaultLng: 46.6,
      locale: 'en',
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        full_name: 'Maha',
        default_address: 'Riyadh',
        default_lat: 24.7,
        default_lng: 46.6,
      }),
      { onConflict: 'id' }
    );
    expect(result.fullName).toBe('Maha');
    expect(result.defaultAddress).toBe('Riyadh');
  });

  it('persists a successful mobile order using a stable payment reference', async () => {
    const payload: CheckoutPayload = {
      customerName: 'Maha',
      phone: '0500000000',
      email: 'maha@example.com',
      address: 'Riyadh',
      notes: 'Call on arrival',
      lat: 24.7,
      lng: 46.6,
      items: [
        {
          productId: 'nova-330-40',
          name: 'Nova 330ml',
          quantity: 2,
          unitPrice: 12,
          lineTotal: 24,
          image: '/nova.jpg',
        },
      ],
      totalItems: 2,
      subtotal: 24,
      deliveryFee: 15,
      discount: 0,
      finalTotal: 39,
      locale: 'en',
    };

    const insertOrderSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'order-1',
        user_id: 'user-1',
        payment_reference: 'pay_123',
        source: 'mobile_app',
        customer_name: 'Maha',
        customer_phone: '0500000000',
        customer_email: 'maha@example.com',
        customer_address: 'Riyadh',
        customer_notes: 'Call on arrival',
        customer_lat: 24.7,
        customer_lng: 46.6,
        total_items: 2,
        subtotal: 24,
        delivery_fee: 15,
        discount: 0,
        final_total: 39,
        locale: 'en',
        payment_status: 'paid',
        created_at: '2026-04-16T00:00:00.000Z',
      },
      error: null,
    });
    const insertOrderSelect = jest.fn(() => ({
      maybeSingle: insertOrderSingle,
    }));
    const insertOrderUpsert = jest.fn(() => ({
      select: insertOrderSelect,
    }));

    const upsertItems = jest.fn().mockResolvedValue({ error: null });

    const hydratedOrderSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'order-1',
        user_id: 'user-1',
        payment_reference: 'pay_123',
        source: 'mobile_app',
        customer_name: 'Maha',
        customer_phone: '0500000000',
        customer_email: 'maha@example.com',
        customer_address: 'Riyadh',
        customer_notes: 'Call on arrival',
        customer_lat: 24.7,
        customer_lng: 46.6,
        total_items: 2,
        subtotal: 24,
        delivery_fee: 15,
        discount: 0,
        final_total: 39,
        locale: 'en',
        payment_status: 'paid',
        created_at: '2026-04-16T00:00:00.000Z',
        order_items: [
          {
            order_id: 'order-1',
            product_id: 'nova-330-40',
            name: 'Nova 330ml',
            quantity: 2,
            unit_price: 12,
            line_total: 24,
            image: '/nova.jpg',
          },
        ],
      },
      error: null,
    });
    const hydratedOrderEq = jest.fn(() => ({
      single: hydratedOrderSingle,
    }));
    const hydratedOrderSelect = jest.fn(() => ({
      eq: hydratedOrderEq,
    }));

    mockGetSupabaseClient.mockReturnValue({
      from: jest
        .fn()
        .mockImplementationOnce(() => ({
          upsert: insertOrderUpsert,
        }))
        .mockImplementationOnce(() => ({
          upsert: upsertItems,
        }))
        .mockImplementationOnce(() => ({
          select: hydratedOrderSelect,
        })),
    });

    const result = await persistCompletedOrder({
      userId: 'user-1',
      paymentReference: 'pay_123',
      payload,
    });

    expect(insertOrderUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        payment_reference: 'pay_123',
        source: 'mobile_app',
      }),
      { onConflict: 'payment_reference', ignoreDuplicates: true }
    );
    expect(upsertItems).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          order_id: 'order-1',
          product_id: 'nova-330-40',
        }),
      ],
      { onConflict: 'order_id,product_id', ignoreDuplicates: true }
    );
    expect(result.paymentReference).toBe('pay_123');
    expect(result.items).toHaveLength(1);
  });
});
