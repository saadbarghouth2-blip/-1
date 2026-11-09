import { describe, expect, it } from 'vitest';
import type { Product } from '../data/products';
import {
  STANDARD_DELIVERY_FEE,
  getCartDeliveryRuleState,
  isBundleProduct,
} from './deliveryRules';

function product(overrides: Partial<Product>): Product {
  return {
    id: 'regular-water',
    brandId: 'regular',
    brand: 'Regular',
    brandAr: 'عادي',
    name: { ar: 'مياه عادية', en: 'Regular water' },
    category: 'small',
    catalogGroup: '200ml',
    size: '200ml',
    quantity: 48,
    price: 10,
    pricingMode: 'fixed',
    isPurchasable: true,
    description: { ar: '', en: '' },
    features: [],
    benefits: [],
    specifications: {},
    inStock: true,
    rating: 0,
    reviews: 0,
    catalogOrder: 1,
    ...overrides,
  };
}

describe('delivery rules by product type', () => {
  it('requires 15 regular cartons and charges 25 SAR until 20', () => {
    const regular = product({});

    expect(getCartDeliveryRuleState([{ product: regular, quantity: 14 }]).canDeliver).toBe(false);
    expect(getCartDeliveryRuleState([{ product: regular, quantity: 15 }]).deliveryFee).toBe(STANDARD_DELIVERY_FEE);
    expect(getCartDeliveryRuleState([{ product: regular, quantity: 20 }]).deliveryFee).toBe(0);
  });

  it('applies the 20/35 rule to the specified Makkah bundles', () => {
    const bundle = product({
      id: 'rafa-makkah-250-24',
      brandId: 'rafa-makkah',
      brand: 'Rafa Makkah',
      brandAr: 'رفا مكة',
      size: '250ml',
      quantity: 24,
    });

    expect(isBundleProduct(bundle)).toBe(true);
    expect(getCartDeliveryRuleState([{ product: bundle, quantity: 19 }]).canDeliver).toBe(false);
    expect(getCartDeliveryRuleState([{ product: bundle, quantity: 20 }]).deliveryFee).toBe(25);
    expect(getCartDeliveryRuleState([{ product: bundle, quantity: 35 }]).deliveryFee).toBe(0);
  });

  it('applies the 10/15 rule to glass cartons', () => {
    const glass = product({ category: 'glass', size: '750ml' });

    expect(getCartDeliveryRuleState([{ product: glass, quantity: 9 }]).canDeliver).toBe(false);
    expect(getCartDeliveryRuleState([{ product: glass, quantity: 10 }]).deliveryFee).toBe(25);
    expect(getCartDeliveryRuleState([{ product: glass, quantity: 15 }]).deliveryFee).toBe(0);
  });

  it('makes every offer deliverable with free delivery', () => {
    const offer = product({ id: 'offer-campaign', category: 'offer', imageType: 'offer', quantity: 20 });
    const state = getCartDeliveryRuleState([{ product: offer, quantity: 1 }]);

    expect(state.canDeliver).toBe(true);
    expect(state.hasFreeDelivery).toBe(true);
    expect(state.deliveryFee).toBe(0);
  });
});
