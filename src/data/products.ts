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

const WINDOWS_1252_TO_BYTE: Record<string, number> = {
  '€': 0x80,
  '‚': 0x82,
  'ƒ': 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  'ˆ': 0x88,
  '‰': 0x89,
  'Š': 0x8a,
  '‹': 0x8b,
  'Œ': 0x8c,
  'Ž': 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  'š': 0x9a,
  '›': 0x9b,
  'œ': 0x9c,
  'ž': 0x9e,
  'Ÿ': 0x9f,
};

function fixMojibake(value: string) {
  if (!/[ÃÂØÙð]/.test(value)) {
    return value;
  }

  const bytes: number[] = [];

  for (const character of value) {
    const mappedByte = WINDOWS_1252_TO_BYTE[character];
    if (mappedByte !== undefined) {
      bytes.push(mappedByte);
      continue;
    }

    const code = character.charCodeAt(0);
    if (code > 0xff) {
      return value;
    }

    bytes.push(code);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
  } catch {
    return value;
  }
}

function cleanLocalizedText(text: LocalizedText): LocalizedText {
  return {
    ar: fixMojibake(text.ar),
    en: fixMojibake(text.en),
  };
}

function cleanStringList(values: string[]) {
  return values.map(fixMojibake);
}

function cleanProduct(product: Product): Product {
  return {
    ...product,
    name: cleanLocalizedText(product.name),
    brand: fixMojibake(product.brand),
    brandAr: fixMojibake(product.brandAr),
    description: cleanLocalizedText(product.description),
    features: cleanStringList(product.features),
    benefits: cleanStringList(product.benefits),
    specifications: {
      ...product.specifications,
      ...(product.specifications.source ? { source: fixMojibake(product.specifications.source) } : {}),
      ...(product.specifications.packaging ? { packaging: fixMojibake(product.specifications.packaging) } : {}),
    },
    ...(product.story ? { story: cleanLocalizedText(product.story) } : {}),
    ...(product.idealFor ? { idealFor: product.idealFor.map(cleanLocalizedText) } : {}),
    ...(product.usageMoments ? { usageMoments: product.usageMoments.map(cleanLocalizedText) } : {}),
    ...(product.purchaseNotes ? { purchaseNotes: product.purchaseNotes.map(cleanLocalizedText) } : {}),
    ...(product.quickFacts ? {
      quickFacts: product.quickFacts.map((fact) => ({
        labelAr: fixMojibake(fact.labelAr),
        labelEn: fixMojibake(fact.labelEn),
        valueAr: fixMojibake(fact.valueAr),
        valueEn: fixMojibake(fact.valueEn),
      })),
    } : {}),
    ...(product.offerMeta ? {
      offerMeta: {
        ...product.offerMeta,
        headline: cleanLocalizedText(product.offerMeta.headline),
        summary: cleanLocalizedText(product.offerMeta.summary),
        variantOptions: product.offerMeta.variantOptions.map((option) => ({
          ...option,
          sizeLabel: cleanLocalizedText(option.sizeLabel),
          description: cleanLocalizedText(option.description),
        })),
        priceNote: cleanLocalizedText(product.offerMeta.priceNote),
        deliveryNote: cleanLocalizedText(product.offerMeta.deliveryNote),
        marketingPoints: product.offerMeta.marketingPoints.map(cleanLocalizedText),
        terms: product.offerMeta.terms.map(cleanLocalizedText),
      },
    } : {}),
  };
}

const BRAND_META = {
  neutral: { id: 'neotrel', en: 'Neotrel', ar: 'Ù†ÙŠÙˆØªØ±Ù„' },
  nirvana: { id: 'nirvana', en: 'Nirvana', ar: 'Ù†ÙŠØ±ÙØ§Ù†Ø§' },
  nova: { id: 'nova', en: 'Nova', ar: 'Ù†ÙˆÙØ§' },
  falin: { id: 'falin', en: 'Falin', ar: 'ÙØ§Ù„ÙŠÙ†' },
  alShafiyah: { id: 'al-shafiyah', en: 'Al Shafiyah', ar: 'Ø§Ù„Ø´Ø§ÙÙŠØ©' },
  alRaneemDiamond: { id: 'al-raneem-diamond', en: 'Ø§Ù„Ø±Ù†ÙŠÙ… Ø§Ù„Ù…Ø§Ø³ÙŠ', ar: 'Ø§Ù„Ø±Ù†ÙŠÙ… Ø§Ù„Ù…Ø§Ø³ÙŠ' },
  alRafeemDiamond: { id: 'al-rafeem-diamond', en: 'Ø§Ù„Ø±ÙÙŠÙ… Ø§Ù„Ù…Ø§Ø³ÙŠ', ar: 'Ø§Ù„Ø±ÙÙŠÙ… Ø§Ù„Ù…Ø§Ø³ÙŠ' },
  naqi: { id: 'naqi', en: 'Naqi', ar: 'Ù†Ù‚ÙŠ' },
  mana: { id: 'mana', en: 'Mana', ar: 'Ù…Ø§Ù†Ø§' },
  adhari: { id: 'adhari', en: 'Adhari', ar: 'Ø¹Ø°Ø§Ø±ÙŠ' },
  safaMakkah: { id: 'safa-makkah', en: 'Safa Makkah', ar: 'ØµÙØ§ Ù…ÙƒØ©' },
  sehtak: { id: 'sehtak', en: 'Sehtak', ar: 'ØµØ­ØªÙƒ' },
  sky: { id: 'sky', en: 'Sky', ar: 'Ø³ÙƒØ§ÙŠ' },
  berain: { id: 'berain', en: 'Berain', ar: 'Ø¨ÙŠØ±ÙŠÙ†' },
  ival: { id: 'ival', en: 'Ival', ar: 'Ø§ÙŠÙØ§Ù„' },
  oska: { id: 'oska', en: 'Oska', ar: 'Ø§ÙˆØ³ÙƒØ§' },
  oubi: { id: 'oubi', en: 'Oubi', ar: 'Ø§ÙˆØ¨ÙŠ' },
  agadir: { id: 'agadir', en: 'Agadir', ar: 'Ø§ØºØ§Ø¯ÙŠØ±' },
  tala: { id: 'tala', en: 'Tala', ar: 'ØªØ§Ù„Ø§' },
  hittin: { id: 'hittin', en: 'Hittin', ar: 'Ø­Ø·ÙŠÙ†' },
  larina: { id: 'larina', en: 'Larina', ar: 'Ù„Ø§Ø±ÙŠÙ†Ø§' },
  ava: { id: 'ava', en: 'Ava', ar: 'Ø§ÙØ§' },
  rode: { id: 'rode', en: 'Rode Water', ar: 'Ø±ÙˆØ¯' },
  view: { id: 'view', en: 'View', ar: 'ÙÙŠÙˆ' },
  marina: { id: 'marina', en: 'Marina', ar: 'Ù…Ø§Ø±ÙŠÙ†Ø§' },
  safa: { id: 'safa', en: 'Safa', ar: 'ØµÙØ§' },
  fly: { id: 'fly', en: 'Fly Water', ar: 'ÙÙ„Ø§ÙŠ' },
} satisfies Record<string, BrandMeta>;

const PRODUCTS_BASE_DIR = '/images/New Products';
const NEW_PRODUCTS_BASE_DIR = '/images/new';
const PRODUCTS_PAGE_SIZE = 12;

export { PRODUCTS_PAGE_SIZE };

const rawProductSizeOptions: ProductSizeOption[] = [
  { id: '200ml', labelAr: '200 Ù…Ù„', labelEn: '200ml' },
  { id: '250ml', labelAr: '250 Ù…Ù„', labelEn: '250ml' },
  { id: '330ml', labelAr: '330 Ù…Ù„', labelEn: '330ml' },
  { id: '500ml', labelAr: '500 Ù…Ù„', labelEn: '500ml' },
  { id: '600ml', labelAr: '600 Ù…Ù„', labelEn: '600ml' },
  { id: '750ml', labelAr: '750 Ù…Ù„', labelEn: '750ml' },
  { id: '1.5L', labelAr: '1.5 Ù„ØªØ±', labelEn: '1.5L' },
  { id: '5L', labelAr: '5 Ù„ØªØ±', labelEn: '5L' },
  { id: '12L', labelAr: '12 Ù„ØªØ±', labelEn: '12L' },
];

export const productSizeOptions: ProductSizeOption[] = rawProductSizeOptions.map((option) => ({
  ...option,
  labelAr: fixMojibake(option.labelAr),
  labelEn: fixMojibake(option.labelEn),
}));

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

function offerImage(fileName: string) {
  return encodeURI(`/images/offers/${fileName}`);
}

