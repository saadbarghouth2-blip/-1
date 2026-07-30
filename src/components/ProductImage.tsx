import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import type { Product } from '../data/products';

type ProductImageSize = 'card' | 'list' | 'detail' | 'thumb' | 'compact';

interface ProductImageProps {
  product: Pick<Product, 'image' | 'name' | 'size' | 'quantity' | 'imageType' | 'imageFit'>;
  isRTL?: boolean;
  size?: ProductImageSize;
  className?: string;
  imageClassName?: string;
}

const frameClasses: Record<ProductImageSize, string> = {
  card: 'aspect-square rounded-[1.3rem] sm:rounded-[1.75rem]',
  list: 'aspect-square rounded-2xl',
  detail: 'aspect-[5/4] rounded-[2rem] sm:rounded-[2.25rem]',
  thumb: 'aspect-square rounded-xl',
  compact: 'aspect-square rounded-2xl',
};

const shellClasses: Record<NonNullable<Product['imageType']>, string> = {
  case: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(239,249,255,0.94)_55%,rgba(191,219,254,0.9))]',
  offer: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.99),rgba(239,249,255,0.96)_48%,rgba(186,230,253,0.82))]',
  bottle: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(240,253,250,0.93)_48%,rgba(186,230,253,0.88))]',
  gallon: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(224,242,254,0.94)_52%,rgba(191,219,254,0.9))]',
};

const paddingClasses: Record<NonNullable<Product['imageType']>, Record<ProductImageSize, string>> = {
  case: {
    card: 'p-2 sm:p-3.5',
    list: 'p-2',
    detail: 'p-4 sm:p-6',
    thumb: 'p-1.5',
    compact: 'p-2.5',
  },
  offer: {
    card: 'p-1.5 sm:p-2.5',
    list: 'p-1.5',
    detail: 'p-3 sm:p-4',
    thumb: 'p-1',
    compact: 'p-2',
  },
  bottle: {
    card: 'p-3 sm:p-5',
    list: 'p-3',
    detail: 'p-6 sm:p-8',
    thumb: 'p-2.5',
    compact: 'p-4',
  },
  gallon: {
    card: 'p-3 sm:p-5',
    list: 'p-3',
    detail: 'p-6 sm:p-9',
    thumb: 'p-2.5',
    compact: 'p-4',
  },
};

const fitClasses: Record<NonNullable<Product['imageFit']>, string> = {
  relaxed: 'scale-[0.94]',
  balanced: 'scale-100',
  tight: 'scale-[1.06]',
  portrait: 'scale-[1.02]',
};

const imageSizes: Record<ProductImageSize, string> = {
  card: '(min-width: 1280px) 24vw, (min-width: 640px) 45vw, 92vw',
  list: '(min-width: 1024px) 24vw, 92vw',
  detail: '(min-width: 1024px) 46vw, 92vw',
  thumb: '96px',
  compact: '(min-width: 1024px) 18vw, 44vw',
};

export default function ProductImage({
  product,
  isRTL = true,
  size = 'card',
  className,
  imageClassName,
}: ProductImageProps) {
  const imageType = product.imageType ?? 'case';
  const imageFit = product.imageFit ?? 'balanced';
  const isCriticalImage = size === 'detail';
  const [hasImageError, setHasImageError] = useState(false);
  const showFallback = !product.image || hasImageError;

  useEffect(() => {
    setHasImageError(false);
  }, [product.image]);

  return (
    <div className={cn('relative isolate overflow-hidden', frameClasses[size], className)}>
      <div
        className={cn(
          'absolute inset-0 border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
          shellClasses[imageType],
        )}
      />
      <div className="absolute inset-x-[14%] top-0 h-1/2 rounded-full bg-white/80 blur-3xl" />
      <div className="absolute inset-x-[18%] bottom-[-16%] h-1/3 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute inset-[10%] rounded-[inherit] border border-white/45 bg-white/35 backdrop-blur-[1px]" />

      <div className={cn('relative flex h-full w-full items-center justify-center', paddingClasses[imageType][size])}>
        {showFallback ? (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[#153b66]/18 bg-white/65 px-4 py-5 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#153b66]/55">
              {isRTL ? 'صورة قيد التحديث' : 'Image Updating'}
            </span>
            <span className="mt-3 line-clamp-2 text-lg font-black leading-tight text-slate-900">
              {isRTL ? product.name.ar : product.name.en}
            </span>
            <span className="mt-3 rounded-full bg-[#153b66]/8 px-3 py-1.5 text-xs font-semibold text-[#153b66]">
              {product.size} x{product.quantity}
            </span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={isRTL ? product.name.ar : product.name.en}
            loading={isCriticalImage ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={isCriticalImage ? 'high' : 'auto'}
            sizes={imageSizes[size]}
            onError={() => setHasImageError(true)}
            className={cn(
              'h-full w-full object-contain object-center drop-shadow-[0_18px_30px_rgba(15,23,42,0.12)] transition-transform duration-500',
              fitClasses[imageFit],
              imageClassName,
            )}
          />
        )}
      </div>
    </div>
  );
}
