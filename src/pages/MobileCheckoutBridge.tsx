import { useMemo, useState } from 'react';
import { formatSarPrice } from '@riq/shared';
import { Banknote, CreditCard, Landmark } from 'lucide-react';
import {
  BANK_TRANSFER_DETAILS,
  MANUAL_PAYMENT_METHODS,
  buildOrderWhatsAppLink,
  getManualPaymentMethodLabel,
  openWhatsAppLink,
  type ManualPaymentMethod,
} from '../lib/contact';
import {
  buildMobileCheckoutReturnUrl,
  readMobileCheckoutPayload,
} from '../lib/mobileCheckout';

export default function MobileCheckoutBridge() {
  const payload = useMemo(() => readMobileCheckoutPayload(), []);
  const isRTL = payload?.locale === 'ar';
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>('cash_on_delivery');
  const selectedPaymentMethodLabel = getManualPaymentMethodLabel(paymentMethod, isRTL);
  const paymentMethodIcons = {
    cash_on_delivery: Banknote,
    bank_transfer: Landmark,
    pos_on_delivery: CreditCard,
  } satisfies Record<ManualPaymentMethod, typeof Banknote>;
  const whatsappLink = useMemo(() => {
    if (!payload) {
      return '';
    }

    return buildOrderWhatsAppLink({
      ...payload,
      paymentMethod,
      isRTL,
    });
  }, [isRTL, payload, paymentMethod]);

  const returnToApp = () => {
    window.location.replace(
      buildMobileCheckoutReturnUrl({
        status: 'cancelled',
        message: 'manual_bank_transfer',
      })
    );
  };

  if (!payload) {
    return (
      <main className="min-h-screen bg-[#edf4fa] px-4 py-12 text-[#153b66]">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.25)]">
          <h1 className="text-2xl font-black">
            {isRTL ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0637\u0644\u0628 \u0645\u062d\u0641\u0648\u0638\u0629' : 'No checkout payload found'}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {isRTL
              ? '\u0627\u0631\u062c\u0639 \u0625\u0644\u0649 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0648\u0627\u0628\u062f\u0623 \u0627\u0644\u0637\u0644\u0628 \u0645\u0646 \u0634\u0627\u0634\u0629 \u0627\u0644\u0633\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.'
              : 'Return to the mobile app and start checkout from the cart again.'}
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
            {isRTL ? '\u062f\u0641\u0639 \u064a\u062f\u0648\u064a \u0645\u0624\u0642\u062a' : 'Manual checkout'}
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight">
            {isRTL ? '\u0627\u062e\u062a\u0631 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 \u0648\u0623\u0631\u0633\u0644 \u0627\u0644\u0637\u0644\u0628' : 'Choose a payment method and send the order'}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/80">
            {isRTL
              ? '\u0623\u0648\u0642\u0641\u0646\u0627 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062f\u0641\u0639 \u0645\u0624\u0642\u062a\u064b\u0627. \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645\u060c \u0623\u0648 \u0628\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a\u060c \u0623\u0648 \u0628\u0634\u0628\u0643\u0629 \u0645\u0639 \u0627\u0644\u0645\u0646\u062f\u0648\u0628.'
              : 'The payment gateway is paused temporarily. You can pay on delivery, transfer to the bank account, or use a card machine with the delivery representative.'}
          </p>

          <div className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/10 p-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{isRTL ? '\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064a\u0644' : 'Customer'}</span>
              <span>{payload.customerName}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{isRTL ? '\u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644' : 'Phone'}</span>
              <span>{payload.phone}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{isRTL ? '\u0639\u062f\u062f \u0627\u0644\u0642\u0637\u0639' : 'Items'}</span>
              <span>{payload.totalItems}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{isRTL ? '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0646\u0647\u0627\u0626\u064a' : 'Final total'}</span>
              <span>{formatSarPrice(payload.finalTotal, isRTL)}</span>
            </div>
            <div className="mt-5 rounded-[1.4rem] bg-white/10 p-4 text-xs leading-6 text-white/75">
              {payload.address || (isRTL ? '\u0644\u0645 \u064a\u064f\u0631\u0633\u0644 \u0639\u0646\u0648\u0627\u0646 \u062a\u0641\u0635\u064a\u0644\u064a.' : 'No detailed address was sent.')}
            </div>
          </div>

          <button
            type="button"
            onClick={returnToApp}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {isRTL ? '\u0627\u0644\u0631\u062c\u0648\u0639 \u0625\u0644\u0649 \u0627\u0644\u062a\u0637\u0628\u064a\u0642' : 'Return to app'}
          </button>
        </section>

        <section className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.22)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2b648c]">
                {isRTL ? '\u0627\u0644\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u064a\u062f\u0648\u064a' : 'Manual confirmation'}
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {selectedPaymentMethodLabel}
              </h2>
            </div>
            <div className="rounded-full bg-[#edf4fa] px-4 py-2 text-sm font-bold text-[#153b66]">
              {formatSarPrice(payload.finalTotal, isRTL)}
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {MANUAL_PAYMENT_METHODS.map((option) => {
              const selected = paymentMethod === option.id;
              const Icon = paymentMethodIcons[option.id];

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentMethod(option.id)}
                  className={`rounded-2xl border px-4 py-4 text-start transition ${
                    selected
                      ? 'border-[#153b66] bg-[#153b66] text-white shadow-lg shadow-[#153b66]/15'
                      : 'border-sky-100 bg-slate-50 text-slate-700 hover:border-[#153b66]/30'
                  }`}
                >
                  <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${selected ? 'bg-white/15 text-white' : 'bg-white text-[#153b66]'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="block text-sm font-black">
                    {isRTL ? option.labelAr : option.labelEn}
                  </span>
                  <span className={`mt-2 block text-xs font-semibold leading-6 ${selected ? 'text-white/75' : 'text-slate-500'}`}>
                    {isRTL ? option.descriptionAr : option.descriptionEn}
                  </span>
                </button>
              );
            })}
          </div>

          {paymentMethod === 'bank_transfer' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">{isRTL ? '\u0627\u0633\u0645 \u0635\u0627\u062d\u0628 \u0627\u0644\u062d\u0633\u0627\u0628' : 'Account holder'}</p>
              <p className="mt-2 text-sm font-black leading-6 text-slate-900">
                {isRTL ? BANK_TRANSFER_DETAILS.accountNameAr : BANK_TRANSFER_DETAILS.accountNameEn}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4" dir="ltr">
              <p className="text-xs font-bold text-slate-500">{isRTL ? '\u0631\u0642\u0645 \u0627\u0644\u062d\u0633\u0627\u0628' : 'Account number'}</p>
              <p className="mt-2 break-all text-sm font-black text-slate-900">{BANK_TRANSFER_DETAILS.accountNumber}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2" dir="ltr">
              <p className="text-xs font-bold text-slate-500">IBAN</p>
              <p className="mt-2 break-all text-base font-black text-[#153b66]">{BANK_TRANSFER_DETAILS.iban}</p>
            </div>
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black leading-7 text-emerald-800 sm:col-span-2">
              {isRTL
                ? '\u0628\u0631\u062c\u0627\u0621 \u0625\u0631\u0633\u0627\u0644 \u0635\u0648\u0631\u0629 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0639\u0644\u0649 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u0639\u062f \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u062a\u062d\u0648\u064a\u0644.'
                : 'Please send a receipt photo on WhatsApp after completing the transfer.'}
            </p>
          </div>
          ) : null}

          <div className="mt-5 rounded-[1.5rem] border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold leading-7 text-amber-800">
            {paymentMethod === 'bank_transfer'
              ? (isRTL
                  ? '\u0628\u0639\u062f \u0627\u0644\u062a\u062d\u0648\u064a\u0644\u060c \u0623\u0631\u0633\u0644 \u0627\u0644\u0637\u0644\u0628 \u0648\u0623\u0631\u0641\u0642 \u0635\u0648\u0631\u0629 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628.'
                  : 'After transferring, send the order and attach a receipt photo on WhatsApp.')
              : (isRTL
                  ? '\u0623\u0631\u0633\u0644 \u0627\u0644\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628\u060c \u0648\u0633\u062a\u0635\u0644\u0646\u0627 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629.'
                  : 'Send the order on WhatsApp and we will receive the selected payment method.')}
          </div>

          <button
            type="button"
            onClick={() => openWhatsAppLink(whatsappLink)}
            className="mt-5 w-full rounded-[1.5rem] bg-green-600 px-5 py-4 text-base font-black text-white transition hover:bg-green-700"
          >
            {isRTL ? '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628' : 'Send order on WhatsApp'}
          </button>
        </section>
      </div>
    </main>
  );
}