const productSeeds: ProductSeed[] = [
  {
    id: 'neotrel-200-24',
    order: 1,
    brandKey: 'neutral',
    displayNameAr: 'Ù†ÙŠÙˆØªØ±Ù„',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø­Ø¨Ø©',
    countLabelEn: '24 bottles',
    price: 6,
    originalPrice: 6.75,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.38 PM (1).jpeg'),
  },
  {
    id: 'nirvana-200-24',
    order: 2,
    brandKey: 'nirvana',
    displayNameAr: 'Ù†ÙŠØ±ÙØ§Ù†Ø§',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø­Ø¨Ø©',
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
    sizeAr: '200 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø­Ø¨Ø©',
    countLabelEn: '24 bottles',
    price: 12.5,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.37 PM (3).jpeg'),
  },
  {
    id: 'falin-200-24',
    order: 4,
    brandKey: 'falin',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø­Ø¨Ø©',
    countLabelEn: '24 bottles',
    price: 5.9,
    originalPrice: 6.75,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.37 PM.jpeg'),
  },
  {
    id: 'al-shafiyah-200-24',
    order: 5,
    brandKey: 'alShafiyah',
    displayNameAr: 'Ø§Ù„Ø´Ø§ÙÙŠØ©',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø­Ø¨Ø©',
    countLabelEn: '24 bottles',
    pricingMode: 'quote',
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.39 PM (2).jpeg'),
  },
  {
    id: 'al-raneem-almasi-200-24',
    order: 6,
    brandKey: 'alRaneemDiamond',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø­Ø¨Ø©',
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
    sizeAr: '200 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 10.9,
    originalPrice: 13.75,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.37 PM (1).jpeg'),
  },
  {
    id: 'neotrel-200-48',
    order: 8,
    brandKey: 'neutral',
    displayNameAr: 'Ù†ÙŠÙˆØªØ±ÙŠÙ„',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 11,
    originalPrice: 14.75,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.39 PM.jpeg'),
  },
  {
    id: 'naqi-200-48',
    order: 9,
    brandKey: 'naqi',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 14.9,
    originalPrice: 16.5,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.37 PM (2).jpeg'),
  },
  {
    id: 'mana-200-48',
    order: 10,
    brandKey: 'mana',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
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
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 10.9,
    originalPrice: 12,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.36 PM.jpeg'),
  },
  {
    id: 'safa-makkah-200-48',
    order: 12,
    brandKey: 'safaMakkah',
    displayNameAr: 'ØµÙØ§ Ù…ÙƒÙ‡',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 19.9,
    originalPrice: 21,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.41 PM (3).jpeg'),
  },
  {
    id: 'sehtak-200-48',
    order: 13,
    brandKey: 'sehtak',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 11.9,
    originalPrice: 14.5,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.41 PM (2).jpeg'),
  },
  {
    id: 'sky-200-48',
    order: 14,
    brandKey: 'sky',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 11.5,
    originalPrice: 14.75,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.41 PM (1).jpeg'),
  },
  {
    id: 'berain-200-48',
    order: 15,
    brandKey: 'berain',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 17.9,
    originalPrice: 21,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.41 PM.jpeg'),
  },
  {
    id: 'ival-200-48',
    order: 16,
    brandKey: 'ival',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 19.9,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.40 PM (2).jpeg'),
  },
  {
    id: 'oska-200-48',
    order: 17,
    brandKey: 'oska',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 13,
    originalPrice: 15,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.40 PM (1).jpeg'),
  },
  {
    id: 'oubi-200-48',
    order: 18,
    brandKey: 'oubi',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 11.5,
    originalPrice: 12,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.40 PM.jpeg'),
  },
  {
    id: 'agadir-200-48',
    order: 19,
    brandKey: 'agadir',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    price: 10,
    originalPrice: 10.75,
    image: assetPath('200 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.04.39 PM (1).jpeg'),
  },
  {
    id: 'falin-330-20',
    order: 20,
    brandKey: 'falin',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 20,
    countLabelAr: '20 Ø­Ø¨Ø©',
    countLabelEn: '20 bottles',
    price: 5.75,
    originalPrice: 6.75,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.20 PM (2).jpeg'),
  },
  {
    id: 'al-rafeem-almasi-330-20',
    order: 21,
    brandKey: 'alRafeemDiamond',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 20,
    countLabelAr: '20 Ø­Ø¨Ø©',
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
    sizeAr: '330 Ù…Ù„',
    quantity: 20,
    countLabelAr: '20 Ø­Ø¨Ø©',
    countLabelEn: '20 bottles',
    pricingMode: 'quote',
  },
  {
    id: 'neotrel-330-40',
    order: 23,
    brandKey: 'neutral',
    displayNameAr: 'Ù†ÙŠÙˆØªØ±Ù„',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 11,
    originalPrice: 15.5,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.16 PM.jpeg'),
  },
  {
    id: 'tala-330-40',
    order: 24,
    brandKey: 'tala',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 13,
    originalPrice: 15.5,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.19 PM.jpeg'),
  },
  {
    id: 'sky-330-40',
    order: 25,
    brandKey: 'sky',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 11.5,
    originalPrice: 15.5,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.19 PM (1).jpeg'),
  },
  {
    id: 'oubi-330-40',
    order: 26,
    brandKey: 'oubi',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 11.5,
    originalPrice: 12,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.18 PM.jpeg'),
  },
  {
    id: 'adhari-330-40',
    order: 27,
    brandKey: 'adhari',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 10.9,
    originalPrice: 12,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.20 PM (1).jpeg'),
  },
  {
    id: 'agadir-330-40',
    order: 28,
    brandKey: 'agadir',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 10,
    originalPrice: 10.75,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.17 PM.jpeg'),
  },
  {
    id: 'nova-330-40',
    order: 29,
    brandKey: 'nova',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 17.5,
    originalPrice: 21,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.15 PM.jpeg'),
  },
  {
    id: 'berain-330-40',
    order: 30,
    brandKey: 'berain',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 17.9,
    originalPrice: 20,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.18 PM (3).jpeg'),
  },
  {
    id: 'safa-makkah-330-40',
    order: 31,
    brandKey: 'safaMakkah',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 17.9,
    originalPrice: 20,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.20 PM.jpeg'),
  },
  {
    id: 'naqi-330-40',
    order: 32,
    brandKey: 'naqi',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 14.9,
    originalPrice: 16.5,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.14 PM.jpeg'),
  },
  {
    id: 'ival-330-40',
    order: 33,
    brandKey: 'ival',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 19.9,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.18 PM (2).jpeg'),
  },
  {
    id: 'oska-330-40',
    order: 34,
    brandKey: 'oska',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 13,
    originalPrice: 15,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.18 PM (1).jpeg'),
  },
  {
    id: 'mana-330-40',
    order: 35,
    brandKey: 'mana',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
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
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 11.9,
    originalPrice: 14.5,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.19 PM (2).jpeg'),
  },
  {
    id: 'al-shafiyah-330-40',
    order: 37,
    brandKey: 'alShafiyah',
    displayNameAr: 'Ø§Ù„Ø´Ø§ÙÙŠØ©',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    price: 10,
    originalPrice: 15.5,
    image: assetPath('330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.17 PM (1).jpeg'),
  },
  {
    id: 'nova-500-24',
    order: 38,
    brandKey: 'nova',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '500ml',
    sizeAr: '500 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ù‚Ø§Ø±ÙˆØ±Ø©',
    countLabelEn: '24 bottles',
    price: 12,
    originalPrice: 14,
    image: assetPath('Ø§ÙƒØªØ± Ù…Ù† 330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.45 PM.jpeg'),
  },
  {
    id: 'berain-600-28',
    order: 39,
    brandKey: 'berain',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 Ù…Ù„',
    quantity: 28,
    countLabelAr: '28 Ù‚Ø§Ø±ÙˆØ±Ø©',
    countLabelEn: '28 bottles',
    price: 16,
    image: assetPath('Ø§ÙƒØªØ± Ù…Ù† 330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.47 PM (1).jpeg'),
  },
  {
    id: 'hittin-600-30',
    order: 40,
    brandKey: 'hittin',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 Ù…Ù„',
    quantity: 30,
    countLabelAr: '30 Ø­Ø¨Ø©',
    countLabelEn: '30 bottles',
    price: 11,
    originalPrice: 15,
    image: assetPath('Ø§ÙƒØªØ± Ù…Ù† 330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.48 PM.jpeg'),
  },
  {
    id: 'berain-1.5l-12',
    order: 41,
    brandKey: 'berain',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 Ù„ØªØ±',
    quantity: 12,
    countLabelAr: '12 Ù‚Ø§Ø±ÙˆØ±Ø©',
    countLabelEn: '12 bottles',
    price: 16,
    image: assetPath('Ø§ÙƒØªØ± Ù…Ù† 330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.47 PM.jpeg'),
    imageFit: 'tight',
  },
  {
    id: 'larina-shrink-1.5l-6',
    order: 42,
    brandKey: 'larina',
    displayNameAr: 'Ù„Ø§Ø±ÙŠÙ†Ø§ Ø´Ø±ÙŠÙ†Ùƒ',
    displayNameEn: 'Larina Shrink',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 Ù„ØªØ±',
    quantity: 6,
    countLabelAr: '6 Ø­Ø¨Ø©',
    countLabelEn: '6 bottles',
    price: 7,
    originalPrice: 12,
    image: assetPath('Ø§ÙƒØªØ± Ù…Ù† 330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.48 PM (2).jpeg'),
    imageFit: 'tight',
  },
  {
    id: 'larina-carton-1.5l-12',
    order: 43,
    brandKey: 'larina',
    displayNameAr: 'Ù„Ø§Ø±ÙŠÙ†Ø§ ÙƒØ±ØªÙˆÙ†',
    displayNameEn: 'Larina Carton',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 Ù„ØªØ±',
    quantity: 12,
    countLabelAr: '12 Ø­Ø¨Ø©',
    countLabelEn: '12 bottles',
    price: 16.25,
    originalPrice: 19.25,
    image: assetPath('Ø§ÙƒØªØ± Ù…Ù† 330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.48 PM (3).jpeg'),
    imageFit: 'tight',
  },
  {
    id: 'safa-makkah-1.5l-12',
    order: 44,
    brandKey: 'safaMakkah',
    displayNameAr: 'ØµÙØ§ Ù…ÙƒØ©',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 Ù„ØªØ±',
    quantity: 12,
    countLabelAr: '12 Ø­Ø¨Ø©',
    countLabelEn: '12 bottles',
    price: 16.5,
    originalPrice: 19.5,
    image: assetPath('Ø§ÙƒØªØ± Ù…Ù† 330 Ù…Ù„ ðŸ‘‡', 'WhatsApp Image 2026-04-18 at 11.05.48 PM (1).jpeg'),
    imageFit: 'tight',
  },
  {
    id: 'neotrel-1.5l-6',
    order: 45,
    brandKey: 'neutral',
    displayNameAr: 'Ù†ÙŠÙˆØªØ±Ù„',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 Ù„ØªØ±',
    quantity: 6,
    countLabelAr: '6 Ø­Ø¨Ø©',
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
    sizeAr: '200 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø­Ø¨Ø©',
    countLabelEn: '24 bottles',
    pricingMode: 'quote',
    image: newProductImage('Ø§ÙØ§ 200 Ù…Ù„ÙŠ.png'),
  },
  {
    id: 'oubi-1.5l-12',
    order: 47,
    brandKey: 'oubi',
    category: 'large',
    catalogGroup: 'over-330ml',
    size: '1.5L',
    sizeAr: '1.5 Ù„ØªØ±',
    quantity: 12,
    countLabelAr: '12 Ù‚Ø§Ø±ÙˆØ±Ø©',
    countLabelEn: '12 bottles',
    pricingMode: 'quote',
    image: newProductImage('Ø§ÙˆØ¨ÙŠ 1.5 Ù„ØªØ±.png'),
    imageFit: 'tight',
  },
  {
    id: 'oubi-real-600-28',
    order: 48,
    brandKey: 'oubi',
    displayNameAr: 'Ø§ÙˆØ¨ÙŠ Ø±ÙŠØ§Ù„',
    displayNameEn: 'Oubi Real',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 Ù…Ù„',
    quantity: 28,
    countLabelAr: '28 Ù‚Ø§Ø±ÙˆØ±Ø©',
    countLabelEn: '28 bottles',
    pricingMode: 'quote',
    image: newProductImage('Ø§ÙˆØ¨ÙŠ Ø±ÙŠØ§Ù„ 600 Ù…Ù„.png'),
  },
  {
    id: 'berain-600-28-new',
    order: 49,
    brandKey: 'berain',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 Ù…Ù„',
    quantity: 28,
    countLabelAr: '28 Ù‚Ø§Ø±ÙˆØ±Ø©',
    countLabelEn: '28 bottles',
    pricingMode: 'quote',
    image: newProductImage('Ø¨ÙŠØ±ÙŠÙ† 600 Ù…Ù„ÙŠ_.png'),
  },
  {
    id: 'rode-200-48',
    order: 50,
    brandKey: 'rode',
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    pricingMode: 'quote',
    image: newProductImage('Ø±ÙˆØ¯ 200 Ù…Ù„ÙŠ.png'),
  },
  {
    id: 'rode-330-40',
    order: 51,
    brandKey: 'rode',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    pricingMode: 'quote',
    image: newProductImage('Ø±ÙˆØ¯ 330 Ù…Ù„ÙŠ.png'),
  },
  {
    id: 'rode-600-24',
    order: 52,
    brandKey: 'rode',
    category: 'medium',
    catalogGroup: 'over-330ml',
    size: '600ml',
    sizeAr: '600 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ù‚Ø§Ø±ÙˆØ±Ø©',
    countLabelEn: '24 bottles',
    pricingMode: 'quote',
    image: newProductImage('Ø±ÙˆØ¯ 600 Ù…Ù„ÙŠ_.png'),
  },
  {
    id: 'sky-330-40-new',
    order: 53,
    brandKey: 'sky',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    pricingMode: 'quote',
    image: newProductImage('Ø³ÙƒØ§ÙŠ 330 Ù…Ù„ÙŠ_.png'),
  },
  {
    id: 'safa-5l-4',
    order: 54,
    brandKey: 'safa',
    displayNameAr: 'ØµÙØ§ Ù…ÙƒØ©',
    displayNameEn: 'Safa Makkah',
    category: 'gallon',
    catalogGroup: 'over-330ml',
    size: '5L',
    sizeAr: '5 Ù„ØªØ±',
    quantity: 4,
    countLabelAr: '4 Ø¹Ø¨ÙˆØ§Øª',
    countLabelEn: '4 bottles',
    pricingMode: 'quote',
    image: newProductImage('ØµÙØ§ 5 Ù„ØªØ±.png'),
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
    sizeAr: '200 Ù…Ù„',
    quantity: 48,
    countLabelAr: '48 Ø­Ø¨Ø©',
    countLabelEn: '48 bottles',
    pricingMode: 'quote',
    image: newProductImage('ÙÙŠÙˆ 200 Ù…Ù„ÙŠ_.png'),
  },
  {
    id: 'view-330-40',
    order: 56,
    brandKey: 'view',
    category: 'small',
    catalogGroup: '330ml',
    size: '330ml',
    sizeAr: '330 Ù…Ù„',
    quantity: 40,
    countLabelAr: '40 Ø­Ø¨Ø©',
    countLabelEn: '40 bottles',
    pricingMode: 'quote',
    image: newProductImage('ÙÙŠÙˆ 330 Ù…Ù„ÙŠ_.png'),
  },
  {
    id: 'marina-5l-1',
    order: 57,
    brandKey: 'marina',
    category: 'gallon',
    catalogGroup: 'over-330ml',
    size: '5L',
    sizeAr: '5 Ù„ØªØ±',
    quantity: 1,
    countLabelAr: 'Ø¹Ø¨ÙˆØ© ÙˆØ§Ø­Ø¯Ø©',
    countLabelEn: '1 bottle',
    pricingMode: 'quote',
    image: newProductImage('Ù…Ø§Ø±ÙŠÙ†Ø§ 5 Ù„ØªØ±_.png'),
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
    sizeAr: '5 Ù„ØªØ±',
    quantity: 1,
    countLabelAr: 'Ø¹Ø¨ÙˆØ© ÙˆØ§Ø­Ø¯Ø©',
    countLabelEn: '1 bottle',
    pricingMode: 'quote',
    image: newProductImage('Ù†ÙˆÙØ§ 5 Ù„ØªØ±_.png'),
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
    sizeAr: '12 Ù„ØªØ±',
    quantity: 1,
    countLabelAr: 'Ø¹Ø¨ÙˆØ© ÙˆØ§Ø­Ø¯Ø©',
    countLabelEn: '1 bottle',
    pricingMode: 'quote',
    image: newProductImage('Ù†ÙˆÙØ§ 12 Ù„ØªØ±.png'),
    imageType: 'gallon',
    imageFit: 'tight',
  },
  {
    id: 'nova-glass-250-24',
    order: 60,
    brandKey: 'nova',
    displayNameAr: 'Ù†ÙˆÙØ§ Ø²Ø¬Ø§Ø¬',
    displayNameEn: 'Nova Glass',
    category: 'glass',
    catalogGroup: '200ml',
    size: '250ml',
    sizeAr: '250 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø²Ø¬Ø§Ø¬Ø©',
    countLabelEn: '24 glass bottles',
    pricingMode: 'quote',
    image: newProductImage('Ù†ÙˆÙØ§ Ø²Ø¬Ø§Ø¬ 250 Ù…Ù„ÙŠ_.png'),
    imageType: 'bottle',
    imageFit: 'tight',
  },
  {
    id: 'nova-glass-750-12',
    order: 61,
    brandKey: 'nova',
    displayNameAr: 'Ù†ÙˆÙØ§ Ø²Ø¬Ø§Ø¬',
    displayNameEn: 'Nova Glass',
    category: 'glass',
    catalogGroup: 'over-330ml',
    size: '750ml',
    sizeAr: '750 Ù…Ù„',
    quantity: 12,
    countLabelAr: '12 Ø²Ø¬Ø§Ø¬Ø©',
    countLabelEn: '12 glass bottles',
    pricingMode: 'quote',
    image: newProductImage('Ù†ÙˆÙØ§ Ø²Ø¬Ø§Ø¬ 750 Ù…Ù„ÙŠ_.png'),
    imageType: 'bottle',
    imageFit: 'tight',
  },
  {
    id: 'nova-sparkling-glass-250-24',
    order: 62,
    brandKey: 'nova',
    displayNameAr: 'Ù†ÙˆÙØ§ Ø²Ø¬Ø§Ø¬ ÙÙˆØ§Ø±Ø©',
    displayNameEn: 'Nova Sparkling Glass',
    category: 'glass',
    catalogGroup: '200ml',
    size: '250ml',
    sizeAr: '250 Ù…Ù„',
    quantity: 24,
    countLabelAr: '24 Ø²Ø¬Ø§Ø¬Ø©',
    countLabelEn: '24 glass bottles',
    pricingMode: 'quote',
    image: newProductImage('Ù†ÙˆÙØ§ Ø²Ø¬Ø§Ø¬ ÙÙˆØ§Ø±Ø© 250 Ù…Ù„.png'),
    imageType: 'bottle',
    imageFit: 'tight',
  },
  {
    id: 'nova-sparkling-glass-750-12',
    order: 63,
    brandKey: 'nova',
    displayNameAr: 'Ù†ÙˆÙØ§ Ø²Ø¬Ø§Ø¬ ÙÙˆØ§Ø±Ø©',
    displayNameEn: 'Nova Sparkling Glass',
    category: 'glass',
    catalogGroup: 'over-330ml',
    size: '750ml',
    sizeAr: '750 Ù…Ù„',
    quantity: 12,
    countLabelAr: '12 Ø²Ø¬Ø§Ø¬Ø©',
    countLabelEn: '12 glass bottles',
    pricingMode: 'quote',
    image: newProductImage('Ù†ÙˆÙØ§ Ø²Ø¬Ø§Ø¬ ÙÙˆØ§Ø±Ø© 750 Ù…Ù„.png'),
    imageType: 'bottle',
    imageFit: 'tight',
  },
];

