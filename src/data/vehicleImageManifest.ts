export interface ManifestEntry {
  image_url: string;
  make: string;
  model: string;
  generation?: string;
  category: 'mainstream' | 'premium' | 'sports' | 'supercars';
  body_type: string;
  color: string;
  confidence: number;
  vehicle_match_status: 'verified' | 'unverified';
}

export const LOCAL_CAR_IMAGES_MANIFEST: ManifestEntry[] = [
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.29 (2)_Yardy_Imports.jpg',
    make: 'Toyota',
    model: 'Land Cruiser 300',
    generation: 'J300',
    category: 'premium',
    body_type: 'SUV',
    color: 'White',
    confidence: 0.98,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.30_Yardy_Imports.jpg',
    make: 'Volkswagen',
    model: 'Tiguan',
    generation: 'R-Line',
    category: 'mainstream',
    body_type: 'SUV',
    color: 'White',
    confidence: 0.98,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.30 (1)_Yardy_Imports.jpg',
    make: 'Volkswagen',
    model: 'Tiguan',
    generation: 'R-Line Rear Angle',
    category: 'mainstream',
    body_type: 'SUV',
    color: 'White',
    confidence: 0.98,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.31_Yardy_Imports.jpg',
    make: 'Land Rover',
    model: 'Range Rover',
    generation: 'L460 Vogue',
    category: 'premium',
    body_type: 'SUV',
    color: 'Black',
    confidence: 0.98,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.31 (1)_Yardy_Imports.jpg',
    make: 'Mercedes-Benz',
    model: 'G-Class',
    generation: 'G63 AMG Brabus',
    category: 'supercars',
    body_type: 'SUV',
    color: 'Grey',
    confidence: 0.98,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.31 (2)_Yardy_Imports.jpg',
    make: 'Mercedes-Benz',
    model: 'G-Class',
    generation: 'G63 Brabus 800 Widestar',
    category: 'supercars',
    body_type: 'SUV',
    color: 'Matte Black',
    confidence: 0.98,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.32_Yardy_Imports.jpg',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    generation: 'W223',
    category: 'premium',
    body_type: 'Sedan',
    color: 'Black',
    confidence: 0.98,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.32 (1)_Yardy_Imports.jpg',
    make: 'Subaru',
    model: 'Forester',
    generation: 'SJ / SK',
    category: 'mainstream',
    body_type: 'SUV',
    color: 'Dark Grey',
    confidence: 0.96,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.28_Yardy_Imports.jpg',
    make: 'Toyota',
    model: 'Raize / Rocky',
    generation: '2022',
    category: 'mainstream',
    body_type: 'SUV',
    color: 'White',
    confidence: 0.96,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.29_Yardy_Imports.jpg',
    make: 'BMW',
    model: 'X5',
    generation: 'G05',
    category: 'premium',
    body_type: 'SUV',
    color: 'White',
    confidence: 0.95,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.28 (1)_Yardy_Imports.jpg',
    make: 'Volvo',
    model: 'XC60',
    generation: 'Second Gen',
    category: 'premium',
    body_type: 'SUV',
    color: 'White',
    confidence: 0.94,
    vehicle_match_status: 'verified'
  },
  {
    image_url: '/Car Images/WhatsApp Image 2026-08-31 at 23.30.29 (1)_Yardy_Imports.jpg',
    make: 'Custom',
    model: 'Alloy Wheels & Performance Tires',
    generation: 'Aftermarket',
    category: 'sports',
    body_type: 'Coupe / Convertible',
    color: 'Silver & Gold',
    confidence: 0.90,
    vehicle_match_status: 'unverified'
  }
];
