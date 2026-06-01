import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Shapes } from 'lucide-react';
import { isDiscountedProduct } from '../data/products';
import { getBrandEntryPrice, useProductCatalog } from '../features/catalog/ProductCatalogProvider';
import BrandVisual from '../components/BrandVisual';
import { formatSarPrice } from '../lib/utils';

type SortKey = 'default' | 'products' | 'price';

export default function Brands() {
  const { i18n } = useTranslation();
  const { brands, products, getProductsByBrand } = useProductCatalog();
  const isRTL = i18n.language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

  const filteredBrands = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    const result = brands.filter((brand) => (
      !needle ||
      brand.name.toLowerCase().includes(needle) ||
      brand.nameAr.toLowerCase().includes(needle)
    ));

    if (sortBy === 'products') {
      result.sort((left, right) => getProductsByBrand(right.name).length - getProductsByBrand(left.name).length);
    } else if (sortBy === 'price') {
      result.sort((left, right) => {
        const leftLowest = getBrandEntryPrice(getProductsByBrand(left.name)) ?? Number.POSITIVE_INFINITY;
        const rightLowest = getBrandEntryPrice(getProductsByBrand(right.name)) ?? Number.POSITIVE_INFINITY;
        return leftLowest - rightLowest;
      });
    }

    return result;
  }, [searchQuery, sortBy]);

  const activeBrandCount = brands.length;
  const smallPackCount = products.filter((product) => product.category === 'small').length;
  const largePackCount = products.filter((product) => product.category === 'large').length;

  return (
    <main className="relative z-10 min-h-screen py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#153b66] via-[#245780] to-[#537fa3] px-6 py-8 text-white shadow-[0_30px_90px_-44px_rgba(15,23,42,0.72)] sm:px-8 sm:py-10">
          <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-cyan-200/12 blur-3xl" />
          <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <Shapes className="h-4 w-4" />
                <span>{isRTL ? 'علامات مشتقة من الكتالوج الفعلي' : 'Brands derived from the live catalog'}</span>
              </div>
              <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                {isRTL
                  ? 'كل علامة هنا مرتبطة مباشرة بمنتجاتها الحالية داخل ملف الإكسل'
                  : 'Every brand here now comes directly from the active spreadsheet-backed products'}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
                {isRTL
                  ? 'قارن بسرعة بين عدد المنتجات، الأحجام المتاحة، وأقل سعر ظاهر لكل علامة بدون جالونات أو عروض قديمة خارج الكتالوج.'
                  : 'Compare brands quickly by live product count, available sizes, and visible entry price without legacy gallons or retired offer records.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: isRTL ? 'علامات فعالة' : 'Active brands', value: `${activeBrandCount}` },
                { label: isRTL ? 'عبوات صغيرة' : 'Small packs', value: `${smallPackCount}` },
                { label: isRTL ? 'عبوات كبيرة' : 'Large packs', value: `${largePackCount}` },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black">{item.value}</div>
                  <div className="text-sm text-white/72">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.28)] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
            <label className="relative block">
              <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={isRTL ? 'ابحث عن علامة...' : 'Search a brand...'}
                className={`w-full rounded-full border border-slate-200 bg-slate-50 py-3 text-sm text-slate-900 outline-none transition focus:border-[#153b66] focus:bg-white focus:ring-4 focus:ring-[#153b66]/10 sm:text-base ${isRTL ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
              />
            </label>

            <label className="rounded-[1.5rem] bg-slate-50 p-4">
              <span className="text-sm font-medium text-slate-500">
                {isRTL ? 'الترتيب' : 'Sort by'}
              </span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#153b66] focus:ring-4 focus:ring-[#153b66]/10"
              >
                <option value="default">{isRTL ? 'الافتراضي' : 'Default'}</option>
                <option value="products">{isRTL ? 'عدد المنتجات' : 'Products count'}</option>
                <option value="price">{isRTL ? 'أقل سعر' : 'Lowest price'}</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBrands.map((brand, index) => {
            const brandProducts = getProductsByBrand(brand.name);
            const sizes = [...new Set(brandProducts.map((product) => product.size))];
            const lowestPrice = getBrandEntryPrice(brandProducts);
            const discountedCount = brandProducts.filter(isDiscountedProduct).length;

            return (
              <motion.article
                key={brand.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] transition-all hover:-translate-y-1 hover:shadow-[0_26px_70px_-34px_rgba(14,165,233,0.24)]"
              >
                <BrandVisual brand={brand} isRTL={isRTL} size="card" />

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#153b66]/10 px-3 py-1.5 text-xs font-semibold text-[#153b66]">
                    {brandProducts.length} {isRTL ? 'منتج' : 'items'}
                  </span>
                  {discountedCount > 0 ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      {discountedCount} {isRTL ? 'مخفض' : 'discounted'}
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-4 text-2xl font-black text-slate-900">
                  {isRTL ? brand.nameAr : brand.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isRTL ? brand.name : brand.nameAr}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.2rem] bg-slate-50 p-4">
                    <div className="text-xs font-medium text-slate-500">{isRTL ? 'المنتجات' : 'Products'}</div>
                    <div className="mt-2 text-xl font-black text-slate-900">{brandProducts.length}</div>
                  </div>
                  <div className="rounded-[1.2rem] bg-slate-50 p-4">
                    <div className="text-xs font-medium text-slate-500">{isRTL ? 'الأحجام' : 'Sizes'}</div>
                    <div className="mt-2 text-xl font-black text-slate-900">{sizes.length}</div>
                  </div>
                  <div className="rounded-[1.2rem] bg-slate-50 p-4">
                    <div className="text-xs font-medium text-slate-500">{isRTL ? 'أقل سعر' : 'Entry price'}</div>
                    <div className="mt-2 text-base font-black text-slate-900">{formatSarPrice(lowestPrice, isRTL)}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {sizes.slice(0, 4).map((size) => (
                    <span
                      key={`${brand.id}-${size}`}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      {size}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/brand/${brand.id}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#153b66] transition-colors hover:text-[#102f52]"
                >
                  <span>{isRTL ? 'عرض منتجات العلامة' : 'View brand products'}</span>
                  <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              </motion.article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
