import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  Filter,
  Eye,
  FileText,
  Globe2,
  LayoutDashboard,
  MapPinned,
  Image as ImageIcon,
  Lock,
  Package,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  X,
} from 'lucide-react';
import AdminSalesMap from '../components/admin/AdminSalesMap';
import { useWebAuth } from '../features/auth/WebAuthProvider';
import {
  loadAdminSalesDashboard,
  recordAdminPaymentStatus,
  type AdminOrder,
  type AdminPaymentStatus,
  type AdminSalesDashboard,
} from '../services/adminDashboard';
import { PRODUCT_ADMIN_EMAIL } from '../services/productAdmin';
import { formatSarPrice } from '../lib/utils';
import { downloadInvoice, formatShortOrderReference, type InvoiceData, type InvoiceDownloadFormat } from '../lib/invoice';

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

type AdminView = 'overview' | 'orders' | 'map' | 'products' | 'reports';

const ADMIN_VIEWS: Array<{ id: AdminView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'orders', label: 'الطلبات', icon: ClipboardList },
  { id: 'map', label: 'خريطة المبيعات', icon: MapPinned },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'reports', label: 'التقارير', icon: BarChart3 },
];

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

function paymentMethodLabel(method: string | null) {
  if (method === 'bank_transfer') return 'تحويل بنكي';
  if (method === 'pos_on_delivery') return 'شبكة عند الاستلام';
  if (method === 'cash_on_delivery') return 'نقدي عند الاستلام';
  return method || 'غير محدد';
}

