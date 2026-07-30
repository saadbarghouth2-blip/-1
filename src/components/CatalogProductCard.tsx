import { ArrowRight, MessageCircle, ShoppingCart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Product } from '../data/products';
import { hasFixedPrice, isDiscountedProduct } from '../data/products';
import { buildWhatsAppMessageLink } from '../lib/contact';
import { cn, formatSarPrice } from '../lib/utils';
import ProductImage from './ProductImage';

interface CatalogProductCardProps {
  product: Product;
  isRTL: boolean;
  onAddToCart: (product: Product) => void;
  groupBadge?: string;
  className?: string;
}

export default function CatalogProductCard({
  product,
  isRTL,
  onAddToCart,
  groupBadge,
  className,
}: CatalogProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const hasPrice = hasFixedPrice(product);
  const hasDiscount = isDiscountedProduct(product);
  const statusBadge = product.pricingMode === 'quote'
    ? {
        label: isRTL ? 'اسأل عن السعر' : 'Ask for price',
        className: 'border-amber-200/80 bg-amber-50/95 text-amber-800',
      }
    : hasDiscount
      ? {
          label: isRTL ? 'مخفض' : 'Discounted',
          className: 'border-emerald-200/80 bg-emerald-50/95 text-emerald-800',
        }
      : null;
  const packFacts = `${product.size} | x${product.quantity}`;
  const quoteHref = buildWhatsAppMessageLink(
    isRTL
      ? `أرغب في معرفة سعر ${product.name.ar}`
      : `I would like to know the current price for ${product.name.en}`
  );

  return (
    <motion.article
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-45px' }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.012 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.988 }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white/92 p-2 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.26)] transition-shadow duration-300 hover:shadow-[0_28px_64px_-32px_rgba(21,59,102,0.42)] min-[430px]:rounded-[1.55rem] min-[430px]:p-3 sm:rounded-[1.75rem] sm:p-4',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(56,189,248,0.12),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <Link to={`/product/${product.id}`} className="relative block">
        {statusBadge ? (
          <span
            className={cn(
              'absolute top-2 z-10 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur-sm min-[430px]:px-3 min-[430px]:text-[11px]',
              isRTL ? 'left-2' : 'right-2',
              statusBadge.className,
            )}
          >
            {statusBadge.label}
          </span>
        ) : null}
        <ProductImage
          product={product}
          isRTL={isRTL}
          size="card"
          className="h-32 min-[430px]:h-36 sm:h-52"
          imageClassName="group-hover:scale-[1.03]"
        />
      </Link>

      <div className="mt-2 flex items-center justify-between gap-2 min-[430px]:mt-2.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-[11px] font-bold text-[#153b66] min-[430px]:text-xs">
              {isRTL ? product.brandAr : product.brand}
            </span>
            {groupBadge ? (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 min-[430px]:px-2.5 min-[430px]:py-1 min-[430px]:text-[11px]">
                {groupBadge}
              </span>
            ) : null}
          </div>
        </div>
        <span
          dir="ltr"
          className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 min-[430px]:px-3 min-[430px]:text-[11px]"
        >
          {packFacts}
        </span>
      </div>

      <Link to={`/product/${product.id}`} className="mt-2 block min-[430px]:mt-2.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[0.98rem] font-black leading-5 text-slate-900 transition-colors hover:text-[#153b66] min-[430px]:min-h-[3rem] min-[430px]:text-base min-[430px]:leading-6 sm:text-xl">
          {isRTL ? product.name.ar : product.name.en}
        </h3>
      </Link>

      <p className="mt-1 line-clamp-1 text-[11px] leading-5 text-slate-500 min-[430px]:text-xs sm:line-clamp-2 sm:text-sm sm:leading-7">
        {isRTL ? product.description.ar : product.description.en}
      </p>

      <div className="mt-auto pt-3 min-[430px]:pt-4">
        <div className="flex min-h-[40px] items-end gap-2 min-[430px]:min-h-[48px] min-[430px]:gap-3">
          {hasPrice ? (
            <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-0.5">
              <span className="text-lg font-black text-[#153b66] min-[430px]:text-xl">
                {formatSarPrice(product.price, isRTL)}
              </span>
              {hasDiscount ? (
                <span className="text-[11px] font-medium text-slate-400 line-through min-[430px]:text-xs">
                  {formatSarPrice(product.originalPrice, isRTL)}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-sm font-black text-amber-700 min-[430px]:text-base">
              {isRTL ? 'اسأل عن السعر' : 'Ask for price'}
            </span>
          )}
        </div>

        <div className="mt-2.5 flex flex-col gap-2 min-[430px]:mt-3 sm:flex-row">
          <Link
            to={`/product/${product.id}`}
            className="hidden flex-1 items-center justify-center gap-2 rounded-full bg-[#153b66] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#102f52] sm:inline-flex"
          >
            <span>{isRTL ? 'عرض التفاصيل' : 'View details'}</span>
            <ArrowRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
          </Link>

          {hasPrice ? (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-[#153b66]/65 bg-white px-3 py-2 text-[12px] font-semibold text-[#153b66] transition-colors hover:border-[#153b66] hover:bg-[#153b66] hover:text-white min-[430px]:h-11 min-[430px]:gap-2 min-[430px]:px-5 min-[430px]:text-sm sm:flex-1"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{isRTL ? 'أضف للسلة' : 'Add to cart'}</span>
            </button>
          ) : (
            <a
              href={quoteHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/60 px-3 py-2 text-[12px] font-semibold text-amber-700 transition-colors hover:bg-amber-100 min-[430px]:h-11 min-[430px]:gap-2 min-[430px]:px-5 min-[430px]:text-sm sm:flex-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{isRTL ? 'اسأل الآن' : 'Ask now'}</span>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
