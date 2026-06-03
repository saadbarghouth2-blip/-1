import type { LocalizedText } from '../lib/utils';

export interface OfferVariantOption {
  sizeLabel: LocalizedText;
  bottlesPerCarton: number;
  description: LocalizedText;
}

export interface OfferMeta {
  campaignImage: string;
  headline: LocalizedText;
  summary: LocalizedText;
  paidCartons: number;
  freeCartons: number;
  variantOptions: OfferVariantOption[];
  priceNote: LocalizedText;
  deliveryNote: LocalizedText;
  marketingPoints: LocalizedText[];
  terms: LocalizedText[];
}

export type CatalogGroupId = '200ml' | '330ml' | 'over-330ml';

export interface Product {
  id: string;
  brandId: string;
  name: LocalizedText;
  brand: string;
  brandAr: string;
  category: 'small' | 'medium' | 'large' | 'gallon' | 'glass' | 'offer';
  catalogGroup: CatalogGroupId;
  size: string;
  quantity: number;
  price?: number;
  originalPrice?: number;
  pricingMode: 'fixed' | 'quote';
  isPurchasable: boolean;
  image?: string;
  description: LocalizedText;
  features: string[];
  benefits: string[];
  specifications: {
    ph?: string;
    tds?: string;
    source?: string;
    packaging?: string;
  };
  story?: LocalizedText;
  idealFor?: LocalizedText[];
  usageMoments?: LocalizedText[];
  purchaseNotes?: LocalizedText[];
  quickFacts?: Array<{
    labelAr: string;
    labelEn: string;
    valueAr: string;
    valueEn: string;
  }>;
  offerMeta?: OfferMeta;
  inStock: boolean;
  isPublished?: boolean;
  rating: number;
  reviews: number;
  imageType?: 'case' | 'offer' | 'bottle' | 'gallon';
  imageFit?: 'relaxed' | 'balanced' | 'tight' | 'portrait';
  catalogOrder: number;
}

export interface BrandSummary {
  id: string;
  name: string;
  nameAr: string;
  logo?: string;
}

export interface CatalogGroupDefinition {
  id: CatalogGroupId;
  slug: '200-ml' | '330-ml' | 'over-330-ml';
  path: `/products/${string}`;
  nameAr: string;
  nameEn: string;
  shortAr: string;
  shortEn: string;
  descriptionAr: string;
  descriptionEn: string;
  count: number;
}

export type ProductSize = Product['size'];

export interface ProductSizeOption {
  id: ProductSize;
  labelAr: string;
  labelEn: string;
}

type BrandMeta = {
  id: string;
  en: string;
  ar: string;
};

type ProductSeed = {
  id: string;
  order: number;
  brandKey: keyof typeof BRAND_META;
  displayNameAr?: string;
  displayNameEn?: string;
  category: Product['category'];
  catalogGroup: CatalogGroupId;
  size: '200ml' | '250ml' | '330ml' | '500ml' | '600ml' | '750ml' | '1.5L' | '5L' | '12L';
  sizeAr: string;
  quantity: number;
  countLabelAr: string;
  countLabelEn: string;
  price?: number;
  originalPrice?: number;
  pricingMode?: Product['pricingMode'];
  image?: string;
  imageType?: Product['imageType'];
  imageFit?: Product['imageFit'];
};

const BRAND_META = {
  neutral: { id: 'neotrel', en: 'Neotrel', ar: 'نيوترل' },
  nirvana: { id: 'nirvana', en: 'Nirvana', ar: 'نيرفانا' },
  nova: { id: 'nova', en: 'Nova', ar: 'نوفا' },
  falin: { id: 'falin', en: 'Falin', ar: 'فالين' },
  alShafiyah: { id: 'al-shafiyah', en: 'Al Shafiyah', ar: 'الشافية' },
  alRaneemDiamond: { id: 'al-raneem-diamond', en: 'الرنيم الماسي', ar: 'الرنيم الماسي' },
  alRafeemDiamond: { id: 'al-rafeem-diamond', en: 'الرفيم الماسي', ar: 'الرفيم الماسي' },
  naqi: { id: 'naqi', en: 'Naqi', ar: 'نقي' },
  mana: { id: 'mana', en: 'Mana', ar: 'مانا' },
  adhari: { id: 'adhari', en: 'Adhari', ar: 'عذاري' },
  safaMakkah: { id: 'safa-makkah', en: 'Safa Makkah', ar: 'صفا مكة' },
  sehtak: { id: 'sehtak', en: 'Sehtak', ar: 'صحتك' },
  sky: { id: 'sky', en: 'Sky', ar: 'سكاي' },
  berain: { id: 'berain', en: 'Berain', ar: 'بيرين' },
  ival: { id: 'ival', en: 'Ival', ar: 'ايفال' },
  oska: { id: 'oska', en: 'Oska', ar: 'اوسكا' },
  oubi: { id: 'oubi', en: 'Oubi', ar: 'اوبي' },
  agadir: { id: 'agadir', en: 'Agadir', ar: 'اغادير' },
  tala: { id: 'tala', en: 'Tala', ar: 'تالا' },
  hittin: { id: 'hittin', en: 'Hittin', ar: 'حطين' },
  larina: { id: 'larina', en: 'Larina', ar: 'لارينا' },
  ava: { id: 'ava', en: 'Ava', ar: 'افا' },
  rode: { id: 'rode', en: 'Rode Water', ar: 'رود' },
  view: { id: 'view', en: 'View', ar: 'فيو' },
  marina: { id: 'marina', en: 'Marina', ar: 'مارينا' },
  safa: { id: 'safa', en: 'Safa', ar: 'صفا' },
} satisfies Record<string, BrandMeta>;

