export const MIN_DELIVERY_CARTONS = 10;
export const FREE_DELIVERY_CARTONS = 20;
export const STANDARD_DELIVERY_FEE = 20;

export function getDeliveryFee(totalCartons: number) {
  if (totalCartons >= FREE_DELIVERY_CARTONS) {
    return 0;
  }

  return STANDARD_DELIVERY_FEE;
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
