import type { Product } from '../data/products';
import {
  catalogGroups,
  getProductPackageDetails,
  productSizeOptions,
  products as fallbackProducts,
  type CatalogGroupId,
} from '../data/products';
import { getSupabaseClient, getSupabaseConfigError, isSupabaseConfigured } from '../lib/supabase';

export const PRODUCT_ADMIN_EMAIL = 'saadsaad50begiseralex6@gmail.com';
export const PRODUCT_IMAGE_BUCKET = 'product-images';

export type ProductRow = {
  id: string;
  brand_id: string;
  brand_en: string;
  brand_ar: string;
  name_en: string;
  name_ar: string;
  category: Product['category'];
  catalog_group: CatalogGroupId;
  size: string;
  quantity: number;
  price: number | null;
  original_price: number | null;
  pricing_mode: Product['pricingMode'];
  is_purchasable: boolean;
  image_url: string | null;
  description_en: string;
  description_ar: string;
  in_stock: boolean;
  is_published: boolean;
  catalog_order: number;
  image_type: Product['imageType'] | null;
  image_fit: Product['imageFit'] | null;
  created_at?: string;
  updated_at?: string;
};

export type ProductInput = {
  id: string;
  brandId: string;
  brand: string;
  brandAr: string;
  nameEn: string;
  nameAr: string;
  category: Product['category'];
  catalogGroup: CatalogGroupId;
  size: string;
  quantity: number;
  price?: number | null;
  originalPrice?: number | null;
  pricingMode: Product['pricingMode'];
  image?: string | null;
  descriptionEn: string;
  descriptionAr: string;
  inStock: boolean;
  isPublished: boolean;
  catalogOrder: number;
  imageType?: Product['imageType'];
  imageFit?: Product['imageFit'];
};

function getClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseConfigError());
  }

  return getSupabaseClient();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toProduct(row: ProductRow): Product {
  const product: Product = {
    id: row.id,
    brandId: row.brand_id,
    name: {
      ar: row.name_ar,
      en: row.name_en,
    },
    brand: row.brand_en,
    brandAr: row.brand_ar,
    category: row.category,
    catalogGroup: row.catalog_group,
    size: row.size,
    quantity: row.quantity,
    ...(typeof row.price === 'number' ? { price: row.price } : {}),
    ...(typeof row.original_price === 'number' ? { originalPrice: row.original_price } : {}),
    pricingMode: row.pricing_mode,
    isPurchasable: row.pricing_mode === 'fixed' && typeof row.price === 'number' && row.is_purchasable,
    ...(row.image_url ? { image: row.image_url } : {}),
    description: {
      ar: row.description_ar,
      en: row.description_en,
    },
    features: [],
    benefits: [],
    specifications: {
      packaging: `${row.size} x${row.quantity}`,
    },
    quickFacts: [
      { labelAr: 'العلامة', labelEn: 'Brand', valueAr: row.brand_ar, valueEn: row.brand_en },
      { labelAr: 'الحجم', labelEn: 'Size', valueAr: row.size, valueEn: row.size },
      { labelAr: 'العدد', labelEn: 'Units', valueAr: `${row.quantity}`, valueEn: `${row.quantity}` },
    ],
    inStock: row.in_stock,
    isPublished: row.is_published,
    rating: 0,
    reviews: 0,
    imageType: row.image_type ?? 'case',
    imageFit: row.image_fit ?? (row.size === '1.5L' ? 'tight' : 'balanced'),
    catalogOrder: row.catalog_order,
  };

  const packageDetails = getProductPackageDetails(product, true);

  return {
    ...product,
    features: packageDetails,
    benefits: packageDetails.slice(0, 4),
  };
}

function toRow(input: ProductInput): Omit<ProductRow, 'created_at' | 'updated_at'> {
  return {
    id: input.id || slugify(`${input.brand}-${input.size}-${input.quantity}`),
    brand_id: input.brandId || slugify(input.brand),
    brand_en: input.brand,
    brand_ar: input.brandAr,
    name_en: input.nameEn,
    name_ar: input.nameAr,
    category: input.category,
    catalog_group: input.catalogGroup,
    size: input.size,
    quantity: input.quantity,
    price: input.pricingMode === 'fixed' ? input.price ?? null : null,
    original_price: input.pricingMode === 'fixed' ? input.originalPrice ?? null : null,
    pricing_mode: input.pricingMode,
    is_purchasable: input.pricingMode === 'fixed' && typeof input.price === 'number',
    image_url: input.image || null,
    description_en: input.descriptionEn,
    description_ar: input.descriptionAr,
    in_stock: input.inStock,
    is_published: input.isPublished,
    catalog_order: input.catalogOrder,
    image_type: input.imageType ?? 'case',
    image_fit: input.imageFit ?? 'balanced',
  };
}

export function makeProductInputFromProduct(product: Product): ProductInput {
  return {
    id: product.id,
    brandId: product.brandId,
    brand: product.brand,
    brandAr: product.brandAr,
    nameEn: product.name.en,
    nameAr: product.name.ar,
    category: product.category,
    catalogGroup: product.catalogGroup,
    size: product.size,
    quantity: product.quantity,
    price: product.price ?? null,
    originalPrice: product.originalPrice ?? null,
    pricingMode: product.pricingMode,
    image: product.image ?? null,
    descriptionEn: product.description.en,
    descriptionAr: product.description.ar,
    inStock: product.inStock,
    isPublished: product.isPublished ?? true,
    catalogOrder: product.catalogOrder,
    imageType: product.imageType,
    imageFit: product.imageFit,
  };
}

export function getBlankProductInput(): ProductInput {
  const nextOrder = Math.max(...fallbackProducts.map((product) => product.catalogOrder), 0) + 1;

  return {
    id: '',
    brandId: '',
    brand: '',
    brandAr: '',
    nameEn: '',
    nameAr: '',
    category: 'small',
    catalogGroup: '200ml',
    size: productSizeOptions[0]?.id ?? '200ml',
    quantity: 24,
    price: null,
    originalPrice: null,
    pricingMode: 'fixed',
    image: null,
    descriptionEn: '',
    descriptionAr: '',
    inStock: true,
    isPublished: true,
    catalogOrder: nextOrder,
    imageType: 'case',
    imageFit: 'balanced',
  };
}

export async function listPublishedProducts() {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('catalog_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toProduct(row as ProductRow));
}

export async function listAdminProducts() {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .select('*')
    .order('catalog_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toProduct(row as ProductRow));
}

export async function createProduct(input: ProductInput) {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .insert(toRow(input))
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return toProduct(data as ProductRow);
}

export async function updateProduct(id: string, input: ProductInput) {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .update(toRow(input))
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return toProduct(data as ProductRow);
}

export async function deleteProduct(id: string) {
  const client = getClient();
  const { error } = await client.from('products').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function uploadProductImage(file: File, productId: string) {
  const client = getClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeProductId = slugify(productId || 'product');
  const path = `${safeProductId}/${Date.now()}.${extension}`;

  const { error } = await client.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function isCurrentUserProductAdmin(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== PRODUCT_ADMIN_EMAIL) {
    return false;
  }

  const client = getClient();
  const { data, error } = await client
    .from('product_admins')
    .select('email')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export function getCatalogGroupIdForAdminSize(size: string): CatalogGroupId {
  if (size === '200ml') {
    return '200ml';
  }

  if (size === '330ml') {
    return '330ml';
  }

  return 'over-330ml';
}

export { catalogGroups };
