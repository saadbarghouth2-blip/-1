import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  Filter,
  Globe2,
  Lock,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { useWebAuth } from '../features/auth/WebAuthProvider';
import {
  loadAdminSalesDashboard,
  type AdminOrder,
  type AdminSalesDashboard,
} from '../services/adminDashboard';
import { PRODUCT_ADMIN_EMAIL } from '../services/productAdmin';
import { formatSarPrice } from '../lib/utils';

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const ORDERS_PER_PAGE = 25;

type PeriodSummary = {
  key: string;
  label: string;
  orders: number;
  items: number;
  revenue: number;
  average: number;
};

function getOrderDate(order: AdminOrder) {
  const date = new Date(order.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function paymentStatusLabel(status: AdminOrder['paymentStatus']) {
  if (status === 'paid') return 'مدفوع';
  if (status === 'pending_verification') return 'تحويل قيد المراجعة';
  return 'غير مدفوع';
}

function paymentMethodLabel(method: string | null) {
  if (method === 'bank_transfer') return 'تحويل بنكي';
  if (method === 'pos_on_delivery') return 'شبكة عند الاستلام';
  if (method === 'cash_on_delivery') return 'نقدي عند الاستلام';
  return method || 'غير محدد';
}

function sourceLabel(source: string | null | undefined) {
  if (source === 'mobile_app' || source === 'app' || source === 'mobile') return 'التطبيق';
  if (source === 'whatsapp') return 'واتساب';
  if (source === 'website' || source === 'web') return 'الموقع';
  return source || 'غير محدد';
}

function summarizePeriods(
  orders: AdminOrder[],
  getKey: (date: Date) => string,
  getLabel: (date: Date) => string,
): PeriodSummary[] {
  const summaries = new Map<string, PeriodSummary>();
  orders.forEach((order) => {
    const date = getOrderDate(order);
    if (!date) return;
    const key = getKey(date);
    const current = summaries.get(key) ?? {
      key,
      label: getLabel(date),
      orders: 0,
      items: 0,
      revenue: 0,
      average: 0,
    };
    current.orders += 1;
    current.items += order.totalItems;
    current.revenue += order.finalTotal;
    current.average = current.revenue / current.orders;
    summaries.set(key, current);
  });
  return Array.from(summaries.values()).sort((left, right) => right.key.localeCompare(left.key));
}

export default function AdminDashboard() {
  const { authReady, isConfigured, configError, session, requestEmailOtp, confirmEmailOtp, signOut } = useWebAuth();
  const [email, setEmail] = useState(PRODUCT_ADMIN_EMAIL);
  const [token, setToken] = useState('');
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [dashboard, setDashboard] = useState<AdminSalesDashboard | null>(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsBusy(true);
    setError('');
    try {
      setDashboard(await loadAdminSalesDashboard(session?.email));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'تعذر تحميل لوحة المبيعات.');
    } finally {
      setIsBusy(false);
    }
  }, [session?.email]);

  useEffect(() => {
    if (authReady && session?.email) void loadDashboard();
  }, [authReady, loadDashboard, session?.email]);

  const orders = useMemo(() => dashboard?.orders ?? dashboard?.recentOrders ?? [], [dashboard]);
  const items = useMemo(() => dashboard?.items ?? [], [dashboard]);

  const availableYears = useMemo(() => {
    return Array.from(new Set(orders.map(getOrderDate).filter(Boolean).map((date) => String(date!.getFullYear()))))
      .sort((left, right) => Number(right) - Number(left));
  }, [orders]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const date = getOrderDate(order);
    if (!date) return false;
    if (selectedYear !== 'all' && String(date.getFullYear()) !== selectedYear) return false;
    return selectedMonth === 'all' || String(date.getMonth() + 1) === selectedMonth;
  }), [orders, selectedMonth, selectedYear]);

  const filteredOrderIds = useMemo(() => new Set(filteredOrders.map((order) => order.id)), [filteredOrders]);
  const filteredItems = useMemo(() => items.filter((item) => filteredOrderIds.has(item.orderId)), [items, filteredOrderIds]);
  const ordersPageCount = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, ordersPage]);

  useEffect(() => {
    setOrdersPage(1);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setOrdersPage((currentPage) => Math.min(currentPage, ordersPageCount));
  }, [ordersPageCount]);

  const totals = useMemo(() => {
    const revenue = filteredOrders.reduce((sum, order) => sum + order.finalTotal, 0);
    return {
      orders: filteredOrders.length,
      revenue,
      items: filteredOrders.reduce((sum, order) => sum + order.totalItems, 0),
      average: filteredOrders.length ? revenue / filteredOrders.length : 0,
      unpaid: filteredOrders.filter((order) => order.paymentStatus === 'unpaid').length,
      pending: filteredOrders.filter((order) => order.paymentStatus === 'pending_verification').length,
    };
  }, [filteredOrders]);

  const yearlySummary = useMemo(() => summarizePeriods(
    filteredOrders,
    (date) => String(date.getFullYear()),
    (date) => String(date.getFullYear()),
  ), [filteredOrders]);

  const monthlySummary = useMemo(() => summarizePeriods(
    filteredOrders,
    (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    (date) => `${ARABIC_MONTHS[date.getMonth()]} ${date.getFullYear()}`,
  ), [filteredOrders]);

  const productSummary = useMemo(() => {
    const products = new Map<string, { key: string; name: string; orderIds: Set<string>; quantity: number; revenue: number }>();
    filteredItems.forEach((item) => {
      const key = item.productId || item.name;
      const current = products.get(key) ?? { key, name: item.name, orderIds: new Set<string>(), quantity: 0, revenue: 0 };
      current.orderIds.add(item.orderId);
      current.quantity += item.quantity;
      current.revenue += item.lineTotal;
      products.set(key, current);
    });
    return Array.from(products.values()).map((product) => ({
      ...product,
      orders: product.orderIds.size,
      average: product.quantity ? product.revenue / product.quantity : 0,
    })).sort((left, right) => right.revenue - left.revenue);
  }, [filteredItems]);

  const sourceSummary = useMemo(() => {
    const sources = new Map<string, { key: string; orders: number; items: number; revenue: number }>();
    filteredOrders.forEach((order) => {
      const key = order.source || order.channel || 'unknown';
      const current = sources.get(key) ?? { key, orders: 0, items: 0, revenue: 0 };
      current.orders += 1;
      current.items += order.totalItems;
      current.revenue += order.finalTotal;
      sources.set(key, current);
    });
    return Array.from(sources.values()).sort((left, right) => right.revenue - left.revenue);
  }, [filteredOrders]);

  const handleSendLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsBusy(true);
    setError('');
    setMessage('');
    try {
      await requestEmailOtp(email);
      setLoginStep('otp');
      setMessage('تم إرسال كود الدخول إلى البريد الإلكتروني.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'تعذر إرسال كود الدخول.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsBusy(true);
    setError('');
    setMessage('');
    try {
      await confirmEmailOtp(email, token);
      setMessage('تم تسجيل الدخول بنجاح.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'الكود غير صحيح أو انتهت صلاحيته.');
    } finally {
      setIsBusy(false);
    }
  };

  if (!isConfigured) {
    return <AdminCenteredState title="لوحة الإدارة غير متاحة" message={configError ?? 'Supabase غير مفعّل.'} />;
  }

  if (!session?.email) {
    return (
      <main className="relative z-10 min-h-screen px-4 py-20" dir="rtl">
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.35)]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#153b66]/10 text-[#153b66]"><Lock className="h-5 w-5" /></span>
            <div>
              <h1 className="text-xl font-black text-slate-900">دخول لوحة الإدارة</h1>
              <p className="text-sm text-slate-500">متابعة آمنة للمبيعات والطلبات.</p>
            </div>
          </div>
          <form onSubmit={loginStep === 'email' ? handleSendLogin : handleConfirmLogin} className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">{loginStep === 'email' ? 'البريد الإلكتروني' : 'كود الدخول'}</span>
              <input
                value={loginStep === 'email' ? email : token}
                onChange={(event) => loginStep === 'email' ? setEmail(event.target.value) : setToken(event.target.value.replace(/\D/g, '').slice(0, 8))}
                type={loginStep === 'email' ? 'email' : 'text'}
                inputMode={loginStep === 'email' ? 'email' : 'numeric'}
                autoComplete={loginStep === 'email' ? 'email' : 'one-time-code'}
                maxLength={loginStep === 'email' ? undefined : 8}
                placeholder={loginStep === 'email' ? PRODUCT_ADMIN_EMAIL : '12345678'}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none transition focus:border-[#153b66] focus:ring-4 focus:ring-[#153b66]/10"
              />
            </label>
            {loginStep === 'otp' && (
              <button type="button" onClick={() => { setLoginStep('email'); setToken(''); setMessage(''); setError(''); }} className="text-sm font-bold text-[#153b66]">
                تغيير البريد أو إعادة إرسال الكود
              </button>
            )}
            {message && <p role="status" aria-live="polite" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
            {error && <p role="alert" aria-live="assertive" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            <button type="submit" disabled={isBusy} className="inline-flex w-full items-center justify-center rounded-full bg-[#153b66] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
              {isBusy ? 'جاري التنفيذ...' : loginStep === 'email' ? 'إرسال الكود' : 'تأكيد الكود'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-screen py-12 sm:py-16" dir="rtl">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <section className="overflow-hidden rounded-[2rem] bg-[#153b66] p-5 text-white shadow-[0_28px_80px_-42px_rgba(21,59,102,0.62)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold"><BarChart3 className="h-4 w-4" /> مركز المبيعات</div>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">لوحة متابعة المبيعات</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">عرض شامل لكل الطلبات من جميع المصادر مع تفاصيل شهرية وسنوية وتحليل المنتجات.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void loadDashboard()} disabled={isBusy} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold disabled:opacity-60">
                <RefreshCw className={`h-4 w-4 ${isBusy ? 'animate-spin' : ''}`} /> تحديث
              </button>
              <Link to="/admin/products" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#153b66]"><Boxes className="h-4 w-4" /> إدارة المنتجات</Link>
              <button type="button" onClick={() => void signOut()} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">خروج</button>
            </div>
          </div>
        </section>

        <section className="mt-4 flex flex-col gap-3 rounded-[1.4rem] border border-sky-200 bg-sky-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#153b66] shadow-sm"><ShieldCheck className="h-5 w-5" /></span>
            <div><h2 className="font-black text-[#153b66]">سجل المبيعات للعرض فقط</h2><p className="mt-1 text-sm leading-6 text-slate-600">لا توجد هنا أي أدوات تعديل أو حذف. السجل يحافظ على الطلبات ويعرضها كما تم تسجيلها.</p></div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-emerald-700"><Lock className="h-3.5 w-3.5" /> قراءة فقط</span>
        </section>

        <p className="sr-only" role="status" aria-live="polite">{isBusy ? 'جاري تحميل بيانات المبيعات.' : 'اكتمل تحميل بيانات المبيعات.'}</p>
        {error && <section role="alert" aria-live="assertive" className="mt-4 rounded-[1.4rem] border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</section>}

        <section className="mt-6 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.3)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#153b66]/10 text-[#153b66]"><Filter className="h-5 w-5" /></span><div><h2 className="font-black text-slate-900">تصفية الفترة</h2><p className="text-xs text-slate-500">كل الأرقام والجداول التالية تتبع الاختيار.</p></div></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FilterSelect label="السنة" value={selectedYear} onChange={setSelectedYear} icon={<CalendarDays className="h-4 w-4" />}>
                <option value="all">كل السنوات</option>{availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </FilterSelect>
              <FilterSelect label="الشهر" value={selectedMonth} onChange={setSelectedMonth} icon={<CalendarDays className="h-4 w-4" />}>
                <option value="all">كل الشهور</option>{ARABIC_MONTHS.map((month, index) => <option key={month} value={String(index + 1)}>{month}</option>)}
              </FilterSelect>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard icon={ClipboardList} label="عدد الطلبات" value={String(totals.orders)} />
          <MetricCard icon={Wallet} label="قيمة المبيعات" value={formatSarPrice(totals.revenue, true)} />
          <MetricCard icon={Package} label="المنتجات المباعة" value={String(totals.items)} />
          <MetricCard icon={ShoppingBag} label="متوسط الطلب" value={formatSarPrice(totals.average, true)} />
          <MetricCard icon={Lock} label="طلبات غير مدفوعة" value={String(totals.unpaid)} tone="amber" />
          <MetricCard icon={RefreshCw} label="تحويلات قيد المراجعة" value={String(totals.pending)} tone="sky" />
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)] sm:p-5">
          <SectionHeading icon={<ClipboardList className="h-5 w-5" />} title="كل الطلبات" description={`${filteredOrders.length} طلب ضمن الفترة المحددة — دون أي إمكانية للتعديل أو الحذف.`} />
          <div className="mt-4 overflow-x-auto rounded-[1.3rem] border border-slate-200">
            <table className="w-full min-w-[1120px] text-right text-sm">
              <thead className="bg-slate-50 text-xs font-black text-slate-500"><tr><th scope="col" className="px-4 py-3">العميل</th><th scope="col" className="px-4 py-3">الجوال</th><th scope="col" className="px-4 py-3">المصدر</th><th scope="col" className="px-4 py-3">الكمية</th><th scope="col" className="px-4 py-3">الإجمالي</th><th scope="col" className="px-4 py-3">الدفع</th><th scope="col" className="px-4 py-3">الحالة</th><th scope="col" className="px-4 py-3">التاريخ</th><th scope="col" className="px-4 py-3">المرجع</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">{order.customerName || 'غير مسجل'}</td>
                    <td className="px-4 py-3 text-slate-600" dir="ltr">{order.customerPhone || '—'}</td>
                    <td className="px-4 py-3"><SourceBadge source={order.source || order.channel} /></td>
                    <td className="px-4 py-3 font-bold text-slate-700">{order.totalItems}</td>
                    <td className="px-4 py-3 font-black text-[#153b66]">{formatSarPrice(order.finalTotal, true)}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-600">{paymentMethodLabel(order.paymentMethod)}</td>
                    <td className="px-4 py-3"><PaymentBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{getOrderDate(order)?.toLocaleString('ar-SA') ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500" dir="ltr">{order.paymentReference || order.id.slice(0, 8)}</td>
                  </tr>
                ))}
                {!filteredOrders.length && <EmptyTable colSpan={9} message="لا توجد طلبات في الفترة المحددة." />}
              </tbody>
            </table>
          </div>
          {filteredOrders.length > 0 && (
            <nav aria-label="صفحات الطلبات" className="mt-4 flex flex-col gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-slate-600" aria-live="polite">
                الصفحة {ordersPage} من {ordersPageCount} · عرض {((ordersPage - 1) * ORDERS_PER_PAGE) + 1}–{Math.min(ordersPage * ORDERS_PER_PAGE, filteredOrders.length)} من {filteredOrders.length}
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOrdersPage((page) => Math.max(1, page - 1))} disabled={ordersPage === 1} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#153b66] disabled:cursor-not-allowed disabled:opacity-40">السابق</button>
                <button type="button" onClick={() => setOrdersPage((page) => Math.min(ordersPageCount, page + 1))} disabled={ordersPage === ordersPageCount} className="rounded-full bg-[#153b66] px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">التالي</button>
              </div>
            </nav>
          )}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <SummaryTable title="ملخص سنوي" description="الأداء السنوي حسب الفترة المختارة." rows={yearlySummary} />
          <SummaryTable title="ملخص شهري" description="الأداء الشهري حسب الفترة المختارة." rows={monthlySummary} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)] sm:p-5">
            <SectionHeading icon={<Package className="h-5 w-5" />} title="تفصيل المبيعات حسب المنتج" description="الطلبات والكمية والإيراد ومتوسط سعر الوحدة." />
            <div className="mt-4 overflow-x-auto rounded-[1.3rem] border border-slate-200">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="bg-slate-50 text-xs font-black text-slate-500"><tr><th scope="col" className="px-4 py-3">المنتج</th><th scope="col" className="px-4 py-3">طلبات تحتويه</th><th scope="col" className="px-4 py-3">الكمية</th><th scope="col" className="px-4 py-3">الإيراد</th><th scope="col" className="px-4 py-3">متوسط الوحدة</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {productSummary.map((product) => <tr key={product.key}><td className="px-4 py-3 font-bold text-slate-900">{product.name}</td><td className="px-4 py-3 text-slate-600">{product.orders}</td><td className="px-4 py-3 font-bold text-slate-700">{product.quantity}</td><td className="px-4 py-3 font-black text-[#153b66]">{formatSarPrice(product.revenue, true)}</td><td className="px-4 py-3 text-slate-600">{formatSarPrice(product.average, true)}</td></tr>)}
                  {!productSummary.length && <EmptyTable colSpan={5} message="لا توجد تفاصيل منتجات في الفترة المحددة." />}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)] sm:p-5">
            <SectionHeading icon={<Globe2 className="h-5 w-5" />} title="مصادر الطلبات" description="الموقع والتطبيق وأي قنوات أخرى مسجلة." />
            <div className="mt-4 space-y-3">
              {sourceSummary.map((source) => (
                <div key={source.key} className="rounded-[1.2rem] border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3"><SourceBadge source={source.key} /><strong className="text-[#153b66]">{formatSarPrice(source.revenue, true)}</strong></div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500"><span>الطلبات <b className="text-slate-800">{source.orders}</b></span><span>الكمية <b className="text-slate-800">{source.items}</b></span></div>
                </div>
              ))}
              {!sourceSummary.length && <div className="rounded-[1.2rem] bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">لا توجد مصادر مسجلة في الفترة المحددة.</div>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterSelect({ label, value, onChange, icon, children }: { label: string; value: string; onChange: (value: string) => void; icon: ReactNode; children: ReactNode }) {
  return <label className="min-w-[170px]"><span className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-slate-500">{icon}{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#153b66]">{children}</select></label>;
}

function MetricCard({ icon: Icon, label, value, tone = 'navy' }: { icon: typeof Wallet; label: string; value: string; tone?: 'navy' | 'amber' | 'sky' }) {
  const color = tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'sky' ? 'bg-sky-50 text-sky-700' : 'bg-[#153b66]/10 text-[#153b66]';
  return <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.25)]"><span className={`flex h-11 w-11 items-center justify-center rounded-full ${color}`}><Icon className="h-5 w-5" /></span><div className="mt-4 break-words text-2xl font-black text-slate-900">{value}</div><div className="mt-1 text-sm font-bold text-slate-500">{label}</div></div>;
}

