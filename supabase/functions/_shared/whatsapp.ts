type InvoiceOrder = {
  payment_reference: string;
  customer_name: string;
  customer_phone: string;
  final_total: number | string;
  locale: 'ar' | 'en';
};

function normalizeSaudiPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('966')) return digits;
  if (digits.startsWith('05')) return `966${digits.slice(1)}`;
  if (digits.startsWith('5')) return `966${digits}`;
  return digits;
}

export async function sendPaidInvoiceTemplate(order: InvoiceOrder) {
  const token = Deno.env.get('META_WHATSAPP_TOKEN');
  const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID');
  const graphVersion = Deno.env.get('META_GRAPH_API_VERSION');
  const templateName = order.locale === 'en'
    ? Deno.env.get('META_INVOICE_TEMPLATE_EN')
    : Deno.env.get('META_INVOICE_TEMPLATE_AR');

  if (!token || !phoneNumberId || !graphVersion || !templateName) {
    throw new Error('WhatsApp server secrets or approved template name are missing.');
  }

  const response = await fetch(
    `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(phoneNumberId)}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizeSaudiPhone(order.customer_phone),
        type: 'template',
        template: {
          name: templateName,
          language: { code: order.locale === 'en' ? 'en' : 'ar' },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: order.customer_name },
              { type: 'text', text: order.payment_reference },
              { type: 'text', text: `${Number(order.final_total).toFixed(2)} SAR` },
            ],
          }],
        },
      }),
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message ?? 'WhatsApp Cloud API rejected the message.';
    throw new Error(message);
  }

  return {
    messageId: payload?.messages?.[0]?.id as string | undefined,
    templateName,
  };
}
