import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPinned, Navigation, TriangleAlert } from 'lucide-react';
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

function loadStyle() {
  if (document.querySelector(`link[href="${LEAFLET_STYLE}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = LEAFLET_STYLE;
  document.head.appendChild(link);
}

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${LEAFLET_SCRIPT}"]`);
  if (existing) return new Promise<LeafletApi>((resolve, reject) => {
    existing.addEventListener('load', () => window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable')), { once: true });
    existing.addEventListener('error', () => reject(new Error('Leaflet failed')), { once: true });
  });
  return new Promise<LeafletApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = LEAFLET_SCRIPT;
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable'));
    script.onerror = () => reject(new Error('Leaflet failed'));
    document.head.appendChild(script);
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function paymentStatusLabel(status: AdminOrder['paymentStatus']) {
  if (status === 'paid') return 'مدفوع';
  if (status === 'pending_verification') return 'قيد المراجعة';
  return 'غير مدفوع';
}

export default function AdminSalesMap({ orders }: { orders: AdminOrder[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapError, setMapError] = useState('');
  const mapped = useMemo(() => orders.filter((order) => Number.isFinite(order.customerLat) && Number.isFinite(order.customerLng)), [orders]);
  const unmapped = useMemo(() => orders.filter((order) => !Number.isFinite(order.customerLat) || !Number.isFinite(order.customerLng)), [orders]);

  useEffect(() => {
    let cancelled = false;
    loadStyle();
    void loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current) return;
      mapRef.current?.remove();
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([24.7136, 46.6753], 10);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      const coords: Array<[number, number]> = [];
      mapped.forEach((order) => {
        const point: [number, number] = [order.customerLat!, order.customerLng!];
        coords.push(point);
        const icon = L.divIcon({ className: '', html: '<span style="display:flex;width:30px;height:30px;border-radius:11px;background:#153b66;border:3px solid white;box-shadow:0 8px 20px rgba(21,59,102,.35);align-items:center;justify-content:center;color:white;font-size:13px">●</span>', iconSize: [30, 30], iconAnchor: [15, 15] });
        const orderDate = new Date(order.createdAt);
        const orderDateLabel = Number.isNaN(orderDate.getTime()) ? 'تاريخ غير مسجل' : orderDate.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
        L.marker(point, { icon }).addTo(map).bindPopup(`<div dir="rtl" style="font-family:Tahoma,Arial;min-width:210px;text-align:right"><b style="color:#153b66">طلب #${escapeHtml(formatShortOrderReference(order.paymentReference || order.id))}</b><div style="margin-top:7px">${escapeHtml(order.customerName || 'غير مسجل')}</div><div style="margin-top:4px;color:#475569">${escapeHtml(order.customerAddress || 'العنوان غير مسجل')}</div><div style="margin-top:8px;display:flex;justify-content:space-between;gap:8px;font-size:12px"><span style="font-weight:700;color:${order.paymentStatus === 'paid' ? '#15803d' : '#b45309'}">${escapeHtml(paymentStatusLabel(order.paymentStatus))}</span><span style="color:#64748b">${escapeHtml(orderDateLabel)}</span></div><strong style="display:block;margin-top:8px;color:#0b587e">${escapeHtml(formatSarPrice(order.finalTotal, true))}</strong></div>`);
      });
      if (coords.length > 1) map.fitBounds(L.latLngBounds(coords), { padding: [42, 42], maxZoom: 14 });
      else if (coords.length === 1) map.setView(coords[0], 14);
    }).catch(() => !cancelled && setMapError('تعذر تحميل الخريطة الآن. بيانات المواقع ما زالت محفوظة ويمكن مراجعتها من القائمة.'));
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, [mapped]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <MapStat icon={MapPinned} label="طلبات على الخريطة" value={mapped.length} tone="navy" />
        <MapStat icon={Navigation} label="نسبة تحديد الموقع" value={`${orders.length ? Math.round(mapped.length / orders.length * 100) : 0}%`} tone="cyan" />
        <MapStat icon={TriangleAlert} label="بدون إحداثيات" value={unmapped.length} tone="amber" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-sky-200 bg-[#dceff7] shadow-[0_28px_80px_-48px_rgba(21,59,102,.55)]">
          <div ref={containerRef} className="absolute inset-0 z-0" aria-label="خريطة مواقع المبيعات" />
          {!mapped.length && !mapError && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#eaf6fb]/90 p-8 text-center"><div><MapPinned className="mx-auto h-10 w-10 text-[#153b66]" /><h3 className="mt-4 text-xl font-black text-[#153b66]">لا توجد طلبات بإحداثيات بعد</h3><p className="mt-2 max-w-md text-sm leading-7 text-slate-600">ستظهر هنا فقط المواقع التي أكدها العميل، من غير تخمين أو تغيير لأي عنوان.</p></div></div>}
          {mapError && <div className="absolute inset-x-4 top-4 z-20 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{mapError}</div>}
          <div className="absolute bottom-4 right-4 z-[500] rounded-xl bg-white/95 px-4 py-3 text-xs font-bold text-[#153b66] shadow-lg backdrop-blur">كل نقطة تمثل طلبًا بإحداثيات مؤكدة</div>
        </section>
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-46px_rgba(15,23,42,.32)]">
          <h3 className="text-lg font-black text-slate-900">طلبات تحتاج تحديد موقع</h3>
          <p className="mt-1 text-xs leading-6 text-slate-500">لا نضعها على الخريطة إلا لو الإحداثيات محفوظة فعليًا.</p>
          <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pl-1">
            {unmapped.map((order) => <div key={order.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><b className="text-sm text-[#153b66]">#{formatShortOrderReference(order.paymentReference || order.id)}</b><span className="text-xs font-black text-slate-600">{formatSarPrice(order.finalTotal, true)}</span></div><p className="mt-2 truncate text-xs font-bold text-slate-700">{order.customerName || 'غير مسجل'}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{order.customerAddress || 'العنوان غير مسجل'}</p></div>)}
            {!unmapped.length && <div className="rounded-xl bg-emerald-50 p-5 text-center text-sm font-bold text-emerald-700">كل الطلبات الحالية لها إحداثيات.</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MapStat({ icon: Icon, label, value, tone }: { icon: typeof MapPinned; label: string; value: string | number; tone: 'navy' | 'cyan' | 'amber' }) {
  const colors = tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'cyan' ? 'bg-cyan-50 text-cyan-700' : 'bg-[#153b66] text-white';
  return <div className={`flex items-center justify-between rounded-[1.4rem] p-4 ${colors}`}><div><div className="text-2xl font-black">{value}</div><div className="mt-1 text-xs font-bold opacity-80">{label}</div></div><Icon className="h-6 w-6 opacity-80" /></div>;
}
