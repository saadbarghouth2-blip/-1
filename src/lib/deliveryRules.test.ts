import { describe, expect, it } from 'vitest';
import { STANDARD_DELIVERY_FEE, getDeliveryRuleState } from './deliveryRules';

describe('offer delivery override', () => {
  it('keeps the minimum-carton rule while making base delivery free', () => {
    const state = getDeliveryRuleState(5, true);

    expect(state.canDeliver).toBe(false);
    expect(state.hasFreeDelivery).toBe(true);
    expect(state.deliveryFee).toBe(0);
  });

  it('does not change ordinary product delivery fees', () => {
    const state = getDeliveryRuleState(10, false);

    expect(state.canDeliver).toBe(true);
    expect(state.hasFreeDelivery).toBe(false);
    expect(state.deliveryFee).toBe(STANDARD_DELIVERY_FEE);
  });

  it('makes a mixed eligible cart free when it contains an offer', () => {
    const state = getDeliveryRuleState(12, true);

    expect(state.canDeliver).toBe(true);
    expect(state.hasFreeDelivery).toBe(true);
    expect(state.deliveryFee).toBe(0);
  });
});
