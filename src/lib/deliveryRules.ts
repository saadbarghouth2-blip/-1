import { isOfferProduct, type Product } from '../data/products';

export const MIN_DELIVERY_CARTONS = 15;
export const FREE_DELIVERY_CARTONS = 20;
export const MIN_DELIVERY_BUNDLES = 20;
export const FREE_DELIVERY_BUNDLES = 35;
export const MIN_DELIVERY_GLASS_CARTONS = 10;
export const FREE_DELIVERY_GLASS_CARTONS = 15;
export const STANDARD_DELIVERY_FEE = 25;
export const SERVICE_CITY_AR = 'الرياض';
export const SERVICE_CITY_EN = 'Riyadh';
export const PENDING_CITY_AR = 'الدمام';
export const PENDING_CITY_EN = 'Dammam';
export const DELIVERY_DURATION_AR = 'من 24 إلى 48 ساعة';
export const DELIVERY_DURATION_EN = '24 to 48 hours';
export const DELIVERY_WINDOW_AR = '8:00 صباحًا حتى 8:00 مساءً';
export const DELIVERY_WINDOW_EN = '8:00 AM to 8:00 PM';

export type DeliveryFloorLevel = 'ground' | 'first' | 'second' | 'higher';
export type DeliveryCity = 'riyadh' | 'dammam';
export type DeliveryUnitKind = 'carton' | 'bundle' | 'glass';

export type DeliveryCartItem = { product: Product; quantity: number };

export type DeliveryQuantitySummary = {
  cartons: number;
  bundles: number;
  glassCartons: number;
  offerCartons: number;
  hasOffer: boolean;
};

type DeliveryRequirement = {
  kind: DeliveryUnitKind;
  quantity: number;
  minimum: number;
  freeMinimum: number;
};

export const DELIVERY_FLOOR_OPTIONS: Array<{
  id: DeliveryFloorLevel;
  labelAr: string;
  labelEn: string;
  fee: number | null;
}> = [
  { id: 'ground', labelAr: 'الدور الأرضي', labelEn: 'Ground floor', fee: 0 },
  { id: 'first', labelAr: 'الدور الأول', labelEn: 'First floor', fee: 10 },
  { id: 'second', labelAr: 'الدور الثاني', labelEn: 'Second floor', fee: 20 },
  { id: 'higher', labelAr: 'دور أعلى', labelEn: 'Higher floor', fee: null },
];

export const DELIVERY_CITY_OPTIONS: Array<{
  id: DeliveryCity;
  labelAr: string;
  labelEn: string;
  enabled: boolean;
}> = [
  { id: 'riyadh', labelAr: SERVICE_CITY_AR, labelEn: SERVICE_CITY_EN, enabled: true },
  { id: 'dammam', labelAr: PENDING_CITY_AR, labelEn: PENDING_CITY_EN, enabled: false },
];

function normalizeIdentity(product: Product) {
  return [product.id, product.brandId, product.brand, product.brandAr, product.name.ar, product.name.en]
    .join(' ')
    .toLocaleLowerCase();
}

export function isBundleProduct(product: Product) {
  const identity = normalizeIdentity(product);
  const isSupportedBrand = [
    'rafa-makkah', 'rafa makkah', 'رفا مكة', 'رفا مكه',
  ].some((marker) => identity.includes(marker));

  return isSupportedBrand && (
    (product.size === '250ml' && product.quantity === 24) ||
    (product.size === '330ml' && product.quantity === 20)
  );
}

export function summarizeDeliveryQuantities(items: DeliveryCartItem[]): DeliveryQuantitySummary {
  return items.reduce<DeliveryQuantitySummary>((summary, item) => {
    const itemQuantity = Math.max(item.quantity, 0);

    if (isOfferProduct(item.product)) {
      summary.hasOffer = true;
      summary.offerCartons += Math.max(item.product.quantity, 1) * itemQuantity;
    } else if (isBundleProduct(item.product)) {
      summary.bundles += itemQuantity;
    } else if (item.product.category === 'glass') {
      summary.glassCartons += itemQuantity;
    } else {
      summary.cartons += itemQuantity;
    }

    return summary;
  }, { cartons: 0, bundles: 0, glassCartons: 0, offerCartons: 0, hasOffer: false });
}

