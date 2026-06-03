export const MIN_DELIVERY_CARTONS = 10;
export const FREE_DELIVERY_CARTONS = 20;
export const STANDARD_DELIVERY_FEE = 20;
export const SERVICE_CITY_AR = 'الرياض';
export const SERVICE_CITY_EN = 'Riyadh';
export const DELIVERY_WINDOW_AR = '8:00 صباحا حتى 8:00 مساء';
export const DELIVERY_WINDOW_EN = '8:00 AM to 8:00 PM';

export type DeliveryFloorLevel = 'ground' | 'first' | 'second' | 'higher';

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

export function getDeliveryFee(totalCartons: number) {
  if (totalCartons >= FREE_DELIVERY_CARTONS) {
    return 0;
  }

  return STANDARD_DELIVERY_FEE;
}

export function getFloorDeliveryFee(floorLevel: DeliveryFloorLevel) {
  const option = DELIVERY_FLOOR_OPTIONS.find((item) => item.id === floorLevel);
  return option?.fee ?? 0;
}

export function requiresFloorFeeAgreement(floorLevel: DeliveryFloorLevel) {
  return floorLevel === 'higher';
}

export function getDeliveryPolicySummary(isRTL: boolean) {
  return isRTL
    ? [
        `الحد الأدنى للطلب ${MIN_DELIVERY_CARTONS} كراتين.`,
        `رسوم التوصيل ${STANDARD_DELIVERY_FEE} ريال للطلبات الأقل من ${FREE_DELIVERY_CARTONS} كرتون.`,
        `التوصيل مجاني عند طلب ${FREE_DELIVERY_CARTONS} كرتون أو أكثر.`,
        'التوصيل حتى الدور الأرضي بدون رسوم إضافية، والدور الأول 10 ريالات، والدور الثاني 20 ريالا.',
        'للأدوار الأعلى يتم الاتفاق على الرسوم حسب حالة الموقع قبل تأكيد الطلب.',
        `يجب تسجيل الطلب قبل موعد التوصيل بيوم واحد على الأقل، والتوصيل خلال ساعات العمل من ${DELIVERY_WINDOW_AR}.`,
        `الخدمة متاحة لجميع أحياء مدينة ${SERVICE_CITY_AR} وفق المواعيد المتاحة وجدول التشغيل.`,
      ]
    : [
        `Minimum order is ${MIN_DELIVERY_CARTONS} cartons.`,
        `Delivery fee is ${STANDARD_DELIVERY_FEE} SAR for orders below ${FREE_DELIVERY_CARTONS} cartons.`,
        `Delivery is free from ${FREE_DELIVERY_CARTONS} cartons or more.`,
        'Delivery to the ground floor has no extra fee; first floor is 10 SAR, second floor is 20 SAR.',
        'Higher floors are quoted according to site conditions before confirming the order.',
        `Orders should be placed at least one day before delivery. Delivery runs during working hours from ${DELIVERY_WINDOW_EN}.`,
        `Service covers all ${SERVICE_CITY_EN} districts according to available slots and the operating schedule.`,
      ];
}

export function getDeliveryRuleState(totalCartons: number) {
  const cartonsToMinimum = Math.max(MIN_DELIVERY_CARTONS - totalCartons, 0);
  const cartonsToFreeDelivery = Math.max(FREE_DELIVERY_CARTONS - totalCartons, 0);

  return {
    canDeliver: totalCartons >= MIN_DELIVERY_CARTONS,
    hasFreeDelivery: totalCartons >= FREE_DELIVERY_CARTONS,
    cartonsToMinimum,
    cartonsToFreeDelivery,
    deliveryFee: getDeliveryFee(totalCartons),
  };
}
