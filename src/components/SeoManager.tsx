import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  brands,
  catalogGroups,
  getBrandEntryPrice,
  getCatalogGroupBySlug,
  getProductById,
  getProductsByBrand,
  hasFixedPrice,
  isDiscountedProduct,
  products,
} from '../data/products';
import { localizeText } from '../lib/utils';
import {
  SITE_ADDRESS_AR,
  SITE_ADDRESS_EN,
  SITE_ALTERNATE_NAMES,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_IMAGE,
  SITE_EMAIL,
  SITE_NAME_AR,
  SITE_NAME_LOCKUP,
  SITE_PHONE,
  SITE_PHONE_RAW,
  SITE_SHORT_NAME_AR,
  SITE_SOCIAL_LINKS,
  getSiteOrigin,
  normalizeCanonicalPath,
  toAbsoluteUrl,
  withBasePath,
} from '../lib/site';

type BreadcrumbItem = {
  name: string;
  path: string;
};

type SeoPayload = {
  title: string;
  description: string;
  image: string;
  path: string;
  type: 'website' | 'product';
  robots: string;
  keywords: string;
  structuredData: unknown[];
};

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

function upsertStructuredData(id: string, data: unknown) {
  let element = document.head.querySelector<HTMLScriptElement>(`script[data-seo-id="${id}"]`);

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.seoId = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

function buildBreadcrumbSchema(items: BreadcrumbItem[], siteOrigin: string, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(withBasePath(item.path), siteOrigin),
    })),
  };
}

function buildWebPageSchema({
  pageUrl,
  title,
  description,
  pageType,
  locale,
  siteOrigin,
}: {
  pageUrl: string;
  title: string;
  description: string;
  pageType: string;
  locale: string;
  siteOrigin: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: {
      '@id': `${siteOrigin}/#website`,
    },
    breadcrumb: {
      '@id': `${pageUrl}#breadcrumb`,
    },
  };
}

function buildItemListSchema(
  pageUrl: string,
  items: Array<{ name: string; path: string }>,
  siteOrigin: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${pageUrl}#itemlist`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: toAbsoluteUrl(withBasePath(item.path), siteOrigin),
    })),
  };
}

function buildCommonSchemas(siteOrigin: string, isRTL: boolean) {
  const description = isRTL ? SITE_DEFAULT_DESCRIPTION.ar : SITE_DEFAULT_DESCRIPTION.en;
  const address = isRTL ? SITE_ADDRESS_AR : SITE_ADDRESS_EN;
  const logoUrl = toAbsoluteUrl(SITE_DEFAULT_IMAGE, siteOrigin);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteOrigin}/#website`,
      url: `${siteOrigin}/`,
      name: SITE_SHORT_NAME_AR,
      alternateName: SITE_ALTERNATE_NAMES,
      description,
      inLanguage: ['ar-SA', 'en-SA'],
      publisher: {
        '@id': `${siteOrigin}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteOrigin}/products?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteOrigin}/#organization`,
      name: SITE_NAME_LOCKUP,
      alternateName: SITE_ALTERNATE_NAMES,
      url: `${siteOrigin}/`,
      logo: logoUrl,
      image: logoUrl,
      email: SITE_EMAIL,
      telephone: SITE_PHONE_RAW,
      sameAs: SITE_SOCIAL_LINKS,
    },
    {
      '@context': 'https://schema.org',
      '@type': ['Store', 'LocalBusiness'],
      '@id': `${siteOrigin}/#store`,
      name: SITE_NAME_AR,
      alternateName: SITE_ALTERNATE_NAMES,
      image: logoUrl,
      logo: logoUrl,
      url: `${siteOrigin}/`,
      telephone: SITE_PHONE_RAW,
      email: SITE_EMAIL,
      description,
      address: {
        '@type': 'PostalAddress',
        addressLocality: isRTL ? 'الرياض' : 'Riyadh',
        addressCountry: 'SA',
        streetAddress: address,
      },
      sameAs: SITE_SOCIAL_LINKS,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: SITE_PHONE_RAW,
          email: SITE_EMAIL,
          contactType: 'customer service',
          availableLanguage: ['Arabic', 'English'],
        },
      ],
    },
  ];
}

