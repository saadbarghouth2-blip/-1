import type { CheckoutPayload } from '@riq/shared';
import type {
  OrderLine,
  OrderSummary,
  ProfileRecord,
  SaveProfileInput,
} from '../features/account/types';
import {
  getSupabaseClient,
  getSupabaseConfigError,
  isSupabaseConfigured,
} from './supabase';

const MOBILE_ORDER_SOURCE = 'mobile_app' as const;

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  default_address: string | null;
  default_lat: number | null;
  default_lng: number | null;
  locale: 'ar' | 'en' | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image: string | null;
};

type OrderRow = {
  id: string;
  user_id: string;
  payment_reference: string;
  source: typeof MOBILE_ORDER_SOURCE;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_notes: string | null;
  customer_lat: number | null;
  customer_lng: number | null;
  total_items: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  final_total: number;
  locale: 'ar' | 'en';
  payment_status: 'paid';
  created_at: string;
  order_items?: OrderItemRow[] | null;
};

function getClientOrThrow() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(getSupabaseConfigError());
  }

  return client;
}

function toProfileRecord(row: ProfileRow): ProfileRecord {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? '',
    phone: row.phone ?? '',
    defaultAddress: row.default_address ?? '',
    defaultLat: row.default_lat ?? null,
    defaultLng: row.default_lng ?? null,
    locale: row.locale ?? 'ar',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toOrderLines(rows: OrderItemRow[] | null | undefined): OrderLine[] {
  if (!rows?.length) {
    return [];
  }

  return rows.map((item) => ({
    productId: item.product_id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    lineTotal: item.line_total,
    image: item.image ?? undefined,
  }));
}

function toOrderSummary(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    userId: row.user_id,
    paymentReference: row.payment_reference,
    source: MOBILE_ORDER_SOURCE,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email ?? '',
    customerAddress: row.customer_address ?? '',
    customerNotes: row.customer_notes ?? '',
    customerLat: row.customer_lat ?? null,
    customerLng: row.customer_lng ?? null,
    totalItems: row.total_items,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    discount: row.discount,
    finalTotal: row.final_total,
    locale: row.locale,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    items: toOrderLines(row.order_items),
  };
}

export async function loadUserProfile(userId: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getClientOrThrow();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw error;
  }

  return data ? toProfileRecord(data) : null;
}

export async function upsertUserProfile(input: SaveProfileInput) {
  const client = getClientOrThrow();
  const { data, error } = await client
    .from('profiles')
    .upsert(
      {
        id: input.userId,
        email: input.email,
        full_name: input.fullName.trim() || null,
        phone: input.phone.trim() || null,
        default_address: input.defaultAddress.trim() || null,
        default_lat: input.defaultLat ?? null,
        default_lng: input.defaultLng ?? null,
        locale: input.locale,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single<ProfileRow>();

  if (error) {
    throw error;
  }

  return toProfileRecord(data);
}

export async function listUserOrders(userId: string, limit = 20) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const client = getClientOrThrow();
  const { data, error } = await client
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .eq('source', MOBILE_ORDER_SOURCE)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<OrderRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(toOrderSummary);
}

export async function persistCompletedOrder(params: {
  userId: string;
  paymentReference: string;
  payload: CheckoutPayload;
}) {
  const client = getClientOrThrow();
  const { data: insertedOrderRow, error: orderError } = await client
    .from('orders')
    .upsert(
      {
        user_id: params.userId,
        payment_reference: params.paymentReference,
        source: MOBILE_ORDER_SOURCE,
        customer_name: params.payload.customerName,
        customer_phone: params.payload.phone,
        customer_email: params.payload.email ?? null,
        customer_address: params.payload.address ?? null,
        customer_notes: params.payload.notes ?? null,
        customer_lat: params.payload.lat ?? null,
        customer_lng: params.payload.lng ?? null,
        total_items: params.payload.totalItems,
        subtotal: params.payload.subtotal,
        delivery_fee: params.payload.deliveryFee,
        discount: params.payload.discount,
        final_total: params.payload.finalTotal,
        locale: params.payload.locale,
        payment_status: 'paid',
      },
      { onConflict: 'payment_reference', ignoreDuplicates: true }
    )
    .select('*')
    .maybeSingle<OrderRow>();

  if (orderError) {
    throw orderError;
  }

  let orderRow = insertedOrderRow;
  if (!orderRow) {
    const { data: existingOrderRow, error: existingOrderError } = await client
      .from('orders')
      .select('*')
      .eq('payment_reference', params.paymentReference)
      .eq('user_id', params.userId)
      .single<OrderRow>();

    if (existingOrderError) {
      throw existingOrderError;
    }

    orderRow = existingOrderRow;
  }

  const orderItems = params.payload.items.map((item) => ({
    order_id: orderRow.id,
    product_id: item.productId,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.lineTotal,
    image: item.image ?? null,
  }));

  if (orderItems.length) {
    const { error: itemsError } = await client
      .from('order_items')
      .upsert(orderItems, { onConflict: 'order_id,product_id', ignoreDuplicates: true });

    if (itemsError) {
      throw itemsError;
    }
  }

  const { data: hydratedOrder, error: hydratedOrderError } = await client
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderRow.id)
    .single<OrderRow>();

  if (hydratedOrderError) {
    throw hydratedOrderError;
  }

  return toOrderSummary(hydratedOrder);
}