function buildRequirements(summary: DeliveryQuantitySummary): DeliveryRequirement[] {
  const requirements: DeliveryRequirement[] = [];
  if (summary.cartons > 0) requirements.push({ kind: 'carton', quantity: summary.cartons, minimum: MIN_DELIVERY_CARTONS, freeMinimum: FREE_DELIVERY_CARTONS });
  if (summary.bundles > 0) requirements.push({ kind: 'bundle', quantity: summary.bundles, minimum: MIN_DELIVERY_BUNDLES, freeMinimum: FREE_DELIVERY_BUNDLES });
  if (summary.glassCartons > 0) requirements.push({ kind: 'glass', quantity: summary.glassCartons, minimum: MIN_DELIVERY_GLASS_CARTONS, freeMinimum: FREE_DELIVERY_GLASS_CARTONS });
  return requirements;
}

function unitLabel(kind: DeliveryUnitKind, quantity: number, isRTL: boolean) {
  if (!isRTL) {
    if (kind === 'bundle') return quantity === 1 ? 'bundle' : 'bundles';
    if (kind === 'glass') return quantity === 1 ? 'glass carton' : 'glass cartons';
    return quantity === 1 ? 'carton' : 'cartons';
  }
  if (kind === 'bundle') return quantity === 1 ? 'ربطة' : 'ربطات';
  if (kind === 'glass') return quantity === 1 ? 'كرتون زجاج' : 'كراتين زجاج';
  return quantity === 1 ? 'كرتونة' : 'كراتين';
}

function formatShortfalls(requirements: DeliveryRequirement[], threshold: 'minimum' | 'freeMinimum', isRTL: boolean) {
  return requirements
    .map((requirement) => ({ ...requirement, missing: Math.max(requirement[threshold] - requirement.quantity, 0) }))
    .filter((requirement) => requirement.missing > 0)
    .map((requirement) => `${requirement.missing} ${unitLabel(requirement.kind, requirement.missing, isRTL)}`)
    .join(isRTL ? ' و' : ' and ');
}

export function getCartDeliveryRuleState(items: DeliveryCartItem[]) {
  const summary = summarizeDeliveryQuantities(items);
  const requirements = buildRequirements(summary);
  const hasAnyQuantity = summary.hasOffer || requirements.length > 0;
  const canDeliver = summary.hasOffer || (hasAnyQuantity && requirements.every((item) => item.quantity >= item.minimum));
  const hasFreeDelivery = summary.hasOffer || (requirements.length > 0 && requirements.every((item) => item.quantity >= item.freeMinimum));
  const unitsToMinimum = requirements.reduce((sum, item) => sum + Math.max(item.minimum - item.quantity, 0), 0);
  const unitsToFreeDelivery = summary.hasOffer ? 0 : requirements.reduce((sum, item) => sum + Math.max(item.freeMinimum - item.quantity, 0), 0);
  const freeDeliveryProgress = summary.hasOffer
    ? 100
    : requirements.length === 0
      ? 0
      : Math.min(...requirements.map((item) => Math.min((item.quantity / item.freeMinimum) * 100, 100)));

  return {
    canDeliver,
    hasFreeDelivery,
    deliveryFee: hasFreeDelivery ? 0 : STANDARD_DELIVERY_FEE,
    unitsToMinimum,
    unitsToFreeDelivery,
    cartonsToMinimum: unitsToMinimum,
    cartonsToFreeDelivery: unitsToFreeDelivery,
    freeDeliveryProgress,
    summary,
    requirements,
    getMinimumShortfall: (isRTL: boolean) => formatShortfalls(requirements, 'minimum', isRTL),
    getFreeDeliveryShortfall: (isRTL: boolean) => formatShortfalls(requirements, 'freeMinimum', isRTL),
  };
}