function buildProductSchema({
  productId,
  pageUrl,
  siteOrigin,
  isRTL,
}: {
  productId: string;
  pageUrl: string;
  siteOrigin: string;
  isRTL: boolean;
}) {
  const product = getProductById(productId);
  if (!product) {
    return null;
  }

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${pageUrl}#product`,
    name: isRTL ? product.name.ar : product.name.en,
    alternateName: isRTL ? product.name.en : product.name.ar,
    sku: product.id,
    image: [toAbsoluteUrl(product.image ?? SITE_DEFAULT_IMAGE, siteOrigin)],
    description: localizeText(product.story ?? product.description, isRTL),
    brand: {
      '@type': 'Brand',
      name: isRTL ? product.brandAr : product.brand,
      alternateName: isRTL ? product.brand : product.brandAr,
    },
  };

  if (hasFixedPrice(product)) {
    productSchema.offers = {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'SAR',
      price: product.price.toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@id': `${siteOrigin}/#store`,
      },
    };
  }

  if (product.rating > 0 && product.reviews > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviews,
    };
  }

  return productSchema;
}

function buildBrandSchema({
  brandId,
  pageUrl,
  siteOrigin,
  isRTL,
}: {
  brandId: string;
  pageUrl: string;
  siteOrigin: string;
  isRTL: boolean;
}) {
  const brand = brands.find((item) => item.id === brandId);
  if (!brand) {
    return null;
  }

  const brandProducts = getProductsByBrand(brand.name);

  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    '@id': `${pageUrl}#brand`,
    name: isRTL ? brand.nameAr : brand.name,
    alternateName: isRTL ? brand.name : brand.nameAr,
    url: pageUrl,
    logo: toAbsoluteUrl(brand.logo ?? SITE_DEFAULT_IMAGE, siteOrigin),
    description: isRTL
      ? `تسوق منتجات ${brand.nameAr} داخل متجر ريق مع توصيل سريع في الرياض.`
      : `Shop ${brand.name} products at Riq Store with fast delivery in Riyadh.`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isRTL ? `منتجات ${brand.nameAr}` : `${brand.name} products`,
      itemListElement: brandProducts.slice(0, 12).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: isRTL ? product.name.ar : product.name.en,
          url: toAbsoluteUrl(withBasePath(`/product/${product.id}`), siteOrigin),
        },
      })),
    },
  };
}

function buildStaticPagePayload({
  title,
  description,
  path,
  type = 'website',
  robots = 'index, follow, max-image-preview:large',
  keywords,
  image = SITE_DEFAULT_IMAGE,
  breadcrumbs,
  items,
  pageType,
  isRTL,
  siteOrigin,
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'product';
  robots?: string;
  keywords: string;
  image?: string;
  breadcrumbs: BreadcrumbItem[];
  items?: Array<{ name: string; path: string }>;
  pageType: string;
  isRTL: boolean;
  siteOrigin: string;
}): SeoPayload {
  const canonicalPath = withBasePath(path);
  const pageUrl = toAbsoluteUrl(canonicalPath, siteOrigin);
  const locale = isRTL ? 'ar-SA' : 'en-SA';

  return {
    title,
    description,
    image,
    path: canonicalPath,
    type,
    robots,
    keywords,
    structuredData: [
      ...buildCommonSchemas(siteOrigin, isRTL),
      buildBreadcrumbSchema(breadcrumbs, siteOrigin, pageUrl),
      buildWebPageSchema({
        pageUrl,
        title,
        description,
        pageType,
        locale,
        siteOrigin,
      }),
      ...(items ? [buildItemListSchema(pageUrl, items, siteOrigin)] : []),
    ],
  };
}

