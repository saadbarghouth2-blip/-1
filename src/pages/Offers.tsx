import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, BadgePercent, Package, ShoppingCart, Tags, Truck } from 'lucide-react';
import { hasFixedPrice, isOfferProduct, type Product } from '../data/products';
import { useProductCatalog } from '../features/catalog/ProductCatalogProvider';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { formatSarPrice } from '../lib/utils';
import OfferSizeSelector from '../components/OfferSizeSelector';
import { getDefaultOfferSize, type OfferWaterSize } from '../lib/offerSizes';

type AvailableOfferProduct = Product & {
  price: number;
};

function isAvailableOfferProduct(product: Product): product is AvailableOfferProduct {
  return (
    isOfferProduct(product) &&
    hasFixedPrice(product) &&
    product.isPurchasable &&
    product.inStock
  );
}

export default function Offers() {
  const { i18n } = useTranslation();
  const { addToCart } = useCart();
  const { offerProducts } = useProductCatalog();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-120px' });
  const isRTL = i18n.language === 'ar';
  const [selectedSizes, setSelectedSizes] = useState<Record<string, OfferWaterSize>>({});

  const availableOffers = useMemo(
    () => offerProducts.filter(isAvailableOfferProduct),
    [offerProducts],
  );

  const totalSavings = availableOffers.reduce((sum, product) => (
    sum + Math.max(0, (product.originalPrice ?? product.price) - product.price)
  ), 0);
  const discountedBrands = new Set(availableOffers.map((product) => product.brand)).size;

  return (
    <main ref={sectionRef} className="relative z-10 min-h-screen py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0b5685] via-[#0b78ad] to-[#07345f] px-6 py-8 text-white shadow-[0_34px_95px_-42px_rgba(7,67,111,0.72)] sm:px-8 sm:py-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(186,230,253,0.30),rgba(186,230,253,0)_34%),radial-gradient(circle_at_18%_92%,rgba(34,211,238,0.16),rgba(34,211,238,0)_38%)]" />
          <div className="absolute -left-14 top-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />
          <motion.div
            className="absolute right-8 top-8 h-28 w-28 rounded-full bg-cyan-100/25 blur-3xl"
            animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.35, 0.72, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <motion.div
                className="relative mb-4 inline-flex items-center gap-2 overflow-hidden rounded-full border border-sky-200/60 bg-gradient-to-r from-[#086b9d] via-[#0b83b8] to-[#168fc0] px-4 py-2 text-sm font-black text-white shadow-[0_18px_42px_-20px_rgba(14,116,144,0.78)]"
                animate={{ y: [0, -2, 0], boxShadow: ['0 18px 42px -24px rgba(14,116,144,0.70)', '0 22px 54px -18px rgba(56,189,248,0.82)', '0 18px 42px -24px rgba(14,116,144,0.70)'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.span
                  className="absolute inset-y-0 -left-10 w-10 rotate-12 bg-white/35 blur-sm"
                  animate={{ x: ['0%', '520%'] }}
                  transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
                />
                <motion.span
                  className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/16"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <BadgePercent className="h-4 w-4" />
                </motion.span>
                <span>{isRTL ? 'عروض حقيقية لفترة محدودة' : 'Real limited-time offers'}</span>
              </motion.div>
              <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                {isRTL
                  ? 'وفّر على طلبك اليوم مع عروض ريق المختارة'
                  : 'Save on your order today with selected Riq offers'}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/78 sm:text-base">
                {isRTL
                  ? 'اختيارات مخفضة على مقاسات مطلوبة، أسعار أوضح، وطلب سريع قبل ما العروض تخلص.'
                  : 'Discounted picks on popular packs, clearer prices, and fast ordering before the deals end.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Tags,
                  label: isRTL ? 'عروض اليوم' : 'Today deals',
                  value: `${availableOffers.length}`,
                },
                {
                  icon: Package,
                  label: isRTL ? 'علامات موثوقة' : 'Trusted brands',
                  value: `${discountedBrands}`,
                },
                {
                  icon: BadgePercent,
                  label: isRTL ? 'توفير ممكن' : 'Possible savings',
                  value: formatSarPrice(totalSavings, isRTL),
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.14 + index * 0.06 }}
                  className="rounded-[1.5rem] border border-sky-100/30 bg-[#063b67]/25 p-4 backdrop-blur-sm transition-colors hover:bg-sky-400/20"
                >
                  <item.icon className="mb-3 h-5 w-5 text-sky-100" />
                  <div className="text-2xl font-black">{item.value}</div>
                  <div className="text-sm text-white/70">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {availableOffers.length === 0 ? (
          <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_-44px_rgba(15,23,42,0.45)]">
            <h2 className="text-2xl font-bold text-slate-900">
              {isRTL ? 'لا توجد عروض متاحة الآن' : 'No offers available right now'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              {isRTL
                ? 'هنعرض هنا كل العروض المتاحة للطلب فور إضافتها.'
                : 'Every available offer will appear here as soon as it is published.'}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#075985] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#064b70]"
            >
              <span>{isRTL ? 'العودة للرئيسية' : 'Back home'}</span>
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-4 pb-24 sm:mt-10 sm:gap-5 md:grid-cols-2 md:pb-10 xl:grid-cols-3">
            {availableOffers.map((product, index) => {
              const savings = Math.max(0, (product.originalPrice ?? product.price) - product.price);
              const hasDiscount = savings > 0;
              const selectedSize = selectedSizes[product.id] ?? getDefaultOfferSize(product.size);

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.05 * index }}
                  className="group overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white p-3.5 shadow-[0_20px_60px_-34px_rgba(7,89,133,0.28)] transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_28px_76px_-36px_rgba(14,116,144,0.30)] sm:rounded-[2rem] sm:p-5"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <ProductImage
                      product={product}
                      isRTL={isRTL}
                      size="card"
                      className="aspect-[4/3] sm:aspect-square"
                      imageClassName="group-hover:scale-[1.03]"
                    />
                  </Link>

                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
                    <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-[#075985]">
                      {isRTL ? product.brandAr : product.brand}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      {product.size}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      x{product.quantity}
                    </span>
                  </div>

                  <Link to={`/product/${product.id}`}>
                    <h2 className="mt-4 line-clamp-2 text-xl font-black leading-tight text-slate-900 transition-colors hover:text-[#075985]">
                      {isRTL ? product.name.ar : product.name.en}
                    </h2>
                  </Link>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-500">
                    {isRTL ? product.description.ar : product.description.en}
                  </p>

                  <div className="mt-4 flex flex-wrap items-end gap-2 sm:mt-5 sm:gap-3">
                    <span className="text-2xl font-black text-[#075985]">
                      {formatSarPrice(product.price, isRTL)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatSarPrice(product.originalPrice!, isRTL)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-[#087da1]">
                    {hasDiscount && (
                      <span>{isRTL
                        ? `توفر ${formatSarPrice(savings, isRTL)} على هذا المقاس`
                        : `Save ${formatSarPrice(savings, isRTL)} on this pack`}</span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="h-4 w-4" />
                      {isRTL ? 'توصيل مجاني' : 'Free delivery'}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-3">
                    <OfferSizeSelector
                      compact
                      value={selectedSize}
                      isRTL={isRTL}
                      onChange={(size) => setSelectedSizes((current) => ({ ...current, [product.id]: size }))}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">
                    <Link
                      to={`/product/${product.id}`}
                      className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full bg-[#075985] px-2 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#064b70] sm:gap-2 sm:px-5 sm:text-sm"
                    >
                      <span>{isRTL ? 'عرض التفاصيل' : 'View details'}</span>
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                    <button
                      onClick={() => addToCart(product, 1, selectedSize)}
                      className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full border border-sky-200 px-2 py-3 text-xs font-semibold text-[#075985] transition-colors hover:border-sky-400 hover:bg-sky-50 sm:gap-2 sm:px-5 sm:text-sm"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{isRTL ? 'أضف للسلة' : 'Add to cart'}</span>
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
