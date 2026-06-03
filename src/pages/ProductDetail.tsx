import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronRight,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import {
  getProductPackageDetails,
  hasFixedPrice,
  isDiscountedProduct,
} from '../data/products';
import { useProductCatalog } from '../features/catalog/ProductCatalogProvider';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';
import { WHATSAPP_LINK } from '../lib/contact';
import { formatSarPrice } from '../lib/utils';

const CATEGORY_LABELS = {
  small: { ar: 'عبوة صغيرة', en: 'Small pack' },
  medium: { ar: 'عبوة متوسطة', en: 'Medium pack' },
  large: { ar: 'عبوة كبيرة', en: 'Large pack' },
  gallon: { ar: 'جالون', en: 'Gallon' },
  glass: { ar: 'زجاج', en: 'Glass' },
  offer: { ar: 'عرض', en: 'Offer' },
} as const;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { brands, getCatalogGroupById, getProductById, getRelatedProducts } = useProductCatalog();
  const isRTL = i18n.language === 'ar';
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = id ? getRelatedProducts(id, 4) : [];
  const brandRecord = useMemo(
    () => brands.find((brand) => brand.id === product?.brandId),
    [product],
  );
  const groupRecord = product ? getCatalogGroupById(product.catalogGroup) : undefined;

  useEffect(() => {
    if (!product) {
      navigate('/products');
    }
  }, [navigate, product]);

  if (!product) {
    return null;
  }

  const pricedProduct = hasFixedPrice(product) ? product : null;
  const discountedProduct = isDiscountedProduct(product) ? product : null;
  const hasPrice = pricedProduct !== null;
  const hasDiscount = discountedProduct !== null;
  const discountValue = discountedProduct ? discountedProduct.originalPrice - discountedProduct.price : 0;
  const productFacts = product.quickFacts ?? [];
  const packageDetails = getProductPackageDetails(product, isRTL);
  const categoryLabel = CATEGORY_LABELS[product.category];
  const quoteLink = `${WHATSAPP_LINK}?text=${encodeURIComponent(
    isRTL
      ? `أرغب في معرفة سعر ${product.name.ar}`
      : `I would like to know the current price for ${product.name.en}`,
  )}`;

  const handleAddToCart = () => {
    if (!hasPrice) {
      return;
    }

    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!hasPrice) {
      return;
    }

    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <main className="relative z-10 min-h-screen py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 overflow-x-auto px-1 text-xs text-gray-500 scrollbar-hide sm:mb-8 sm:text-sm"
        >
          <Link to="/" className="whitespace-nowrap transition-colors hover:text-[#153b66]">
            {isRTL ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <Link to="/products" className="whitespace-nowrap transition-colors hover:text-[#153b66]">
            {isRTL ? 'المنتجات' : 'Products'}
          </Link>
          {groupRecord ? (
            <>
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              <Link to={groupRecord.path} className="whitespace-nowrap transition-colors hover:text-[#153b66]">
                {isRTL ? groupRecord.shortAr : groupRecord.shortEn}
              </Link>
            </>
          ) : null}
          <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="truncate whitespace-nowrap text-gray-800">
            {isRTL ? product.name.ar : product.name.en}
          </span>
        </motion.nav>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2.2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.4)] sm:p-5"
          >
            <ProductImage
              product={product}
              isRTL={isRTL}
              size="detail"
              className="h-[340px] sm:h-[440px] lg:h-[540px]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isRTL ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className="flex min-w-0 flex-col gap-5"
          >
            <div className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.32)] sm:p-7">
              <div className="flex flex-wrap items-center gap-3">
                {brandRecord ? (
                  <Link
                    to={`/brand/${brandRecord.id}`}
                    className="rounded-full bg-[#153b66]/10 px-3 py-1.5 text-xs font-semibold text-[#153b66]"
                  >
                    {isRTL ? product.brandAr : product.brand}
                  </Link>
                ) : null}
                <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700">
                  {isRTL ? categoryLabel.ar : categoryLabel.en}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {product.size}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  x{product.quantity}
                </span>
                {product.pricingMode === 'quote' ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                    {isRTL ? 'اسأل عن السعر' : 'Ask for price'}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 break-words text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                {isRTL ? product.name.ar : product.name.en}
              </h1>
              <p className="mt-4 text-sm leading-8 text-slate-500 sm:text-base">
                {isRTL ? product.description.ar : product.description.en}
              </p>

              <div className="mt-5 flex min-h-[56px] flex-wrap items-end gap-3">
                {hasPrice ? (
                  <>
                    <span className="text-3xl font-black text-[#153b66] sm:text-4xl">
                      {formatSarPrice(pricedProduct?.price, isRTL)}
                    </span>
                    {typeof pricedProduct?.originalPrice === 'number' ? (
                      <span className="text-lg text-slate-400 line-through">
                        {formatSarPrice(pricedProduct.originalPrice, isRTL)}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-2xl font-black text-amber-700 sm:text-3xl">
                    {isRTL ? 'اسأل عن السعر' : 'Ask for price'}
                  </span>
                )}
              </div>

              {hasDiscount ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <Check className="h-4 w-4" />
                  <span>
                    {isRTL
                      ? `توفر ${formatSarPrice(discountValue, isRTL)} على هذا المنتج`
                      : `Save ${formatSarPrice(discountValue, isRTL)} on this product`}
                  </span>
                </div>
              ) : null}

              {hasPrice ? (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {isRTL ? 'الكمية:' : 'Quantity:'}
                  </span>
                  <div className="flex items-center overflow-hidden rounded-full border border-slate-200">
                    <button
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="p-3 text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[56px] px-4 text-center text-base font-bold text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((current) => current + 1)}
                      className="p-3 text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className={`mt-6 grid gap-3 ${hasPrice ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {hasPrice ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#153b66] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#102f52]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{isRTL ? 'أضف للسلة' : 'Add to cart'}</span>
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#153b66] hover:text-[#153b66]"
                    >
                      <Truck className="h-4 w-4" />
                      <span>{isRTL ? 'اطلب الآن' : 'Buy now'}</span>
                    </button>
                  </>
                ) : null}

                <a
                  href={quoteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 px-6 py-3.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{isRTL ? 'اسأل عبر واتساب' : 'Ask on WhatsApp'}</span>
                </a>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-34px_rgba(15,23,42,0.28)]">
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#153b66]" />
                  <h2 className="text-xl font-bold text-slate-900">
                    {isRTL ? 'حقائق سريعة' : 'Quick facts'}
                  </h2>
                </div>
                <div className="space-y-3">
                  {productFacts.map((fact) => (
                    <div
                      key={fact.labelEn}
                      className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-500">
                        {isRTL ? fact.labelAr : fact.labelEn}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {isRTL ? fact.valueAr : fact.valueEn}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-34px_rgba(15,23,42,0.28)]">
                <h2 className="text-xl font-bold text-slate-900">
                  {isRTL ? 'تفاصيل العبوة' : 'Pack details'}
                </h2>
                <div className="mt-4 space-y-3">
                  {packageDetails.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span className="leading-7">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mt-12">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isRTL ? 'منتجات مرتبطة' : 'Related products'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isRTL
                    ? 'منتجات من نفس العلامة أو نفس فئة المقاس لتسهيل استكمال الطلب.'
                    : 'Products from the same brand or the same size group to continue browsing faster.'}
                </p>
              </div>
              {groupRecord ? (
                <Link
                  to={groupRecord.path}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#153b66] transition-colors hover:text-[#102f52]"
                >
                  <span>{isRTL ? `كل ${groupRecord.shortAr}` : `All ${groupRecord.shortEn}`}</span>
                  <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((related) => (
                <article
                  key={related.id}
                  className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white p-4 shadow-[0_18px_55px_-34px_rgba(15,23,42,0.28)]"
                >
                  <Link to={`/product/${related.id}`} className="block">
                    <ProductImage product={related} isRTL={isRTL} size="card" className="h-52" />
                  </Link>
                  <Link to={`/product/${related.id}`}>
                    <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900 transition-colors hover:text-[#153b66]">
                      {isRTL ? related.name.ar : related.name.en}
                    </h3>
                  </Link>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500">
                    <span>{related.size}</span>
                    <span>x{related.quantity}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-lg font-black text-[#153b66]">
                      {formatSarPrice(related.price, isRTL)}
                    </span>
                    {hasFixedPrice(related) ? (
                      <button
                        onClick={() => addToCart(related)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#153b66] hover:text-[#153b66]"
                      >
                        {isRTL ? 'أضف' : 'Add'}
                      </button>
                    ) : (
                      <a
                        href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                          isRTL
                            ? `أرغب في معرفة سعر ${related.name.ar}`
                            : `I would like to know the current price for ${related.name.en}`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                      >
                        {isRTL ? 'اسأل' : 'Ask'}
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
