import { create } from 'zustand';

// ─── Tier system (exact copy of Flutter TierUtils) ───
const TIERS = [
  { name: 'Любитель', nameKey: 'tier_iron', image: 'coffee_bean', min: 0, max: 100, cb: 3 },
  { name: 'Ценитель', nameKey: 'tier_gold', image: 'coffee_leaf', min: 100, max: 500, cb: 5 },
  { name: 'Знаток', nameKey: 'tier_sapphire', image: 'golden_bean', min: 500, max: 1000, cb: 7 },
  { name: 'Гурман', nameKey: 'tier_diamond', image: 'diamond_bean', min: 1000, max: 9999999, cb: 10 },
];

export function getTierForVisits(visits: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (visits >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTierForVisits(visits: number) {
  for (let i = 0; i < TIERS.length; i++) {
    if (visits < TIERS[i].max) {
      return i + 1 < TIERS.length ? TIERS[i + 1] : null;
    }
  }
  return null;
}

interface ProfileState {
  name: string;
  phone: string;
  points: number;
  visits: number;
  loyaltyNumber: string;
}

export const useProfileStore = create<ProfileState>(() => ({
  name: 'Даниэль',
  phone: '+996 555 123 456',
  points: 30,
  visits: 45,
  loyaltyNumber: '000000',
}));