const rawCategories = [
  { id: 'all', nameAr: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª', nameEn: 'All Products' },
  { id: 'small', nameAr: '200 Ùˆ330 Ù…Ù„', nameEn: '200ml & 330ml' },
  { id: 'medium', nameAr: '500 Ùˆ600 Ù…Ù„', nameEn: '500ml & 600ml' },
  { id: 'large', nameAr: '1.5 Ù„ØªØ±', nameEn: '1.5L Packs' },
  { id: 'gallon', nameAr: 'Ø¹Ø¨ÙˆØ§Øª ÙƒØ¨ÙŠØ±Ø©', nameEn: 'Large Bottles' },
  { id: 'glass', nameAr: 'Ø²Ø¬Ø§Ø¬ ÙˆÙÙˆØ§Ø±Ø©', nameEn: 'Glass & Sparkling' },
] as const;

export const categories = rawCategories.map((category) => ({
  ...category,
  nameAr: fixMojibake(category.nameAr),
  nameEn: fixMojibake(category.nameEn),
}));

function buildPackagingAr(seed: ProductSeed) {
  return `Ø¹Ø¨ÙˆØ© ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ${seed.countLabelAr}`;
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
      ar: `${seed.displayNameAr ?? brand.ar} Ø¨Ø­Ø¬Ù… ${seed.sizeAr} Ø¨Ø¹Ø¯Ø¯ ${seed.countLabelAr} Ù…ØªØ§Ø­ Ø­Ø§Ù„ÙŠØ§Ù‹ Ø¨Ø·Ù„Ø¨ Ø³Ø¹Ø± Ù…Ø¨Ø§Ø´Ø± Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨.`,
      en: `${seed.displayNameEn ?? brand.en} in ${seed.size} with ${seed.countLabelEn} is available on request. Ask us for the current price on WhatsApp.`,
    };
  }

  return {
    ar: `${seed.displayNameAr ?? brand.ar} Ø¨Ø­Ø¬Ù… ${seed.sizeAr} Ø¨Ø¹Ø¯Ø¯ ${seed.countLabelAr} Ø¯Ø§Ø®Ù„ ${packagingAr}.`,
    en: `${seed.displayNameEn ?? brand.en} in ${seed.size} with ${seed.countLabelEn} per ${packagingEn}.`,
  };
}