const PRODUCTS_BASE_DIR = '/images/New Products';
const NEW_PRODUCTS_BASE_DIR = '/images/new';
const PRODUCTS_PAGE_SIZE = 12;

export { PRODUCTS_PAGE_SIZE };

export const productSizeOptions: ProductSizeOption[] = [
  { id: '200ml', labelAr: '200 مل', labelEn: '200ml' },
  { id: '250ml', labelAr: '250 مل', labelEn: '250ml' },
  { id: '330ml', labelAr: '330 مل', labelEn: '330ml' },
  { id: '500ml', labelAr: '500 مل', labelEn: '500ml' },
  { id: '600ml', labelAr: '600 مل', labelEn: '600ml' },
  { id: '750ml', labelAr: '750 مل', labelEn: '750ml' },
  { id: '1.5L', labelAr: '1.5 لتر', labelEn: '1.5L' },
  { id: '5L', labelAr: '5 لتر', labelEn: '5L' },
  { id: '12L', labelAr: '12 لتر', labelEn: '12L' },
];

const productSizeGroupMap: Record<ProductSize, CatalogGroupId> = {
  '200ml': '200ml',
  '250ml': '200ml',
  '330ml': '330ml',
  '500ml': 'over-330ml',
  '600ml': 'over-330ml',
  '750ml': 'over-330ml',
  '1.5L': 'over-330ml',
  '5L': 'over-330ml',
  '12L': 'over-330ml',
};

function assetPath(folder: string, fileName?: string) {
  if (!fileName) {
    return undefined;
  }

  return encodeURI(`${PRODUCTS_BASE_DIR}/${folder}/${fileName}`);
}

function newProductImage(fileName: string) {
  return encodeURI(`${NEW_PRODUCTS_BASE_DIR}/${fileName}`);
}

