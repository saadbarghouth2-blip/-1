import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronRight, Search } from 'lucide-react';
import CatalogMobileToolbar from '../components/CatalogMobileToolbar';
import CatalogProductCard from '../components/CatalogProductCard';
import {
  PRODUCTS_PAGE_SIZE,
  isDiscountedProduct,
  type ProductSize,
} from '../data/products';
import { useProductCatalog } from '../features/catalog/ProductCatalogProvider';
import { useCart } from '../context/CartContext';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from '../components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../components/ui/empty';

function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  if (page > totalPages) {
    return totalPages;
  }

  return page;
}

export default function ProductCatalogGroup() {
  const { groupSlug } = useParams<{ groupSlug: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const {
    catalogGroups,
    getCatalogGroupBySlug,
    getCatalogProductsByGroup,
    getProductSizeOptionsByGroup,
    searchProducts,
  } = useProductCatalog();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const resultsSectionRef = useRef<HTMLElement>(null);
  const shouldScrollResultsRef = useRef(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim();
  const hasSearch = normalizedSearchQuery.length > 0;
  const isRTL = i18n.language === 'ar';

  const group = groupSlug ? getCatalogGroupBySlug(groupSlug) : undefined;

  useEffect(() => {
    if (!group) {
      navigate('/products', { replace: true });
    }
  }, [group, navigate]);

  const groupProducts = useMemo(
    () => (group ? getCatalogProductsByGroup(group.id) : []),
    [group],
  );
  const sizeOptions = useMemo(
    () => (group ? getProductSizeOptionsByGroup(group.id) : []),
    [group],
  );
  const requestedSize = searchParams.get('size')?.trim() ?? '';
  const activeSize = sizeOptions.some((option) => option.id === requestedSize)
    ? requestedSize as ProductSize
    : 'all';
  const activeSizeOption = activeSize === 'all'
    ? null
    : sizeOptions.find((option) => option.id === activeSize) ?? null;

  const filteredProducts = useMemo(() => {
    if (!group) {
      return [];
    }

    const matchingProducts = hasSearch
      ? searchProducts(normalizedSearchQuery)
          .filter((product) => product.catalogGroup === group.id)
          .slice()
          .sort((left, right) => left.catalogOrder - right.catalogOrder)
      : groupProducts;

    if (activeSize === 'all') {
      return matchingProducts;
    }

    return matchingProducts.filter((product) => product.size === activeSize);
  }, [activeSize, group, groupProducts, hasSearch, normalizedSearchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PAGE_SIZE));
  const requestedPage = Number(searchParams.get('page') ?? '1');
  const currentPage = clampPage(requestedPage, totalPages);

  useEffect(() => {
    const currentParam = searchParams.get('page');
    const normalizedParam = currentPage === 1 ? null : String(currentPage);

    if (currentParam === normalizedParam || (currentPage === 1 && currentParam === null)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (currentPage === 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', String(currentPage));
    }

    setSearchParams(nextParams, { replace: true });
  }, [currentPage, searchParams, setSearchParams]);

  useEffect(() => {
    if (!requestedSize) {
      return;
    }

    if (sizeOptions.some((option) => option.id === requestedSize)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('size');
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  }, [requestedSize, searchParams, setSearchParams, sizeOptions]);

  useEffect(() => {
    if (!shouldScrollResultsRef.current) {
      return;
    }

    shouldScrollResultsRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeSize, currentPage]);

  if (!group) {
    return null;
  }

  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PAGE_SIZE,
    currentPage * PRODUCTS_PAGE_SIZE,
  );
  const discountedCount = groupProducts.filter(isDiscountedProduct).length;
  const quoteCount = groupProducts.filter((product) => product.pricingMode === 'quote').length;

  const buildPageLink = (page: number) => {
    const nextParams = new URLSearchParams();

    if (activeSize !== 'all') {
      nextParams.set('size', activeSize);
    }

    if (page > 1) {
      nextParams.set('page', String(page));
    }

    const queryString = nextParams.toString();
    return queryString ? `${group.path}?${queryString}` : group.path;
  };

  const toolbarGroups = catalogGroups.map((item) => ({
    id: item.id,
    labelAr: item.shortAr,
    labelEn: item.shortEn,
    count: item.count,
  }));
  const sizeFilters = [
    {
      id: 'all',
      labelAr: 'كل المقاسات',
      labelEn: 'All sizes',
      count: groupProducts.length,
    },
    ...sizeOptions,
  ];

  const resetPagination = () => {
    if (!searchParams.has('page')) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    resetPagination();
  };

  const handleClearQuery = () => {
    setSearchQuery('');
    resetPagination();
  };

  const handleGroupSelect = (groupId: string) => {
    const targetGroup = catalogGroups.find((item) => item.id === groupId);
    if (!targetGroup || targetGroup.id === group.id) {
      return;
    }

    navigate(targetGroup.path);
  };

  const handleSizeFilterSelect = (sizeId: string) => {
    shouldScrollResultsRef.current = true;
    const nextParams = new URLSearchParams(searchParams);

    if (sizeId === 'all') {
      nextParams.delete('size');
    } else {
      nextParams.set('size', sizeId);
    }

    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  };

  const mobileToolbarHelperText = hasSearch
    ? (isRTL ? 'نتائج البحث داخل هذا القسم والمقاس المختار' : 'Search results inside this section and selected size')
    : activeSizeOption
      ? (isRTL ? 'بدّل المقاس أو غيّر القسم بدون سكرول طويل' : 'Switch size or jump to another section without long scrolling')
      : (isRTL ? 'بدّل القسم أو صفّي حسب المقاس المناسب' : 'Switch the section or filter by the right size');

  const mobileToolbarCountPill = hasSearch
    ? `${filteredProducts.length} ${isRTL ? 'نتيجة' : 'results'}`
    : activeSizeOption
      ? `${isRTL ? activeSizeOption.labelAr : activeSizeOption.labelEn} • ${filteredProducts.length} ${isRTL ? 'منتج' : 'products'}`
      : `${groupProducts.length} ${isRTL ? 'منتج' : 'products'}`;

  const productGridClassName = isMobile
    ? 'grid grid-cols-2 gap-3'
    : 'grid gap-4 min-[430px]:grid-cols-2 xl:grid-cols-3';

  return (
    <main className="relative z-10 min-h-screen py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 hidden items-center gap-2 overflow-x-auto px-1 text-xs text-gray-500 scrollbar-hide sm:mb-8 sm:flex sm:text-sm"
        >
          <Link to="/" className="whitespace-nowrap transition-colors hover:text-[#153b66]">
            {isRTL ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <Link to="/products" className="whitespace-nowrap transition-colors hover:text-[#153b66]">
            {isRTL ? 'المنتجات' : 'Products'}
          </Link>
          <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="truncate whitespace-nowrap text-gray-800">
            {isRTL ? group.nameAr : group.nameEn}
          </span>
        </motion.nav>

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#153b66] via-[#245780] to-[#0d2743] px-4 py-5 text-white shadow-[0_28px_80px_-34px_rgba(21,59,102,0.62)] sm:rounded-[2.4rem] sm:px-8 sm:py-10">
          <div className="absolute -left-10 top-0 h-36 w-36 rounded-full bg-cyan-300/18 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-sky-200/12 blur-3xl" />

          <div className="relative sm:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/16"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                <span>{isRTL ? 'كل الأقسام' : 'All sections'}</span>
              </Link>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                {isRTL ? group.shortAr : group.shortEn}
              </div>
            </div>
            <h1 className="mt-3 text-2xl font-black leading-tight">
              {isRTL ? group.nameAr : group.nameEn}
            </h1>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/78">
              {isRTL ? group.descriptionAr : group.descriptionEn}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: isRTL ? 'الكل' : 'All', value: `${groupProducts.length}` },
                { label: isRTL ? 'مخفض' : 'Discounted', value: `${discountedCount}` },
                { label: isRTL ? 'اسأل' : 'Quote', value: `${quoteCount}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.2rem] border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm"
                >
                  <div className="text-lg font-black">{item.value}</div>
                  <div className="text-[11px] font-semibold text-white/72">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden gap-6 xl:grid xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                {isRTL ? `${group.shortAr} - صفحة ${currentPage}` : `${group.shortEn} - Page ${currentPage}`}
              </div>
              <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                {isRTL ? group.nameAr : group.nameEn}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
                {isRTL ? group.descriptionAr : group.descriptionEn}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: isRTL ? 'إجمالي المنتجات' : 'Products', value: `${groupProducts.length}` },
                { label: isRTL ? 'مخفض' : 'Discounted', value: `${discountedCount}` },
                { label: isRTL ? 'اسأل عن السعر' : 'Quote only', value: `${quoteCount}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="text-2xl font-black">{item.value}</div>
                  <div className="text-sm text-white/72">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isMobile ? (
          <CatalogMobileToolbar
            isRTL={isRTL}
            query={searchQuery}
            onQueryChange={handleSearchQueryChange}
            onClearQuery={handleClearQuery}
            groups={toolbarGroups}
            activeGroupId={group.id}
            onGroupSelect={handleGroupSelect}
            filters={sizeFilters}
            activeFilterId={activeSize}
            onFilterSelect={handleSizeFilterSelect}
            filtersLabel={isRTL ? 'فلترة حسب المقاس' : 'Filter by size'}
            helperText={mobileToolbarHelperText}
            countPill={mobileToolbarCountPill}
            searchPlaceholder={
              isRTL
                ? `ابحث داخل ${group.shortAr}`
                : `Search inside ${group.shortEn}`
            }
          />
        ) : null}

        {!isMobile ? (
          <section className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isRTL ? 'فلترة أسرع حسب المقاس' : 'Filter faster by exact size'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isRTL
                    ? 'اعرض القسم كله أو قلّل البطاقات الظاهرة باختيار مقاس محدد فقط.'
                    : 'Show the whole section or reduce visible cards by choosing one exact size.'}
                </p>
              </div>
              <span className="rounded-full bg-[#153b66]/8 px-3 py-1.5 text-xs font-bold text-[#153b66]">
                {activeSizeOption
                  ? `${isRTL ? activeSizeOption.labelAr : activeSizeOption.labelEn} • ${filteredProducts.length} ${isRTL ? 'منتج' : 'products'}`
                  : `${groupProducts.length} ${isRTL ? 'منتج' : 'products'}`}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {sizeFilters.map((filter) => {
                const isActive = filter.id === activeSize;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => handleSizeFilterSelect(filter.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border-[#153b66] bg-[#153b66] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#153b66] hover:bg-white hover:text-[#153b66]'
                    }`}
                  >
                    <span>{isRTL ? filter.labelAr : filter.labelEn}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-white/15 text-white' : 'bg-white text-slate-500'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section ref={resultsSectionRef} className="mt-8 scroll-mt-28 sm:scroll-mt-24">
          {visibleProducts.length > 0 ? (
            <div className={productGridClassName}>
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <CatalogProductCard
                    product={product}
                    isRTL={isRTL}
                    onAddToCart={addToCart}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Empty className="rounded-[1.8rem] border border-dashed border-slate-200 bg-white p-8 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-[#153b66]/10 text-[#153b66]">
                  <Search className="size-5" />
                </EmptyMedia>
                <EmptyTitle>{isRTL ? 'لا توجد نتائج داخل هذا القسم' : 'No results in this section'}</EmptyTitle>
                <EmptyDescription>
                  {isRTL
                    ? 'جرّب اسمًا آخر أو امسح البحث لتعود لكل منتجات هذا المقاس.'
                    : 'Try another keyword or clear the search to return to all products in this size.'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearQuery}
                  className="rounded-full border-slate-200 px-5"
                >
                  {isRTL ? 'مسح البحث' : 'Clear search'}
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </section>

        {totalPages > 1 ? (
          <section className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
              const active = page === currentPage;

              return (
                <Link
                  key={page}
                  to={buildPageLink(page)}
                  onClick={() => {
                    shouldScrollResultsRef.current = true;
                  }}
                  className={`inline-flex h-11 min-w-[44px] items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#153b66] text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-[#153b66] hover:text-[#153b66]'
                  }`}
                >
                  {page}
                </Link>
              );
            })}
          </section>
        ) : null}

        {!isMobile ? (
          <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_-34px_rgba(15,23,42,0.24)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {isRTL ? 'انتقل بسرعة بين الفئات' : 'Move quickly between groups'}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {isRTL
                    ? 'لو لم تجد المقاس المناسب هنا، افتح الفئة التالية مباشرة بدون الرجوع للوراء.'
                    : 'If this is not the right pack size, jump straight to another group without backtracking.'}
                </p>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#153b66] transition-colors hover:text-[#102f52]"
              >
                <span>{isRTL ? 'العودة للفهرس' : 'Back to index'}</span>
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {catalogGroups
                .filter((item) => item.id !== group.id)
                .map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-[#153b66] hover:bg-white"
                  >
                    <div className="text-sm font-semibold text-[#153b66]">
                      {isRTL ? item.shortAr : item.shortEn}
                    </div>
                    <div className="mt-2 text-lg font-black text-slate-900">
                      {isRTL ? item.nameAr : item.nameEn}
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {item.count} {isRTL ? 'منتج' : 'products'}
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