function buildFeatures(seed: ProductSeed) {
  return [
    seed.sizeAr,
    seed.countLabelAr,
    buildPackagingAr(seed),
    seed.catalogGroup === '200ml'
      ? 'ÙØ¦Ø© 200 Ù…Ù„'
      : seed.catalogGroup === '330ml'
        ? 'ÙØ¦Ø© 330 Ù…Ù„'
        : 'ÙØ¦Ø© Ø£ÙƒØ¨Ø± Ù…Ù† 330 Ù…Ù„',
  ];
}

function buildBenefits(seed: ProductSeed) {
  return [
    'Ù…ÙŠØ§Ù‡ Ù…Ø¹Ø¨Ø£Ø© Ù„Ù„Ø´Ø±Ø¨',
    seed.countLabelAr,
    seed.pricingMode === 'quote' ? 'Ø§Ù„Ø³Ø¹Ø± Ø­Ø³Ø¨ Ø§Ù„Ø·Ù„Ø¨' : 'Ø³Ø¹Ø± Ø¸Ø§Ù‡Ø± Ø¯Ø§Ø®Ù„ Ø§Ù„ÙƒØªØ§Ù„ÙˆØ¬',
    buildPackagingAr(seed),
  ];
}

function buildQuickFacts(seed: ProductSeed, brand: BrandMeta) {
  return [
    {
      labelAr: 'Ø§Ù„Ø¹Ù„Ø§Ù…Ø©',
      labelEn: 'Brand',
      valueAr: seed.displayNameAr ?? brand.ar,
      valueEn: seed.displayNameEn ?? brand.en,
    },
    {
      labelAr: 'Ø§Ù„Ø­Ø¬Ù…',
      labelEn: 'Size',
      valueAr: seed.sizeAr,
      valueEn: seed.size,
    },
    {
      labelAr: 'Ø§Ù„Ø¹Ø¯Ø¯',
      labelEn: 'Units',
      valueAr: seed.countLabelAr,
      valueEn: seed.countLabelEn,
    },
    {
      labelAr: 'Ø§Ù„ØªØºÙ„ÙŠÙ',
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

function makeCampaignOfferProduct({
  id,
  brandKey,
  brandNameAr,
  size,
  catalogGroup,
  bottleCountAr,
  bottleCountEn,
  price,
  originalPrice,
  imageFile,
  catalogOrder,
}: {
  id: string;
  brandKey: keyof typeof BRAND_META;
  brandNameAr: string;
  size: Product['size'];
  catalogGroup: CatalogGroupId;
  bottleCountAr: string;
  bottleCountEn: string;
  price: number;
  originalPrice: number;
  imageFile: string;
  catalogOrder: number;
}): Product {
  const brand = BRAND_META[brandKey];
  const sizeAr = size.replace('ml', ' مل').replace('L', ' لتر');
  const offerAr = `عرض مياه ${brandNameAr} ${sizeAr} 15 + 5 كراتين`;
  const offerEn = `${brand.en} ${size} 15 + 5 Cartons Offer`;

  return {
    id,
    brandId: brand.id,
    name: {
      ar: offerAr,
      en: offerEn,
    },
    brand: brand.en,
    brandAr: brandNameAr,
    category: 'offer',
    catalogGroup,
    size,
    quantity: 20,
    price,
    originalPrice,
    pricingMode: 'fixed',
    isPurchasable: true,
    image: offerImage(imageFile),
    description: {
      ar: `اشتر 15 كرتون مياه ${brandNameAr} ${sizeAr} واحصل على 5 كراتين مجانا بسعر ${price} ريال شامل الضريبة والتوصيل داخل الرياض.`,
      en: `Buy 15 ${brand.en} ${size} cartons and get 5 cartons free for SAR ${price}, including VAT and delivery in Riyadh.`,
    },
    features: [
      `اشتر 15 كرتون مياه ${brandNameAr} واحصل على 5 كراتين مجانا.`,
      `مقاس ${sizeAr} بعدد ${bottleCountAr} للكراتين.`,
      `السعر ${price} ريال شامل الضريبة والتوصيل داخل الرياض.`,
      'توصيل مجاني داخل الرياض ضمن العرض.',
    ],
    benefits: [
      '15 كرتون + 5 كراتين مجانا',
      `${sizeAr} - ${bottleCountAr}`,
      'شامل الضريبة والتوصيل',
      'عرض متاح لفترة محدودة',
    ],
    specifications: {
      packaging: `15 + 5 كراتين مجانا، ${size} ${bottleCountEn}`,
    },
    story: {
      ar: `عرض ${brandNameAr} مناسب للبيت والمكتب والضيافة، مع سعر شامل الضريبة والتوصيل داخل الرياض.`,
      en: `${brand.en} offer is suitable for home, office, and hospitality orders with VAT and delivery included in Riyadh.`,
    },
    quickFacts: [
      { labelAr: 'العلامة', labelEn: 'Brand', valueAr: brandNameAr, valueEn: brand.en },
      { labelAr: 'المقاس', labelEn: 'Size', valueAr: sizeAr, valueEn: size },
      { labelAr: 'العرض', labelEn: 'Offer', valueAr: '15 + 5 كراتين مجانا', valueEn: '15 + 5 cartons free' },
      { labelAr: 'السعر شامل', labelEn: 'Includes', valueAr: 'الضريبة والتوصيل', valueEn: 'VAT and delivery' },
    ],
    inStock: true,
    isPublished: true,
    rating: 0,
    reviews: 0,
    imageType: 'offer',
    imageFit: 'balanced',
    catalogOrder,
  };
}

const offerProducts: Product[] = [
  makeCampaignOfferProduct({
    id: 'offer-adhari-330-15-plus-5',
    brandKey: 'adhari',
    brandNameAr: 'عذاري',
    size: '330ml',
    catalogGroup: '330ml',
    bottleCountAr: '40 عبوة للكرتون',
    bottleCountEn: 'x40 bottles',
    price: 199,
    originalPrice: 265,
    imageFile: 'adhari-campaign.png',
    catalogOrder: 0,
  }),
  makeCampaignOfferProduct({
    id: 'offer-aghadeer-330-15-plus-5',
    brandKey: 'agadir',
    brandNameAr: 'أغادير',
    size: '330ml',
    catalogGroup: '330ml',
    bottleCountAr: '40 عبوة للكرتون',
    bottleCountEn: 'x40 bottles',
    price: 195,
    originalPrice: 260,
    imageFile: 'aghadeer-campaign.jpeg',
    catalogOrder: 1,
  }),
  makeCampaignOfferProduct({
    id: 'offer-naqi-200-15-plus-5',
    brandKey: 'naqi',
    brandNameAr: 'نقي',
    size: '200ml',
    catalogGroup: '200ml',
    bottleCountAr: '48 عبوة للكرتون',
    bottleCountEn: 'x48 bottles',
    price: 199,
    originalPrice: 265,
    imageFile: 'naqi-campaign.jpeg',
    catalogOrder: 2,
  }),
  makeCampaignOfferProduct({
    id: 'offer-oubi-330-15-plus-5',
    brandKey: 'oubi',
    brandNameAr: 'أوبي',
    size: '330ml',
    catalogGroup: '330ml',
    bottleCountAr: '40 عبوة للكرتون',
    bottleCountEn: 'x40 bottles',
    price: 209,
    originalPrice: 280,
    imageFile: 'oubi-campaign.jpeg',
    catalogOrder: 3,
  }),
  {
    id: 'offer-nova-330-15-plus-5',
    brandId: BRAND_META.nova.id,
    name: {
      ar: 'Ø¹Ø±Ø¶ Ù…ÙŠØ§Ù‡ Ù†ÙˆÙØ§ 330 Ù…Ù„ 15 + 5 ÙƒØ±Ø§ØªÙŠÙ†',
      en: 'Nova 330ml 15 + 5 Cartons Offer',
    },
    brand: BRAND_META.nova.en,
    brandAr: BRAND_META.nova.ar,
    category: 'offer',
    catalogGroup: '330ml',
    size: '330ml',
    quantity: 20,
    price: 350,
    originalPrice: 467,
    pricingMode: 'fixed',
    isPurchasable: true,
    image: offerImage('nova-campaign.png'),
    description: {
      ar: 'Ø¹Ø±Ø¶ Ù…Ù…ÙŠØ² Ø¹Ù„Ù‰ Ù…ÙŠØ§Ù‡ Ù†ÙˆÙØ§ 330 Ù…Ù„: Ø§Ø´ØªØ± 15 ÙƒØ±ØªÙˆÙ† ÙˆØ§Ø­ØµÙ„ Ø¹Ù„Ù‰ 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§ØŒ Ø´Ø§Ù…Ù„ Ø§Ù„ØªÙˆØµÙŠÙ„ Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶ Ø¨Ø³Ø¹Ø± 350 Ø±ÙŠØ§Ù„ ÙÙ‚Ø·.',
      en: 'Special Nova 330ml offer: buy 15 cartons and get 5 cartons free, with free delivery in Riyadh for SAR 350 only.',
    },
    features: [
      'Ù…ÙŠØ§Ù‡ Ù†ÙˆÙØ§ ØªØ£ØªÙŠ Ù…Ù† Ø¢Ø¨Ø§Ø± ÙˆØ§Ø¯ÙŠ Ø³Ø¹Ø¯ØŒ Ø£Ø­Ø¯ Ø£Ø´Ù‡Ø± Ø§Ù„Ù…ØµØ§Ø¯Ø± Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ© Ù„Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ù†Ù‚ÙŠØ© ÙÙŠ Ø§Ù„Ù…Ù…Ù„ÙƒØ©.',
      'ØªØ±ÙƒÙŠØ¨Ø© Ù…ØªÙˆØ§Ø²Ù†Ø© ÙˆØ·Ø¹Ù… Ù†Ù‚ÙŠ ÙŠÙ†Ø¹Ø´ ÙŠÙˆÙ…Ùƒ Ù…Ø¹ ÙƒÙ„ Ø±Ø´ÙØ©.',
      'Ø§Ù„Ù…Ù‚Ø§Ø³: 330 Ù…Ù„ØŒ ÙˆØ§Ù„ÙƒÙ…ÙŠØ© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ©: 20 ÙƒØ±ØªÙˆÙ† Ø¶Ù…Ù† Ø¹Ø±Ø¶ 15 + 5 Ù…Ø¬Ø§Ù†Ø§.',
      'Ø§Ù„Ø³Ø¹Ø± 350 Ø±ÙŠØ§Ù„ ÙÙ‚Ø· Ø´Ø§Ù…Ù„ Ø§Ù„ØªÙˆØµÙŠÙ„ Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶.',
      'Ø§Ø®ØªÙŠØ§Ø± Ù…Ø«Ø§Ù„ÙŠ Ù„Ù„Ù…Ù†Ø²Ù„ØŒ Ø§Ù„Ù…ÙƒØ§ØªØ¨ØŒ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§ØªØŒ ÙˆØ§Ù„Ø¶ÙŠØ§ÙØ© Ø§Ù„Ø±Ø§Ù‚ÙŠØ©.',
    ],
    benefits: [
      '15 ÙƒØ±ØªÙˆÙ† + 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§',
      'ØªÙˆØµÙŠÙ„ Ù…Ø¬Ø§Ù†ÙŠ',
      'Ù…ÙŠØ§Ù‡ Ù†ÙˆÙØ§ 330 Ù…Ù„',
      'Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ù…Ù†Ø²Ù„ ÙˆØ§Ù„Ù…ÙƒØ§ØªØ¨ ÙˆØ§Ù„Ø¶ÙŠØ§ÙØ©',
    ],
    specifications: {
      packaging: '15 + 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§ØŒ 330ml',
    },
    story: {
      ar: 'ØªØ£ØªÙŠ Ù…ÙŠØ§Ù‡ Ù†ÙˆÙØ§ Ù…Ù† Ø¢Ø¨Ø§Ø± ÙˆØ§Ø¯ÙŠ Ø³Ø¹Ø¯ØŒ ÙˆØªØªÙ…ÙŠØ² Ø¨ØªØ±ÙƒÙŠØ¨Ø© Ù…ØªÙˆØ§Ø²Ù†Ø© ÙˆØ·Ø¹Ù… Ù†Ù‚ÙŠ Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠ ÙˆØ§Ù„Ø¶ÙŠØ§ÙØ©.',
      en: 'Nova water comes from Wadi Saad wells and is known for a balanced composition and clean taste for daily use and hospitality.',
    },
    quickFacts: [
      { labelAr: 'Ø§Ù„Ø¹Ù„Ø§Ù…Ø©', labelEn: 'Brand', valueAr: 'Ù†ÙˆÙØ§', valueEn: 'Nova' },
      { labelAr: 'Ø§Ù„Ù…Ù‚Ø§Ø³', labelEn: 'Size', valueAr: '330 Ù…Ù„', valueEn: '330ml' },
      { labelAr: 'Ø§Ù„Ø¹Ø±Ø¶', labelEn: 'Offer', valueAr: '15 + 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§', valueEn: '15 + 5 cartons free' },
      { labelAr: 'Ø§Ù„ØªÙˆØµÙŠÙ„', labelEn: 'Delivery', valueAr: 'Ù…Ø¬Ø§Ù†ÙŠ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶', valueEn: 'Free in Riyadh' },
    ],
    inStock: true,
    isPublished: true,
    rating: 0,
    reviews: 0,
    imageType: 'offer',
    imageFit: 'balanced',
    catalogOrder: 0,
  },
  {
    id: 'offer-fly-15-plus-5',
    brandId: BRAND_META.fly.id,
    name: {
      ar: 'Ø¹Ø±Ø¶ Ù…ÙŠØ§Ù‡ ÙÙ„Ø§ÙŠ 15 + 5 ÙƒØ±Ø§ØªÙŠÙ†',
      en: 'Fly Water 15 + 5 Cartons Offer',
    },
    brand: BRAND_META.fly.en,
    brandAr: BRAND_META.fly.ar,
    category: 'offer',
    catalogGroup: '200ml',
    size: '200ml / 330ml',
    quantity: 20,
    price: 195,
    originalPrice: 260,
    pricingMode: 'fixed',
    isPurchasable: true,
    image: offerImage('fly-campaign.jpeg'),
    description: {
      ar: 'Ø§Ø´ØªØ± 15 ÙƒØ±ØªÙˆÙ† Ù…ÙŠØ§Ù‡ ÙÙ„Ø§ÙŠ ÙˆØ§Ø­ØµÙ„ Ø¹Ù„Ù‰ 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§. Ù…ØªÙˆÙØ± 200 Ù…Ù„ 48 Ø¹Ø¨ÙˆØ© Ø£Ùˆ 330 Ù…Ù„ 40 Ø¹Ø¨ÙˆØ© Ø¨Ø³Ø¹Ø± 195 Ø±ÙŠØ§Ù„ Ø´Ø§Ù…Ù„ Ø§Ù„Ø¶Ø±ÙŠØ¨Ø© ÙˆØ§Ù„ØªÙˆØµÙŠÙ„ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶.',
      en: 'Buy 15 Fly Water cartons and get 5 cartons free. Available in 200ml x48 bottles or 330ml x40 bottles for SAR 195 including VAT and delivery in Riyadh.',
    },
    features: [
      'Ø§Ø´ØªØ± 15 ÙƒØ±ØªÙˆÙ† Ù…ÙŠØ§Ù‡ ÙÙ„Ø§ÙŠ ÙˆØ§Ø­ØµÙ„ Ø¹Ù„Ù‰ 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§.',
      'Ù…ØªÙˆÙØ± Ø¨Ù…Ù‚Ø§Ø³ 200 Ù…Ù„ Ø¨Ø¹Ø¯Ø¯ 48 Ø¹Ø¨ÙˆØ© Ù„Ù„ÙƒØ±ØªÙˆÙ† Ø£Ùˆ 330 Ù…Ù„ Ø¨Ø¹Ø¯Ø¯ 40 Ø¹Ø¨ÙˆØ© Ù„Ù„ÙƒØ±ØªÙˆÙ†.',
      'Ø§Ù„Ø³Ø¹Ø± 195 Ø±ÙŠØ§Ù„ ÙÙ‚Ø· Ø´Ø§Ù…Ù„ Ø§Ù„Ø¶Ø±ÙŠØ¨Ø© ÙˆØ§Ù„ØªÙˆØµÙŠÙ„ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶.',
      'Ù…ÙŠØ§Ù‡ Ø´Ø±Ø¨ Ù†Ù‚ÙŠØ© Ù…Ø¹ ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ ÙˆØ¹Ø±ÙˆØ¶ Ù…Ø³ØªÙ…Ø±Ø©.',
      'Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† ÙˆØ§Ø³ØªÙØ¯ Ù…Ù† Ø§Ù„Ø¹Ø±Ø¶ Ù‚Ø¨Ù„ Ø§Ù†ØªÙ‡Ø§Ø¦Ù‡.',
    ],
    benefits: [
      '15 ÙƒØ±ØªÙˆÙ† + 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§',
      '200 Ù…Ù„ Ø£Ùˆ 330 Ù…Ù„',
      'Ø´Ø§Ù…Ù„ Ø§Ù„Ø¶Ø±ÙŠØ¨Ø© ÙˆØ§Ù„ØªÙˆØµÙŠÙ„',
      'ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶',
    ],
    specifications: {
      packaging: '15 + 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§ØŒ 200ml x48 Ø£Ùˆ 330ml x40',
    },
    story: {
      ar: 'Ø¹Ø±Ø¶ ÙÙ„Ø§ÙŠ Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„ØªØ®Ø²ÙŠÙ† Ø§Ù„ÙŠÙˆÙ…ÙŠ ÙˆØ§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¹Ø§Ø¦Ù„ÙŠØ© ÙˆØ§Ù„Ù…ÙƒØªØ¨ÙŠØ© Ù…Ø¹ Ø³Ø¹Ø± Ø´Ø§Ù…Ù„ Ø§Ù„Ø¶Ø±ÙŠØ¨Ø© ÙˆØ§Ù„ØªÙˆØµÙŠÙ„ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶.',
      en: 'Fly offer is suited for daily stocking, family orders, and office supply with VAT and delivery included in Riyadh.',
    },
    quickFacts: [
      { labelAr: 'Ø§Ù„Ø¹Ù„Ø§Ù…Ø©', labelEn: 'Brand', valueAr: 'ÙÙ„Ø§ÙŠ', valueEn: 'Fly Water' },
      { labelAr: 'Ø§Ù„Ù…Ù‚Ø§Ø³Ø§Øª', labelEn: 'Sizes', valueAr: '200 Ù…Ù„ / 330 Ù…Ù„', valueEn: '200ml / 330ml' },
      { labelAr: 'Ø§Ù„Ø¹Ø±Ø¶', labelEn: 'Offer', valueAr: '15 + 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§', valueEn: '15 + 5 cartons free' },
      { labelAr: 'Ø§Ù„Ø³Ø¹Ø± Ø´Ø§Ù…Ù„', labelEn: 'Includes', valueAr: 'Ø§Ù„Ø¶Ø±ÙŠØ¨Ø© ÙˆØ§Ù„ØªÙˆØµÙŠÙ„', valueEn: 'VAT and delivery' },
    ],
    inStock: true,
    isPublished: true,
    rating: 0,
    reviews: 0,
    imageType: 'offer',
    imageFit: 'balanced',
    catalogOrder: 1,
  },
  {
    id: 'offer-fly-330-15-plus-5',
    brandId: BRAND_META.fly.id,
    name: {
      ar: '\u0639\u0631\u0636 \u0645\u064a\u0627\u0647 \u0641\u0644\u0627\u064a 330 \u0645\u0644 15 + 5 \u0643\u0631\u0627\u062a\u064a\u0646',
      en: 'Fly Water 330ml 15 + 5 Cartons Offer',
    },
    brand: BRAND_META.fly.en,
    brandAr: BRAND_META.fly.ar,
    category: 'offer',
    catalogGroup: '330ml',
    size: '330ml',
    quantity: 20,
    price: 195,
    originalPrice: 260,
    pricingMode: 'fixed',
    isPurchasable: true,
    image: offerImage('fly-campaign.jpeg'),
    description: {
      ar: '\u0627\u0634\u062a\u0631 15 \u0643\u0631\u062a\u0648\u0646 \u0645\u064a\u0627\u0647 \u0641\u0644\u0627\u064a 330 \u0645\u0644 \u0648\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 5 \u0643\u0631\u0627\u062a\u064a\u0646 \u0645\u062c\u0627\u0646\u0627 \u0628\u0633\u0639\u0631 195 \u0631\u064a\u0627\u0644 \u0634\u0627\u0645\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u0629 \u0648\u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u062f\u0627\u062e\u0644 \u0627\u0644\u0631\u064a\u0627\u0636.',
      en: 'Buy 15 Fly Water 330ml cartons and get 5 cartons free for SAR 195 including VAT and delivery in Riyadh.',
    },
    features: [
      '\u0627\u0634\u062a\u0631 15 \u0643\u0631\u062a\u0648\u0646 \u0645\u064a\u0627\u0647 \u0641\u0644\u0627\u064a \u0648\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 5 \u0643\u0631\u0627\u062a\u064a\u0646 \u0645\u062c\u0627\u0646\u0627.',
      '\u0645\u0642\u0627\u0633 330 \u0645\u0644 \u0628\u0639\u062f\u062f 40 \u0639\u0628\u0648\u0629 \u0644\u0644\u0643\u0631\u062a\u0648\u0646.',
      '\u0627\u0644\u0633\u0639\u0631 195 \u0631\u064a\u0627\u0644 \u0641\u0642\u0637 \u0634\u0627\u0645\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u0629 \u0648\u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u062f\u0627\u062e\u0644 \u0627\u0644\u0631\u064a\u0627\u0636.',
      '\u0645\u064a\u0627\u0647 \u0634\u0631\u0628 \u0646\u0642\u064a\u0629 \u0645\u0639 \u062a\u0648\u0635\u064a\u0644 \u0633\u0631\u064a\u0639 \u0648\u0639\u0631\u0648\u0636 \u0645\u0633\u062a\u0645\u0631\u0629.',
      '\u0627\u0637\u0644\u0628 \u0627\u0644\u0622\u0646 \u0648\u0627\u0633\u062a\u0641\u062f \u0645\u0646 \u0627\u0644\u0639\u0631\u0636 \u0642\u0628\u0644 \u0627\u0646\u062a\u0647\u0627\u0626\u0647.',
    ],
    benefits: [
      '15 \u0643\u0631\u062a\u0648\u0646 + 5 \u0643\u0631\u0627\u062a\u064a\u0646 \u0645\u062c\u0627\u0646\u0627',
      '330 \u0645\u0644',
      '\u0634\u0627\u0645\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u0629 \u0648\u0627\u0644\u062a\u0648\u0635\u064a\u0644',
      '\u062a\u0648\u0635\u064a\u0644 \u0633\u0631\u064a\u0639 \u062f\u0627\u062e\u0644 \u0627\u0644\u0631\u064a\u0627\u0636',
    ],
    specifications: {
      packaging: '15 + 5 \u0643\u0631\u0627\u062a\u064a\u0646 \u0645\u062c\u0627\u0646\u0627\u060c 330ml x40',
    },
    story: {
      ar: '\u0639\u0631\u0636 \u0641\u0644\u0627\u064a 330 \u0645\u0644 \u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u062a\u062e\u0632\u064a\u0646 \u0627\u0644\u064a\u0648\u0645\u064a \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0639\u0627\u0626\u0644\u064a\u0629 \u0648\u0627\u0644\u0645\u0643\u062a\u0628\u064a\u0629 \u0645\u0639 \u0633\u0639\u0631 \u0634\u0627\u0645\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u0629 \u0648\u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u062f\u0627\u062e\u0644 \u0627\u0644\u0631\u064a\u0627\u0636.',
      en: 'Fly 330ml offer is suited for daily stocking, family orders, and office supply with VAT and delivery included in Riyadh.',
    },
    quickFacts: [
      { labelAr: '\u0627\u0644\u0639\u0644\u0627\u0645\u0629', labelEn: 'Brand', valueAr: '\u0641\u0644\u0627\u064a', valueEn: 'Fly Water' },
      { labelAr: '\u0627\u0644\u0645\u0642\u0627\u0633', labelEn: 'Size', valueAr: '330 \u0645\u0644', valueEn: '330ml' },
      { labelAr: '\u0627\u0644\u0639\u0631\u0636', labelEn: 'Offer', valueAr: '15 + 5 \u0643\u0631\u0627\u062a\u064a\u0646 \u0645\u062c\u0627\u0646\u0627', valueEn: '15 + 5 cartons free' },
      { labelAr: '\u0627\u0644\u0633\u0639\u0631 \u0634\u0627\u0645\u0644', labelEn: 'Includes', valueAr: '\u0627\u0644\u0636\u0631\u064a\u0628\u0629 \u0648\u0627\u0644\u062a\u0648\u0635\u064a\u0644', valueEn: 'VAT and delivery' },
    ],
    inStock: true,
    isPublished: true,
    rating: 0,
    reviews: 0,
    imageType: 'offer',
    imageFit: 'balanced',
    catalogOrder: 2,
  },
];

const rawProducts: Product[] = [
  ...offerProducts,
  ...productSeeds.map((seed) => makeProduct({ ...seed, order: seed.order + offerProducts.length })),
];

export const products: Product[] = rawProducts.map(cleanProduct);

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
    name: fixMojibake(brand.en),
    nameAr: fixMojibake(brand.ar),
    logo: firstDefined(brandProducts.map((product) => product.image)),
  });

  return collection;
}, []);

