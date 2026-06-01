import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgePercent,
  Droplets,
  Layers3,
  MessageCircle,
  Package,
  ShoppingCart,
} from 'lucide-react';
import CatalogProductCard from '../components/CatalogProductCard';
import {
  hasFixedPrice,
  isDiscountedProduct,
} from '../data/products';
import { getCatalogGroupIdForSize, productSizeOptions, useProductCatalog } from '../features/catalog/ProductCatalogProvider';
import { useCart } from '../context/CartContext';
import { useIsMobile } from '../hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import HowToOrder from '../sections/HowToOrder';
import WaterComparison from '../sections/WaterComparison';

export default function Products() {
  const { i18n } = useTranslation();
  const { addToCart } = useCart();
  const { products, catalogGroups, getCatalogProductsByGroup } = useProductCatalog();
  const isMobile = useIsMobile();
  const isRTL = i18n.language === 'ar';

  const discountedCount = products.filter(isDiscountedProduct).length;
  const quoteCount = products.filter((product) => product.pricingMode === 'quote').length;
  const fixedPriceCount = products.filter(hasFixedPrice).length;

  const catalogSections = useMemo(() => (
    catalogGroups.map((group) => {
      const groupProducts = getCatalogProductsByGroup(group.id);

      return {
        group,
        products: groupProducts,
        discountedCount: groupProducts.filter(isDiscountedProduct).length,
        quoteCount: groupProducts.filter((product) => product.pricingMode === 'quote').length,
      };
    })
  ), []);

  const sizeQuickLinks = useMemo(() => (
    productSizeOptions.reduce<Array<{
      id: string;
      labelAr: string;
      labelEn: string;
      count: number;
      path: string;
      groupLabelAr: string;
      groupLabelEn: string;
    }>>((collection, option) => {
      const count = products.filter((product) => product.size === option.id).length;
      if (!count) {
        return collection;
      }

      const groupId = getCatalogGroupIdForSize(option.id);
      const group = catalogGroups.find((entry) => entry.id === groupId);
      if (!group) {
        return collection;
      }

      collection.push({
        id: option.id,
        labelAr: option.labelAr,
        labelEn: option.labelEn,
        count,
        path: groupId === 'over-330ml' ? `${group.path}?size=${option.id}` : group.path,
        groupLabelAr: group.shortAr,
        groupLabelEn: group.shortEn,
      });

      return collection;
    }, [])
  ), []);

  const renderDesktopSection = (
    groupId: string,
    sectionIndex: number,
  ) => {
    const section = catalogSections.find((entry) => entry.group.id === groupId);
    if (!section) {
      return null;
    }

    return (
      <motion.section
        key={section.group.id}
        id={`catalog-${section.group.slug}`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sectionIndex * 0.05 }}
        className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.28)] sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full bg-[#153b66]/10 px-3 py-1.5 text-xs font-semibold text-[#153b66]">
              {isRTL ? section.group.shortAr : section.group.shortEn}
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
              {isRTL ? section.group.nameAr : section.group.nameEn}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              {isRTL ? section.group.descriptionAr : section.group.descriptionEn}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[320px]">
            {[
              { label: isRTL ? 'الكل' : 'All', value: `${section.products.length}` },
              { label: isRTL ? 'مخفض' : 'Discounted', value: `${section.discountedCount}` },
              { label: isRTL ? 'حسب الطلب' : 'Quote', value: `${section.quoteCount}` },
            ].map((item) => (
              <div
                key={`${section.group.id}-${item.label}`}
                className="rounded-[1.2rem] bg-slate-50 px-3 py-3 text-center"
              >
                <div className="text-lg font-black text-slate-900 sm:text-xl">{item.value}</div>
                <div className="text-[11px] font-semibold text-slate-500 sm:text-xs">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 min-[430px]:grid-cols-2 xl:grid-cols-3">
          {section.products.map((product) => (
            <CatalogProductCard
              key={product.id}
              product={product}
              isRTL={isRTL}
              onAddToCart={addToCart}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-slate-500">
            {isRTL
              ? 'لو تحب تشوف هذا المقاس فقط، افتح صفحته المخصصة وتصفح المنتجات براحة أكبر.'
              : 'If you prefer, open the dedicated page for this size only and browse it on its own.'}
          </p>
          <Link
            to={section.group.path}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#153b66] transition-colors hover:text-[#102f52]"
          >
            <Package className="h-4 w-4" />
            <span>{isRTL ? 'افتح صفحة المقاس' : 'Open dedicated page'}</span>
          </Link>
        </div>
      </motion.section>
    );
  };

  return (
    <main className="relative z-10 min-h-screen py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#153b66] via-[#225880] to-[#0b233d] px-4 py-5 text-white shadow-[0_30px_90px_-44px_rgba(15,23,42,0.72)] sm:rounded-[2.5rem] sm:px-8 sm:py-10">
          <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-sky-200/10 blur-3xl" />

          <div className="relative sm:hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <Layers3 className="h-3.5 w-3.5" />
              <span>{isRTL ? 'اطلب أسرع حسب المقاس' : 'Order faster by size'}</span>
            </div>

            <h1 className="mt-3 text-2xl font-black leading-tight">
              {isRTL ? 'اختَر مقاسك وشوف السعر واطلب فورًا' : 'Pick your size, check the price, and order now'}
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/78">
              {isRTL
                ? 'لو بتطلب للبيت أو المكتب، ادخل على المقاس المطلوب مباشرة ووفر وقتك من غير لف كتير.'
                : 'Ordering for home or office? Jump straight to the size you need and save time.'}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: isRTL ? 'اختيارات' : 'Choices', value: `${products.length}` },
                { label: isRTL ? 'أسعار جاهزة' : 'Ready prices', value: `${fixedPriceCount}` },
                { label: isRTL ? 'نأكدها لك' : 'We confirm', value: `${quoteCount}` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.2rem] border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm"
                >
                  <div className="text-lg font-black">{stat.value}</div>
                  <div className="text-[11px] font-semibold text-white/72">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden gap-6 xl:grid xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <Layers3 className="h-4 w-4" />
                <span>{isRTL ? 'كل المقاسات جاهزة للطلب' : 'All sizes ready to order'}</span>
              </div>
              <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                {isRTL
                  ? 'اختار الموية المناسبة لك واطلبها في دقائق'
                  : 'Choose the water pack that fits you and order in minutes'}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
                {isRTL
                  ? 'اختار المقاس المناسب لك بسرعة، شوف السعر بوضوح، وكمّل طلبك في خطوات بسيطة.'
                  : 'Sizes are grouped so you find the pack you need quickly, see the price clearly, and finish your order with less effort.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: isRTL ? 'اختيارات متاحة' : 'Available picks', value: `${products.length}` },
                { label: isRTL ? 'أسعار جاهزة' : 'Ready prices', value: `${fixedPriceCount}` },
                { label: isRTL ? 'نأكد السعر لك' : 'Price confirmed', value: `${quoteCount}` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="text-2xl font-black">{stat.value}</div>
                  <div className="text-sm text-white/72">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.2)] sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                {isRTL ? 'ابدأ بالمقاس اللي يناسبك' : 'Start with the size that fits you'}
              </h2>
              <p className="mt-1 text-sm leading-7 text-slate-500">
                {isRTL
                  ? 'اختار المقاس، شوف المنتجات المتاحة، وكمّل طلبك بسرعة من غير بحث طويل.'
                  : 'Pick a size, see matching products, and complete your order without a long search.'}
              </p>
            </div>
            <span className="inline-flex rounded-full bg-[#153b66]/8 px-3 py-1.5 text-xs font-bold text-[#153b66]">
              {sizeQuickLinks.length} {isRTL ? 'مقاسات متاحة' : 'quick shortcuts'}
            </span>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
            {sizeQuickLinks.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="group min-w-[148px] rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-[#153b66] hover:bg-white sm:min-w-0"
              >
                <div className="text-sm font-black text-slate-900">
                  {isRTL ? item.labelAr : item.labelEn}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-500">
                  {item.count} {isRTL ? 'منتج' : 'products'}
                </div>
                <div className="mt-2 text-[11px] font-semibold text-[#153b66]">
                  {isRTL ? `يفتح قسم ${item.groupLabelAr}` : `Inside ${item.groupLabelEn}`}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {isMobile ? (
          <>
            <section className="mt-5">
              <div className="rounded-[1.6rem] border border-[#153b66]/12 bg-[#153b66]/5 p-4 text-sm leading-7 text-slate-600 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.28)]">
                {isRTL
                  ? 'ابدأ بالمقاس الذي تريده، وبعدها ستشوف منتجاته فقط لطلب أسرع وأسهل.'
                  : 'Start by choosing the right pack size, then browse only that section with its own local search and faster section switching.'}
              </div>

              <div className="mt-4 grid gap-3">
                {catalogSections.map((section) => (
                  <Link
                    key={section.group.id}
                    to={section.group.path}
                    className="group rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full bg-[#153b66]/10 px-3 py-1 text-xs font-semibold text-[#153b66]">
                          {isRTL ? section.group.shortAr : section.group.shortEn}
                        </span>
                        <h2 className="mt-3 text-lg font-black text-slate-900">
                          {isRTL ? section.group.nameAr : section.group.nameEn}
                        </h2>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                        <div className="text-lg font-black text-slate-900">{section.products.length}</div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          {isRTL ? 'منتج' : 'items'}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                      {isRTL ? section.group.descriptionAr : section.group.descriptionEn}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {section.products.length} {isRTL ? 'منتج' : 'products'}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        {section.discountedCount} {isRTL ? 'مخفض' : 'discounted'}
                      </span>
                      {section.quoteCount > 0 ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                          {section.quoteCount} {isRTL ? 'حسب الطلب' : 'quote only'}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[#153b66]">
                      <span>{isRTL ? 'افتح هذا القسم' : 'Open group page'}</span>
                      <Package className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white px-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)]" value="how-to-order">
                  <AccordionTrigger className="py-5 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#153b66]/10 text-[#153b66]">
                        <ShoppingCart className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-base font-black text-slate-900">
                          {isRTL ? 'كيف أطلب؟' : 'How to order'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isRTL ? 'افتح خطوات الطلب فقط عندما تحتاجها.' : 'Open the ordering guide only when needed.'}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="-mx-4 -mb-4">
                      <HowToOrder isRTL={isRTL} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white px-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)]" value="water-comparison">
                  <AccordionTrigger className="py-5 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                        <Droplets className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-base font-black text-slate-900">
                          {isRTL ? 'مقارنة أنواع المياه' : 'Water comparison'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isRTL ? 'افتح المقارنة فقط إذا احتجتها.' : 'Expand the guide only when you need it.'}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="-mx-4 -mb-4">
                      <WaterComparison isRTL={isRTL} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </>
        ) : (
          <>
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                    {isRTL ? 'تنقل سريع بين المقاسات' : 'Quick jumps between groups'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isRTL
                      ? 'اختر القسم المناسب وانتقل إليه مباشرة بدل البحث بين كل المنتجات.'
                      : 'Jump straight to the right section without scanning every product.'}
                  </p>
                </div>
                <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:inline-flex">
                  {products.length} {isRTL ? 'منتج' : 'products'}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {catalogSections.map((section) => (
                  <a
                    key={section.group.id}
                    href={`#catalog-${section.group.slug}`}
                    className="min-w-[260px] rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.24)] transition-transform duration-300 hover:-translate-y-1 sm:min-w-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex rounded-full bg-[#153b66]/10 px-3 py-1 text-xs font-semibold text-[#153b66]">
                          {isRTL ? section.group.shortAr : section.group.shortEn}
                        </span>
                        <h3 className="mt-3 text-lg font-black text-slate-900">
                          {isRTL ? section.group.nameAr : section.group.nameEn}
                        </h3>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                        <div className="text-lg font-black text-slate-900">{section.products.length}</div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          {isRTL ? 'منتج' : 'items'}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                      {isRTL ? section.group.descriptionAr : section.group.descriptionEn}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {section.products.length} {isRTL ? 'منتج' : 'products'}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        {section.discountedCount} {isRTL ? 'مخفض' : 'discounted'}
                      </span>
                      {section.quoteCount > 0 ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                          {section.quoteCount} {isRTL ? 'حسب الطلب' : 'quote only'}
                        </span>
                      ) : null}
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section className="mt-8 space-y-8">
              {catalogSections.map((section, index) => renderDesktopSection(section.group.id, index))}
            </section>

            <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.24)] sm:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.4rem] bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-[#153b66]">
                    <BadgePercent className="h-4 w-4" />
                    <span className="text-sm font-semibold">{isRTL ? 'عروض واضحة' : 'Visible discounts'}</span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-slate-900">{discountedCount}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {isRTL
                      ? 'كل العروض الظاهرة هنا لها سعر واضح وخصم حقيقي.'
                      : 'The offers page still includes only products with a confirmed price and a real visible discount.'}
                  </p>
                </div>

                <div className="rounded-[1.4rem] bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-[#153b66]">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">{isRTL ? 'أسعار حسب الطلب' : 'Needs price confirmation'}</span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-slate-900">{quoteCount}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {isRTL
                      ? 'بعض المنتجات تحتاج تأكيد سعر، وستجدها واضحة بعلامة حسب الطلب.'
                      : 'Any product without a confirmed fixed price is clearly marked as ask for price, without a misleading cart action.'}
                  </p>
                </div>

                <div className="rounded-[1.4rem] bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-[#153b66]">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-semibold">{isRTL ? 'تصفح أسهل' : 'Better on mobile'}</span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-slate-900">{products.length}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {isRTL
                      ? 'رتبنا المقاسات والمنتجات بشكل أوضح لتصل لطلبك أسرع.'
                      : 'All current products now live on the same page, with clearer grouping and cards that are easier to scan on mobile.'}
                  </p>
                </div>
              </div>
            </section>

            <section id="how-to-order" className="mt-14">
              <HowToOrder isRTL={isRTL} />
            </section>

            <section id="water-comparison" className="mt-12">
              <WaterComparison isRTL={isRTL} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
