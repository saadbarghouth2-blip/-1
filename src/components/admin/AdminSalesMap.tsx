import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Layers3, ListFilter, MapPinned, MapPin } from 'lucide-react';
import type { AdminOrder } from '../../services/adminDashboard';
import { formatSarPrice } from '../../lib/utils';
import { formatShortOrderReference } from '../../lib/invoice';

const LEAFLET_SCRIPT = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_STYLE = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

type LeafletMap = { remove: () => void; fitBounds: (bounds: unknown, options?: unknown) => void; setView: (coords: [number, number], zoom: number) => LeafletMap };
type LeafletApi = {
  map: (element: HTMLElement, options?: unknown) => LeafletMap;
  tileLayer: (url: string, options?: unknown) => { addTo: (map: LeafletMap) => void };
  marker: (coords: [number, number], options?: unknown) => { addTo: (map: LeafletMap) => { bindPopup: (html: string) => void } };
  divIcon: (options: unknown) => unknown;
  latLngBounds: (coords: Array<[number, number]>) => unknown;
};
declare global { interface Window { L?: LeafletApi } }
type PaymentTone = 'paid' | 'pending' | 'unpaid';

function loadStyle() {
  if (document.querySelector(`link[href="${LEAFLET_STYLE}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = LEAFLET_STYLE; document.head.appendChild(link);
}
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${LEAFLET_SCRIPT}"]`);
  if (existing) return new Promise<LeafletApi>((resolve, reject) => {
    existing.addEventListener('load', () => window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable')), { once: true });
    existing.addEventListener('error', () => reject(new Error('Leaflet failed')), { once: true });
  });
  return new Promise<LeafletApi>((resolve, reject) => {
    const script = document.createElement('script'); script.src = LEAFLET_SCRIPT;
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable'));
    script.onerror = () => reject(new Error('Leaflet failed')); document.head.appendChild(script);
  });
}
function escapeHtml(value: unknown) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
function isValidCoordinate(order: AdminOrder) { return Number.isFinite(order.customerLat) && Number.isFinite(order.customerLng) && Math.abs(order.customerLat as number) <= 90 && Math.abs(order.customerLng as number) <= 180; }
function paymentTone(status: AdminOrder['paymentStatus']): PaymentTone { return status === 'paid' ? 'paid' : status === 'pending_verification' ? 'pending' : 'unpaid'; }
function paymentStatusLabel(status: AdminOrder['paymentStatus']) { return status === 'paid' ? 'مدفوع' : status === 'pending_verification' ? 'قيد المراجعة' : 'غير مدفوع'; }
function paymentColor(tone: PaymentTone) { return tone === 'paid' ? '#15803d' : tone === 'pending' ? '#0369a1' : '#b45309'; }
function getAreaLabel(address: string | null) {
  const clean = String(address ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'عنوان غير مكتمل';
  const pieces = clean.split(/[,،\-–—]/).map((piece) => piece.trim()).filter(Boolean);
  const usable = pieces.find((piece) => piece.length >= 3 && !/^الرياض$/i.test(piece)) ?? pieces[0];
  return usable?.slice(0, 42) || 'عنوان غير مكتمل';
}

export default function AdminSalesMap({ orders }: { orders: AdminOrder[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapError, setMapError] = useState('');
  const mapped = useMemo(() => orders.filter(isValidCoordinate), [orders]);
  const unmapped = useMemo(() => orders.filter((order) => !isValidCoordinate(order)).sort((left, right) => right.finalTotal - left.finalTotal), [orders]);
  const mappedRevenue = useMemo(() => mapped.reduce((total, order) => total + order.finalTotal, 0), [mapped]);
  const unmappedRevenue = useMemo(() => unmapped.reduce((total, order) => total + order.finalTotal, 0), [unmapped]);
  const coverage = orders.length ? Math.round(mapped.length / orders.length * 100) : 0;
  const areaSummary = useMemo(() => {
    const areas = new Map<string, { label: string; orders: number; revenue: number }>();
    mapped.forEach((order) => { const label = getAreaLabel(order.customerAddress); const area = areas.get(label) ?? { label, orders: 0, revenue: 0 }; area.orders += 1; area.revenue += order.finalTotal; areas.set(label, area); });
    return Array.from(areas.values()).sort((left, right) => right.revenue - left.revenue).slice(0, 6);
  }, [mapped]);

  useEffect(() => {
    let cancelled = false; setMapError(''); loadStyle();
    void loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current) return;
      mapRef.current?.remove();
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([24.7136, 46.6753], 10);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      const coords: Array<[number, number]> = [];
      mapped.forEach((order) => {
        const point: [number, number] = [order.customerLat as number, order.customerLng as number]; coords.push(point);
        const tone = paymentTone(order.paymentStatus);
        const icon = L.divIcon({ className: '', html: `<span style="display:flex;width:28px;height:28px;border-radius:8px;background:${paymentColor(tone)};border:3px solid #fff;box-shadow:0 7px 16px rgba(15,23,42,.28);align-items:center;justify-content:center;color:#fff;font-size:12px;line-height:1">●</span>`, iconSize: [28, 28], iconAnchor: [14, 14] });
        const orderDate = new Date(order.createdAt);
        const orderDateLabel = Number.isNaN(orderDate.getTime()) ? 'تاريخ غير مسجل' : orderDate.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
        L.marker(point, { icon }).addTo(map).bindPopup(`<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;min-width:230px;text-align:right;color:#0f172a"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><strong style="color:#153b66;font-size:13px">طلب #${escapeHtml(formatShortOrderReference(order.paymentReference || order.id))}</strong><span style="border-radius:999px;background:${tone === 'paid' ? '#dcfce7' : tone === 'pending' ? '#e0f2fe' : '#fef3c7'};color:${paymentColor(tone)};padding:4px 8px;font-size:11px;font-weight:700">${escapeHtml(paymentStatusLabel(order.paymentStatus))}</span></div><div style="margin-top:10px;font-weight:700">${escapeHtml(order.customerName || 'غير مسجل')}</div><div style="margin-top:5px;color:#475569;font-size:12px;line-height:1.65">${escapeHtml(order.customerAddress || 'العنوان غير مسجل')}</div><div style="margin-top:10px;padding-top:9px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:12px;font-size:11px;color:#64748b"><span>${escapeHtml(orderDateLabel)}</span><strong style="color:#0b587e;font-size:13px">${escapeHtml(formatSarPrice(order.finalTotal, true))}</strong></div></div>`);
      });
      if (coords.length > 1) map.fitBounds(L.latLngBounds(coords), { padding: [46, 46], maxZoom: 14 }); else if (coords.length === 1) map.setView(coords[0], 14);
    }).catch(() => !cancelled && setMapError('تعذر تحميل الخريطة الآن. بيانات المواقع محفوظة ويمكن مراجعتها من قائمة الطلبات.'));
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, [mapped]);

  return <section className="space-y-5" aria-label="تحليل مواقع المبيعات">
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="flex items-center gap-2 text-xs font-black tracking-wide text-sky-700"><MapPinned className="h-4 w-4" /> التحليل الجغرافي</div><h2 className="mt-2 text-2xl font-black text-slate-900">خريطة مبيعات المتجر</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">توزيع مبني على الإحداثيات التي حفظها العميل فقط. لا يتم تخمين أي موقع أو تعديل العنوان.</p></div>
      <div className="flex w-fit items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"><Layers3 className="h-4 w-4 text-[#153b66]" /> نطاق العرض الحالي: {orders.length} طلب</div>
    </header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="طلبات مُمَوضعة" value={mapped.length} detail={`من ${orders.length} طلب`} tone="navy" /><Metric label="تغطية الموقع" value={`${coverage}%`} detail="إحداثيات قابلة للعرض" tone="sky" /><Metric label="مبيعات بموقع مؤكد" value={formatSarPrice(mappedRevenue, true)} detail="إجمالي قيمة النقاط" tone="emerald" /><Metric label="تحتاج استكمال موقع" value={formatSarPrice(unmappedRevenue, true)} detail={`${unmapped.length} طلب بلا إحداثيات`} tone="amber" />
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="relative min-h-[420px] overflow-hidden border border-sky-200 bg-[#dceff7] shadow-[0_28px_80px_-48px_rgba(21,59,102,.55)] sm:min-h-[580px]">
        <div ref={containerRef} className="absolute inset-0 z-0" role="region" aria-label="خريطة مواقع المبيعات التفاعلية" />
        {!mapped.length && !mapError && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#eaf6fb]/95 p-8 text-center"><div><MapPinned className="mx-auto h-10 w-10 text-[#153b66]" /><h3 className="mt-4 text-xl font-black text-[#153b66]">لا توجد طلبات بإحداثيات بعد</h3><p className="mt-2 max-w-md text-sm leading-7 text-slate-600">أضف الموقع من العميل في الطلبات القادمة وستظهر النقاط تلقائيًا هنا.</p></div></div>}
        {mapError && <div role="alert" className="absolute inset-x-4 top-4 z-20 border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">{mapError}</div>}
        <div className="absolute bottom-4 right-4 z-[500] max-w-[calc(100%-2rem)] border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur"><div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-700"><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 bg-emerald-700" /> مدفوع</span><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 bg-sky-700" /> قيد المراجعة</span><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 bg-amber-700" /> غير مدفوع</span></div><p className="mt-2 text-[11px] text-slate-500">كل نقطة تمثل طلبًا واحدًا بإحداثيات مؤكدة.</p></div>
      </section>
      <aside className="space-y-5">
        <PanelHeading icon={<MapPin className="h-4 w-4" />} title="أعلى نطاقات العناوين" description="مجمّعة آليًا من نص العنوان المسجل فقط." />
        <div className="border-y border-slate-200">{areaSummary.map((area, index) => <div key={area.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 py-3 last:border-b-0"><span className="grid h-7 w-7 place-items-center bg-slate-100 text-xs font-black text-[#153b66]">{index + 1}</span><div className="min-w-0"><h3 className="truncate text-sm font-black text-slate-800">{area.label}</h3><p className="mt-1 text-xs text-slate-500">{area.orders} طلب</p></div><strong className="text-xs text-[#153b66]">{formatSarPrice(area.revenue, true)}</strong></div>)}{!areaSummary.length && <p className="py-6 text-center text-sm font-bold text-slate-500">لا توجد عناوين مرتبطة بإحداثيات في الفترة.</p>}</div>
        <PanelHeading icon={<ListFilter className="h-4 w-4" />} title="متابعة المواقع الناقصة" description={`${unmapped.length} طلب يحتاج موقعًا مؤكدًا، مرتبة حسب قيمة الطلب.`} />
        <div className="max-h-[330px] space-y-2 overflow-y-auto pr-1">{unmapped.map((order) => <article key={order.id} className="border border-slate-200 bg-white p-3 transition hover:border-sky-300"><div className="flex items-center justify-between gap-3"><b className="font-mono text-xs text-[#153b66]" dir="ltr">#{formatShortOrderReference(order.paymentReference || order.id)}</b><PaymentPill status={order.paymentStatus} /></div><div className="mt-2 flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-black text-slate-800">{order.customerName || 'غير مسجل'}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{order.customerAddress || 'عنوان غير مكتمل'}</p></div><strong className="shrink-0 text-xs text-[#153b66]">{formatSarPrice(order.finalTotal, true)}</strong></div></article>)}{!unmapped.length && <div className="border border-emerald-100 bg-emerald-50 p-5 text-center text-sm font-bold text-emerald-700">كل الطلبات الحالية تحمل إحداثيات مؤكدة.</div>}</div>
      </aside>
    </div>
  </section>;
}
function Metric({ label, value, detail, tone }: { label: string; value: string | number; detail: string; tone: 'navy' | 'sky' | 'emerald' | 'amber' }) {
  const styles = { navy: 'border-[#153b66] bg-[#153b66] text-white', sky: 'border-sky-200 bg-sky-50 text-[#153b66]', emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800', amber: 'border-amber-200 bg-amber-50 text-amber-800' }[tone];
  return <article className={`border p-4 ${styles}`}><div className="text-xs font-bold opacity-75">{label}</div><div className="mt-2 break-words text-2xl font-black tracking-tight">{value}</div><p className="mt-1 text-xs font-medium opacity-70">{detail}</p></article>;
}
function PanelHeading({ icon, title, description }: { icon: ReactNode; title: string; description: string }) { return <div><div className="flex items-center gap-2 text-sm font-black text-slate-900">{icon}{title}</div><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>; }
function PaymentPill({ status }: { status: AdminOrder['paymentStatus'] }) { const tone = paymentTone(status); const styles = tone === 'paid' ? 'bg-emerald-50 text-emerald-700' : tone === 'pending' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'; return <span className={`shrink-0 px-2 py-1 text-[10px] font-black ${styles}`}>{paymentStatusLabel(status)}</span>; }
