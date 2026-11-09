import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type {
  CheckoutDraftRecord,
  OrderSummary,
  ProfileRecord,
  SaveProfileInput,
  WebAuthSession,
} from '../features/account/types';
import { getSupabaseClient, getSupabaseConfigError, isSupabaseConfigured } from '../lib/supabase';

function toWebAuthSession(session: Session | null): WebAuthSession | null {
  if (!session?.user) {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? null,
  };
}

function getClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseConfigError());
  }

  return getSupabaseClient();
}

export async function getCurrentWebSession() {
  const client = getClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return toWebAuthSession(data.session);
}

export function subscribeToWebAuthChanges(
  callback: (event: AuthChangeEvent, session: WebAuthSession | null) => void,
) {
  const client = getClient();

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    callback(event, toWebAuthSession(session));
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function sendWebEmailOtp(email: string) {
  const client = getClient();
  const emailRedirectTo = typeof window === 'undefined'
    ? undefined
    : `${window.location.origin}/admin/products`;

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw error;
  }
}

export async function verifyWebEmailOtp(email: string, token: string) {
  const client = getClient();
  const { error } = await client.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    throw error;
  }
}

export async function signOutWebAccount() {
  const client = getClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function loadUserProfile(userId: string) {
  const client = getClient();
  const { data, error } = await client
    .from('profiles')
    .select('id, email, full_name, phone, default_address, default_lat, default_lng, locale, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    userId: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    defaultAddress: data.default_address,
    defaultLat: data.default_lat,
    defaultLng: data.default_lng,
    locale: data.locale,
    updatedAt: data.updated_at,
  } satisfies ProfileRecord;
}

export async function upsertUserProfile(input: SaveProfileInput) {
  const client = getClient();
  const { data, error } = await client
    .from('profiles')
    .upsert({
      id: input.userId,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone,
      default_address: input.defaultAddress,
      default_lat: input.defaultLat,
      default_lng: input.defaultLng,
      locale: input.locale,
    })
    .select('id, email, full_name, phone, default_address, default_lat, default_lng, locale, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return {
    userId: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    defaultAddress: data.default_address,
    defaultLat: data.default_lat,
    defaultLng: data.default_lng,
    locale: data.locale,
    updatedAt: data.updated_at,
  } satisfies ProfileRecord;
}

export async function listUserOrders(userId: string) {
  const client = getClient();
  const { data, error } = await client
    .from('orders')
    .select('id, payment_reference, customer_name, customer_phone, customer_email, customer_address, total_items, final_total, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []).map((order) => ({
    id: order.id,
    paymentReference: order.payment_reference,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
    customerAddress: order.customer_address,
    totalItems: order.total_items,
    finalTotal: Number(order.final_total),
    createdAt: order.created_at,
  })) satisfies OrderSummary[];
}

export async function persistCompletedOrder(userId: string, email: string | null, draft: CheckoutDraftRecord) {
  return persistOrderRecord(userId, email, draft, null);
}

type SubmittedWebOrderMetadata = {
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'pending_verification';
};

async function persistOrderRecord(
  userId: string,
  email: string | null,
  draft: CheckoutDraftRecord,
  customerNotes: string | null,
) {
  const client = getClient();

  const { data: insertedOrder, error: orderError } = await client
    .from('orders')
    .upsert({
      user_id: userId,
      payment_reference: draft.reference,
      customer_name: draft.customerName,
      customer_phone: draft.customerPhone,
      customer_email: email,
      customer_address: draft.customerAddress,
      customer_notes: customerNotes,
      customer_lat: draft.customerLat,
      customer_lng: draft.customerLng,
      total_items: draft.items.reduce((sum, item) => sum + (item.cartonQuantity ?? item.quantity), 0),
      subtotal: draft.subtotal,
      delivery_fee: draft.deliveryFee,
      discount: draft.discount,
      final_total: draft.finalTotal,
      locale: draft.locale,
    }, {
      onConflict: 'payment_reference',
      ignoreDuplicates: true,
    })
    .select('id')
    .maybeSingle();

  if (orderError) {
    throw orderError;
  }

  let orderData = insertedOrder;
  if (!orderData) {
    const { data: existingOrder, error: existingOrderError } = await client
      .from('orders')
      .select('id')
      .eq('payment_reference', draft.reference)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingOrderError) {
      throw existingOrderError;
    }

    if (!existingOrder) {
      throw new Error('The order already exists but could not be loaded safely.');
    }

    orderData = existingOrder;
  }

  const orderItems = draft.items.map((item) => ({
    order_id: orderData.id,
    product_id: item.productId,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.lineTotal,
    image: item.image,
  }));

  if (orderItems.length > 0) {
    const { error: itemError } = await client
      .from('order_items')
      .upsert(orderItems, {
        onConflict: 'order_id,product_id',
        ignoreDuplicates: true,
      });

    if (itemError) {
      throw itemError;
    }
  }

  return orderData.id;
}

export async function persistSubmittedWebOrder(
  email: string | null,
  draft: CheckoutDraftRecord,
  metadata: SubmittedWebOrderMetadata,
) {
  const client = getClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  let activeSession = sessionData.session;
  if (!activeSession?.user) {
    const { data: anonymousData, error: anonymousError } = await client.auth.signInAnonymously();
    if (anonymousError) {
      throw new Error(`Anonymous checkout session is unavailable: ${anonymousError.message}`);
    }
    activeSession = anonymousData.session;
  }

  if (!activeSession?.user) {
    throw new Error('Unable to create a secure checkout session for this order.');
  }

  const customerNotes = JSON.stringify({
    source: 'website',
    channel: 'whatsapp',
    paymentMethod: metadata.paymentMethod,
    paymentStatus: metadata.paymentStatus,
  });

  return persistOrderRecord(
    activeSession.user.id,
    email ?? activeSession.user.email ?? null,
    draft,
    customerNotes,
  );
}
