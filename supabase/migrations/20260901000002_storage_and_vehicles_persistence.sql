-- YARDLY Supabase Migration: Vehicles Storage & Database Security Policies
-- Version: 1.3.0

-- Create 'vehicles' storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicles', 
  'vehicles', 
  true, 
  15728640, -- 15MB file size limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policy 1: Public READ access for vehicle images
DO $$ BEGIN
    CREATE POLICY "Public read access for vehicle images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'vehicles');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Storage Policy 2: Admin upload access for vehicle images
DO $$ BEGIN
    CREATE POLICY "Admin upload access for vehicle images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'vehicles'
      AND (
        auth.role() = 'service_role' OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Storage Policy 3: Admin update access for vehicle images
DO $$ BEGIN
    CREATE POLICY "Admin update access for vehicle images"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'vehicles'
      AND (
        auth.role() = 'service_role' OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Storage Policy 4: Admin delete access for vehicle images
DO $$ BEGIN
    CREATE POLICY "Admin delete access for vehicle images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'vehicles'
      AND (
        auth.role() = 'service_role' OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Ensure public.vehicles policies for Admins
DO $$ BEGIN
    CREATE POLICY "Admin insert vehicles"
    ON public.vehicles FOR INSERT
    WITH CHECK (
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin update vehicles"
    ON public.vehicles FOR UPDATE
    USING (
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin delete vehicles"
    ON public.vehicles FOR DELETE
    USING (
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Ensure public.vehicle_images policies for Admins
DO $$ BEGIN
    CREATE POLICY "Admin manage vehicle images"
    ON public.vehicle_images FOR ALL
    USING (
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;
