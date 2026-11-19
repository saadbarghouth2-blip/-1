import {
  BUSINESS_ADDRESS_AR,
  BUSINESS_COMMERCIAL_REGISTRATION,
  BUSINESS_LEGAL_NAME_AR,
  BUSINESS_TAX_NUMBER,
} from './contact';
import { BRAND_LOGO_SRC } from './brand';

export type InvoiceItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  orderNumber: string;
  issuedAt: Date | string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending_verification';
  items: InvoiceItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export type InvoiceDownloadFormat = 'pdf' | 'png';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function money(value: number) {
  return `${Number(value || 0).toLocaleString('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function paymentStatusLabel(status: InvoiceData['paymentStatus']) {
  if (status === 'paid') return 'مدفوع';
  if (status === 'pending_verification') return 'بانتظار مراجعة التحويل';
  return 'غير مدفوع';
}

function safeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'order';
}

export function formatShortOrderReference(value: string) {
  const normalized = String(value || '')
    .replace(/^(inv|web|order)[-_:]*/i, '')
    .replace(/[^a-zA-Z0-9]/g, '');
  return (normalized.slice(0, 8) || 'ORDER').toUpperCase();
}

function buildInvoiceElement(data: InvoiceData) {
  const displayReference = formatShortOrderReference(data.orderNumber);
  const issuedAt = new Date(data.issuedAt);
  const issuedLabel = Number.isNaN(issuedAt.getTime())
    ? String(data.issuedAt)
    : issuedAt.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
  const includedVat = data.total > 0 ? data.total * 0.15 / 1.15 : 0;
  const rows = data.items.length
    ? data.items.map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.quantity)}</td>
        <td>${money(item.unitPrice)}</td>
        <td><strong>${money(item.lineTotal)}</strong></td>
      </tr>`).join('')
    : '<tr><td colspan="4">لا توجد تفاصيل منتجات محفوظة لهذا الطلب.</td></tr>';

  const root = document.createElement('div');
  root.setAttribute('dir', 'rtl');
  root.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;min-height:1123px;background:#f5f9fc;color:#153b66;font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;z-index:-1;';
  root.innerHTML = `
    <div style="min-height:1123px;background:#f5f9fc;box-sizing:border-box;padding-bottom:26px;direction:rtl;text-align:right;">
      <header style="height:180px;padding:30px 42px;box-sizing:border-box;background:linear-gradient(135deg,#0b587e 0%,#153b66 78%);color:#fff;display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:32px;align-items:center;direction:rtl;border-bottom:7px solid #60b8d8;">
        <div style="display:flex;align-items:center;justify-content:flex-start;gap:18px;min-width:0;direction:rtl;text-align:right;">
          <img src="${escapeHtml(BRAND_LOGO_SRC)}" alt="ريق" style="width:86px;height:86px;border-radius:22px;object-fit:cover;border:2px solid rgba(255,255,255,.78);box-shadow:0 8px 24px rgba(0,0,0,.18);flex:0 0 auto;" />
          <div style="min-width:0;"><div style="font-size:26px;font-weight:900;line-height:1.35;">متجر ريق لتوصيل المياه</div><div style="margin-top:7px;color:#d8eef7;font-size:13px;">المتجر الإلكتروني للمياه</div></div>
        </div>
        <div style="padding-right:24px;border-right:1px solid rgba(255,255,255,.28);text-align:right;direction:rtl;"><div style="font-size:25px;font-weight:900;">فاتورة طلب</div><div style="margin-top:9px;font-size:11px;direction:ltr;text-align:right;unicode-bidi:plaintext;letter-spacing:.4px;">INV-${escapeHtml(displayReference)}</div><div style="margin-top:7px;font-size:11px;color:#d8eef7;direction:rtl;unicode-bidi:plaintext;">${escapeHtml(issuedLabel)}</div></div>
      </header>

      <main style="padding:26px 42px;direction:rtl;text-align:right;">
        <div style="display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;margin-bottom:20px;direction:rtl;">
          <div style="padding:10px 18px;border-radius:999px;background:${data.paymentStatus === 'paid' ? '#dcfce7' : '#fff7ed'};color:${data.paymentStatus === 'paid' ? '#15803d' : '#b45309'};font-weight:900;white-space:nowrap;">${paymentStatusLabel(data.paymentStatus)}</div>
          <div style="font-size:12px;color:#607286;text-align:left;">رقم الطلب: <strong style="color:#153b66;direction:ltr;display:inline-block;unicode-bidi:plaintext;letter-spacing:.3px;">#${escapeHtml(displayReference)}</strong></div>
        </div>

        <section style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;direction:rtl;">
          <div style="background:#fff;border:1px solid #d8e4ec;border-right:5px solid #0b6a91;border-radius:16px;padding:17px 18px;text-align:right;">
            <div style="font-size:12px;color:#607286;margin-bottom:7px;">بيانات العميل</div>
            <div style="font-size:17px;font-weight:900;">${escapeHtml(data.customerName)}</div>
            <div style="margin-top:9px;font-size:13px;direction:ltr;text-align:right;unicode-bidi:plaintext;">${escapeHtml(data.customerPhone)}</div>
            ${data.customerEmail ? `<div style="margin-top:7px;font-size:12px;direction:ltr;text-align:right;unicode-bidi:plaintext;">${escapeHtml(data.customerEmail)}</div>` : ''}
          </div>
          <div style="background:#fff;border:1px solid #d8e4ec;border-right:5px solid #0b6a91;border-radius:16px;padding:17px 18px;text-align:right;">
            <div style="font-size:12px;color:#607286;margin-bottom:7px;">طريقة الدفع</div>
            <div style="font-size:17px;font-weight:900;">${escapeHtml(data.paymentMethod)}</div>
            <div style="margin-top:9px;font-size:12px;color:#607286;">موعد التوصيل المتوقع: خلال 24 إلى 48 ساعة</div>
          </div>
        </section>

        <section style="background:#eaf5fa;border:1px solid #d5e9f2;border-radius:16px;padding:15px 18px;margin-bottom:20px;text-align:right;">
          <div style="font-size:12px;color:#607286;margin-bottom:6px;">عنوان التوصيل</div>
          <div style="font-size:14px;font-weight:800;line-height:1.8;">${escapeHtml(data.customerAddress)}</div>
        </section>

        <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #d8e4ec;border-radius:16px;overflow:hidden;text-align:right;direction:rtl;">
          <thead><tr style="background:#0b587e;color:#fff;"><th style="padding:13px 15px;text-align:right;">المنتج</th><th style="padding:13px 15px;text-align:center;">الكمية</th><th style="padding:13px 15px;text-align:right;">سعر الوحدة</th><th style="padding:13px 15px;text-align:right;">الإجمالي</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <section style="width:370px;margin:22px 0 26px auto;background:#fff;border:1px solid #d8e4ec;border-top:5px solid #0b6a91;border-radius:16px;padding:14px 18px 17px;box-sizing:border-box;text-align:right;direction:rtl;">
          <div class="sum"><span>المجموع الفرعي</span><strong>${money(data.subtotal)}</strong></div>
          <div class="sum"><span>رسوم التوصيل</span><strong>${money(data.deliveryFee)}</strong></div>
          <div class="sum"><span>الخصم</span><strong>${money(data.discount)}</strong></div>
          <div class="sum"><span>الضريبة المشمولة (15%)</span><strong>${money(includedVat)}</strong></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:14px;border-radius:12px;background:#153b66;color:#fff;font-size:17px;"><span>الإجمالي</span><strong>${money(data.total)}</strong></div>
        </section>

        <footer style="border-top:1px solid #d8e4ec;padding-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:28px;color:#607286;font-size:11px;line-height:1.9;direction:rtl;text-align:right;">
          <div><strong style="display:block;color:#153b66;font-size:13px;margin-bottom:3px;">${escapeHtml(BUSINESS_LEGAL_NAME_AR)}</strong>الرقم الضريبي: <span dir="ltr">${escapeHtml(BUSINESS_TAX_NUMBER)}</span><br/>السجل التجاري: <span dir="ltr">${escapeHtml(BUSINESS_COMMERCIAL_REGISTRATION)}</span></div>
          <div>${escapeHtml(BUSINESS_ADDRESS_AR)}<br/><strong style="color:#153b66;">شكرًا لاختيارك متجر ريق.</strong></div>
        </footer>
      </main>
    </div>
    <style>
      td{padding:14px 15px;border-bottom:1px solid #e6eef3;font-size:12px;color:#334e68;vertical-align:top;text-align:right;direction:rtl}tbody tr:last-child td{border-bottom:0}td:nth-child(2){text-align:center}.sum{display:flex;flex-direction:row;justify-content:space-between;gap:14px;padding:7px 0;color:#607286;font-size:12px;text-align:right;direction:rtl}.sum strong{color:#153b66;direction:rtl;unicode-bidi:plaintext}
    </style>`;
  document.body.appendChild(root);
  return root;
}