const productSeeds: ProductSeed[] = [
  {
    id: 'neotrel-200-24',
    order: 1,
    brandKey: 'neutral',
    displayNameAr: 'نيوترل',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 24,
    countLabelAr: '24 حبة',
    countLabelEn: '24 bottles',
    price: 6,
    originalPrice: 6.75,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.38 PM (1).jpeg'),
  },
  {
    id: 'nirvana-200-24',
    order: 2,
    brandKey: 'nirvana',
    displayNameAr: 'نيرفانا',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 24,
    countLabelAr: '24 حبة',
    countLabelEn: '24 bottles',
    pricingMode: 'quote',
  },
  {
    id: 'nova-200-24',
    order: 3,
    brandKey: 'nova',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 24,
    countLabelAr: '24 حبة',
    countLabelEn: '24 bottles',
    price: 12.5,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.37 PM (3).jpeg'),
  },
  {
    id: 'falin-200-24',
    order: 4,
    brandKey: 'falin',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 24,
    countLabelAr: '24 حبة',
    countLabelEn: '24 bottles',
    price: 5.9,
    originalPrice: 6.75,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.37 PM.jpeg'),
  },
  {
    id: 'al-shafiyah-200-24',
    order: 5,
    brandKey: 'alShafiyah',
    displayNameAr: 'الشافية',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 24,
    countLabelAr: '24 حبة',
    countLabelEn: '24 bottles',
    pricingMode: 'quote',
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.39 PM (2).jpeg'),
  },
  {
    id: 'al-raneem-almasi-200-24',
    order: 6,
    brandKey: 'alRaneemDiamond',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 24,
    countLabelAr: '24 حبة',
    countLabelEn: '24 bottles',
    pricingMode: 'quote',
  },
  {
    id: 'naqi-200-40',
    order: 7,
    brandKey: 'naqi',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 10.9,
    originalPrice: 13.75,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.37 PM (1).jpeg'),
  },
  {
    id: 'neotrel-200-48',
    order: 8,
    brandKey: 'neutral',
    displayNameAr: 'نيوتريل',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 11,
    originalPrice: 14.75,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.39 PM.jpeg'),
  },
  {
    id: 'naqi-200-48',
    order: 9,
    brandKey: 'naqi',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 14.9,
    originalPrice: 16.5,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.37 PM (2).jpeg'),
  },
  {
    id: 'mana-200-48',
    order: 10,
    brandKey: 'mana',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    pricingMode: 'quote',
    image: assetPath('New', 'WhatsApp Image 2026-04-17 at 10.01.00 PM (1).jpeg'),
  },
  {
    id: 'adhari-200-48',
    order: 11,
    brandKey: 'adhari',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 10.9,
    originalPrice: 12,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.36 PM.jpeg'),
  },
  {
    id: 'safa-makkah-200-48',
    order: 12,
    brandKey: 'safaMakkah',
    displayNameAr: 'صفا مكه',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 19.9,
    originalPrice: 21,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.41 PM (3).jpeg'),
  },
  {
    id: 'sehtak-200-48',
    order: 13,
    brandKey: 'sehtak',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 11.9,
    originalPrice: 14.5,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.41 PM (2).jpeg'),
  },
  {
    id: 'sky-200-48',
    order: 14,
    brandKey: 'sky',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 11.5,
    originalPrice: 14.75,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.41 PM (1).jpeg'),
  },
  {
    id: 'berain-200-48',
    order: 15,
    brandKey: 'berain',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 17.9,
    originalPrice: 21,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.41 PM.jpeg'),
  },
  {
    id: 'ival-200-48',
    order: 16,
    brandKey: 'ival',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 19.9,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.40 PM (2).jpeg'),
  },
  {
    id: 'oska-200-48',
    order: 17,
    brandKey: 'oska',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 13,
    originalPrice: 15,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.40 PM (1).jpeg'),
  },
  {
    id: 'oubi-200-48',
    order: 18,
    brandKey: 'oubi',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 11.5,
    originalPrice: 12,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.40 PM.jpeg'),
  },
  {
    id: 'agadir-200-48',
    order: 19,
    brandKey: 'agadir',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    price: 10,
    originalPrice: 10.75,
    image: assetPath('200 مل 👇', 'WhatsApp Image 2026-04-18 at 11.04.39 PM (1).jpeg'),
  },
  {
    id: 'falin-330-20',
    order: 20,
    brandKey: 'falin',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 20,
    countLabelAr: '20 حبة',
    countLabelEn: '20 bottles',
    price: 5.75,
    originalPrice: 6.75,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.20 PM (2).jpeg'),
  },
  {
    id: 'al-rafeem-almasi-330-20',
    order: 21,
    brandKey: 'alRafeemDiamond',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 20,
    countLabelAr: '20 حبة',
    countLabelEn: '20 bottles',
    pricingMode: 'quote',
  },
  {
    id: 'nirvana-330-20',
    order: 22,
    brandKey: 'nirvana',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 20,
    countLabelAr: '20 حبة',
    countLabelEn: '20 bottles',
    pricingMode: 'quote',
  },
  {
    id: 'neotrel-330-40',
    order: 23,
    brandKey: 'neutral',
    displayNameAr: 'نيوترل',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 11,
    originalPrice: 15.5,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.16 PM.jpeg'),
  },
  {
    id: 'tala-330-40',
    order: 24,
    brandKey: 'tala',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 13,
    originalPrice: 15.5,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.19 PM.jpeg'),
  },
  {
    id: 'sky-330-40',
    order: 25,
    brandKey: 'sky',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 11.5,
    originalPrice: 15.5,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.19 PM (1).jpeg'),
  },
  {
    id: 'oubi-330-40',
    order: 26,
    brandKey: 'oubi',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 11.5,
    originalPrice: 12,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.18 PM.jpeg'),
  },
  {
    id: 'adhari-330-40',
    order: 27,
    brandKey: 'adhari',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 10.9,
    originalPrice: 12,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.20 PM (1).jpeg'),
  },
  {
    id: 'agadir-330-40',
    order: 28,
    brandKey: 'agadir',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 10,
    originalPrice: 10.75,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.17 PM.jpeg'),
  },
  {
    id: 'nova-330-40',
    order: 29,
    brandKey: 'nova',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 17.5,
    originalPrice: 21,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.15 PM.jpeg'),
  },
  {
    id: 'berain-330-40',
    order: 30,
    brandKey: 'berain',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 17.9,
    originalPrice: 20,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.18 PM (3).jpeg'),
  },
  {
    id: 'safa-makkah-330-40',
    order: 31,
    brandKey: 'safaMakkah',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 17.9,
    originalPrice: 20,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.20 PM.jpeg'),
  },
  {
    id: 'naqi-330-40',
    order: 32,
    brandKey: 'naqi',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 14.9,
    originalPrice: 16.5,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.14 PM.jpeg'),
  },
  {
    id: 'ival-330-40',
    order: 33,
    brandKey: 'ival',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 19.9,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.18 PM (2).jpeg'),
  },
  {
    id: 'oska-330-40',
    order: 34,
    brandKey: 'oska',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 13,
    originalPrice: 15,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.18 PM (1).jpeg'),
  },
  {
    id: 'mana-330-40',
    order: 35,
    brandKey: 'mana',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    pricingMode: 'quote',
  },
  {
    id: 'sehtak-330-40',
    order: 36,
    brandKey: 'sehtak',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 11.9,
    originalPrice: 14.5,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.19 PM (2).jpeg'),
  },
  {
    id: 'al-shafiyah-330-40',
    order: 37,
    brandKey: 'alShafiyah',
    displayNameAr: 'الشافية',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    price: 10,
    originalPrice: 15.5,
    image: assetPath('330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.17 PM (1).jpeg'),
  },
  {
    id: 'nova-500-24',
    order: 38,
    brandKey: 'nova',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '500ml',
    sizeAr: '500 مل',
    quantity: 24,
    countLabelAr: '24 قارورة',
    countLabelEn: '24 bottles',
    price: 12,
    originalPrice: 14,
    image: assetPath('اكتر من 330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.45 PM.jpeg'),
  },
  {
    id: 'berain-600-28',
    order: 39,
    brandKey: 'berain',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 مل',
    quantity: 28,
    countLabelAr: '28 قارورة',
    countLabelEn: '28 bottles',
    price: 16,
    image: assetPath('اكتر من 330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.47 PM (1).jpeg'),
  },
  {
    id: 'hittin-600-30',
    order: 40,
    brandKey: 'hittin',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 مل',
    quantity: 30,
    countLabelAr: '30 حبة',
    countLabelEn: '30 bottles',
    price: 11,
    originalPrice: 15,
    image: assetPath('اكتر من 330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.48 PM.jpeg'),
  },
  {
    id: 'berain-1.5l-12',
    order: 41,
    brandKey: 'berain',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 لتر',
    quantity: 12,
    countLabelAr: '12 قارورة',
    countLabelEn: '12 bottles',
    price: 16,
    image: assetPath('اكتر من 330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.47 PM.jpeg'),
    imageFit: 'tight',
  },
  {
    id: 'larina-shrink-1.5l-6',
    order: 42,
    brandKey: 'larina',
    displayNameAr: 'لارينا شرينك',
    displayNameEn: 'Larina Shrink',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 لتر',
    quantity: 6,
    countLabelAr: '6 حبة',
    countLabelEn: '6 bottles',
    price: 7,
    originalPrice: 12,
    image: assetPath('اكتر من 330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.48 PM (2).jpeg'),
    imageFit: 'tight',
  },
  {
    id: 'larina-carton-1.5l-12',
    order: 43,
    brandKey: 'larina',
    displayNameAr: 'لارينا كرتون',
    displayNameEn: 'Larina Carton',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 لتر',
    quantity: 12,
    countLabelAr: '12 حبة',
    countLabelEn: '12 bottles',
    price: 16.25,
    originalPrice: 19.25,
    image: assetPath('اكتر من 330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.48 PM (3).jpeg'),
    imageFit: 'tight',
  },
  {
    id: 'safa-makkah-1.5l-12',
    order: 44,
    brandKey: 'safaMakkah',
    displayNameAr: 'صفا مكة',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 لتر',
    quantity: 12,
    countLabelAr: '12 حبة',
    countLabelEn: '12 bottles',
    price: 16.5,
    originalPrice: 19.5,
    image: assetPath('اكتر من 330 مل 👇', 'WhatsApp Image 2026-04-18 at 11.05.48 PM (1).jpeg'),
    imageFit: 'tight',
  },
  {
    id: 'neotrel-1.5l-6',
    order: 45,
    brandKey: 'neutral',
    displayNameAr: 'نيوترل',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 لتر',
    quantity: 6,
    countLabelAr: '6 حبة',
    countLabelEn: '6 bottles',
    price: 7,
    originalPrice: 12,
    imageFit: 'tight',
  },
  {
    id: 'ava-200-24',
    order: 46,
    brandKey: 'ava',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 24,
    countLabelAr: '24 حبة',
    countLabelEn: '24 bottles',
    pricingMode: 'quote',
    image: newProductImage('افا 200 ملي.png'),
  },
  {
    id: 'oubi-1.5l-12',
    order: 47,
    brandKey: 'oubi',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 لتر',
    quantity: 12,
    countLabelAr: '12 قارورة',
    countLabelEn: '12 bottles',
    pricingMode: 'quote',
    image: newProductImage('اوبي 1.5 لتر.png'),
    imageFit: 'tight',
  },
  {
    id: 'oubi-real-600-28',
    order: 48,
    brandKey: 'oubi',
    displayNameAr: 'اوبي ريال',
    displayNameEn: 'Oubi Real',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 مل',
    quantity: 28,
    countLabelAr: '28 قارورة',
    countLabelEn: '28 bottles',
    pricingMode: 'quote',
    image: newProductImage('اوبي ريال 600 مل.png'),
  },
  {
    id: 'berain-600-28-new',
    order: 49,
    brandKey: 'berain',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 مل',
    quantity: 28,
    countLabelAr: '28 قارورة',
    countLabelEn: '28 bottles',
    pricingMode: 'quote',
    image: newProductImage('بيرين 600 ملي_.png'),
  },
  {
    id: 'rode-200-48',
    order: 50,
    brandKey: 'rode',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    pricingMode: 'quote',
    image: newProductImage('رود 200 ملي.png'),
  },
  {
    id: 'rode-330-40',
    order: 51,
    brandKey: 'rode',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    pricingMode: 'quote',
    image: newProductImage('رود 330 ملي.png'),
  },
  {
    id: 'rode-600-24',
    order: 52,
    brandKey: 'rode',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 مل',
    quantity: 24,
    countLabelAr: '24 قارورة',
    countLabelEn: '24 bottles',
    pricingMode: 'quote',
    image: newProductImage('رود 600 ملي_.png'),
  },
  {
    id: 'sky-330-40-new',
    order: 53,
    brandKey: 'sky',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    pricingMode: 'quote',
    image: newProductImage('سكاي 330 ملي_.png'),
  },
  {
    id: 'safa-5l-4',
    order: 54,
    brandKey: 'safa',
    displayNameAr: 'صفا مكة',
    displayNameEn: 'Safa Makkah',
    category: 'gallon',
    catalogGroup: 'over-330ml',
    size: '5L',
    sizeAr: '5 لتر',
    quantity: 4,
    countLabelAr: '4 عبوات',
    countLabelEn: '4 bottles',
    pricingMode: 'quote',
    image: newProductImage('صفا 5 لتر.png'),
    imageType: 'gallon',
    imageFit: 'tight',
  },
  {
    id: 'view-200-48',
    order: 55,
    brandKey: 'view',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 مل',
    quantity: 48,
    countLabelAr: '48 حبة',
    countLabelEn: '48 bottles',
    pricingMode: 'quote',
    image: newProductImage('فيو 200 ملي_.png'),
  },
  {
    id: 'view-330-40',
    order: 56,
    brandKey: 'view',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 مل',
    quantity: 40,
    countLabelAr: '40 حبة',
    countLabelEn: '40 bottles',
    pricingMode: 'quote',
    image: newProductImage('فيو 330 ملي_.png'),
  },
  {
    id: 'marina-5l-1',
    order: 57,
    brandKey: 'marina',
    category: 'gallon',
    catalogGroup: 'over-330ml',
    size: '5L',
    sizeAr: '5 لتر',
    quantity: 1,
    countLabelAr: 'عبوة واحدة',
    countLabelEn: '1 bottle',
    pricingMode: 'quote',
    image: newProductImage('مارينا 5 لتر_.png'),
    imageType: 'gallon',
    imageFit: 'portrait',
  },
  {
    id: 'nova-5l-1',
    order: 58,
    brandKey: 'nova',
    category: 'gallon',
    catalogGroup: 'over-330ml',
    size: '5L',
    sizeAr: '5 لتر',
    quantity: 1,
    countLabelAr: 'عبوة واحدة',
    countLabelEn: '1 bottle',
    pricingMode: 'quote',
    image: newProductImage('نوفا 5 لتر_.png'),
    imageType: 'gallon',
    imageFit: 'portrait',
  },
  {
    id: 'nova-12l-1',
    order: 59,
    brandKey: 'nova',
    category: 'gallon',
    catalogGroup: 'over-330ml',
    size: '12L',
    sizeAr: '12 لتر',
    quantity: 1,
    countLabelAr: 'عبوة واحدة',
    countLabelEn: '1 bottle',
    pricingMode: 'quote',
    image: newProductImage('نوفا 12 لتر.png'),
    imageType: 'gallon',
    imageFit: 'tight',
  },
  {
    id: 'nova-glass-250-24',
    order: 60,
    brandKey: 'nova',
    displayNameAr: 'نوفا زجاج',
    displayNameEn: 'Nova Glass',
    category: 'glass',
    catalogGroup: '200ml',
    size: '250ml',
    sizeAr: '250 مل',
    quantity: 24,
    countLabelAr: '24 زجاجة',
    countLabelEn: '24 glass bottles',
    pricingMode: 'quote',
    image: newProductImage('نوفا زجاج 250 ملي_.png'),
    imageType: 'bottle',
    imageFit: 'tight',
  },
  {
    id: 'nova-glass-750-12',
    order: 61,
    brandKey: 'nova',
    displayNameAr: 'نوفا زجاج',
    displayNameEn: 'Nova Glass',
    category: 'glass',
    catalogGroup: 'over-330ml',
    size: '750ml',
    sizeAr: '750 مل',
    quantity: 12,
    countLabelAr: '12 زجاجة',
    countLabelEn: '12 glass bottles',
    pricingMode: 'quote',
    image: newProductImage('نوفا زجاج 750 ملي_.png'),
    imageType: 'bottle',
    imageFit: 'tight',
  },
  {
    id: 'nova-sparkling-glass-250-24',
    order: 62,
    brandKey: 'nova',
    displayNameAr: 'نوفا زجاج فوارة',
    displayNameEn: 'Nova Sparkling Glass',
    category: 'glass',
    catalogGroup: '200ml',
    size: '250ml',
    sizeAr: '250 مل',
    quantity: 24,
    countLabelAr: '24 زجاجة',
    countLabelEn: '24 glass bottles',
    pricingMode: 'quote',
    image: newProductImage('نوفا زجاج فوارة 250 مل.png'),
    imageType: 'bottle',
    imageFit: 'tight',
  },
  {
    id: 'nova-sparkling-glass-750-12',
    order: 63,
    brandKey: 'nova',
    displayNameAr: 'نوفا زجاج فوارة',
    displayNameEn: 'Nova Sparkling Glass',
    category: 'glass',
    catalogGroup: 'over-330ml',
    size: '750ml',
    sizeAr: '750 مل',
    quantity: 12,
    countLabelAr: '12 زجاجة',
    countLabelEn: '12 glass bottles',
    pricingMode: 'quote',
    image: newProductImage('نوفا زجاج فوارة 750 مل.png'),
    imageType: 'bottle',
    imageFit: 'tight',
  },
];

