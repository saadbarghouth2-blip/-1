import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  catalogGroups as baseCatalogGroups,
  getBrandEntryPrice,
  hasFixedPrice,
  productSizeOptions,
  products as fallbackProducts,
  type BrandSummary,
  type CatalogGroupDefinition,
  type CatalogGroupId,
  type Product,
  type ProductSize,
  type ProductSizeOption,
} from '../../data/products';
import { isSupabaseConfigured } from '../../lib/supabase';
import { listPublishedProducts } from '../../services/productAdmin';

type ProductCatalogContextValue = {
  products: Product[];
  brands: BrandSummary[];
  catalogGroups: CatalogGroupDefinition[];
  isLoading: boolean;
  isFallback: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByBrand: (brand: string) => Product[];
  getCatalogProductsByGroup: (group: CatalogGroupId) => Product[];
  getProductSizeOptionsByGroup: (group: CatalogGroupId) => Array<ProductSizeOption & { count: number }>;
  searchProducts: (query: string) => Product[];
  getRelatedProducts: (productId: string, limit?: number) => Product[];
  getCatalogGroupBySlug: (slug: string) => CatalogGroupDefinition | undefined;
  getCatalogGroupById: (groupId: CatalogGroupId) => CatalogGroupDefinition | undefined;
};

const ProductCatalogContext = createContext<ProductCatalogContextValue | undefined>(undefined);

function firstDefined<T>(values: Array<T | undefined>) {
  return values.find((value) => value !== undefined);
}

function buildBrands(products: Product[]) {
  const byBrand = new Map<string, Product[]>();
  products.forEach((product) => {
    const collection = byBrand.get(product.brandId) ?? [];
    collection.push(product);
    byBrand.set(product.brandId, collection);
  });

  return Array.from(byBrand.entries())
    .map(([id, brandProducts]) => {
      const firstProduct = brandProducts[0];
      return {
        id,
        name: firstProduct.brand,
        nameAr: firstProduct.brandAr,
        logo: firstDefined(brandProducts.map((product) => product.image)),
      } satisfies BrandSummary;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function buildCatalogGroups(products: Product[]) {
  return baseCatalogGroups.map((group) => ({
    ...group,
    count: products.filter((product) => product.catalogGroup === group.id).length,
  }));
}

function getCatalogGroupIdForSize(size: ProductSize): CatalogGroupId {
  if (size === '200ml') {
    return '200ml';
  }

  if (size === '330ml') {
    return '330ml';
  }

  return 'over-330ml';
}

function normalizeProducts(products: Product[]) {
  return products.slice().sort((left, right) => left.catalogOrder - right.catalogOrder);
}

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured());
  const [isFallback, setIsFallback] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setProducts(fallbackProducts);
      setIsFallback(true);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const remoteProducts = await listPublishedProducts();
      if (remoteProducts.length === 0) {
        setProducts(fallbackProducts);
        setIsFallback(true);
        setError(null);
        return;
      }

      setProducts(normalizeProducts(remoteProducts));
      setIsFallback(false);
      setError(null);
    } catch (nextError) {
      setProducts(fallbackProducts);
      setIsFallback(true);
      setError(nextError instanceof Error ? nextError.message : 'Unable to load products.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const value = useMemo<ProductCatalogContextValue>(() => {
    const brands = buildBrands(products);
    const catalogGroups = buildCatalogGroups(products);

    const getProductById = (id: string) => products.find((product) => product.id === id);
    const getProductsByBrand = (brand: string) => {
      const normalized = brand.trim().toLowerCase();
      return products.filter((product) => (
        product.brand.toLowerCase() === normalized || product.brandId === normalized
      ));
    };
    const getCatalogProductsByGroup = (group: CatalogGroupId) =>
      products.filter((product) => product.catalogGroup === group);
    const getProductSizeOptionsByGroup = (group: CatalogGroupId) =>
      productSizeOptions.reduce<Array<ProductSizeOption & { count: number }>>((collection, option) => {
        const count = products.filter((product) => (
          product.catalogGroup === group && product.size === option.id
        )).length;

        if (count > 0) {
          collection.push({ ...option, count });
        }

        return collection;
      }, []);
    const searchProducts = (query: string) => {
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
    const getRelatedProducts = (productId: string, limit = 4) => {
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

    return {
      products,
      brands,
      catalogGroups,
      isLoading,
      isFallback,
      error,
      refreshProducts,
      getProductById,
      getProductsByBrand,
      getCatalogProductsByGroup,
      getProductSizeOptionsByGroup,
      searchProducts,
      getRelatedProducts,
      getCatalogGroupBySlug: (slug) => catalogGroups.find((group) => group.slug === slug),
      getCatalogGroupById: (groupId) => catalogGroups.find((group) => group.id === groupId),
    };
  }, [error, isFallback, isLoading, products, refreshProducts]);

  return (
    <ProductCatalogContext.Provider value={value}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    throw new Error('useProductCatalog must be used within ProductCatalogProvider.');
  }

  return context;
}

export { getBrandEntryPrice, getCatalogGroupIdForSize, hasFixedPrice, productSizeOptions };
