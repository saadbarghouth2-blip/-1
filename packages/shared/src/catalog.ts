import {
  brands as rawBrands,
  categories,
  getProductById as rawGetProductById,
  getProductsByBrand as rawGetProductsByBrand,
  getProductsByCategory as rawGetProductsByCategory,
  getRelatedProducts as rawGetRelatedProducts,
  products as rawProducts,
  searchProducts as rawSearchProducts,
} from '../../../src/data/products';
import type { BrandSummary, Product as RawProduct } from '../../../src/data/products';

export type Product = RawProduct & { price: number };

export const products = rawProducts as Product[];
export const brands = rawBrands as BrandSummary[];

export { categories };

export const getProductById = (id: string) => rawGetProductById(id) as Product | undefined;

export const getProductsByBrand = (brand: string) => rawGetProductsByBrand(brand) as Product[];

export const getProductsByCategory = (category: string) =>
  rawGetProductsByCategory(category) as Product[];

export const getRelatedProducts = (productId: string, limit?: number) =>
  rawGetRelatedProducts(productId, limit) as Product[];

export const searchProducts = (query: string) => rawSearchProducts(query) as Product[];