export const categories = [
  { id: 'all', nameAr: 'جميع المنتجات', nameEn: 'All Products' },
  { id: 'small', nameAr: '200 و330 مل', nameEn: '200ml & 330ml' },
  { id: 'medium', nameAr: '500 و600 مل', nameEn: '500ml & 600ml' },
  { id: 'large', nameAr: '1.5 لتر', nameEn: '1.5L Packs' },
  { id: 'gallon', nameAr: 'عبوات كبيرة', nameEn: 'Large Bottles' },
  { id: 'glass', nameAr: 'زجاج وفوارة', nameEn: 'Glass & Sparkling' },
] as const;

function buildPackagingAr(seed: ProductSeed) {
  return `عبوة تحتوي على ${seed.countLabelAr}`;
}

function buildPackagingEn(seed: ProductSeed) {
  return `Pack of ${seed.countLabelEn}`;
}

function buildArabicName(seed: ProductSeed, brand: BrandMeta) {
  return `${seed.displayNameAr ?? brand.ar} ${seed.sizeAr} ${seed.countLabelAr}`;
}

function buildEnglishName(seed: ProductSeed, brand: BrandMeta) {
  const baseName = seed.displayNameEn ?? brand.en;
  return `${baseName} ${seed.size} - ${seed.quantity} Bottles`;
}

