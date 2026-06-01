import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Package, Shapes, ShoppingCart, Tag } from 'lucide-react';
import { hasFixedPrice, isDiscountedProduct } from '../data/products';
import { getBrandEntryPrice, useProductCatalog } from '../features/catalog/ProductCatalogProvider';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';
import BrandVisual from '../components/BrandVisual';
import { WHATSAPP_LINK } from '../lib/contact';
import { formatSarPrice } from '../lib/utils';

export default function BrandDetail() {
  const { brandId } = useParams<{ brandId: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { brands, getProductsByBrand } = useProductCatalog();
  const isRTL = i18n.language === 'ar';

  const brand = brands.find((item) => item.id === brandId);
  const brandProducts = brand ? getProductsByBrand(brand.name) : [];

  useEffect(() => {
    if (!brand) {
      navigate('/brands');
    }
  }, [brand, navigate]);

  if (!brand) {
    return null;
  }

  const sizes = [...new Set(brandProducts.map((product) => product.size))];
  const discountedCount = brandProducts.filter(isDiscountedProduct).length;
  const entryPrice = getBrandEntryPrice(brandProducts);

  return (
    <main className="relative z-10 min-h-screen py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 overflow-x-auto px-1 text-xs text-gray-500 scrollbar-hide sm:mb-8 sm:text-sm"
        >
          <Link to="/" className="transition-colors hover:text-[#153b66]">{isRTL ? 'الرئيسية' : 'Home'}</Link>
          <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <Link to="/brands" className="transition-colors hover:text-[#153b66]">{isRTL ? 'العلامات التجارية' : 'Brands'}</Link>
          <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="truncate whitespace-nowrap text-gray-800">{isRTL ? brand.nameAr : brand.name}</span>
        </motion.nav>

        <section className="overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-[#0a63a7] via-[#1388d3] to-[#0f3f7b] p-6 text-white shadow-[0_28px_80px_-34px_rgba(21,59,102,0.7)] sm:p-8 lg:p-10">
          <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr] xl:items-center">
            <div>
              <BrandVisual brand={brand} isRTL={isRTL} size="hero" className="border-white/20 bg-white/10" />
            </div>

            <div>
              <div className="inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                {isRTL ? 'ملف العلامة' : 'Brand profile'}
              </div>
              <h1 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">{isRTL ? brand.nameAr : brand.name}</h1>
              <p className="mt-2 text-base text-white/72 sm:text-lg">{isRTL ? brand.name : brand.nameAr}</p>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-white/90 sm:text-base">
                {isRTL
                  ? `${brand.nameAr} متاحة الآن عبر ${brandProducts.length} منتجًا في الكتالوج الحالي، مع أحجام مثل ${sizes.join('، ')} وسعر يبدأ من ${formatSarPrice(entryPrice, isRTL)}.`
                  : `${brand.name} is currently represented by ${brandProducts.length} products in the active catalog, with sizes such as ${sizes.join(', ')} and pricing from ${formatSarPrice(entryPrice, isRTL)}.`}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {size}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: isRTL ? 'المنتجات' : 'Products', value: `${brandProducts.length}`, icon: Package },
                  { label: isRTL ? 'الأحجام' : 'Sizes', value: `${sizes.length}`, icon: Shapes },
                  { label: isRTL ? 'منتجات مخفضة' : 'Discounted', value: `${discountedCount}`, icon: Tag },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <item.icon className="mb-2 h-5 w-5 text-white/85" />
                    <div className="text-xl font-black text-white">{item.value}</div>
                    <div className="text-xs text-white/75">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.3)]">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <div className="text-sm font-medium text-slate-500">{isRTL ? 'أقل سعر ظاهر' : 'Entry price'}</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{formatSarPrice(entryPrice, isRTL)}</div>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <div className="text-sm font-medium text-slate-500">{isRTL ? 'أحجام متاحة' : 'Available sizes'}</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{sizes.length}</div>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <div className="text-sm font-medium text-slate-500">{isRTL ? 'خصومات حالية' : 'Live discounts'}</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{discountedCount}</div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isRTL ? `منتجات ${brand.nameAr}` : `${brand.name} products`}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isRTL
                  ? 'جميع المنتجات التابعة للعلامة في الكتالوج الحالي بنفس ترتيب العرض المشترك.'
                  : 'All current products for this brand in the same shared display order.'}
              </p>
            </div>
            <Link
              to="/brands"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#153b66] transition-colors hover:text-[#102f52]"
            >
              <span>{isRTL ? 'العودة لكل العلامات' : 'Back to all brands'}</span>
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {brandProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] transition-all hover:-translate-y-1 hover:shadow-[0_26px_70px_-34px_rgba(14,165,233,0.24)]"
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
                <Link to={`/product/${product.id}`}>
                  <h3 className="mt-4 line-clamp-2 text-xl font-black leading-tight text-slate-900 transition-colors hover:text-[#153b66]">
                    {isRTL ? product.name.ar : product.name.en}
                  </h3>
                </Link>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500">
                  <span>{product.size}</span>
                  <span>x{product.quantity}</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-xl font-black text-[#153b66]">
                    {formatSarPrice(product.price, isRTL)}
                  </span>
                  {hasFixedPrice(product) ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#153b66] hover:text-[#153b66]"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>{isRTL ? 'أضف' : 'Add'}</span>
                    </button>
                  ) : (
                    <a
                      href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                        isRTL
                          ? `أرغب في معرفة سعر ${product.name.ar}`
                          : `I would like to know the current price for ${product.name.en}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{isRTL ? 'اسأل' : 'Ask'}</span>
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
