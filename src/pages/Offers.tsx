import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, BadgePercent, Package, ShoppingCart, Tags } from 'lucide-react';
import { isDiscountedProduct } from '../data/products';
import { useProductCatalog } from '../features/catalog/ProductCatalogProvider';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { formatSarPrice } from '../lib/utils';

export default function Offers() {
  const { i18n } = useTranslation();
  const { addToCart } = useCart();
  const { products } = useProductCatalog();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-120px' });
  const isRTL = i18n.language === 'ar';

  const discountedProducts = useMemo(
    () => products.filter(isDiscountedProduct),
    [products],
  );

  const totalSavings = discountedProducts.reduce((sum, product) => (
    sum + ((product.originalPrice ?? product.price) - product.price)
  ), 0);
  const visibleOffers = discountedProducts.slice(0, 9);
  const discountedBrands = new Set(discountedProducts.map((product) => product.brand)).size;

  return (
    <main ref={sectionRef} className="relative z-10 min-h-screen py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#7f1d1d] via-[#dc2626] to-[#450a0a] px-6 py-8 text-white shadow-[0_34px_95px_-42px_rgba(127,29,29,0.86)] sm:px-8 sm:py-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(254,202,202,0.26),rgba(254,202,202,0)_34%),radial-gradient(circle_at_18%_92%,rgba(251,146,60,0.16),rgba(251,146,60,0)_38%)]" />
          <div className="absolute -left-14 top-0 h-40 w-40 rounded-full bg-red-200/30 blur-3xl" />
          <motion.div
            className="absolute right-8 top-8 h-28 w-28 rounded-full bg-red-100/24 blur-3xl"
            animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.35, 0.72, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-orange-200/18 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <motion.div
                className="relative mb-4 inline-flex items-center gap-2 overflow-hidden rounded-full border border-red-200/60 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 px-4 py-2 text-sm font-black text-white shadow-[0_18px_42px_-20px_rgba(220,38,38,0.78)]"
                animate={{ y: [0, -2, 0], boxShadow: ['0 18px 42px -24px rgba(220,38,38,0.72)', '0 22px 54px -18px rgba(248,113,113,0.9)', '0 18px 42px -24px rgba(220,38,38,0.72)'] }}
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
                  value: `${visibleOffers.length}`,
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
                  className="rounded-[1.5rem] border border-red-100/30 bg-red-950/18 p-4 backdrop-blur-sm transition-colors hover:bg-red-500/20"
                >
                  <item.icon className="mb-3 h-5 w-5 text-red-100" />
                  <div className="text-2xl font-black">{item.value}</div>
                  <div className="text-sm text-white/70">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {discountedProducts.length === 0 ? (
          <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_-44px_rgba(15,23,42,0.45)]">
            <h2 className="text-2xl font-bold text-slate-900">
              {isRTL ? 'لا توجد منتجات مخفضة الآن' : 'No discounted products right now'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              {isRTL
                ? 'هنعرض هنا العروض المخفضة فقط عند توفرها.'
                : 'Only discounted offers will appear here when available.'}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <span>{isRTL ? 'العودة للرئيسية' : 'Back home'}</span>
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </section>
        ) : (
          <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleOffers.map((product, index) => {
              const savings = (product.originalPrice ?? product.price) - product.price;

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.05 * index }}
                  className="group overflow-hidden rounded-[2rem] border border-red-100 bg-white p-4 shadow-[0_20px_60px_-34px_rgba(127,29,29,0.34)] transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_28px_76px_-36px_rgba(220,38,38,0.32)] sm:p-5"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <ProductImage
                      product={product}
                      isRTL={isRTL}
                      size="card"
                      className="h-56"
                      imageClassName="group-hover:scale-[1.03]"
                    />
                  </Link>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                      {isRTL ? product.brandAr : product.brand}
                    </span>
                    <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                      {product.size}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      x{product.quantity}
                    </span>
                  </div>

                  <Link to={`/product/${product.id}`}>
                    <h2 className="mt-4 line-clamp-2 text-xl font-black leading-tight text-slate-900 transition-colors hover:text-red-700">
                      {isRTL ? product.name.ar : product.name.en}
                    </h2>
                  </Link>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-500">
                    {isRTL ? product.description.ar : product.description.en}
                  </p>

                  <div className="mt-5 flex items-end gap-3">
                    <span className="text-2xl font-black text-red-700">
                      {formatSarPrice(product.price, isRTL)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatSarPrice(product.originalPrice ?? product.price, isRTL)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-red-700">
                    {isRTL
                      ? `توفر ${formatSarPrice(savings, isRTL)} على هذا المقاس`
                      : `Save ${formatSarPrice(savings, isRTL)} on this pack`}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/product/${product.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      <span>{isRTL ? 'عرض التفاصيل' : 'View details'}</span>
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-red-100 px-5 py-3 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50"
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