function buildDescription(seed: ProductSeed, brand: BrandMeta): LocalizedText {
  const packagingAr = buildPackagingAr(seed);
  const packagingEn = buildPackagingEn(seed);

  if (seed.pricingMode === 'quote') {
    return {
      ar: `${seed.displayNameAr ?? brand.ar} بحجم ${seed.sizeAr} بعدد ${seed.countLabelAr} متاح حالياً بطلب سعر مباشر عبر واتساب.`,
      en: `${seed.displayNameEn ?? brand.en} in ${seed.size} with ${seed.countLabelEn} is available on request. Ask us for the current price on WhatsApp.`,
    };
  }

  return {
    ar: `${seed.displayNameAr ?? brand.ar} بحجم ${seed.sizeAr} بعدد ${seed.countLabelAr} داخل ${packagingAr}.`,
    en: `${seed.displayNameEn ?? brand.en} in ${seed.size} with ${seed.countLabelEn} per ${packagingEn}.`,
  };
}

function buildFeatures(seed: ProductSeed) {
  return [
    seed.sizeAr,
    seed.countLabelAr,
    buildPackagingAr(seed),
    seed.catalogGroup === '200ml'
      ? 'فئة 200 مل'
      : seed.catalogGroup === '330ml'
        ? 'فئة 330 مل'
        : 'فئة أكبر من 330 مل',
  ];
}

