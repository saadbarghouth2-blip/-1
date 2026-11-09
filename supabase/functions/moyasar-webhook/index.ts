import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse } from '../_shared/cors.ts';
import { sendPaidInvoiceTemplate } from '../_shared/whatsapp.ts';

type MoyasarWebhook = {
  id?: string;
  type?: string;
  secret_token?: string;
  live?: boolean;
  data?: {
    id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  };
};

function mapStatus(type: string) {
  if (type === 'payment_paid' || type === 'payment_captured' || type === 'payment_verified') return 'paid';
  if (type === 'payment_refunded') return 'refunded';
  if (type === 'payment_voided' || type === 'payment_abandoned') return 'cancelled';
  if (type === 'payment_failed' || type === 'payment_faild') return 'failed';
  return 'pending';
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const expectedSecret = Deno.env.get('MOYASAR_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!expectedSecret || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server configuration is incomplete' }, 503);
  }

  let event: MoyasarWebhook;
  try {
    event = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (event.secret_token !== expectedSecret) {
    return jsonResponse({ error: 'Invalid webhook secret' }, 401);
  }

  const eventId = event.id;
  const eventType = event.type ?? '';
  const metadata = event.data?.metadata ?? {};
  const orderId = typeof metadata.order_id === 'string' ? metadata.order_id : null;
  const paymentReference = typeof metadata.payment_reference === 'string'
    ? metadata.payment_reference
    : event.data?.description;

  if (!eventId || !eventType || (!orderId && !paymentReference)) {
    return jsonResponse({ error: 'Webhook is missing its event or order reference' }, 400);
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let orderQuery = client
    .from('orders')
    .select('id, payment_reference, customer_name, customer_phone, final_total, locale');
  orderQuery = orderId ? orderQuery.eq('id', orderId) : orderQuery.eq('payment_reference', paymentReference!);
  const { data: order, error: orderError } = await orderQuery.maybeSingle();
  if (orderError || !order) return jsonResponse({ error: 'Referenced order was not found' }, 404);

  const amount = typeof event.data?.amount === 'number' ? event.data.amount / 100 : null;
  const expectedAmount = Number(order.final_total);
  const amountMatches = amount !== null && Math.abs(amount - expectedAmount) < 0.005;
  const currencyMatches = (event.data?.currency ?? '').toUpperCase() === 'SAR';
  const requestedStatus = mapStatus(eventType);
  // Never mark an order paid or send its invoice if the provider amount/currency differs.
  const status = requestedStatus === 'paid' && (!amountMatches || !currencyMatches)
    ? 'pending'
    : requestedStatus;
  const { data: paymentEvent, error: paymentError } = await client
    .from('payment_events')
    .upsert({
      order_id: order.id,
      provider: 'moyasar',
      provider_event_id: eventId,
      provider_payment_id: event.data?.id ?? null,
      status,
      amount,
      currency: event.data?.currency ?? 'SAR',
      is_live: event.live === true,
    }, { onConflict: 'provider_event_id', ignoreDuplicates: true })
    .select('id')
    .maybeSingle();

  if (paymentError) return jsonResponse({ error: 'Unable to record payment event' }, 500);

  if (status !== 'paid' || !paymentEvent) return jsonResponse({ received: true });

  try {
    const sent = await sendPaidInvoiceTemplate(order);
    await client.from('invoice_events').insert({
      order_id: order.id,
      payment_event_id: paymentEvent.id,
      provider_message_id: sent.messageId ?? null,
      template_name: sent.templateName,
      status: 'sent',
    });
  } catch (error) {
    const templateName = order.locale === 'en'
      ? Deno.env.get('META_INVOICE_TEMPLATE_EN')
      : Deno.env.get('META_INVOICE_TEMPLATE_AR');
    await client.from('invoice_events').upsert({
      order_id: order.id,
      payment_event_id: paymentEvent.id,
      template_name: templateName ?? 'not_configured',
      status: 'failed',
      error_code: error instanceof Error ? error.message.slice(0, 500) : 'unknown_error',
    }, { onConflict: 'order_id,payment_event_id,template_name', ignoreDuplicates: true });
  }

  return jsonResponse({ received: true });
});