export function getDeliveryFee(totalCartons: number, hasOffer = false) {
  return hasOffer || totalCartons >= FREE_DELIVERY_CARTONS ? 0 : STANDARD_DELIVERY_FEE;
}

export function getFloorDeliveryFee(floorLevel: DeliveryFloorLevel) {
  return DELIVERY_FLOOR_OPTIONS.find((item) => item.id === floorLevel)?.fee ?? 0;
}

export function requiresFloorFeeAgreement(floorLevel: DeliveryFloorLevel) {
  return floorLevel === 'higher';
}

export function getDeliveryPolicySummary(isRTL: boolean) {
  return isRTL
    ? [
        `الحد الأدنى للمياه العادية ${MIN_DELIVERY_CARTONS} كرتون، والتوصيل المجاني من ${FREE_DELIVERY_CARTONS} كرتون.`,
        `الحد الأدنى لربطات رفا مكة المحددة ${MIN_DELIVERY_BUNDLES} ربطة، والتوصيل المجاني من ${FREE_DELIVERY_BUNDLES} ربطة.`,
        `الحد الأدنى للمياه الزجاجية ${MIN_DELIVERY_GLASS_CARTONS} كراتين، والتوصيل المجاني من ${FREE_DELIVERY_GLASS_CARTONS} كرتون.`,
        `رسوم التوصيل داخل الرياض ${STANDARD_DELIVERY_FEE} ريال عند عدم بلوغ حد التوصيل المجاني.`,
        'جميع العروض تشمل توصيلًا مجانيًا داخل الرياض.',
        `مدة التوصيل المتوقعة داخل الرياض ${DELIVERY_DURATION_AR}.`,
        'التوصيل للأرضي بدون رسوم إضافية، والدور الأول 10 ريالات، والدور الثاني 20 ريالًا.',
        'للأدوار الأعلى يتم الاتفاق على الرسوم حسب حالة الموقع قبل تأكيد الطلب.',
        `التوصيل خلال ساعات العمل من ${DELIVERY_WINDOW_AR}.`,
        'الدمام مضافة كمنطقة قادمة، ولن يُقبل طلب توصيل إليها حتى اعتماد المنتجات المتاحة هناك.',
      ]
    : [
        `Regular water requires at least ${MIN_DELIVERY_CARTONS} cartons; free delivery starts at ${FREE_DELIVERY_CARTONS}.`,
        `The specified Rafa Makkah bundles require at least ${MIN_DELIVERY_BUNDLES} bundles; free delivery starts at ${FREE_DELIVERY_BUNDLES}.`,
        `Glass water requires at least ${MIN_DELIVERY_GLASS_CARTONS} cartons; free delivery starts at ${FREE_DELIVERY_GLASS_CARTONS}.`,
        `Delivery inside Riyadh costs ${STANDARD_DELIVERY_FEE} SAR when the free-delivery threshold is not met.`,
        'Every offer includes free delivery inside Riyadh.',
        `Expected delivery time inside Riyadh is ${DELIVERY_DURATION_EN}.`,
        'Ground-floor delivery has no extra fee; first floor is 10 SAR and second floor is 20 SAR.',
        'Higher floors are quoted according to site conditions before order confirmation.',
        `Delivery runs during working hours from ${DELIVERY_WINDOW_EN}.`,
        'Dammam is listed as an upcoming area and checkout remains disabled until its available products are approved.',
      ];
}

/** Backward-compatible helper for callers that only know a carton count. */
export function getDeliveryRuleState(totalCartons: number, hasOffer = false) {
  const cartonsToMinimum = Math.max(MIN_DELIVERY_CARTONS - totalCartons, 0);
  const cartonsToFreeDelivery = Math.max(FREE_DELIVERY_CARTONS - totalCartons, 0);
  return {
    canDeliver: hasOffer || totalCartons >= MIN_DELIVERY_CARTONS,
    hasFreeDelivery: hasOffer || totalCartons >= FREE_DELIVERY_CARTONS,
    cartonsToMinimum,
    cartonsToFreeDelivery,
    deliveryFee: getDeliveryFee(totalCartons, hasOffer),
  };
}