function buildSeoPayload(pathname: string, isRTL: boolean, siteOrigin: string): SeoPayload {
  const normalizedPath = normalizeCanonicalPath(pathname);
  const homeBreadcrumbs: BreadcrumbItem[] = [
    { name: isRTL ? 'الرئيسية' : 'Home', path: '/' },
  ];
  const genericKeywords = isRTL
    ? 'ريق, متجر ريق, Riq Store, riq, مياه معبأة, توصيل مياه الرياض'
    : 'Riq Store, riq, bottled water Riyadh, water delivery, bottled water catalog';

  if (normalizedPath === '/') {
    return buildStaticPagePayload({
      title: isRTL ? 'ريق | متجر ريق - توصيل مياه في الرياض' : 'Riq | Riq Store - Bottled Water Delivery in Riyadh',
      description: isRTL ? SITE_DEFAULT_DESCRIPTION.ar : SITE_DEFAULT_DESCRIPTION.en,
      path: '/',
      keywords: genericKeywords,
      breadcrumbs: homeBreadcrumbs,
      items: products.slice(0, 10).map((product) => ({
        name: isRTL ? product.name.ar : product.name.en,
        path: `/product/${product.id}`,
      })),
      pageType: 'WebPage',
      isRTL,
      siteOrigin,
    });
  }

  if (normalizedPath === '/products') {
    return buildStaticPagePayload({
      title: isRTL ? 'المنتجات | متجر ريق' : 'Products | Riq Store',
      description: isRTL
        ? 'تصفح منتجات المياه المعبأة المتاحة في متجر ريق واطلب توصيل المياه داخل الرياض.'
        : 'Browse bottled water products at Riq Store and order water delivery in Riyadh.',
      path: '/products',
      keywords: isRTL
        ? 'منتجات متجر ريق, مياه 200 مل, مياه 330 مل, مياه 1.5 لتر, توصيل مياه'
        : 'Riq Store products, 200ml water, 330ml water, 1.5L water, water delivery',
      breadcrumbs: [
        ...homeBreadcrumbs,
        { name: isRTL ? 'المنتجات' : 'Products', path: '/products' },
      ],
      items: catalogGroups.map((group) => ({
        name: isRTL ? group.nameAr : group.nameEn,
        path: group.path,
      })),
      pageType: 'CollectionPage',
      isRTL,
      siteOrigin,
    });
  }

  const catalogGroupMatch = normalizedPath.match(/^\/products\/([^/]+)$/);
  if (catalogGroupMatch) {
    const group = getCatalogGroupBySlug(catalogGroupMatch[1]);
    if (group) {
      const groupProducts = products.filter((product) => product.catalogGroup === group.id);

      return buildStaticPagePayload({
        title: `${isRTL ? group.nameAr : group.nameEn} | ${SITE_NAME_LOCKUP}`,
        description: isRTL ? group.descriptionAr : group.descriptionEn,
        path: normalizedPath,
        keywords: isRTL
          ? `${group.shortAr}, منتجات المياه, متجر ريق`
          : `${group.shortEn}, water catalog, Riq Store`,
        breadcrumbs: [
          ...homeBreadcrumbs,
          { name: isRTL ? 'المنتجات' : 'Products', path: '/products' },
          { name: isRTL ? group.nameAr : group.nameEn, path: normalizedPath },
        ],
        items: groupProducts.map((product) => ({
          name: isRTL ? product.name.ar : product.name.en,
          path: `/product/${product.id}`,
        })),
        pageType: 'CollectionPage',
        isRTL,
        siteOrigin,
      });
    }
  }

  const productMatch = normalizedPath.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    const product = getProductById(productMatch[1]);
    if (product) {
      const canonicalPath = withBasePath(normalizedPath);
      const pageUrl = toAbsoluteUrl(canonicalPath, siteOrigin);
      const group = catalogGroups.find((item) => item.id === product.catalogGroup);
      const title = `${isRTL ? product.name.ar : product.name.en} | ${SITE_NAME_LOCKUP}`;
      const description = hasFixedPrice(product)
        ? (
          isRTL
            ? `اطلب ${product.name.ar} من متجر ريق مع توصيل سريع في الرياض وسعر يبدأ من ${product.price.toFixed(2)} ريال.`
            : `Order ${product.name.en} from Riq Store with fast Riyadh delivery from ${product.price.toFixed(2)} SAR.`
        )
        : (
          isRTL
            ? `اطلب ${product.name.ar} من متجر ريق وتواصل معنا لمعرفة السعر الحالي وتأكيد التوفر.`
            : `Order ${product.name.en} from Riq Store and contact us directly to confirm the current price and availability.`
        );

      return {
        title,
        description,
        image: product.image ?? SITE_DEFAULT_IMAGE,
        path: canonicalPath,
        type: 'product',
        robots: 'index, follow, max-image-preview:large',
        keywords: isRTL
          ? `${product.brandAr}, ${product.name.ar}, مياه معبأة, متجر ريق`
          : `${product.brand}, ${product.name.en}, bottled water, Riq Store`,
        structuredData: [
          ...buildCommonSchemas(siteOrigin, isRTL),
          buildBreadcrumbSchema([
            ...homeBreadcrumbs,
            { name: isRTL ? 'المنتجات' : 'Products', path: '/products' },
            ...(group ? [{ name: isRTL ? group.shortAr : group.shortEn, path: group.path }] : []),
            { name: isRTL ? product.name.ar : product.name.en, path: normalizedPath },
          ], siteOrigin, pageUrl),
          buildWebPageSchema({
            pageUrl,
            title,
            description,
            pageType: 'WebPage',
            locale: isRTL ? 'ar-SA' : 'en-SA',
            siteOrigin,
          }),
          buildProductSchema({
            productId: product.id,
            pageUrl,
            siteOrigin,
            isRTL,
          }),
        ].filter(Boolean),
      };
    }
  }

  if (normalizedPath === '/brands') {
    return buildStaticPagePayload({
      title: isRTL ? 'العلامات التجارية | متجر ريق' : 'Brands | Riq Store',
      description: isRTL
        ? 'اكتشف العلامات التجارية المتاحة حاليا داخل متجر ريق لتوصيل المياه في الرياض.'
        : 'Discover the water brands currently available at Riq Store.',
      path: '/brands',
      keywords: isRTL ? 'العلامات التجارية, مياه معبأة, متجر ريق' : 'water brands, bottled water, Riq Store',
      breadcrumbs: [
        ...homeBreadcrumbs,
        { name: isRTL ? 'العلامات التجارية' : 'Brands', path: '/brands' },
      ],
      items: brands.map((brand) => ({
        name: isRTL ? brand.nameAr : brand.name,
        path: `/brand/${brand.id}`,
      })),
      pageType: 'CollectionPage',
      isRTL,
      siteOrigin,
    });
  }

  const brandMatch = normalizedPath.match(/^\/brand\/([^/]+)$/);
  if (brandMatch) {
    const brand = brands.find((item) => item.id === brandMatch[1]);
    if (brand) {
      const brandProducts = getProductsByBrand(brand.name);
      const entryPrice = getBrandEntryPrice(brandProducts);
      const canonicalPath = withBasePath(normalizedPath);
      const pageUrl = toAbsoluteUrl(canonicalPath, siteOrigin);
      const title = `${isRTL ? brand.nameAr : brand.name} | ${SITE_NAME_LOCKUP}`;
      const description = isRTL
        ? `${brand.nameAr} متاحة الآن عبر ${brandProducts.length} منتجا داخل متجر ريق، مع سعر يبدأ من ${entryPrice !== null ? entryPrice.toFixed(2) : '0.00'} ريال.`
        : `${brand.name} is currently available through ${brandProducts.length} catalog products, with pricing from ${entryPrice !== null ? entryPrice.toFixed(2) : '0.00'} SAR.`;

      return {
        title,
        description,
        image: brand.logo ?? SITE_DEFAULT_IMAGE,
        path: canonicalPath,
        type: 'website',
        robots: 'index, follow, max-image-preview:large',
        keywords: isRTL
          ? `${brand.nameAr}, ${brand.name}, متجر ريق, مياه معبأة`
          : `${brand.name}, ${brand.nameAr}, Riq Store, bottled water`,
        structuredData: [
          ...buildCommonSchemas(siteOrigin, isRTL),
          buildBreadcrumbSchema([
            ...homeBreadcrumbs,
            { name: isRTL ? 'العلامات التجارية' : 'Brands', path: '/brands' },
            { name: isRTL ? brand.nameAr : brand.name, path: normalizedPath },
          ], siteOrigin, pageUrl),
          buildWebPageSchema({
            pageUrl,
            title,
            description,
            pageType: 'CollectionPage',
            locale: isRTL ? 'ar-SA' : 'en-SA',
            siteOrigin,
          }),
          buildItemListSchema(
            pageUrl,
            brandProducts.map((product) => ({
              name: isRTL ? product.name.ar : product.name.en,
              path: `/product/${product.id}`,
            })),
            siteOrigin,
          ),
          buildBrandSchema({
            brandId: brand.id,
            pageUrl,
            siteOrigin,
            isRTL,
          }),
        ].filter(Boolean),
      };
    }
  }

  if (normalizedPath === '/offers') {
    return buildStaticPagePayload({
      title: isRTL ? 'العروض | متجر ريق' : 'Special Offers | Riq Store',
      description: isRTL
        ? 'تابع عروض المياه والمنتجات المخفضة داخل متجر ريق.'
        : 'Browse current water discounts and special offers at Riq Store.',
      path: '/offers',
      keywords: isRTL ? 'عروض المياه, خصومات المياه, متجر ريق' : 'water discounts, water deals, Riq Store',
      breadcrumbs: [
        ...homeBreadcrumbs,
        { name: isRTL ? 'العروض' : 'Offers', path: '/offers' },
      ],
      items: products.filter(isDiscountedProduct).map((product) => ({
        name: isRTL ? product.name.ar : product.name.en,
        path: `/product/${product.id}`,
      })),
      pageType: 'CollectionPage',
      isRTL,
      siteOrigin,
    });
  }

  const staticDefinitions: Record<string, { title: string; description: string; pageType: string; robots?: string }> = {
    '/about': {
      title: isRTL ? 'من نحن | متجر ريق' : 'About Us | Riq Store',
      description: isRTL
        ? 'تعرف على متجر ريق ورسالتنا في توصيل المياه المعبأة داخل الرياض.'
        : 'Learn more about Riq Store and our mission to deliver high-quality bottled water in Riyadh.',
      pageType: 'AboutPage',
    },
    '/app': {
      title: isRTL ? 'تثبيت التطبيق | متجر ريق' : 'Install the App | Riq Store',
      description: isRTL
        ? 'ثبت متجر ريق على جوالك من المتصفح واحتفظ بروابط التحميل في صفحة واحدة.'
        : 'Install Riq Store on your phone from the browser today and keep app links in one page.',
      pageType: 'WebPage',
    },
    '/contact': {
      title: isRTL ? 'اتصل بنا | متجر ريق' : 'Contact Us | Riq Store',
      description: isRTL
        ? 'تواصل مع متجر ريق للطلبات والاستفسارات وخدمة العملاء في الرياض.'
        : 'Contact Riq Store for orders, questions, and customer support in Riyadh.',
      pageType: 'ContactPage',
    },
    '/cart': {
      title: isRTL ? 'سلة التسوق | متجر ريق' : 'Cart | Riq Store',
      description: isRTL ? 'راجع سلتك قبل متابعة الطلب.' : 'Review your cart before placing the order.',
      pageType: 'WebPage',
      robots: 'noindex, nofollow',
    },
    '/checkout': {
      title: isRTL ? 'إتمام الطلب | متجر ريق' : 'Checkout | Riq Store',
      description: isRTL ? 'إتمام الطلب والدفع الآمن داخل متجر ريق.' : 'Secure checkout and payment at Riq Store.',
      pageType: 'WebPage',
      robots: 'noindex, nofollow',
    },
  };

  const staticDefinition = staticDefinitions[normalizedPath];
  if (staticDefinition) {
    return buildStaticPagePayload({
      title: staticDefinition.title,
      description: staticDefinition.description,
      path: normalizedPath,
      keywords: genericKeywords,
      robots: staticDefinition.robots,
      breadcrumbs: [
        ...homeBreadcrumbs,
        { name: staticDefinition.title.split('|')[0].trim(), path: normalizedPath },
      ],
      pageType: staticDefinition.pageType,
      isRTL,
      siteOrigin,
    });
  }

  return buildStaticPagePayload({
    title: isRTL ? 'الصفحة غير موجودة | متجر ريق' : 'Page Not Found | Riq Store',
    description: isRTL
      ? 'الصفحة المطلوبة غير موجودة. يمكنك العودة للرئيسية أو تصفح المنتجات.'
      : 'The requested page could not be found. You can return home or browse products.',
    path: '/404',
    keywords: genericKeywords,
    robots: 'noindex, nofollow',
    breadcrumbs: homeBreadcrumbs,
    pageType: 'WebPage',
    isRTL,
    siteOrigin,
  });
}