const rawCatalogGroups: CatalogGroupDefinition[] = [
  {
    id: '200ml',
    slug: '200-ml',
    path: '/products/200-ml',
    nameAr: 'Ù…Ù†ØªØ¬Ø§Øª 200 Ù…Ù„',
    nameEn: '200ml Products',
    shortAr: '200 Ù…Ù„',
    shortEn: '200ml',
    descriptionAr: 'Ø¹Ø¨ÙˆØ§Øª 200 Ù…Ù„ Ù…Ù† Ù…Ù„Ù Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯ØŒ Ù…Ø¹ Ø§Ù„Ø£Ø³Ù…Ø§Ø¡ ÙˆØ§Ù„ØµÙˆØ± Ø§Ù„Ù…Ø·Ø§Ø¨Ù‚Ø© Ø§Ù„Ù…ØªØ§Ø­Ø© ÙÙ‚Ø·.',
    descriptionEn: 'All 200ml packs from the refreshed product source with matched names and approved visuals only.',
    count: products.filter((product) => product.catalogGroup === '200ml').length,
  },
  {
    id: '330ml',
    slug: '330-ml',
    path: '/products/330-ml',
    nameAr: 'Ù…Ù†ØªØ¬Ø§Øª 330 Ù…Ù„',
    nameEn: '330ml Products',
    shortAr: '330 Ù…Ù„',
    shortEn: '330ml',
    descriptionAr: 'Ø¹Ø¨ÙˆØ§Øª 330 Ù…Ù„ Ù…Ø±ØªØ¨Ø© Ø­Ø³Ø¨ Ù…Ù„Ù Ø§Ù„Ø¥ÙƒØ³Ù„ Ù†ÙØ³Ù‡ØŒ Ù…Ø¹ ÙØµÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„ØªÙŠ ØªØ­ØªØ§Ø¬ ØªØ³Ø¹ÙŠØ±Ø§Ù‹ Ù…Ø¨Ø§Ø´Ø±Ø§Ù‹.',
    descriptionEn: 'All 330ml packs in spreadsheet order, including quote-only products when pricing is not confirmed.',
    count: products.filter((product) => product.catalogGroup === '330ml').length,
  },
  {
    id: 'over-330ml',
    slug: 'over-330-ml',
    path: '/products/over-330-ml',
    nameAr: 'Ù…Ù†ØªØ¬Ø§Øª Ø£ÙƒØ¨Ø± Ù…Ù† 330 Ù…Ù„',
    nameEn: 'Products Above 330ml',
    shortAr: 'Ø£ÙƒØ¨Ø± Ù…Ù† 330 Ù…Ù„',
    shortEn: 'Above 330ml',
    descriptionAr: 'Ø£Ø­Ø¬Ø§Ù… 500 Ùˆ600 Ù…Ù„ Ùˆ1.5 Ù„ØªØ± Ø¯Ø§Ø®Ù„ ØµÙØ­Ø© Ù…Ø³ØªÙ‚Ù„Ø© Ø£ÙˆØ¶Ø­ Ù„Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„ ÙˆØ§Ù„ØªÙ†Ù‚Ù„ Ø§Ù„Ø³Ø±ÙŠØ¹.',
    descriptionEn: '500ml, 600ml, and 1.5L products in a dedicated page built for mobile-first browsing.',
    count: products.filter((product) => product.catalogGroup === 'over-330ml').length,
  },
];