function buildBenefits(seed: ProductSeed) {
  return [
    'مياه معبأة للشرب',
    seed.countLabelAr,
    seed.pricingMode === 'quote' ? 'السعر حسب الطلب' : 'سعر ظاهر داخل الكتالوج',
    buildPackagingAr(seed),
  ];
}

function buildQuickFacts(seed: ProductSeed, brand: BrandMeta) {
  return [
    {
      labelAr: 'العلامة',
      labelEn: 'Brand',
      valueAr: seed.displayNameAr ?? brand.ar,
      valueEn: seed.displayNameEn ?? brand.en,
    },
    {
      labelAr: 'الحجم',
      labelEn: 'Size',
      valueAr: seed.sizeAr,
      valueEn: seed.size,
    },
    {
      labelAr: 'العدد',
      labelEn: 'Units',
      valueAr: seed.countLabelAr,
      valueEn: seed.countLabelEn,
    },
    {
      labelAr: 'التغليف',
      labelEn: 'Packaging',
      valueAr: buildPackagingAr(seed),
      valueEn: buildPackagingEn(seed),
    },
  ];
}

function makeProduct(seed: ProductSeed): Product {
  const brand = BRAND_META[seed.brandKey];
  const pricingMode = seed.pricingMode ?? 'fixed';

  return {
    id: seed.id,
    brandId: brand.id,
    name: {
      ar: buildArabicName(seed, brand),
      en: buildEnglishName(seed, brand),
    },
    brand: brand.en,
    brandAr: brand.ar,
    category: seed.category,
    catalogGroup: seed.catalogGroup,
    size: seed.size,
    quantity: seed.quantity,
    ...(typeof seed.price === 'number' ? { price: seed.price } : {}),
    ...(typeof seed.originalPrice === 'number' ? { originalPrice: seed.originalPrice } : {}),
    pricingMode,
    isPurchasable: pricingMode === 'fixed' && typeof seed.price === 'number',
    ...(seed.image ? { image: seed.image } : {}),
    description: buildDescription(seed, brand),
    features: buildFeatures(seed),
    benefits: buildBenefits(seed),
    specifications: {
      packaging: buildPackagingAr(seed),
    },
    quickFacts: buildQuickFacts(seed, brand),
    inStock: true,
    rating: 0,
    reviews: 0,
    imageType: seed.imageType ?? 'case',
    imageFit: seed.imageFit ?? (seed.size === '1.5L' ? 'tight' : 'balanced'),
    catalogOrder: seed.order,
  };
}

