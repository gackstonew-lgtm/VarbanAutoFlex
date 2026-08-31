export type UserRole = 'buyer' | 'seller' | 'dealer' | 'admin';

export type VehicleStatus = 'pending_review' | 'active' | 'reserved' | 'sold' | 'rejected';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';

export type TransmissionType = 'Automatic' | 'Manual' | 'CVT';

export type BodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'Station Wagon' | 'Pickup / Truck' | 'Van / Minibus' | 'Coupe / Convertible';

export type SellerType = 'private' | 'dealer';

export type ImageSourceType = 'authorized_external' | 'supabase_storage' | 'admin_uploaded' | 'demo' | 'local_image_library';

export type ImageLicenseStatus = 'authorized' | 'pending' | 'unknown';

export type MarketStatus = 
  | 'kenya_market' 
  | 'importable_subject_to_requirements' 
  | 'locally_available' 
  | 'premium_import' 
  | 'specialty_import' 
  | 'not_for_standard_used_import';

export type ImportEligibility = 
  | 'eligible' 
  | 'subject_to_verification' 
  | 'special_case' 
  | 'not_applicable';

export type SteeringPosition = 'RHD' | 'LHD' | 'unknown';

export type RegistrationStatusType = 'import' | 'locally_used' | 'new' | 'special_order';

export type VehicleCategory = 'mainstream' | 'premium' | 'sports' | 'supercars';

export type { PaymentRecord } from './payment';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  sort_order?: number;
  display_order: number;
  is_primary: boolean;
  source_type?: ImageSourceType;
  license_status?: ImageLicenseStatus;
  created_at: string;
}

export interface VehicleFeature {
  id: string;
  vehicle_id: string;
  feature_name: string;
}

export interface Vehicle {
  id: string;
  seller_id?: string;
  dealer_name?: string;
  seller_type: SellerType;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number; // KES
  currency: string; // KES
  mileage: number; // KM
  engine_cc: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  body_type: BodyType;
  drive_type?: '2WD' | '4WD' | 'AWD' | 'RWD';
  color: string;
  location: string; // e.g. Nairobi, Mombasa, Nakuru
  description: string;
  registration_number?: string; // Hidden from public, visible to admin
  status: VehicleStatus;
  verification_status: VerificationStatus;
  logbook_verified: boolean;
  featured: boolean;
  view_count?: number;
  is_demo?: boolean;
  data_source?: string;
  source_reference?: string;
  demo_source_id?: string;
  
  // Kenyan Import & Market Metadata
  category?: VehicleCategory;
  market_status?: MarketStatus;
  import_eligibility?: ImportEligibility;
  steering_position?: SteeringPosition;
  registration_status?: RegistrationStatusType;
  vehicle_match_status?: 'verified' | 'unverified';

  images: VehicleImage[];
  features?: string[];
  created_at: string;
  updated_at: string;
}

export interface VehicleInquiry {
  id: string;
  vehicle_id: string;
  buyer_id?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: 'web' | 'whatsapp' | 'call' | 'inspection_request';
  status: 'new' | 'contacted' | 'inspection_scheduled' | 'negotiating' | 'won' | 'lost';
  created_at: string;
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  user_id?: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  payment_id?: string;
  expires_at: string;
  created_at: string;
  vehicle?: Partial<Vehicle>;
}

export interface SellerListingSubmission {
  id: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  seller_type: SellerType;
  make: string;
  model: string;
  year: number;
  registration_number: string;
  mileage: number;
  engine_cc: number;
  transmission: TransmissionType;
  fuel_type: FuelType;
  body_type: BodyType;
  location: string;
  asking_price: number;
  description: string;
  condition: 'Brand New' | 'Foreign Used' | 'Locally Used';
  images: string[];
  logbook_document_url?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}
