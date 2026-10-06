import type { OfferWaterSize } from '../lib/offerSizes';

interface OfferSizeSelectorProps {
  value: OfferWaterSize;
  onChange: (value: OfferWaterSize) => void;
  isRTL: boolean;
  compact?: boolean;
}

export default function OfferSizeSelector({ value, onChange, isRTL, compact = false }: OfferSizeSelectorProps) {
  return (
    <fieldset className="min-w-0">
      <legend className={`font-semibold text-slate-700 ${compact ? 'mb-2 text-xs' : 'mb-3 text-sm'}`}>
        {isRTL ? 'اختر حجم المياه' : 'Choose water size'}
      </legend>
      <div className="grid grid-cols-2 gap-2" role="radiogroup">
        {(['200ml', '330ml'] as const).map((size) => (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={value === size}
            onClick={() => onChange(size)}
            className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075985] focus-visible:ring-offset-2 ${
              value === size
                ? 'border-[#075985] bg-[#075985] text-white shadow-sm'
                : 'border-sky-200 bg-sky-50 text-[#075985] hover:border-sky-400'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      <p className={`mt-2 leading-5 text-slate-500 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {isRTL ? 'المقاس المختار يطبق على جميع كراتين العرض.' : 'Your selected size applies to every carton in the offer.'}
      </p>
      <p className={`mt-1 font-bold text-[#075985] ${compact ? 'text-xs' : 'text-sm'}`} aria-live="polite">
        {isRTL ? 'اختيارك' : 'Your choice'}: {value}
      </p>
    </fieldset>
  );
}
