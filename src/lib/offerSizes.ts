export type OfferWaterSize = '200ml' | '330ml';

export function getDefaultOfferSize(size: string): OfferWaterSize {
  return size.toLowerCase().includes('330') ? '330ml' : '200ml';
}