function SectionHeading({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#153b66]/10 text-[#153b66]">{icon}</span><div><h2 className="text-lg font-black text-slate-900 sm:text-xl">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>;
}

function PaymentBadge({ status }: { status: AdminOrder['paymentStatus'] }) {
  const classes = status === 'paid' ? 'bg-emerald-50 text-emerald-700' : status === 'pending_verification' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${classes}`}>{paymentStatusLabel(status)}</span>;
}

function SourceBadge({ source }: { source: string | null | undefined }) {
  return <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-[#153b66]">{sourceLabel(source)}</span>;
}

function SummaryTable({ title, description, rows }: { title: string; description: string; rows: PeriodSummary[] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)] sm:p-5">
      <SectionHeading icon={<CalendarDays className="h-5 w-5" />} title={title} description={description} />
      <div className="mt-4 overflow-x-auto rounded-[1.3rem] border border-slate-200"><table className="w-full min-w-[600px] text-right text-sm"><thead className="bg-slate-50 text-xs font-black text-slate-500"><tr><th scope="col" className="px-4 py-3">الفترة</th><th scope="col" className="px-4 py-3">الطلبات</th><th scope="col" className="px-4 py-3">الكمية</th><th scope="col" className="px-4 py-3">المبيعات</th><th scope="col" className="px-4 py-3">المتوسط</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.key}><td className="px-4 py-3 font-black text-slate-900">{row.label}</td><td className="px-4 py-3 text-slate-600">{row.orders}</td><td className="px-4 py-3 text-slate-600">{row.items}</td><td className="px-4 py-3 font-black text-[#153b66]">{formatSarPrice(row.revenue, true)}</td><td className="px-4 py-3 text-slate-600">{formatSarPrice(row.average, true)}</td></tr>)}{!rows.length && <EmptyTable colSpan={5} message="لا توجد بيانات كافية لهذا الملخص." />}</tbody></table></div>
    </div>
  );
}

function EmptyTable({ colSpan, message }: { colSpan: number; message: string }) {
  return <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-sm font-bold text-slate-500">{message}</td></tr>;
}

function AdminCenteredState({ title, message }: { title: string; message: string }) {
  return <main className="relative z-10 min-h-screen px-4 py-24"><div className="mx-auto max-w-xl rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900" dir="rtl"><Lock className="mb-3 h-7 w-7" /><h1 className="text-2xl font-black">{title}</h1><p className="mt-3 text-sm leading-7">{message}</p></div></main>;
}