export const products: Product[] = productSeeds.map(makeProduct);

function firstDefined<T>(values: T[]) {
  return values.find((value) => value !== undefined);
}

export const brands: BrandSummary[] = Object.values(BRAND_META).reduce<BrandSummary[]>((collection, brand) => {
  const brandProducts = products.filter((product) => product.brandId === brand.id);
  if (brandProducts.length === 0) {
    return collection;
  }

  collection.push({
    id: brand.id,
    name: brand.en,
    nameAr: brand.ar,
    logo: firstDefined(brandProducts.map((product) => product.image)),
  });

  return collection;
}, []);

export const catalogGroups: CatalogGroupDefinition[] = [
  {
    id: '200ml',
    slug: '200-ml',
    path: '/products/200-ml',
    nameAr: 'منتجات 200 مل',
    nameEn: '200ml Products',
    shortAr: '200 مل',
    shortEn: '200ml',
    descriptionAr: 'عبوات 200 مل من ملف المنتجات الجديد، مع الأسماء والصور المطابقة المتاحة فقط.',
    descriptionEn: 'All 200ml packs from the refreshed product source with matched names and approved visuals only.',
    count: products.filter((product) => product.catalogGroup === '200ml').length,
  },
  {
    id: '330ml',
    slug: '330-ml',
    path: '/products/330-ml',
    nameAr: 'منتجات 330 مل',
    nameEn: '330ml Products',
    shortAr: '330 مل',
    shortEn: '330ml',
    descriptionAr: 'عبوات 330 مل مرتبة حسب ملف الإكسل نفسه، مع فصل المنتجات التي تحتاج تسعيراً مباشراً.',
    descriptionEn: 'All 330ml packs in spreadsheet order, including quote-only products when pricing is not confirmed.',
    count: products.filter((product) => product.catalogGroup === '330ml').length,
  },
  {
    id: 'over-330ml',
    slug: 'over-330-ml',
    path: '/products/over-330-ml',
    nameAr: 'منتجات أكبر من 330 مل',
    nameEn: 'Products Above 330ml',
    shortAr: 'أكبر من 330 مل',
    shortEn: 'Above 330ml',
    descriptionAr: 'أحجام 500 و600 مل و1.5 لتر داخل صفحة مستقلة أوضح للموبايل والتنقل السريع.',
    descriptionEn: '500ml, 600ml, and 1.5L products in a dedicated page built for mobile-first browsing.',
    count: products.filter((product) => product.catalogGroup === 'over-330ml').length,
  },
];

