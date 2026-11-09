import { isCurrentUserProductAdmin } from './productAdmin';
import { getSupabaseClient, getSupabaseConfigError, isSupabaseConfigured } from '../lib/supabase';

export type AdminOrder = {
  id: string;
  paymentReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  source: string;
  channel: string | null;
  paymentMethod: string | null;
  paymentStatus: 'paid' | 'unpaid' | 'pending_verification';
  totalItems: number;
  finalTotal: number;
  createdAt: string;
};

export type AdminOrderItem = {
  orderId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string | null;
};

export type AdminSalesDashboard = {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  averageOrderValue: number;
  orders: AdminOrder[];
  items: AdminOrderItem[];
  recentOrders: AdminOrder[];
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
};

function getClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseConfigError());
  }

  return getSupabaseClient();
}

function parseOrderNotes(
  value: unknown,
  fallbackSource: unknown,
): Pick<AdminOrder, 'source' | 'channel' | 'paymentMethod' | 'paymentStatus'> {
  const source = typeof fallbackSource === 'string' && fallbackSource ? fallbackSource : 'unknown';
  if (typeof value !== 'string' || !value.trim()) {
    return { source, channel: null, paymentMethod: null, paymentStatus: 'paid' as const };
  }

  try {
    const notes = JSON.parse(value) as {
      source?: unknown;
      channel?: unknown;
      paymentMethod?: unknown;
      paymentStatus?: unknown;
    };
    const paymentStatus = notes.paymentStatus === 'unpaid' || notes.paymentStatus === 'pending_verification'
      ? notes.paymentStatus
      : 'paid';
    return {
      source: typeof notes.source === 'string' ? notes.source : source,
      channel: typeof notes.channel === 'string' ? notes.channel : null,
      paymentMethod: typeof notes.paymentMethod === 'string' ? notes.paymentMethod : null,
      paymentStatus,
    };
  } catch {
    return { source, channel: null, paymentMethod: null, paymentStatus: 'paid' as const };
  }
}

const SALES_PAGE_SIZE = 1000;

type AdminOrderRow = {
  id: string;
  payment_reference: string;
  source: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_notes: string | null;
  total_items: number | string | null;
  final_total: number | string | null;
  created_at: string;
};

type AdminOrderItemRow = {
  order_id: string;
  product_id: string;
  name: string;
  quantity: number | string | null;
  unit_price: number | string | null;
  line_total: number | string | null;
  image: string | null;
  created_at: string;
};

type PaymentEventRow = {
  order_id: string;
  status: 'initiated' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  created_at: string;
};

async function loadAllOrderRows(client: ReturnType<typeof getClient>) {
  const rows: AdminOrderRow[] = [];
  for (let start = 0; ; start += SALES_PAGE_SIZE) {
    const { data, error } = await client
      .from('orders')
      .select('id, payment_reference, source, customer_name, customer_phone, customer_email, customer_address, customer_notes, total_items, final_total, created_at')
      .order('created_at', { ascending: false })
      .range(start, start + SALES_PAGE_SIZE - 1);

    if (error) throw error;
    const page = (data ?? []) as AdminOrderRow[];
    rows.push(...page);
    if (page.length < SALES_PAGE_SIZE) return rows;
  }
}

async function loadAllOrderItemRows(client: ReturnType<typeof getClient>) {
  const rows: AdminOrderItemRow[] = [];
  for (let start = 0; ; start += SALES_PAGE_SIZE) {
    const { data, error } = await client
      .from('order_items')
      .select('order_id, product_id, name, quantity, unit_price, line_total, image, created_at')
      .order('created_at', { ascending: false })
      .range(start, start + SALES_PAGE_SIZE - 1);

    if (error) throw error;
    const page = (data ?? []) as AdminOrderItemRow[];
    rows.push(...page);
    if (page.length < SALES_PAGE_SIZE) return rows;
  }
}

async function loadLatestPaymentEvents(client: ReturnType<typeof getClient>) {
  const { data, error } = await client
    .from('payment_events')
    .select('order_id, status, created_at')
    .order('created_at', { ascending: false });

  // The site remains compatible before the optional payment-events SQL is installed.
  if (error) return new Map<string, PaymentEventRow['status']>();

  const latest = new Map<string, PaymentEventRow['status']>();
  ((data ?? []) as PaymentEventRow[]).forEach((event) => {
    if (!latest.has(event.order_id)) latest.set(event.order_id, event.status);
  });
  return latest;
}

function getDisplayedPaymentStatus(
  eventStatus: PaymentEventRow['status'] | undefined,
  fallback: AdminOrder['paymentStatus'],
): AdminOrder['paymentStatus'] {
  if (!eventStatus) return fallback;
  if (eventStatus === 'paid') return 'paid';
  if (eventStatus === 'initiated' || eventStatus === 'pending') return 'pending_verification';
  return 'unpaid';
}

export async function loadAdminSalesDashboard(email: string | null | undefined): Promise<AdminSalesDashboard> {
  const allowed = await isCurrentUserProductAdmin(email);
  if (!allowed) {
    throw new Error('This account is not allowed to view admin dashboard data.');
  }

  const client = getClient();
  const [orderRows, itemRows, latestPaymentEvents] = await Promise.all([
    loadAllOrderRows(client),
    loadAllOrderItemRows(client),
    loadLatestPaymentEvents(client),
  ]);

  const orders = orderRows.map((order) => {
    const orderMetadata = parseOrderNotes(order.customer_notes, order.source);
    return {
      id: order.id,
      paymentReference: order.payment_reference,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      customerAddress: order.customer_address,
      source: orderMetadata.source,
      channel: orderMetadata.channel,
      paymentMethod: orderMetadata.paymentMethod,
      paymentStatus: getDisplayedPaymentStatus(latestPaymentEvents.get(order.id), orderMetadata.paymentStatus),
      totalItems: Number(order.total_items ?? 0),
      finalTotal: Number(order.final_total ?? 0),
      createdAt: order.created_at,
    };
  }) satisfies AdminOrder[];

  const items = itemRows.map((item) => ({
    orderId: item.order_id,
    productId: item.product_id,
    name: item.name,
    quantity: Number(item.quantity ?? 0),
    unitPrice: Number(item.unit_price ?? 0),
    lineTotal: Number(item.line_total ?? 0),
    image: item.image,
  })) satisfies AdminOrderItem[];

  const totalRevenue = orders.reduce((sum, order) => sum + order.finalTotal, 0);
  const totalItems = orders.reduce((sum, order) => sum + order.totalItems, 0);
  const products = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>();

  items.forEach((item) => {
    const current = products.get(item.productId) ?? {
      productId: item.productId,
      name: item.name,
      quantity: 0,
      revenue: 0,
    };

    current.quantity += item.quantity;
    current.revenue += item.lineTotal;
    products.set(item.productId, current);
  });

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalItems,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    orders,
    items,
    recentOrders: orders.slice(0, 12),
    topProducts: Array.from(products.values())
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 8),
  };
}
