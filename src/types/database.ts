export type UserRole = 'buyer' | 'seller' | 'dealer' | 'admin';

export type VehicleStatus = 'pending_review' | 'active' | 'reserved' | 'sold' | 'rejected' | 'draft' | 'archived';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';

export type TransmissionType = 'Automatic' | 'Manual' | 'CVT';

export type BodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'Station Wagon' | 'Pickup / Truck' | 'Van / Minibus' | 'Coupe / Convertible' | 'Motorcycle';

export type SellerType = 'private' | 'dealer' | 'importer' | 'business';

export type AccountStatus = 'active' | 'suspended' | 'pending';

export type AuctionStatus = 'upcoming' | 'live' | 'ending_soon' | 'ended' | 'cancelled';

export type TradeInStatus = 'new' | 'under_review' | 'valuation' | 'offer_sent' | 'accepted' | 'rejected' | 'completed';

export type ImportStatus = 'new' | 'reviewing' | 'sourcing' | 'quotation' | 'shipping' | 'customs' | 'delivered' | 'completed' | 'cancelled';

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

export type ValuationConfidence = 'High' | 'Medium' | 'Low';

export type { PaymentRecord } from './payment';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  seller_type?: SellerType;
  business_name?: string;
  avatar_url?: string;
  status?: AccountStatus;
  created_at: string;
  updated_at?: string;
}

export interface BuyerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  preferred_location?: string;
  budget_max?: number;
  status: AccountStatus;
  created_at: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  business_name?: string;
  seller_type: SellerType;
  verification_status: VerificationStatus;
  status: AccountStatus;
  location?: string;
  logbook_verified: boolean;
  total_listings: number;
  created_at: string;
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
  image_type?: 'actual' | 'generic';
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
  generation?: string;
  trim?: string;
  year: number;
  price: number; // KES
  currency: string; // KES
  mileage: number; // KM
  engine_cc: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  body_type: BodyType;
  drive_type?: '2WD' | '4WD' | 'AWD' | 'RWD' | 'FWD';
  color: string;
  exterior_color?: string;
  interior_color?: string;
  seats?: number;
  doors?: number;
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
  
  // Market Valuation Metrics
  market_value_low?: number;
  market_value_high?: number;
  estimated_market_value?: number;
  valuation_confidence?: ValuationConfidence;
  valuation_source?: string;

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
  seller_id?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: 'web' | 'whatsapp' | 'call' | 'inspection_request';
  status: 'new' | 'contacted' | 'in_progress' | 'closed';
  created_at: string;
}

export type InspectionStatus = 'requested' | 'pending' | 'accepted' | 'rejected' | 'scheduled' | 'completed' | 'cancelled';

export interface InspectionRequest {
  id: string;
  vehicle_id: string;
  buyer_id?: string;
  seller_id?: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  preferred_date: string;
  preferred_time: string;
  location: string;
  notes?: string;
  status: InspectionStatus;
  seller_notes?: string;
  created_at: string;
  updated_at?: string;
  vehicle?: Partial<Vehicle>;
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

export interface AuctionBid {
  id: string;
  auction_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  amount: number;
  created_at: string;
}

export interface Auction {
  id: string;
  vehicle_id: string;
  seller_id?: string;
  starting_bid: number;
  current_bid: number;
  minimum_increment: number;
  bid_count: number;
  start_time: string;
  end_time: string;
  status: AuctionStatus;
  created_at: string;
  updated_at?: string;
  vehicle?: Vehicle;
  bids?: AuctionBid[];
}

export interface TradeInRequest {
  id: string;
  reference_id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  registration_status: string;
  transmission: TransmissionType;
  fuel_type: FuelType;
  condition: string;
  location: string;
  expected_value: number;
  description: string;
  images: string[];
  status: TradeInStatus;
  admin_valuation?: number;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ImportRequest {
  id: string;
  reference_number: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  preferred_source_country: string;
  make: string;
  model: string;
  year_min: number;
  budget: number;
  preferred_specs?: string;
  shipping_preference: string;
  additional_requirements?: string;
  status: ImportStatus;
  assigned_to?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  vehicle_id: string;
  created_at: string;
  vehicle?: Vehicle;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'inquiry' | 'auction_bid' | 'outbid' | 'auction_ending' | 'trade_in_status' | 'import_status' | 'listing_approval' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}