export const catalogGroups: CatalogGroupDefinition[] = rawCatalogGroups.map((group) => ({
  ...group,
  nameAr: fixMojibake(group.nameAr),
  nameEn: fixMojibake(group.nameEn),
  shortAr: fixMojibake(group.shortAr),
  shortEn: fixMojibake(group.shortEn),
  descriptionAr: fixMojibake(group.descriptionAr),
  descriptionEn: fixMojibake(group.descriptionEn),
}));

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

function getUnitLabel(product: Product, isRTL: boolean) {
  if (product.category === 'glass') {
    return isRTL ? 'Ø²Ø¬Ø§Ø¬Ø©' : 'glass bottles';
  }

  if (product.category === 'gallon') {
    return isRTL ? 'Ø¬Ø§Ù„ÙˆÙ†' : 'gallons';
  }

  return isRTL ? 'Ø¹Ø¨ÙˆØ©' : 'bottles';
}

function getContainerLabel(product: Product, isRTL: boolean) {
  if (product.category === 'gallon') {
    return isRTL ? 'Ø¹Ø¨ÙˆØ© Ø¬Ø§Ù„ÙˆÙ† ÙƒØ¨ÙŠØ±Ø©' : 'large gallon pack';
  }

  if (product.category === 'glass') {
    return isRTL ? 'ÙƒØ±ØªÙˆÙ† Ø²Ø¬Ø§Ø¬' : 'glass bottle carton';
  }

  if (product.imageType === 'bottle') {
    return isRTL ? 'Ø¹Ø¨ÙˆØ© Ù…ÙŠØ§Ù‡ ÙØ±Ø¯ÙŠØ©' : 'single-bottle pack';
  }

  return isRTL ? 'ÙƒØ±ØªÙˆÙ† Ù…ÙŠØ§Ù‡' : 'water carton';
}