function sourceLabel(source: string | null | undefined) {
  if (source === 'mobile_app' || source === 'app' || source === 'mobile') return 'التطبيق';
  if (source === 'whatsapp') return 'واتساب';
  if (source === 'email') return 'البريد الإلكتروني';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { authReady, isConfigured, configError, session, requestEmailOtp, confirmEmailOtp, signOut } = useWebAuth();
  const [email, setEmail] = useState(PRODUCT_ADMIN_EMAIL);
  const [token, setToken] = useState('');
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [dashboard, setDashboard] = useState<AdminSalesDashboard | null>(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminPaymentStatus>('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState('');
  const [paymentStatusDrafts, setPaymentStatusDrafts] = useState<Record<string, AdminPaymentStatus>>({});
  const [updatingPaymentOrderId, setUpdatingPaymentOrderId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const ordersSectionRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const requestedView = searchParams.get('view');
  const activeView: AdminView = ADMIN_VIEWS.some((view) => view.id === requestedView)
    ? requestedView as AdminView
    : 'overview';

  const setActiveView = (view: AdminView) => {
    setSearchParams(view === 'overview' ? {} : { view });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const periodOrders = useMemo(() => orders.filter((order) => {
    const date = getOrderDate(order);
    if (!date) return false;
    if (selectedYear !== 'all' && String(date.getFullYear()) !== selectedYear) return false;
    return selectedMonth === 'all' || String(date.getMonth() + 1) === selectedMonth;
  }), [orders, selectedMonth, selectedYear]);

  const availableSources = useMemo(() => Array.from(new Set(periodOrders.map((order) => order.channel || order.source).filter(Boolean))).sort(), [periodOrders]);
  const filteredOrders = useMemo(() => {
    const needle = orderSearch.trim().toLocaleLowerCase('ar');
    return periodOrders.filter((order) => {
      if (statusFilter !== 'all' && order.paymentStatus !== statusFilter) return false;
      if (sourceFilter !== 'all' && (order.channel || order.source) !== sourceFilter) return false;
      if (!needle) return true;
      return [order.customerName, order.customerPhone, order.customerEmail, order.paymentReference, order.id]
        .some((value) => String(value ?? '').toLocaleLowerCase('ar').includes(needle));
    });
  }, [orderSearch, periodOrders, sourceFilter, statusFilter]);

  const periodOrderIds = useMemo(() => new Set(periodOrders.map((order) => order.id)), [periodOrders]);
  const filteredItems = useMemo(() => items.filter((item) => periodOrderIds.has(item.orderId)), [items, periodOrderIds]);
  const ordersPageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, ordersPage, pageSize]);

  useEffect(() => {
    setOrdersPage(1);
  }, [selectedMonth, selectedYear, orderSearch, sourceFilter, statusFilter, pageSize]);

  useEffect(() => {
    setOrdersPage((currentPage) => Math.min(currentPage, ordersPageCount));
  }, [ordersPageCount]);

  const totals = useMemo(() => {
    const revenue = periodOrders.reduce((sum, order) => sum + order.finalTotal, 0);
    return {
      orders: periodOrders.length,
      revenue,
      items: periodOrders.reduce((sum, order) => sum + order.totalItems, 0),
      average: periodOrders.length ? revenue / periodOrders.length : 0,
      unpaid: periodOrders.filter((order) => order.paymentStatus === 'unpaid').length,
      pending: periodOrders.filter((order) => order.paymentStatus === 'pending_verification').length,
    };
  }, [periodOrders]);

  const yearlySummary = useMemo(() => summarizePeriods(
    periodOrders,
    (date) => String(date.getFullYear()),
    (date) => String(date.getFullYear()),
  ), [periodOrders]);

  const monthlySummary = useMemo(() => summarizePeriods(
    periodOrders,
    (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    (date) => `${ARABIC_MONTHS[date.getMonth()]} ${date.getFullYear()}`,
  ), [periodOrders]);

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
    periodOrders.forEach((order) => {
      const key = order.channel || order.source || 'unknown';
      const current = sources.get(key) ?? { key, orders: 0, items: 0, revenue: 0 };
      current.orders += 1;
      current.items += order.totalItems;
      current.revenue += order.finalTotal;
      sources.set(key, current);
    });
    return Array.from(sources.values()).sort((left, right) => right.revenue - left.revenue);
  }, [periodOrders]);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const recentPeriodOrders = useMemo(() => periodOrders.slice(0, 5), [periodOrders]);
  const paymentSummary = useMemo(() => [
    { key: 'paid', label: 'مدفوع', value: periodOrders.filter((order) => order.paymentStatus === 'paid').length, color: 'bg-emerald-500' },
    { key: 'pending', label: 'قيد المراجعة', value: periodOrders.filter((order) => order.paymentStatus === 'pending_verification').length, color: 'bg-sky-500' },
    { key: 'unpaid', label: 'غير مدفوع', value: periodOrders.filter((order) => order.paymentStatus === 'unpaid').length, color: 'bg-amber-500' },
  ], [periodOrders]);

  const changeOrdersPage = (page: number) => {
    setOrdersPage(Math.max(1, Math.min(ordersPageCount, page)));
    window.requestAnimationFrame(() => ordersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const openOrderDrawer = (orderId: string, trigger: HTMLButtonElement) => {
    drawerTriggerRef.current = trigger;
    setSelectedOrderId(orderId);
  };

  const closeOrderDrawer = useCallback(() => {
    setSelectedOrderId(null);
    window.requestAnimationFrame(() => drawerTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    drawerCloseRef.current?.focus();
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeOrderDrawer();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOrderDrawer, selectedOrder]);

  const trapDrawerFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !drawerRef.current) return;
    const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const handleInvoiceDownload = async (order: AdminOrder, format: InvoiceDownloadFormat) => {
    const key = `${order.id}:${format}`;
    setDownloadingInvoice(key);
    setError('');
    try {
      const orderItems = items.filter((item) => item.orderId === order.id);
      const invoiceData: InvoiceData = {
        invoiceNumber: `INV-${order.paymentReference || order.id.slice(0, 8)}`,
        orderNumber: order.paymentReference || order.id,
        issuedAt: new Date(),
        customerName: order.customerName || 'غير مسجل',
        customerPhone: order.customerPhone || 'غير مسجل',
        customerEmail: order.customerEmail,
        customerAddress: order.customerAddress || 'غير مسجل',
        paymentMethod: paymentMethodLabel(order.paymentMethod),
        paymentStatus: order.paymentStatus,
        items: orderItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        total: order.finalTotal,
      };
      await downloadInvoice(invoiceData, format);
    } catch (nextError) {
      console.error('Unable to generate the admin invoice.', nextError);
      setError('تعذر تجهيز فاتورة الطلب. حاول مرة أخرى.');
    } finally {
      setDownloadingInvoice('');
    }
  };

  const handlePaymentStatusUpdate = async (order: AdminOrder) => {
    const nextStatus = paymentStatusDrafts[order.id] ?? order.paymentStatus;
    if (nextStatus === order.paymentStatus) return;
    setUpdatingPaymentOrderId(order.id);
    setError('');
    setMessage('');
    try {
      await recordAdminPaymentStatus(session?.email, order.id, nextStatus, order.finalTotal);
      setDashboard((current) => current ? {
        ...current,
        orders: current.orders.map((item) => item.id === order.id ? { ...item, paymentStatus: nextStatus } : item),
        recentOrders: current.recentOrders.map((item) => item.id === order.id ? { ...item, paymentStatus: nextStatus } : item),
      } : current);
      setPaymentStatusDrafts((current) => {
        const next = { ...current };
        delete next[order.id];
        return next;
      });
      setMessage('تم تحديث حالة الدفع وحفظها في سجل الطلب. فاتورة الإدارة ستظهر بالحالة الجديدة.');
    } catch (nextError) {
      console.error('Unable to update payment status.', nextError);
      setError(nextError instanceof Error ? nextError.message : 'تعذر تحديث حالة الدفع.');
    } finally {
      setUpdatingPaymentOrderId('');
    }
  };

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
    <main className="relative min-h-screen py-12 sm:py-16" dir="rtl">
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

        <nav aria-label="أقسام لوحة الإدارة" className="sticky top-[5.5rem] z-40 mt-4 overflow-x-auto rounded-[1.35rem] border border-sky-100 bg-white/95 p-2 shadow-[0_16px_45px_-28px_rgba(21,59,102,.45)] backdrop-blur">
          <div className="flex min-w-max gap-2">
            {ADMIN_VIEWS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActiveView(id)} aria-current={activeView === id ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${activeView === id ? 'bg-[#153b66] text-white shadow-md' : 'text-slate-600 hover:bg-sky-50 hover:text-[#153b66]'}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
        </nav>

        <section className="mt-4 flex flex-col gap-3 rounded-[1.4rem] border border-sky-200 bg-sky-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#153b66] shadow-sm"><ShieldCheck className="h-5 w-5" /></span>
            <div><h2 className="font-black text-[#153b66]">سجل المبيعات للعرض فقط</h2><p className="mt-1 text-sm leading-6 text-slate-600">لا توجد هنا أي أدوات تعديل أو حذف. السجل يحافظ على الطلبات ويعرضها كما تم تسجيلها.</p></div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-emerald-700"><Lock className="h-3.5 w-3.5" /> قراءة فقط</span>
        </section>

        <p className="sr-only" role="status" aria-live="polite">{isBusy ? 'جاري تحميل بيانات المبيعات.' : 'اكتمل تحميل بيانات المبيعات.'}</p>
        {error && <section role="alert" aria-live="assertive" className="mt-4 rounded-[1.4rem] border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</section>}

        {(activeView === 'overview' || activeView === 'reports' || activeView === 'orders' || activeView === 'products') && <section className="mt-6 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.3)] sm:p-5">
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
        </section>}

        {activeView === 'overview' && <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard icon={ClipboardList} label="عدد الطلبات" value={String(totals.orders)} />
          <MetricCard icon={Wallet} label="قيمة المبيعات" value={formatSarPrice(totals.revenue, true)} />
          <MetricCard icon={Package} label="المنتجات المباعة" value={String(totals.items)} />
          <MetricCard icon={ShoppingBag} label="متوسط الطلب" value={formatSarPrice(totals.average, true)} />
          <MetricCard icon={Lock} label="طلبات غير مدفوعة" value={String(totals.unpaid)} tone="amber" />
          <MetricCard icon={RefreshCw} label="تحويلات قيد المراجعة" value={String(totals.pending)} tone="sky" />
        </section>}

        {activeView === 'overview' && <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,.22)]"><SectionHeading icon={<ClipboardList className="h-5 w-5" />} title="أحدث الطلبات" description="آخر الطلبات ضمن الفترة الظاهرة في لوحة التحكم." /><div className="mt-4 space-y-2">{recentPeriodOrders.map((order) => <button key={order.id} type="button" onClick={(event) => openOrderDrawer(order.id, event.currentTarget)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-right transition hover:border-sky-200 hover:bg-sky-50"><div><b className="text-sm text-slate-900">{order.customerName || 'غير مسجل'}</b><div className="mt-1 text-xs text-slate-500">#{formatShortOrderReference(order.paymentReference || order.id)} · {getOrderDate(order)?.toLocaleDateString('ar-SA') ?? '—'}</div></div><strong className="text-sm text-[#153b66]">{formatSarPrice(order.finalTotal, true)}</strong></button>)}{!recentPeriodOrders.length && <p className="rounded-xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">لا توجد طلبات في الفترة.</p>}</div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,.22)]"><SectionHeading icon={<BarChart3 className="h-5 w-5" />} title="حالة التحصيل" description="مقارنة حقيقية لحالات الدفع ضمن الفترة المختارة." /><div className="mt-6 space-y-5">{paymentSummary.map((entry) => { const percentage = periodOrders.length ? Math.round(entry.value / periodOrders.length * 100) : 0; return <div key={entry.key}><div className="mb-2 flex items-center justify-between text-sm font-black"><span className="text-slate-700">{entry.label}</span><span className="text-[#153b66]">{entry.value} · {percentage}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${entry.color}`} style={{ width: `${percentage}%` }} /></div></div>; })}</div><button type="button" onClick={() => setActiveView('map')} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#153b66] px-4 py-3 text-sm font-black text-white"><MapPinned className="h-4 w-4" /> فتح خريطة المبيعات</button></div>
        </section>}

        {activeView === 'map' && (
          <section className="mt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.3rem] border border-sky-200 bg-sky-50 px-4 py-3"><div><b className="text-sm text-[#153b66]">نطاق الخريطة الحالي</b><p className="mt-1 text-xs text-slate-600">{selectedYear === 'all' ? 'كل السنوات' : selectedYear} · {selectedMonth === 'all' ? 'كل الشهور' : ARABIC_MONTHS[Number(selectedMonth) - 1]}</p></div><button type="button" onClick={() => { setSelectedYear('all'); setSelectedMonth('all'); }} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#153b66] shadow-sm">عرض كل الوقت</button></div>
            <AdminSalesMap orders={periodOrders} />
          </section>
        )}

        {activeView === 'orders' && <section ref={ordersSectionRef} className="mt-6 scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)] sm:p-5">
          <SectionHeading icon={<ClipboardList className="h-5 w-5" />} title="كل الطلبات" description={`${filteredOrders.length} طلب ضمن الفترة المحددة — الطلبات محفوظة دون حذف، ويمكن تحديث حالة الدفع فقط مع الاحتفاظ بسجل التغييرات.`} />
          <div className="mt-4 grid gap-3 rounded-[1.25rem] bg-slate-50 p-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_180px_110px]">
            <label className="relative"><span className="sr-only">ابحث في الطلبات</span><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="اسم العميل، الجوال أو رقم الطلب" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm font-bold outline-none focus:border-[#0b587e]" /></label>
            <select aria-label="تصفية حالة الدفع" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | AdminPaymentStatus)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold"><option value="all">كل حالات الدفع</option><option value="paid">مدفوع</option><option value="unpaid">غير مدفوع</option><option value="pending_verification">قيد المراجعة</option></select>
            <select aria-label="تصفية مصدر الطلب" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold"><option value="all">كل المصادر</option>{availableSources.map((source) => <option key={source} value={source}>{sourceLabel(source)}</option>)}</select>
            <select aria-label="عدد الطلبات في الصفحة" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="min-w-[132px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold"><option value={10}>10 في الصفحة</option><option value={25}>25 في الصفحة</option><option value={50}>50 في الصفحة</option></select>
          </div>
          <div className="mt-4 space-y-3">
            <div className="hidden grid-cols-[minmax(150px,1.35fr)_minmax(86px,.75fr)_minmax(110px,.9fr)_minmax(170px,1fr)_auto] items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-500 xl:grid">
              <span>العميل</span><span>المرجع</span><span>التاريخ والإجمالي</span><span>حالة الدفع</span><span>الإجراءات</span>
            </div>
            {paginatedOrders.map((order) => (
              <article key={order.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md xl:grid xl:grid-cols-[minmax(150px,1.35fr)_minmax(86px,.75fr)_minmax(110px,.9fr)_minmax(170px,1fr)_auto] xl:items-center xl:gap-3">
                <div className="min-w-0"><h3 className="truncate font-black text-slate-900">{order.customerName || 'غير مسجل'}</h3><div className="mt-1 flex flex-wrap items-center gap-2"><span className="text-xs text-slate-500" dir="ltr">{order.customerPhone || '—'}</span><SourceBadge source={order.channel || order.source} /></div></div>
                <div className="mt-3 xl:mt-0"><span className="text-[11px] font-bold text-slate-400 xl:hidden">المرجع</span><p className="font-mono text-xs font-bold text-slate-500" dir="ltr" title={order.paymentReference || order.id}>#{formatShortOrderReference(order.paymentReference || order.id)}</p></div>
                <div className="mt-3 xl:mt-0"><span className="text-[11px] font-bold text-slate-400 xl:hidden">التاريخ والإجمالي</span><p className="text-xs text-slate-500">{getOrderDate(order)?.toLocaleDateString('ar-SA') ?? '—'}</p><strong className="mt-1 block text-sm text-[#153b66]">{formatSarPrice(order.finalTotal, true)}</strong></div>
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 xl:mt-0"><select aria-label={`حالة دفع طلب ${order.paymentReference || order.id}`} value={paymentStatusDrafts[order.id] ?? order.paymentStatus} onChange={(event) => setPaymentStatusDrafts((current) => ({ ...current, [order.id]: event.target.value as AdminPaymentStatus }))} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black"><option value="unpaid">غير مدفوع</option><option value="pending_verification">قيد المراجعة</option><option value="paid">مدفوع</option></select><button type="button" aria-label="حفظ حالة الدفع" title="حفظ حالة الدفع" onClick={() => void handlePaymentStatusUpdate(order)} disabled={updatingPaymentOrderId === order.id || (paymentStatusDrafts[order.id] ?? order.paymentStatus) === order.paymentStatus} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">{updatingPaymentOrderId === order.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}</button></div>
                <div className="mt-3 flex items-center gap-2 xl:mt-0"><button type="button" aria-label="تنزيل الفاتورة PDF" title="تنزيل الفاتورة PDF" onClick={() => void handleInvoiceDownload(order, 'pdf')} disabled={Boolean(downloadingInvoice)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#153b66] text-white disabled:cursor-wait disabled:opacity-40"><FileText className="h-4 w-4" /></button><button type="button" aria-label="تنزيل الفاتورة صورة" title="تنزيل الفاتورة صورة" onClick={() => void handleInvoiceDownload(order, 'png')} disabled={Boolean(downloadingInvoice)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800 disabled:cursor-wait disabled:opacity-40"><ImageIcon className="h-4 w-4" /></button><button type="button" aria-label="عرض تفاصيل الطلب" title="عرض التفاصيل" onClick={(event) => openOrderDrawer(order.id, event.currentTarget)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#153b66] transition hover:bg-sky-50"><Eye className="h-4 w-4" /></button></div>
              </article>
            ))}
            {!filteredOrders.length && <p className="rounded-xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">لا توجد طلبات مطابقة.</p>}
          </div>
          {filteredOrders.length > 0 && (
            <nav aria-label="صفحات الطلبات" className="mt-4 flex flex-col gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-slate-600" aria-live="polite">
                الصفحة {ordersPage} من {ordersPageCount} · عرض {((ordersPage - 1) * pageSize) + 1}–{Math.min(ordersPage * pageSize, filteredOrders.length)} من {filteredOrders.length}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => changeOrdersPage(ordersPage - 1)} disabled={ordersPage === 1} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#153b66] disabled:cursor-not-allowed disabled:opacity-40">السابق</button>
                {Array.from({ length: ordersPageCount }, (_, index) => index + 1).filter((page) => page === 1 || page === ordersPageCount || Math.abs(page - ordersPage) <= 1).map((page, index, visible) => <span key={page} className="contents">{index > 0 && page - visible[index - 1] > 1 && <span className="px-1 text-slate-400">…</span>}<button type="button" onClick={() => changeOrdersPage(page)} aria-current={page === ordersPage ? 'page' : undefined} className={`h-9 min-w-9 rounded-full px-2 text-sm font-black ${page === ordersPage ? 'bg-[#0b587e] text-white' : 'border border-slate-200 bg-white text-[#153b66]'}`}>{page}</button></span>)}
                <button type="button" onClick={() => changeOrdersPage(ordersPage + 1)} disabled={ordersPage === ordersPageCount} className="rounded-full bg-[#153b66] px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">التالي</button>
              </div>
            </nav>
          )}
        </section>}

        {activeView === 'reports' && <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <SummaryTable title="ملخص سنوي" description="الأداء السنوي حسب الفترة المختارة." rows={yearlySummary} />
          <SummaryTable title="ملخص شهري" description="الأداء الشهري حسب الفترة المختارة." rows={monthlySummary} />
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5"><SectionHeading icon={<Globe2 className="h-5 w-5" />} title="الأداء حسب المصدر" description="الطلبات والإيراد لكل قناة ضمن الفترة." /><div className="mt-4 space-y-3">{sourceSummary.map((source) => <div key={source.key} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"><div><SourceBadge source={source.key} /><p className="mt-2 text-xs text-slate-500">{source.orders} طلب · {source.items} وحدة</p></div><strong className="text-[#153b66]">{formatSarPrice(source.revenue, true)}</strong></div>)}</div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5"><SectionHeading icon={<Wallet className="h-5 w-5" />} title="حالات الدفع" description="توزيع التحصيل ضمن الفترة المختارة." /><div className="mt-5 space-y-4">{paymentSummary.map((entry) => <div key={entry.key} className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${entry.color}`} /><span className="flex-1 text-sm font-bold text-slate-700">{entry.label}</span><strong className="text-[#153b66]">{entry.value}</strong></div>)}</div></div>
        </section>}

        {(activeView === 'products' || activeView === 'overview') && <section className={`mt-6 grid gap-6 ${activeView === 'overview' ? 'xl:grid-cols-[1.35fr_0.65fr]' : ''}`}>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)] sm:p-5">
            <SectionHeading icon={<Package className="h-5 w-5" />} title="تفصيل المبيعات حسب المنتج" description="الطلبات والكمية والإيراد ومتوسط سعر الوحدة." />
            {activeView === 'products' && <div className="mt-5 grid gap-3 sm:grid-cols-3">{productSummary.slice(0, 3).map((product, index) => <div key={product.key} className="rounded-[1.25rem] bg-gradient-to-br from-[#153b66] to-[#0b587e] p-4 text-white"><span className="text-xs font-black text-white/65">الترتيب #{index + 1}</span><h3 className="mt-2 line-clamp-2 font-black">{product.name}</h3><div className="mt-4 text-xl font-black">{formatSarPrice(product.revenue, true)}</div><p className="mt-1 text-xs text-white/70">{product.quantity} وحدة · {product.orders} طلب</p></div>)}</div>}
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

          <div className={`rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)] sm:p-5 ${activeView === 'products' ? 'hidden' : ''}`}>
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
        </section>}
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-slate-950/35 backdrop-blur-sm" onClick={closeOrderDrawer}>
          <aside ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="order-drawer-title" onKeyDown={trapDrawerFocus} onClick={(event) => event.stopPropagation()} className="absolute inset-y-0 left-0 w-full max-w-lg overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><span className="text-xs font-black text-sky-700">تفاصيل الطلب</span><h2 id="order-drawer-title" className="mt-1 text-2xl font-black text-[#153b66]">#{formatShortOrderReference(selectedOrder.paymentReference || selectedOrder.id)}</h2></div><button ref={drawerCloseRef} type="button" aria-label="إغلاق تفاصيل الطلب" onClick={closeOrderDrawer} className="rounded-full bg-slate-100 p-2 text-slate-600"><X className="h-5 w-5" /></button></div>
            <div className="mt-6 grid grid-cols-2 gap-3">{[['العميل', selectedOrder.customerName], ['الجوال', selectedOrder.customerPhone], ['الإجمالي', formatSarPrice(selectedOrder.finalTotal, true)], ['الكمية', String(selectedOrder.totalItems)], ['طريقة الدفع', paymentMethodLabel(selectedOrder.paymentMethod)], ['المصدر', sourceLabel(selectedOrder.channel || selectedOrder.source)]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><div className="text-xs font-bold text-slate-400">{label}</div><div className="mt-1 break-words text-sm font-black text-slate-800">{value || 'غير مسجل'}</div></div>)}</div>
            <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4"><div className="text-xs font-bold text-slate-500">عنوان التوصيل</div><div className="mt-2 text-sm font-black leading-7 text-[#153b66]">{selectedOrder.customerAddress || 'غير مسجل'}</div></div>
            <h3 className="mt-6 font-black text-slate-900">المنتجات</h3><div className="mt-3 space-y-2">{items.filter((item) => item.orderId === selectedOrder.id).map((item) => <div key={`${item.orderId}-${item.productId}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div><div className="text-sm font-black text-slate-800">{item.name}</div><div className="mt-1 text-xs text-slate-500">الكمية: {item.quantity}</div></div><strong className="text-sm text-[#153b66]">{formatSarPrice(item.lineTotal, true)}</strong></div>)}</div>
            <div className="mt-6 grid grid-cols-2 gap-2"><button type="button" onClick={() => void handleInvoiceDownload(selectedOrder, 'pdf')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#153b66] px-4 py-3 text-sm font-black text-white"><FileText className="h-4 w-4" /> PDF</button><button type="button" onClick={() => void handleInvoiceDownload(selectedOrder, 'png')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm font-black text-sky-800"><ImageIcon className="h-4 w-4" /> صورة</button></div>
          </aside>
        </div>
      )}
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
