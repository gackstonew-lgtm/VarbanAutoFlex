-- YARDLY Supabase Migration: Marketplace Expansion
-- Version: 1.2.0

-- Create auction status & trade-in / import status enums if needed
DO $$ BEGIN
    CREATE TYPE auction_status AS ENUM ('upcoming', 'live', 'ending_soon', 'ended', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trade_in_status AS ENUM ('new', 'under_review', 'valuation', 'offer_sent', 'accepted', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE import_status AS ENUM ('new', 'reviewing', 'sourcing', 'quotation', 'shipping', 'customs', 'delivered', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Buyer Profiles Table
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_location TEXT DEFAULT 'Nairobi',
  budget_max NUMERIC(12, 2),
  saved_search_count INT DEFAULT 0,
  status account_status DEFAULT 'active'::account_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seller Profiles Table
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  seller_type seller_type DEFAULT 'private'::seller_type,
  verification_status verification_status DEFAULT 'pending'::verification_status,
  status account_status DEFAULT 'active'::account_status,
  location TEXT DEFAULT 'Nairobi',
  logbook_verified BOOLEAN DEFAULT FALSE,
  total_listings INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Auctions Table
CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  starting_bid NUMERIC(12, 2) NOT NULL,
  current_bid NUMERIC(12, 2) NOT NULL,
  minimum_increment NUMERIC(12, 2) DEFAULT 10000.00,
  bid_count INT DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status auction_status DEFAULT 'upcoming'::auction_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Auction Bids Table
CREATE TABLE IF NOT EXISTS public.auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trade-In Requests Table
CREATE TABLE IF NOT EXISTS public.trade_in_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  mileage INT NOT NULL,
  registration_status TEXT DEFAULT 'locally_registered',
  transmission transmission_type NOT NULL,
  fuel_type fuel_type NOT NULL,
  condition TEXT DEFAULT 'Used',
  location TEXT NOT NULL,
  expected_value NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status trade_in_status DEFAULT 'new'::trade_in_status,
  admin_valuation NUMERIC(12, 2),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Import Requests Table
CREATE TABLE IF NOT EXISTS public.import_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Kenya',
  preferred_source_country TEXT NOT NULL, -- e.g., Japan, UK, Australia, Dubai
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year_min INT NOT NULL,
  budget NUMERIC(12, 2) NOT NULL,
  preferred_specs TEXT,
  shipping_preference TEXT DEFAULT 'RoRo',
  additional_requirements TEXT,
  status import_status DEFAULT 'new'::import_status,
  assigned_to TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Favorites / Saved Vehicles Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'inquiry', 'auction_bid', 'outbid', 'auction_ending', 'trade_in_status', 'import_status', 'listing_approval', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction ON public.auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_trade_ins_status ON public.trade_in_requests(status);
CREATE INDEX IF NOT EXISTS idx_trade_ins_user ON public.trade_in_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_import_requests_status ON public.import_requests(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- Enable RLS on new tables
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_in_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic Public / User RLS Policies
CREATE POLICY "Public view live auctions" ON public.auctions FOR SELECT USING (TRUE);
CREATE POLICY "Public view auction bids" ON public.auction_bids FOR SELECT USING (TRUE);
CREATE POLICY "Users insert auction bids" ON public.auction_bids FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users view own trade-ins" ON public.trade_in_requests FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users insert trade-ins" ON public.trade_in_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users view own imports" ON public.import_requests FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users insert imports" ON public.import_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