function getVolumeInMl(size: string) {
  const normalized = size.trim().toLowerCase();
  const value = Number.parseFloat(normalized.replace(/[^\d.]/g, ''));

  if (!Number.isFinite(value)) {
    return null;
  }

  if (normalized.includes('l')) {
    return value * 1000;
  }

  if (normalized.includes('Ù…Ù„')) {
    return value;
  }

  return normalized.includes('ml') ? value : null;
}

function formatTotalVolume(product: Product, isRTL: boolean) {
  const volumeInMl = getVolumeInMl(product.size);
  if (volumeInMl === null) {
    return null;
  }

  const totalLiters = (volumeInMl * product.quantity) / 1000;
  const formatted = Number.isInteger(totalLiters)
    ? totalLiters.toFixed(0)
    : totalLiters.toFixed(1).replace(/\.0$/, '');

  return isRTL ? `${formatted} Ù„ØªØ± ØªÙ‚Ø±ÙŠØ¨Ø§` : `about ${formatted} liters`;
}

function getUsageDetail(product: Product, isRTL: boolean) {
  if (product.category === 'gallon' || product.size === '5L' || product.size === '12L') {
    return isRTL
      ? 'Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¹Ø§Ø¦Ù„ÙŠØŒ Ø§Ù„Ù…ÙƒØ§ØªØ¨ØŒ ÙˆØ§Ù„Ø§Ø³ØªØ±Ø§Ø­Ø§Øª Ø§Ù„ØªÙŠ ØªØ­ØªØ§Ø¬ ÙƒÙ…ÙŠØ© Ø£ÙƒØ¨Ø± ÙÙŠ ÙƒÙ„ Ø·Ù„Ø¨.'
      : 'Suited for family use, offices, and locations that need more water per order.';
  }

  if (product.category === 'glass') {
    return isRTL
      ? 'Ø§Ø®ØªÙŠØ§Ø± Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø¶ÙŠØ§ÙØ© Ø§Ù„Ø±Ø³Ù…ÙŠØ©ØŒ ØºØ±Ù Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹Ø§ØªØŒ ÙˆØ§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„ØªÙŠ ØªØ­ØªØ§Ø¬ ØªÙ‚Ø¯ÙŠÙ… Ø£Ù†ÙŠÙ‚.'
      : 'A polished option for hospitality, meeting rooms, and occasions that need a refined presentation.';
  }

  if (product.size === '1.5L') {
    return isRTL
      ? 'Ø­Ø¬Ù… Ø¹Ù…Ù„ÙŠ Ù„Ù„Ù…Ù†Ø²Ù„ØŒ Ø§Ù„Ø±Ø­Ù„Ø§ØªØŒ ÙˆØ§Ù„ØªØ®Ø²ÙŠÙ† Ø§Ù„ÙŠÙˆÙ…ÙŠ Ù„Ø£Ù†Ù‡ ÙŠØ¹Ø·ÙŠ ÙƒÙ…ÙŠØ© Ø£ÙƒØ¨Ø± ÙÙŠ ÙƒÙ„ Ø²Ø¬Ø§Ø¬Ø©.'
      : 'A practical size for home use, trips, and daily storage because each bottle carries more water.';
  }

  if (product.size === '500ml' || product.size === '600ml' || product.size === '750ml') {
    return isRTL
      ? 'Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠ ÙˆØ§Ù„ØªÙ†Ù‚Ù„ ÙˆØ§Ù„Ø¹Ù…Ù„ØŒ Ø¨Ø­Ø¬Ù… ÙŠÙƒÙÙŠ Ù„ÙØªØ±Ø© Ø£Ø·ÙˆÙ„ Ù…Ù† Ø§Ù„Ø¹Ø¨ÙˆØ§Øª Ø§Ù„ØµØºÙŠØ±Ø©.'
      : 'Good for daily use, commuting, and work, with more water than the smaller bottle sizes.';
  }

  if (product.size === '330ml') {
    return isRTL
      ? 'Ø­Ø¬Ù… Ù…ØªÙˆØ§Ø²Ù† Ù„Ù„Ø¶ÙŠØ§ÙØ© ÙˆØ§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠØŒ Ø£Ø³Ù‡Ù„ ÙÙŠ Ø§Ù„Ø­Ù…Ù„ ÙˆÙŠÙ‚Ù„Ù„ Ø§Ù„Ù‡Ø¯Ø± Ù…Ù‚Ø§Ø±Ù†Ø© Ø¨Ø§Ù„Ø£Ø­Ø¬Ø§Ù… Ø§Ù„ÙƒØ¨ÙŠØ±Ø©.'
      : 'A balanced size for hospitality and daily use, easy to carry with less waste than larger bottles.';
  }

  return isRTL
    ? 'Ø­Ø¬Ù… ØµØºÙŠØ± Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø¶ÙŠØ§ÙØ©ØŒ Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹Ø§ØªØŒ Ø§Ù„ØªÙˆØ²ÙŠØ¹ØŒ ÙˆØ§Ù„Ù…Ø¯Ø§Ø±Ø³ Ù…Ø¹ Ø¹Ø¯Ø¯ Ø­Ø¨Ø§Øª Ø¹Ù…Ù„ÙŠ Ø¯Ø§Ø®Ù„ Ø§Ù„ÙƒØ±ØªÙˆÙ†.'
    : 'A small size for hospitality, meetings, distribution, and schools with a practical carton count.';
}

