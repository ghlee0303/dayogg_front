export interface TierData {
  name: string
  imgSrc: string
  startMmr: number
  endMmr: number
}

export const tierDataMap = new Map<string, TierData>([
  ['Bronze', { name: 'Bronze', imgSrc: '/assets/tiers/bronze.png', startMmr: 0, endMmr: 999 }],
  ['Silver', { name: 'Silver', imgSrc: '/assets/tiers/silver.png', startMmr: 1000, endMmr: 1999 }],
  ['Gold', { name: 'Gold', imgSrc: '/assets/tiers/gold.png', startMmr: 2000, endMmr: 2999 }],
]);