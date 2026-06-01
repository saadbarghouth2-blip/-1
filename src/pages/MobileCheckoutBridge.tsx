import { useEffect, useMemo, useRef, useState } from 'react';
import { formatSarPrice } from '@riq/shared';
import { loadExternalScript, loadExternalStylesheet } from '../lib/externalAssets';
import {
  MOYASAR_SCRIPT_URL,
  MOYASAR_STYLES_URL,
  getMoyasarPublicKey,
} from '../lib/payments';
import {
  buildMobileCheckoutReturnUrl,
  getMobileCheckoutDescription,
  readMobileCheckoutPayload,
} from '../lib/mobileCheckout';
import { toAbsoluteUrl, withBasePath } from '../lib/site';

export default function MobileCheckoutBridge() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState('');
  const payload = useMemo(() => readMobileCheckoutPayload(), []);
  const isRTL = payload?.locale === 'ar';
  const moyasarPublicKey = getMoyasarPublicKey();
  const queryParams = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const paymentId = queryParams.get('id') || undefined;
  const isSuccess = queryParams.get('status') === 'success' || Boolean(paymentId);

  useEffect(() => {
    if (!payload || !isSuccess) {
      return;
    }

    window.location.replace(
      buildMobileCheckoutReturnUrl({
        status: 'success',
        paymentId,
      })
    );
  }, [isSuccess, payload, paymentId]);

  useEffect(() => {
    if (!payload || isSuccess || !containerRef.current) {
      return;
    }

    let disposed = false;
    setLoadError('');

    if (!moyasarPublicKey) {
      setLoadError(
        isRTL
          ? 'يرجى ضبط VITE_MOYASAR_PUBLIC_KEY بمفتاح Moyasar الحي قبل تفعيل دفع التطبيق.'
          : 'Set VITE_MOYASAR_PUBLIC_KEY to your live Moyasar public key before enabling app checkout.'
      );
      return;
    }

    Promise.all([
      loadExternalStylesheet(MOYASAR_STYLES_URL),
      loadExternalScript(MOYASAR_SCRIPT_URL),
    ])
      .then(() => {
        if (disposed || !containerRef.current) {
          return;
        }

        const moyasar = (window as typeof window & { Moyasar?: any }).Moyasar;
        if (!moyasar) {
          throw new Error('Moyasar not available');
        }

        containerRef.current.innerHTML = '';
        moyasar.init({
          element: '.riq-mobile-moyasar',
          amount: Math.round(payload.finalTotal * 100),
          currency: 'SAR',
          description: getMobileCheckoutDescription(payload),
          publishable_api_key: moyasarPublicKey,
          callback_url: toAbsoluteUrl(withBasePath('/checkout/mobile?status=success')),
          methods: ['creditcard', 'applepay'],
        });
      })
      .catch(() => {
        if (!disposed) {
          setLoadError(
            isRTL
              ? 'تعذر تحميل بوابة الدفع حاليًا. يمكنك الرجوع للتطبيق والمحاولة مرة أخرى.'
              : 'Unable to load the payment gateway right now. You can return to the app and try again.'
          );
        }
      });

    return () => {
      disposed = true;
    };
  }, [isRTL, isSuccess, moyasarPublicKey, payload]);

  if (!payload) {
    return (
      <main className="min-h-screen bg-[#edf4fa] px-4 py-12 text-[#153b66]">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.25)]">
          <h1 className="text-2xl font-black">
            {isRTL ? 'لا توجد بيانات دفع محفوظة' : 'No checkout payload found'}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {isRTL
              ? 'ارجع إلى التطبيق وابدأ الدفع من شاشة الطلب حتى يتم تمرير البيانات إلى صفحة الويب.'
              : 'Return to the mobile app and start checkout again so the app can inject the payload into this page.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(21,59,102,0.18),_transparent_36%),linear-gradient(180deg,_#edf4fa_0%,_#f8fbfd_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] bg-[#153b66] p-6 text-white shadow-[0_30px_80px_-34px_rgba(21,59,102,0.58)] sm:p-8">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-white/90">
            {isRTL ? 'الدفع من التطبيق' : 'App checkout'}
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight">
            {isRTL ? 'الخطوة الأخيرة لإتمام طلب ريق من تطبيق الموبايل' : 'Final step to complete the Riq mobile order'}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/80">
            {isRTL
              ? 'هذه الصفحة تستقبل بيانات السلة من تطبيق Expo ثم تستخدم نفس بوابة الدفع الحالية قبل إعادتك للتطبيق عبر deep link.'
              : 'This page receives the cart payload from the Expo app, runs the existing payment flow, then returns the shopper to the app via deep link.'}
          </p>

          <div className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/10 p-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{isRTL ? 'اسم العميل' : 'Customer'}</span>
              <span>{payload.customerName}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{isRTL ? 'رقم الجوال' : 'Phone'}</span>
              <span>{payload.phone}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{isRTL ? 'عدد القطع' : 'Items'}</span>
              <span>{payload.totalItems}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{isRTL ? 'الإجمالي النهائي' : 'Final total'}</span>
              <span>{formatSarPrice(payload.finalTotal, isRTL)}</span>
            </div>
            <div className="mt-5 rounded-[1.4rem] bg-white/10 p-4 text-xs leading-6 text-white/75">
              {payload.address || (isRTL ? 'لم يُرسل عنوان تفصيلي.' : 'No detailed address was sent.')}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              window.location.replace(
                buildMobileCheckoutReturnUrl({
                  status: 'cancelled',
                })
              )
            }
            className="mt-6 inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {isRTL ? 'الرجوع إلى التطبيق' : 'Return to app'}
          </button>
        </section>

        <section className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.22)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2b648c]">
                {isRTL ? 'بوابة الدفع الحالية' : 'Current payment gateway'}
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {isRTL ? 'الدفع عبر Moyasar داخل صفحة الجسر' : 'Moyasar checkout inside the bridge page'}
              </h2>
            </div>
            <div className="rounded-full bg-[#edf4fa] px-4 py-2 text-sm font-bold text-[#153b66]">
              {formatSarPrice(payload.finalTotal, isRTL)}
            </div>
          </div>

          {loadError ? (
            <div className="rounded-[1.5rem] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          {!isSuccess ? (
            <div
              ref={containerRef}
              className="riq-mobile-moyasar min-h-[420px] rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4"
            />
          ) : (
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 px-4 py-5 text-sm text-emerald-800">
              {isRTL ? 'تم الدفع بنجاح. جارٍ إعادتك إلى التطبيق.' : 'Payment succeeded. Returning you to the app.'}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
