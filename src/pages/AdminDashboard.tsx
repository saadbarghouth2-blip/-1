import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Boxes, ClipboardList, Lock, Package, RefreshCw, ShoppingBag, Wallet } from 'lucide-react';
import { useWebAuth } from '../features/auth/WebAuthProvider';
import { loadAdminSalesDashboard, type AdminSalesDashboard } from '../services/adminDashboard';
import { PRODUCT_ADMIN_EMAIL } from '../services/productAdmin';
import { formatSarPrice } from '../lib/utils';

export default function AdminDashboard() {
  const {
    authReady,
    isConfigured,
    configError,
    session,
    requestEmailOtp,
    confirmEmailOtp,
    signOut,
  } = useWebAuth();
  const [email, setEmail] = useState(PRODUCT_ADMIN_EMAIL);
  const [token, setToken] = useState('');
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [dashboard, setDashboard] = useState<AdminSalesDashboard | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setIsBusy(true);
    setError('');
    try {
      setDashboard(await loadAdminSalesDashboard(session?.email));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'تعذر تحميل الداشبورد.');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    if (authReady && session?.email) {
      void loadDashboard();
    }
  }, [authReady, session?.email]);

  const handleSendLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsBusy(true);
    setError('');
    setMessage('');
    try {
      await requestEmailOtp(email);
      setLoginStep('otp');
      setMessage('تم إرسال كود الدخول على الإيميل. افتح الرسالة واكتب الكود هنا.');
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
    return (
      <AdminCenteredState title="لوحة الإدارة غير متاحة" message={configError ?? 'Supabase غير مفعّل.'} />
    );
  }

  if (!session) {
    return (
      <main className="relative z-10 min-h-screen py-20">
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.35)]" dir="rtl">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#153b66]/10 text-[#153b66]">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900">دخول لوحة الإدارة</h1>
              <p className="text-sm text-slate-500">المبيعات والمنتجات وإدارة الموقع.</p>
            </div>
          </div>

          <form onSubmit={loginStep === 'email' ? handleSendLogin : handleConfirmLogin} className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">{loginStep === 'email' ? 'الإيميل' : 'كود الدخول'}</span>
              <input
                value={loginStep === 'email' ? email : token}
                onChange={(event) => {
                  if (loginStep === 'email') {
                    setEmail(event.target.value);
                    return;
                  }

                  setToken(event.target.value.replace(/\D/g, '').slice(0, 8));
                }}
                type={loginStep === 'email' ? 'email' : 'text'}
                inputMode={loginStep === 'email' ? 'email' : 'numeric'}
                autoComplete={loginStep === 'email' ? 'email' : 'one-time-code'}
                maxLength={loginStep === 'email' ? undefined : 8}
                placeholder={loginStep === 'email' ? PRODUCT_ADMIN_EMAIL : '12345678'}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none focus:border-[#153b66] focus:ring-4 focus:ring-[#153b66]/10"
              />
            </label>

            {loginStep === 'otp' ? (
              <button
                type="button"
                onClick={() => {
                  setLoginStep('email');
                  setToken('');
                  setMessage('');
                  setError('');
                }}
                className="text-sm font-bold text-[#153b66]"
              >
                تغيير الإيميل أو إعادة إرسال الكود
              </button>
            ) : null}

            {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#153b66] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {loginStep === 'email' ? 'إرسال الكود' : 'تأكيد الكود'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-screen py-16 sm:py-20" dir="rtl">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <section className="rounded-[2rem] bg-[#153b66] p-5 text-white shadow-[0_28px_80px_-42px_rgba(21,59,102,0.62)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold">Admin Dashboard</div>
              <h1 className="mt-3 text-3xl font-black">لوحة التحكم</h1>
              <p className="mt-2 text-sm leading-7 text-white/75">
                ملخص المبيعات والطلبات وروابط إدارة المنتجات. كل البيانات مرتبطة بـ Supabase.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadDashboard()}
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </button>
              <Link to="/admin/products" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#153b66]">
                <Boxes className="h-4 w-4" />
                إدارة المنتجات
              </Link>
              <button type="button" onClick={() => void signOut()} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
                خروج
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <section className="mt-6 rounded-[1.6rem] border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
            {error}
          </section>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={ClipboardList} label="إجمالي الطلبات" value={`${dashboard?.totalOrders ?? 0}`} />
          <MetricCard icon={Wallet} label="إجمالي المبيعات" value={formatSarPrice(dashboard?.totalRevenue ?? 0, true)} />
          <MetricCard icon={Package} label="المنتجات المباعة" value={`${dashboard?.totalItems ?? 0}`} />
          <MetricCard icon={ShoppingBag} label="متوسط الطلب" value={formatSarPrice(dashboard?.averageOrderValue ?? 0, true)} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">آخر الطلبات</h2>
                <p className="text-sm text-slate-500">آخر 12 طلب محفوظ في Supabase.</p>
              </div>
              <BarChart3 className="h-5 w-5 text-[#153b66]" />
            </div>
            <div className="overflow-hidden rounded-[1.4rem] border border-slate-200">
              <table className="w-full min-w-[720px] text-right text-sm">
                <thead className="bg-slate-50 text-xs font-black text-slate-500">
                  <tr>
                    <th className="px-4 py-3">العميل</th>
                    <th className="px-4 py-3">الجوال</th>
                    <th className="px-4 py-3">المنتجات</th>
                    <th className="px-4 py-3">الإجمالي</th>
                    <th className="px-4 py-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(dashboard?.recentOrders ?? []).map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-bold text-slate-900">{order.customerName}</td>
                      <td className="px-4 py-3 text-slate-600">{order.customerPhone}</td>
                      <td className="px-4 py-3 text-slate-600">{order.totalItems}</td>
                      <td className="px-4 py-3 font-black text-[#153b66]">{formatSarPrice(order.finalTotal, true)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString('ar-SA')}</td>
                    </tr>
                  ))}
                  {dashboard?.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm font-bold text-slate-500">لا توجد طلبات محفوظة بعد.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)]">
            <h2 className="text-xl font-black text-slate-900">أفضل المنتجات</h2>
            <p className="mt-1 text-sm text-slate-500">حسب قيمة المبيعات المسجلة.</p>
            <div className="mt-4 space-y-3">
              {(dashboard?.topProducts ?? []).map((product, index) => (
                <div key={product.productId} className="rounded-[1.2rem] bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-black text-[#153b66]">#{index + 1}</div>
                      <div className="mt-1 line-clamp-2 font-black text-slate-900">{product.name}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-black text-slate-900">{product.quantity}</div>
                      <div className="text-xs text-slate-500">قطعة</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm font-bold text-[#153b66]">{formatSarPrice(product.revenue, true)}</div>
                </div>
              ))}
              {dashboard?.topProducts.length === 0 ? (
                <div className="rounded-[1.2rem] bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
                  لا توجد منتجات مباعة بعد.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.25)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#153b66]/10 text-[#153b66]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 text-2xl font-black text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-bold text-slate-500">{label}</div>
    </div>
  );
}

function AdminCenteredState({ title, message }: { title: string; message: string }) {
  return (
    <main className="relative z-10 min-h-screen py-24">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900" dir="rtl">
        <Lock className="mb-3 h-7 w-7" />
        <h1 className="text-2xl font-black">{title}</h1>
        <p className="mt-3 text-sm leading-7">{message}</p>
      </div>
    </main>
  );
}
