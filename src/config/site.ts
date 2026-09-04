import { ImportEligibility, MarketStatus } from '../types/database';

export const siteConfig = {
  name: "Varban Auto Flex",
  legalName: "Varban Auto Flex Technologies Ltd",
  tagline: "Find it. Buy it. Drive it.",
  secondaryTagline: "Kenya's smarter way to buy and sell quality vehicles.",
  description: "Browse verified vehicles, inspect with confidence, and reserve instantly from trusted car yards and private sellers across Kenya.",
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  ogImage: '/og-image.jpg',
  contact: {
    phone: "+254 780618608",
    whatsapp: "+254 780618608",
    email: "support@varban.co.ke",
    address: "Kenyatta Avenue, Nakuru, Kenya",
    hours: "Mon - Sat: 8:00 AM - 6:00 PM"
  },
  socials: {
    facebook: "https://facebook.com/varbanauto",
    twitter: "https://x.com/varbanauto",
    instagram: "https://instagram.com/varbanauto",
    linkedin: "https://linkedin.com/company/varbanauto"
  },
  reservation: {
    defaultDepositKES: 50000,
    currency: "KES",
    holdingPeriodDays: 3,
  },
  financing: {
    defaultInterestRate: 14.0, // 14% p.a. standard Kenyan auto loan rate
    defaultTenureMonths: 48,
    minDepositPercent: 20
  },

  // 2026 Kenyan Import Regulation Rules (Max 8 Years Rule)
  importRules: {
    USED_IMPORT_MAX_AGE_YEARS: 8,
    CURRENT_YEAR: 2026,
    STANDARD_STEERING: 'RHD',
  }
};

/**
 * Calculates Kenyan Import Eligibility dynamically for 2026 regulations.
 * Rule: Vehicle age must be <= 8 years (e.g., Year >= 2018 for 2026 context) and RHD.
 */
export function calculateImportEligibility(year: number, steering: 'RHD' | 'LHD' | 'unknown' = 'RHD'): {
  eligibility: ImportEligibility;
  marketStatus: MarketStatus;
} {
  const currentYear = siteConfig.importRules.CURRENT_YEAR;
  const maxAge = siteConfig.importRules.USED_IMPORT_MAX_AGE_YEARS;
  const minImportYear = currentYear - maxAge;

  if (steering === 'LHD') {
    return {
      eligibility: 'special_case',
      marketStatus: 'specialty_import'
    };
  }

  if (year >= minImportYear && steering === 'RHD') {
    return {
      eligibility: 'eligible',
      marketStatus: 'importable_subject_to_requirements'
    };
  }

  if (year < minImportYear) {
    return {
      eligibility: 'not_applicable', // Too old for new import, available only as locally used
      marketStatus: 'locally_available'
    };
  }

  return {
    eligibility: 'subject_to_verification',
    marketStatus: 'kenya_market'
  };
}