export default function SeoManager() {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const isRTL = i18n.language === 'ar';

  const seo = useMemo(() => {
    const siteOrigin = getSiteOrigin();
    return buildSeoPayload(pathname, isRTL, siteOrigin);
  }, [pathname, isRTL]);

  useEffect(() => {
    const siteOrigin = getSiteOrigin();
    const canonicalUrl = toAbsoluteUrl(seo.path, siteOrigin);
    const imageUrl = toAbsoluteUrl(seo.image, siteOrigin);
    const locale = isRTL ? 'ar_SA' : 'en_SA';

    document.title = seo.title;
    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'keywords', seo.keywords);
    upsertMeta('name', 'robots', seo.robots);
    upsertMeta('name', 'googlebot', seo.robots);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', seo.title);
    upsertMeta('name', 'twitter:description', seo.description);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertMeta('name', 'application-name', SITE_NAME_LOCKUP);
    upsertMeta('name', 'apple-mobile-web-app-title', SITE_NAME_LOCKUP);
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:type', seo.type);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:alt', seo.title);
    upsertMeta('property', 'og:site_name', SITE_NAME_LOCKUP);
    upsertMeta('property', 'og:locale', locale);
    upsertMeta('property', 'business:contact_data:street_address', isRTL ? SITE_ADDRESS_AR : SITE_ADDRESS_EN);
    upsertMeta('property', 'business:contact_data:locality', isRTL ? 'الرياض' : 'Riyadh');
    upsertMeta('property', 'business:contact_data:country_name', 'Saudi Arabia');
    upsertMeta('property', 'business:contact_data:email', SITE_EMAIL);
    upsertMeta('property', 'business:contact_data:phone_number', SITE_PHONE);
    upsertLink('canonical', canonicalUrl);
    upsertStructuredData('route-schema', seo.structuredData);
  }, [isRTL, seo]);

  return null;
}