export function getProductPackageDetails(product: Product, isRTL: boolean) {
  if (product.id === 'offer-nova-330-15-plus-5') {
    return isRTL
      ? [
          'Ù…ÙŠØ§Ù‡ Ù†ÙˆÙØ§ ØªØ£ØªÙŠ Ù…Ù† Ø¢Ø¨Ø§Ø± ÙˆØ§Ø¯ÙŠ Ø³Ø¹Ø¯ØŒ Ø£Ø­Ø¯ Ø£Ø´Ù‡Ø± Ø§Ù„Ù…ØµØ§Ø¯Ø± Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ© Ù„Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ù†Ù‚ÙŠØ© ÙÙŠ Ø§Ù„Ù…Ù…Ù„ÙƒØ©.',
          'ØªØ±ÙƒÙŠØ¨Ø© Ù…ØªÙˆØ§Ø²Ù†Ø© ÙˆØ·Ø¹Ù… Ù†Ù‚ÙŠ ÙŠÙ†Ø¹Ø´ ÙŠÙˆÙ…Ùƒ Ù…Ø¹ ÙƒÙ„ Ø±Ø´ÙØ©.',
          'Ø§Ù„Ù…Ù‚Ø§Ø³: 330 Ù…Ù„ØŒ ÙˆØ§Ù„ÙƒÙ…ÙŠØ© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ©: 20 ÙƒØ±ØªÙˆÙ† Ø¶Ù…Ù† Ø¹Ø±Ø¶ 15 + 5 Ù…Ø¬Ø§Ù†Ø§.',
          'Ø§Ù„Ø³Ø¹Ø± 350 Ø±ÙŠØ§Ù„ ÙÙ‚Ø· Ø´Ø§Ù…Ù„ Ø§Ù„ØªÙˆØµÙŠÙ„ Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶.',
          'Ø§Ø®ØªÙŠØ§Ø± Ù…Ø«Ø§Ù„ÙŠ Ù„Ù„Ù…Ù†Ø²Ù„ØŒ Ø§Ù„Ù…ÙƒØ§ØªØ¨ØŒ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§ØªØŒ ÙˆØ§Ù„Ø¶ÙŠØ§ÙØ© Ø§Ù„Ø±Ø§Ù‚ÙŠØ©.',
        ]
      : [
          'Nova water comes from Wadi Saad wells, one of the well-known natural sources of pure water in Saudi Arabia.',
          'Balanced composition with a clean taste that refreshes your day with every sip.',
          'Size: 330ml, total quantity: 20 cartons in a 15 + 5 free offer.',
          'SAR 350 only, including free delivery in Riyadh.',
          'Ideal for homes, offices, events, and premium hospitality.',
        ];
  }

  if (product.id === 'offer-fly-15-plus-5') {
    return isRTL
      ? [
          'Ø§Ø´ØªØ± 15 ÙƒØ±ØªÙˆÙ† Ù…ÙŠØ§Ù‡ ÙÙ„Ø§ÙŠ ÙˆØ§Ø­ØµÙ„ Ø¹Ù„Ù‰ 5 ÙƒØ±Ø§ØªÙŠÙ† Ù…Ø¬Ø§Ù†Ø§.',
          'Ù…ØªÙˆÙØ± Ø¨Ù…Ù‚Ø§Ø³ 200 Ù…Ù„ Ø¨Ø¹Ø¯Ø¯ 48 Ø¹Ø¨ÙˆØ© Ù„Ù„ÙƒØ±ØªÙˆÙ† Ø£Ùˆ 330 Ù…Ù„ Ø¨Ø¹Ø¯Ø¯ 40 Ø¹Ø¨ÙˆØ© Ù„Ù„ÙƒØ±ØªÙˆÙ†.',
          'Ø§Ù„Ø³Ø¹Ø± 195 Ø±ÙŠØ§Ù„ ÙÙ‚Ø· Ø´Ø§Ù…Ù„ Ø§Ù„Ø¶Ø±ÙŠØ¨Ø© ÙˆØ§Ù„ØªÙˆØµÙŠÙ„ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶.',
          'Ù…ÙŠØ§Ù‡ Ø´Ø±Ø¨ Ù†Ù‚ÙŠØ© Ù…Ø¹ ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ ÙˆØ¹Ø±ÙˆØ¶ Ù…Ø³ØªÙ…Ø±Ø©.',
          'Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† ÙˆØ§Ø³ØªÙØ¯ Ù…Ù† Ø§Ù„Ø¹Ø±Ø¶ Ù‚Ø¨Ù„ Ø§Ù†ØªÙ‡Ø§Ø¦Ù‡.',
        ]
      : [
          'Buy 15 Fly Water cartons and get 5 cartons free.',
          'Available as 200ml with 48 bottles per carton or 330ml with 40 bottles per carton.',
          'SAR 195 only, including VAT and delivery in Riyadh.',
          'Pure drinking water with fast delivery and ongoing offers.',
          'Order now and use the offer before it ends.',
        ];
  }

  if (product.category === 'offer' && product.features.length > 0) {
    return product.features;
  }

  const unitLabel = getUnitLabel(product, isRTL);
  const containerLabel = getContainerLabel(product, isRTL);
  const totalVolume = formatTotalVolume(product, isRTL);
  const packaging = product.specifications.packaging || `${product.size} x${product.quantity}`;
  const details = [
    isRTL
      ? `ØªØ­ØªÙˆÙŠ Ø§Ù„Ø¹Ø¨ÙˆØ© Ø¹Ù„Ù‰ ${product.quantity} ${unitLabel} Ù…Ù† ${product.brandAr}ØŒ Ø­Ø¬Ù… ÙƒÙ„ ÙˆØ§Ø­Ø¯Ø© ${product.size}.`
      : `The pack contains ${product.quantity} ${unitLabel} from ${product.brand}, with ${product.size} in each unit.`,
    isRTL
      ? `Ø§Ù„ØªØºÙ„ÙŠÙ Ø¹Ø¨Ø§Ø±Ø© Ø¹Ù† ${containerLabel} Ù…Ø±ØªØ¨ ÙˆØ³Ù‡Ù„ Ø§Ù„ØªØ®Ø²ÙŠÙ† ÙˆØ§Ù„Ù†Ù‚Ù„.`
      : `Packaging comes as a tidy ${containerLabel} that is easy to store and move.`,
    getUsageDetail(product, isRTL),
    isRTL
      ? `Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¹Ø¨ÙˆØ©: ${packaging}.`
      : `Pack specification: ${packaging}.`,
  ];

  if (totalVolume) {
    details.splice(
      1,
      0,
      isRTL
        ? `Ø¥Ø¬Ù…Ø§Ù„ÙŠ ÙƒÙ…ÙŠØ© Ø§Ù„Ù…ÙŠØ§Ù‡ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø¹Ø¨ÙˆØ© ${totalVolume}.`
        : `Total water volume in the pack is ${totalVolume}.`,
    );
  }

  details.push(
    product.pricingMode === 'quote'
      ? isRTL
        ? 'Ø§Ù„Ø³Ø¹Ø± ÙŠØªÙ… ØªØ£ÙƒÙŠØ¯Ù‡ Ø­Ø³Ø¨ Ø§Ù„ØªÙˆÙØ± ÙˆØ§Ù„ÙƒÙ…ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨ Ù‚Ø¨Ù„ Ø§Ù„Ø·Ù„Ø¨.'
        : 'Price is confirmed by availability and requested quantity on WhatsApp before ordering.'
      : isRTL
        ? 'Ø§Ù„Ù…Ù†ØªØ¬ Ù‚Ø§Ø¨Ù„ Ù„Ù„Ø¥Ø¶Ø§ÙØ© Ù„Ù„Ø³Ù„Ø© Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…ÙˆØ¶Ø­ ÙÙŠ ØµÙØ­Ø© Ø§Ù„Ù…Ù†ØªØ¬.'
        : 'This product can be added to the cart directly at the price shown on the product page.',
  );

  return details;
}

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



