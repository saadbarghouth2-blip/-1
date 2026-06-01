import { isCurrentUserProductAdmin } from './productAdmin';
import { getSupabaseClient, getSupabaseConfigError, isSupabaseConfigured } from '../lib/supabase';

export type AdminOrder = {
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

export async function loadAdminSalesDashboard(email: string | null | undefined): Promise<AdminSalesDashboard> {
  const allowed = await isCurrentUserProductAdmin(email);
  if (!allowed) {
    throw new Error('This account is not allowed to view admin dashboard data.');
  }

  const client = getClient();
  const [ordersResult, itemsResult] = await Promise.all([
    client
      .from('orders')
      .select('id, payment_reference, customer_name, customer_phone, customer_email, customer_address, total_items, final_total, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    client
      .from('order_items')
      .select('order_id, product_id, name, quantity, unit_price, line_total, image')
      .limit(1000),
  ]);

  if (ordersResult.error) {
    throw ordersResult.error;
  }

  if (itemsResult.error) {
    throw itemsResult.error;
  }

  const orders = (ordersResult.data ?? []).map((order) => ({
    id: order.id,
    paymentReference: order.payment_reference,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
    customerAddress: order.customer_address,
    totalItems: Number(order.total_items ?? 0),
    finalTotal: Number(order.final_total ?? 0),
    createdAt: order.created_at,
  })) satisfies AdminOrder[];

  const items = (itemsResult.data ?? []).map((item) => ({
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
    recentOrders: orders.slice(0, 12),
    topProducts: Array.from(products.values())
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 8),
  };
}
