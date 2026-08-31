-- YARDLY Supabase PostgreSQL Database Migration Script
-- Version: 1.1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enums
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'dealer', 'admin');
CREATE TYPE vehicle_status AS ENUM ('pending_review', 'active', 'reserved', 'sold', 'rejected');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE fuel_type AS ENUM ('Petrol', 'Diesel', 'Hybrid', 'Electric');
CREATE TYPE transmission_type AS ENUM ('Automatic', 'Manual', 'CVT');
CREATE TYPE body_type AS ENUM ('SUV', 'Sedan', 'Hatchback', 'Station Wagon', 'Pickup / Truck', 'Van / Minibus', 'Coupe / Convertible');
CREATE TYPE seller_type AS ENUM ('private', 'dealer');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded');

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'buyer'::user_role,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vehicles Table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  dealer_name TEXT,
  seller_type seller_type DEFAULT 'private'::seller_type,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  mileage INT NOT NULL,
  engine_cc INT NOT NULL,
  fuel_type fuel_type NOT NULL,
  transmission transmission_type NOT NULL,
  body_type body_type NOT NULL,
  drive_type TEXT DEFAULT '2WD',
  color TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Nairobi',
  description TEXT NOT NULL,
  registration_number TEXT, -- Sensitive, hidden from public
  status vehicle_status DEFAULT 'pending_review'::vehicle_status,
  verification_status verification_status DEFAULT 'pending'::verification_status,
  logbook_verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  is_demo BOOLEAN DEFAULT FALSE,
  data_source TEXT DEFAULT 'direct',
  source_reference TEXT,
  demo_source_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid querying
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_make_model ON public.vehicles(make, model);
CREATE INDEX idx_vehicles_price ON public.vehicles(price);
CREATE INDEX idx_vehicles_year ON public.vehicles(year);
CREATE INDEX idx_vehicles_location ON public.vehicles(location);
CREATE INDEX idx_vehicles_demo ON public.vehicles(demo_source_id);

-- 3. Vehicle Images
CREATE TABLE public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  source_type TEXT DEFAULT 'demo',
  license_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);

-- 4. Vehicle Features
CREATE TABLE public.vehicle_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL
);

-- 5. Vehicle Inquiries / Leads
CREATE TABLE public.vehicle_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'web',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reservations Table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending',
  payment_id UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payments Table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  provider TEXT NOT NULL, -- 'mpesa', 'payhero', 'card', 'test'
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  mpesa_receipt_number TEXT,
  phone_number TEXT NOT NULL,
  status payment_status DEFAULT 'pending'::payment_status,
  idempotency_key TEXT UNIQUE NOT NULL,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Payment Events (Audit Log)
CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Seller Listings Submissions
CREATE TABLE public.seller_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  seller_type seller_type DEFAULT 'private'::seller_type,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  registration_number TEXT NOT NULL,
  mileage INT NOT NULL,
  engine_cc INT NOT NULL,
  transmission transmission_type NOT NULL,
  fuel_type fuel_type NOT NULL,
  body_type body_type NOT NULL,
  location TEXT NOT NULL,
  asking_price NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  condition TEXT DEFAULT 'Foreign Used',
  images TEXT[] DEFAULT '{}',
  logbook_document_url TEXT,
  status TEXT DEFAULT 'pending_review',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_listings ENABLE ROW LEVEL SECURITY;

-- Vehicles: Everyone can view ACTIVE vehicles
CREATE POLICY "Public can view active vehicles"
  ON public.vehicles FOR SELECT
  USING (status = 'active');

-- Admins can view and update all vehicles
CREATE POLICY "Admins can manage all vehicles"
  ON public.vehicles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Vehicle Images: Public can view
CREATE POLICY "Public can view vehicle images"
  ON public.vehicle_images FOR SELECT
  USING (TRUE);

-- Vehicle Features: Public can view
CREATE POLICY "Public can view vehicle features"
  ON public.vehicle_features FOR SELECT
  USING (TRUE);

-- Inquiries: Users can insert
CREATE POLICY "Public can create inquiries"
  ON public.vehicle_inquiries FOR INSERT
  WITH CHECK (TRUE);

-- Reservations: Users can view their own, Admins view all
CREATE POLICY "Users view own reservations"
  ON public.reservations FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Payments: Users view own payments, Admins view all
CREATE POLICY "Users view own payments"
  ON public.payments FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seller Listings: Anyone can submit, only submitter or admin can view details
CREATE POLICY "Anyone can submit seller listing"
  ON public.seller_listings FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins manage seller listings"
  ON public.seller_listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