export async function downloadInvoice(data: InvoiceData, format: InvoiceDownloadFormat) {
  if (typeof document === 'undefined') return;

  const root = buildInvoiceElement(data);
  try {
    await document.fonts?.ready;
    await Promise.all(Array.from(root.querySelectorAll('img')).map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }));

    const { default: html2canvas } = await import('html2canvas');
    const captureHeight = Math.max(1123, root.scrollHeight);
    const canvas = await html2canvas(root, {
      backgroundColor: '#f7fafc',
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794,
      height: captureHeight,
      windowWidth: 794,
    });
    const filename = `riq-invoice-${safeFilePart(data.orderNumber)}`;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png', 1);
      link.click();
      return;
    }

    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const imageData = canvas.toDataURL('image/jpeg', 0.94);
    const renderedHeight = canvas.height * 210 / canvas.width;
    let remainingHeight = renderedHeight;
    let offsetY = 0;
    pdf.addImage(imageData, 'JPEG', 0, offsetY, 210, renderedHeight, undefined, 'FAST');
    remainingHeight -= 297;
    // Ignore sub-millimetre canvas rounding so a one-page invoice does not
    // produce an almost-empty second PDF page.
    while (remainingHeight > 1) {
      offsetY -= 297;
      pdf.addPage();
      pdf.addImage(imageData, 'JPEG', 0, offsetY, 210, renderedHeight, undefined, 'FAST');
      remainingHeight -= 297;
    }
    pdf.save(`${filename}.pdf`);
  } finally {
    root.remove();
  }
}
