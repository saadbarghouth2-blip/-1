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

function buildInvoiceElement(data: InvoiceData) {
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
  root.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;min-height:1123px;background:#f7fafc;color:#153b66;font-family:Arial,Tahoma,sans-serif;z-index:-1;';
  root.innerHTML = `
    <div style="min-height:1123px;background:#f7fafc;box-sizing:border-box;padding-bottom:30px;">
      <header style="height:175px;padding:34px 44px;box-sizing:border-box;background:linear-gradient(135deg,#153b66,#0b587e);color:#fff;display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:18px;">
          <img src="${escapeHtml(BRAND_LOGO_SRC)}" alt="ريق" style="width:84px;height:84px;border-radius:20px;object-fit:cover;border:2px solid rgba(255,255,255,.32);" />
          <div><div style="font-size:25px;font-weight:900;">متجر ريق لتوصيل المياه</div><div style="margin-top:8px;color:#d8eef7;font-size:13px;">ريق.com</div></div>
        </div>
        <div style="text-align:left;direction:ltr;"><div style="font-size:24px;font-weight:900;direction:rtl;">فاتورة طلب</div><div style="margin-top:8px;font-size:13px;">${escapeHtml(data.invoiceNumber)}</div><div style="margin-top:5px;font-size:12px;color:#d8eef7;">${escapeHtml(issuedLabel)}</div></div>
      </header>

      <main style="padding:28px 44px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <div style="padding:10px 18px;border-radius:999px;background:${data.paymentStatus === 'paid' ? '#dcfce7' : '#fff7ed'};color:${data.paymentStatus === 'paid' ? '#15803d' : '#b45309'};font-weight:900;">${paymentStatusLabel(data.paymentStatus)}</div>
          <div style="font-size:13px;color:#607286;">رقم الطلب: <strong style="color:#153b66;direction:ltr;display:inline-block;">${escapeHtml(data.orderNumber)}</strong></div>
        </div>

        <section style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">
          <div style="background:#fff;border:1px solid #d8e4ec;border-radius:18px;padding:18px;">
            <div style="font-size:12px;color:#607286;margin-bottom:7px;">بيانات العميل</div>
            <div style="font-size:17px;font-weight:900;">${escapeHtml(data.customerName)}</div>
            <div style="margin-top:9px;font-size:13px;direction:ltr;text-align:right;">${escapeHtml(data.customerPhone)}</div>
            ${data.customerEmail ? `<div style="margin-top:7px;font-size:12px;direction:ltr;text-align:right;">${escapeHtml(data.customerEmail)}</div>` : ''}
          </div>
          <div style="background:#fff;border:1px solid #d8e4ec;border-radius:18px;padding:18px;">
            <div style="font-size:12px;color:#607286;margin-bottom:7px;">طريقة الدفع</div>
            <div style="font-size:17px;font-weight:900;">${escapeHtml(data.paymentMethod)}</div>
            <div style="margin-top:9px;font-size:12px;color:#607286;">موعد التوصيل المتوقع: خلال 24 إلى 48 ساعة</div>
          </div>
        </section>

        <section style="background:#edf6fa;border-radius:16px;padding:15px 18px;margin-bottom:20px;">
          <div style="font-size:12px;color:#607286;margin-bottom:6px;">عنوان التوصيل</div>
          <div style="font-size:14px;font-weight:800;line-height:1.8;">${escapeHtml(data.customerAddress)}</div>
        </section>

        <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #d8e4ec;border-radius:16px;overflow:hidden;text-align:right;">
          <thead><tr style="background:#0b587e;color:#fff;"><th style="padding:13px 15px;">المنتج</th><th style="padding:13px 15px;text-align:center;">الكمية</th><th style="padding:13px 15px;">سعر الوحدة</th><th style="padding:13px 15px;">الإجمالي</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <section style="width:355px;margin:22px 0 26px auto;background:#fff;border:1px solid #d8e4ec;border-radius:16px;padding:15px 18px;box-sizing:border-box;">
          <div class="sum"><span>المجموع الفرعي</span><strong>${money(data.subtotal)}</strong></div>
          <div class="sum"><span>رسوم التوصيل</span><strong>${money(data.deliveryFee)}</strong></div>
          <div class="sum"><span>الخصم</span><strong>${money(data.discount)}</strong></div>
          <div class="sum"><span>الضريبة المشمولة (15%)</span><strong>${money(includedVat)}</strong></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:14px;border-radius:12px;background:#153b66;color:#fff;font-size:17px;"><span>الإجمالي</span><strong>${money(data.total)}</strong></div>
        </section>

        <footer style="border-top:1px solid #d8e4ec;padding-top:18px;display:flex;justify-content:space-between;gap:24px;color:#607286;font-size:11px;line-height:1.8;">
          <div><strong style="display:block;color:#153b66;font-size:13px;">${escapeHtml(BUSINESS_LEGAL_NAME_AR)}</strong>الرقم الضريبي: ${escapeHtml(BUSINESS_TAX_NUMBER)}<br/>السجل التجاري: ${escapeHtml(BUSINESS_COMMERCIAL_REGISTRATION)}</div>
          <div style="max-width:330px;">${escapeHtml(BUSINESS_ADDRESS_AR)}<br/>شكرًا لاختيارك متجر ريق.</div>
        </footer>
      </main>
    </div>
    <style>
      td{padding:14px 15px;border-bottom:1px solid #e6eef3;font-size:12px;color:#334e68;vertical-align:top}tbody tr:last-child td{border-bottom:0}td:nth-child(2){text-align:center}.sum{display:flex;justify-content:space-between;gap:14px;padding:7px 0;color:#607286;font-size:12px}.sum strong{color:#153b66}
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
