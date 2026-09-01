-- YARDLY Supabase Migration: Inspection Requests & Realtime Sync
-- Version: 1.3.0

-- Create Inspection Status Enum
DO $$ BEGIN
    CREATE TYPE inspection_status AS ENUM ('requested', 'pending', 'accepted', 'rejected', 'scheduled', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Vehicle Inspection Requests Table
CREATE TABLE IF NOT EXISTS public.inspection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Nairobi',
  notes TEXT,
  status inspection_status DEFAULT 'requested'::inspection_status,
  seller_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rapid lookups
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON public.inspection_requests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inspections_buyer ON public.inspection_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inspections_seller ON public.inspection_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspection_requests(status);

-- Enable Row Level Security
ALTER TABLE public.inspection_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Inspection Requests
CREATE POLICY "Public or buyers can create inspection requests"
  ON public.inspection_requests FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users view relevant inspection requests"
  ON public.inspection_requests FOR SELECT
  USING (
    buyer_id = auth.uid() OR
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sellers and Admins update relevant inspection requests"
  ON public.inspection_requests FOR UPDATE
  USING (
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable Supabase Realtime Publication for Shared Multi-Device Sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_inquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inspection_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids;