export const getProductById = (id: string) => products.find((product) => product.id === id);

export const getProductsByCategory = (category: string) => {
  if (category === 'all') {
    return products;
  }

  return products.filter((product) => product.category === category);
};

export const getProductsByBrand = (brand: string) => {
  const normalized = brand.trim().toLowerCase();

  return products.filter((product) => (
    product.brand.toLowerCase() === normalized || product.brandId === normalized
  ));
};

export const getCatalogProductsByGroup = (group: CatalogGroupId) =>
  products.filter((product) => product.catalogGroup === group);

export const getCatalogGroupIdForSize = (size: ProductSize): CatalogGroupId =>
  productSizeGroupMap[size];

export const getProductSizeOptionsByGroup = (group: CatalogGroupId) =>
  productSizeOptions.reduce<Array<ProductSizeOption & { count: number }>>((collection, option) => {
    const count = products.filter((product) => (
      product.catalogGroup === group && product.size === option.id
    )).length;

    if (count > 0) {
      collection.push({ ...option, count });
    }

    return collection;
  }, []);

export const getCatalogGroupBySlug = (slug: string) =>
  catalogGroups.find((group) => group.slug === slug);

export const getCatalogGroupById = (groupId: CatalogGroupId) =>
  catalogGroups.find((group) => group.id === groupId);

export const hasFixedPrice = (product: Product): product is Product & { price: number } =>
  product.pricingMode === 'fixed' && typeof product.price === 'number';

export const isDiscountedProduct = (product: Product): product is Product & { price: number; originalPrice: number } =>
  hasFixedPrice(product) &&
  typeof product.originalPrice === 'number' &&
  product.originalPrice > product.price;

export const getBrandEntryPrice = (brandProducts: Product[]) => {
  const fixedPrices = brandProducts.filter(hasFixedPrice).map((product) => product.price);
  return fixedPrices.length > 0 ? Math.min(...fixedPrices) : null;
};

export const getRelatedProducts = (productId: string, limit = 4) => {
  const product = getProductById(productId);
  if (!product) {
    return [];
  }

  return products
    .filter((candidate) => candidate.id !== productId)
    .sort((left, right) => {
      const rightBrandMatch = Number(right.brandId === product.brandId);
      const leftBrandMatch = Number(left.brandId === product.brandId);
      if (rightBrandMatch !== leftBrandMatch) {
        return rightBrandMatch - leftBrandMatch;
      }

      const rightGroupMatch = Number(right.catalogGroup === product.catalogGroup);
      const leftGroupMatch = Number(left.catalogGroup === product.catalogGroup);
      if (rightGroupMatch !== leftGroupMatch) {
        return rightGroupMatch - leftGroupMatch;
      }

      return left.catalogOrder - right.catalogOrder;
    })
    .slice(0, limit);
};

export const searchProducts = (query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return products;
  }

  return products.filter((product) => (
    product.name.ar.toLowerCase().includes(needle) ||
    product.name.en.toLowerCase().includes(needle) ||
    product.brand.toLowerCase().includes(needle) ||
    product.brandAr.toLowerCase().includes(needle)
  ));
};
