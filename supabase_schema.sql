-- ============================================================
-- YARDLY AUTOMOTIVE
-- SUPABASE / POSTGRES DATABASE SCHEMA
-- ============================================================
-- Purpose:
--   - Vehicle Inventory & Image Storage Management
--   - User Profiles & Multi-Role Authorization (buyer, seller, dealer, staff, admin, super_admin)
--   - Vehicle Features & Saved Favorites
--   - Customer Inquiries & Vehicle Inspection / Test-Drive Requests
--   - Online Vehicle Reservations & Multi-Provider Payments (M-Pesa / PayHero / Card)
--   - Seller Car Submissions & Trade-In Requests
--   - Car Import Requests & Auction Bidding Engine
--   - User & System Notifications
--   - Vehicle Price & Status History Logging
--   - Administrative Audit Logging
--   - Storage Bucket & Realtime Sync Publications
--
-- Designed for Supabase PostgreSQL.
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";


-- ============================================================
-- 2. ENUM TYPES
-- ============================================================

do $$
begin

    if not exists (select 1 from pg_type where typname = 'user_role') then
        create type public.user_role as enum (
            'buyer',
            'seller',
            'dealer',
            'customer',
            'staff',
            'admin',
            'super_admin'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'vehicle_status') then
        create type public.vehicle_status as enum (
            'pending_review',
            'active',
            'available',
            'reserved',
            'sold',
            'rejected',
            'draft',
            'hidden',
            'archived'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'vehicle_condition') then
        create type public.vehicle_condition as enum (
            'new',
            'used',
            'Brand New',
            'Foreign Used',
            'Locally Used'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'verification_status') then
        create type public.verification_status as enum (
            'pending',
            'verified',
            'rejected'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'fuel_type') then
        create type public.fuel_type as enum (
            'Petrol',
            'Diesel',
            'Hybrid',
            'Electric'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'transmission_type') then
        create type public.transmission_type as enum (
            'Automatic',
            'Manual',
            'CVT'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'body_type') then
        create type public.body_type as enum (
            'SUV',
            'Sedan',
            'Hatchback',
            'Station Wagon',
            'Pickup / Truck',
            'Van / Minibus',
            'Coupe / Convertible',
            'Motorcycle'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'seller_type') then
        create type public.seller_type as enum (
            'private',
            'dealer',
            'importer',
            'business'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'account_status') then
        create type public.account_status as enum (
            'active',
            'suspended',
            'pending'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'inquiry_status') then
        create type public.inquiry_status as enum (
            'new',
            'contacted',
            'in_progress',
            'resolved',
            'closed'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'test_drive_status') then
        create type public.test_drive_status as enum (
            'pending',
            'confirmed',
            'completed',
            'cancelled'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'inspection_status') then
        create type public.inspection_status as enum (
            'requested',
            'pending',
            'accepted',
            'rejected',
            'scheduled',
            'completed',
            'cancelled'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'auction_status') then
        create type public.auction_status as enum (
            'upcoming',
            'live',
            'ending_soon',
            'ended',
            'cancelled'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'trade_in_status') then
        create type public.trade_in_status as enum (
            'new',
            'under_review',
            'valuation',
            'offer_sent',
            'accepted',
            'rejected',
            'completed'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'import_status') then
        create type public.import_status as enum (
            'new',
            'reviewing',
            'sourcing',
            'quotation',
            'shipping',
            'customs',
            'delivered',
            'completed',
            'cancelled'
        );
    end if;

    if not exists (select 1 from pg_type where typname = 'payment_status') then
        create type public.payment_status as enum (
            'pending',
            'processing',
            'paid',
            'failed',
            'cancelled',
            'refunded'
        );
    end if;

end $$;


-- ============================================================
-- 3. PROFILES & USER ACCOUNTS
-- ============================================================
-- Supabase Auth owns credentials. This table stores app user metadata.
-- Dedicated Primary Administrator Email: Varbanauto@admin.com (Role: admin)

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    email text,
    full_name text,
    first_name text,
    last_name text,

    phone text,
    avatar_url text,

    role public.user_role not null default 'buyer',
    seller_type public.seller_type default 'private',
    business_name text,

    status public.account_status not null default 'active',
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Extended Buyer Profile
create table if not exists public.buyer_profiles (
    id uuid primary key references public.profiles(id) on delete cascade,
    preferred_location text default 'Nairobi',
    budget_max numeric(12,2),
    saved_search_count integer default 0,
    status public.account_status default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Extended Seller Profile
create table if not exists public.seller_profiles (
    id uuid primary key references public.profiles(id) on delete cascade,
    business_name text,
    seller_type public.seller_type default 'private',
    verification_status public.verification_status default 'pending',
    status public.account_status default 'active',
    location text default 'Nairobi',
    logbook_verified boolean default false,
    total_listings integer default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 4. VEHICLE INVENTORY
-- ============================================================

create table if not exists public.vehicles (
    id uuid primary key default gen_random_uuid(),

    -- Basic identification
    stock_number text unique,
    vin text unique,
    demo_source_id text unique,

    make text not null,
    model text not null,
    variant text,
    trim text,
    generation text,

    year integer not null
        check (year >= 1886 and year <= extract(year from now()) + 2),

    condition public.vehicle_condition not null default 'used',

    -- Vehicle specifications
    body_type text not null default 'SUV',
    drivetrain text default '4WD',
    drive_type text default '4WD',
    transmission text not null default 'Automatic',
    fuel_type text not null default 'Petrol',

    engine text,
    engine_cc integer check (engine_cc is null or engine_cc > 0),
    engine_size text,

    color text default 'Silver',
    exterior_color text,
    interior_color text,

    doors integer,
    seats integer,

    mileage integer not null default 0
        check (mileage >= 0),

    -- Financial information
    price numeric(12,2) not null check (price >= 0),
    sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
    monthly_payment numeric(12,2) check (monthly_payment is null or monthly_payment >= 0),
    currency text default 'KES',

    -- Listing information
    title text,
    description text not null,

    status public.vehicle_status not null default 'active',
    verification_status public.verification_status not null default 'verified',
    logbook_verified boolean not null default false,

    is_featured boolean not null default false,
    featured boolean not null default false,

    location text not null default 'Nairobi',
    registration_number text, -- Sensitive, admin-only visible

    -- Analytics & Demo tracking
    view_count integer default 0,
    is_demo boolean default false,
    data_source text default 'direct',
    source_reference text,

    -- Market Valuation Metrics
    market_value_low numeric(12,2),
    market_value_high numeric(12,2),
    estimated_market_value numeric(12,2),
    valuation_confidence text,
    valuation_source text,

    -- Kenyan Market & Import Metadata
    category text,
    market_status text,
    import_eligibility text,
    steering_position text default 'RHD',
    registration_status text default 'locally_registered',
    vehicle_match_status text default 'verified',

    -- SEO / Sharing
    slug text unique,
    meta_title text,
    meta_description text,

    -- Management / Ownership
    dealer_name text default 'YARDLY Certified',
    seller_type public.seller_type default 'dealer',

    created_by uuid references public.profiles(id) on delete set null,
    seller_id uuid references public.profiles(id) on delete set null,
    updated_by uuid references public.profiles(id) on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 5. VEHICLE IMAGES
-- ============================================================

create table if not exists public.vehicle_images (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    image_url text not null,
    thumbnail_url text,

    storage_path text,
    alt_text text,

    sort_order integer not null default 0,
    display_order integer not null default 1,

    is_primary boolean not null default false,

    source_type text default 'demo',
    license_status text default 'pending',
    image_type text default 'actual',

    created_at timestamptz not null default now()
);


-- ============================================================
-- 6. VEHICLE FEATURES
-- ============================================================

create table if not exists public.vehicle_features (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    feature_name text not null,

    created_at timestamptz not null default now(),

    unique(vehicle_id, feature_name)
);


-- ============================================================
-- 7. FAVORITES / SAVED VEHICLES
-- ============================================================

create table if not exists public.favorites (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    created_at timestamptz not null default now(),

    unique(user_id, vehicle_id)
);


-- ============================================================
-- 8. CUSTOMER INQUIRIES & VEHICLE INQUIRIES
-- ============================================================

create table if not exists public.vehicle_inquiries (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    user_id uuid
        references public.profiles(id)
        on delete set null,

    buyer_id uuid
        references public.profiles(id)
        on delete set null,

    seller_id uuid
        references public.profiles(id)
        on delete set null,

    name text not null,
    email text not null,
    phone text not null,

    subject text,
    message text not null,
    source text default 'web',

    status public.inquiry_status not null default 'new',

    assigned_to uuid
        references public.profiles(id)
        on delete set null,

    staff_notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Alias view/table compatibility for public.inquiries
create or replace view public.inquiries as
select
    id,
    vehicle_id,
    user_id,
    buyer_id,
    seller_id,
    name,
    email,
    phone,
    subject,
    message,
    source,
    status,
    assigned_to,
    staff_notes,
    created_at,
    updated_at
from public.vehicle_inquiries;


-- ============================================================
-- 9. INSPECTION REQUESTS & TEST DRIVE REQUESTS
-- ============================================================

create table if not exists public.inspection_requests (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    buyer_id uuid
        references public.profiles(id)
        on delete set null,

    seller_id uuid
        references public.profiles(id)
        on delete set null,

    buyer_name text not null,
    buyer_phone text not null,
    buyer_email text not null,

    preferred_date date not null,
    preferred_time text not null,

    location text not null default 'Nairobi',
    notes text,

    status public.inspection_status not null default 'requested',

    seller_notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.test_drive_requests (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    user_id uuid
        references public.profiles(id)
        on delete set null,

    name text not null,
    email text not null,
    phone text,

    requested_date date,
    requested_time time,

    status public.test_drive_status not null default 'pending',

    notes text,

    assigned_to uuid
        references public.profiles(id)
        on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 10. RESERVATIONS, PAYMENTS & AUDIT EVENTS
-- ============================================================

create table if not exists public.reservations (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete restrict,

    user_id uuid
        references public.profiles(id)
        on delete set null,

    buyer_name text not null,
    buyer_phone text not null,
    buyer_email text not null,

    amount numeric(12,2) not null check (amount > 0),
    currency text default 'KES',

    status text not null default 'pending', -- 'pending', 'confirmed', 'expired', 'cancelled'
    payment_id uuid,

    expires_at timestamptz not null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),

    reservation_id uuid
        references public.reservations(id)
        on delete set null,

    vehicle_id uuid not null
        references public.vehicles(id),

    user_id uuid
        references public.profiles(id)
        on delete set null,

    amount numeric(12,2) not null check (amount > 0),
    currency text default 'KES',

    provider text not null, -- 'mpesa', 'payhero', 'card', 'test'
    checkout_request_id text,
    merchant_request_id text,
    mpesa_receipt_number text,

    phone_number text not null,
    status public.payment_status not null default 'pending',

    idempotency_key text unique not null,
    raw_response jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
    id uuid primary key default gen_random_uuid(),

    payment_id uuid not null
        references public.payments(id)
        on delete cascade,

    event_type text not null,
    payload jsonb not null,

    created_at timestamptz not null default now()
);


-- ============================================================
-- 11. SELLER CAR LISTING SUBMISSIONS
-- ============================================================

create table if not exists public.seller_listings (
    id uuid primary key default gen_random_uuid(),

    seller_name text not null,
    seller_phone text not null,
    seller_email text not null,
    seller_type public.seller_type default 'private',

    make text not null,
    model text not null,
    year integer not null,
    registration_number text not null,
    mileage integer not null,
    engine_cc integer not null,

    transmission public.transmission_type not null,
    fuel_type public.fuel_type not null,
    body_type public.body_type not null,

    location text not null,
    asking_price numeric(12,2) not null check (asking_price > 0),
    description text not null,
    condition text default 'Foreign Used',

    images text[] default '{}',
    logbook_document_url text,

    status text default 'pending_review', -- 'pending_review', 'approved', 'rejected'
    rejection_reason text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 12. AUCTIONS & BIDS
-- ============================================================

create table if not exists public.auctions (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    seller_id uuid
        references public.profiles(id)
        on delete set null,

    starting_bid numeric(12,2) not null check (starting_bid >= 0),
    current_bid numeric(12,2) not null check (current_bid >= starting_bid),
    minimum_increment numeric(12,2) default 10000.00 check (minimum_increment > 0),
    bid_count integer default 0,

    start_time timestamptz not null,
    end_time timestamptz not null,

    status public.auction_status default 'upcoming',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.auction_bids (
    id uuid primary key default gen_random_uuid(),

    auction_id uuid not null
        references public.auctions(id)
        on delete cascade,

    buyer_id uuid not null
        references public.profiles(id)
        on delete cascade,

    buyer_name text not null,
    buyer_email text not null,

    amount numeric(12,2) not null check (amount > 0),

    created_at timestamptz not null default now()
);


-- ============================================================
-- 13. TRADE-IN & IMPORT REQUESTS
-- ============================================================

create table if not exists public.trade_in_requests (
    id uuid primary key default gen_random_uuid(),

    reference_id text unique not null,

    user_id uuid
        references public.profiles(id)
        on delete set null,

    full_name text not null,
    email text not null,
    phone text not null,

    make text not null,
    model text not null,
    year integer not null,
    mileage integer not null,
    registration_status text default 'locally_registered',

    transmission public.transmission_type not null,
    fuel_type public.fuel_type not null,

    condition text default 'Used',
    location text not null,

    expected_value numeric(12,2) not null,
    description text not null,
    images text[] default '{}',

    status public.trade_in_status default 'new',
    admin_valuation numeric(12,2),
    admin_notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.import_requests (
    id uuid primary key default gen_random_uuid(),

    reference_number text unique not null,

    user_id uuid
        references public.profiles(id)
        on delete set null,

    full_name text not null,
    email text not null,
    phone text not null,

    country text not null default 'Kenya',
    preferred_source_country text not null,

    make text not null,
    model text not null,
    year_min integer not null,
    budget numeric(12,2) not null,

    preferred_specs text,
    shipping_preference text default 'RoRo',
    additional_requirements text,

    status public.import_status default 'new',
    assigned_to text,
    admin_notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    type text not null, -- 'inquiry', 'auction_bid', 'outbid', 'auction_ending', 'trade_in_status', 'import_status', 'listing_approval', 'system'
    title text not null,
    message text not null,
    read boolean default false,
    link text,

    created_at timestamptz not null default now()
);


-- ============================================================
-- 15. VEHICLE STATUS / PRICE HISTORY & AUDIT LOGS
-- ============================================================

create table if not exists public.vehicle_history (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    changed_by uuid
        references public.profiles(id)
        on delete set null,

    old_status public.vehicle_status,
    new_status public.vehicle_status,

    old_price numeric(12,2),
    new_price numeric(12,2),

    notes text,

    created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),

    user_id uuid
        references public.profiles(id)
        on delete set null,

    action text not null,

    table_name text,
    record_id uuid,

    old_data jsonb,
    new_data jsonb,

    ip_address inet,

    created_at timestamptz not null default now()
);


-- ============================================================
-- 16. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ============================================================

create index if not exists idx_vehicles_make on public.vehicles(make);
create index if not exists idx_vehicles_model on public.vehicles(model);
create index if not exists idx_vehicles_make_model on public.vehicles(make, model);
create index if not exists idx_vehicles_year on public.vehicles(year);
create index if not exists idx_vehicles_price on public.vehicles(price);
create index if not exists idx_vehicles_status on public.vehicles(status);
create index if not exists idx_vehicles_condition on public.vehicles(condition);
create index if not exists idx_vehicles_featured on public.vehicles(is_featured, featured);
create index if not exists idx_vehicles_location on public.vehicles(location);
create index if not exists idx_vehicles_created_at on public.vehicles(created_at desc);

create index if not exists idx_vehicle_images_vehicle on public.vehicle_images(vehicle_id);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_favorites_vehicle on public.favorites(vehicle_id);

create index if not exists idx_inquiries_status on public.vehicle_inquiries(status);
create index if not exists idx_inquiries_vehicle on public.vehicle_inquiries(vehicle_id);

create index if not exists idx_inspections_vehicle on public.inspection_requests(vehicle_id);
create index if not exists idx_inspections_status on public.inspection_requests(status);
create index if not exists idx_test_drive_status on public.test_drive_requests(status);

create index if not exists idx_reservations_status on public.reservations(status);
create index if not exists idx_reservations_user on public.reservations(user_id);
create index if not exists idx_payments_status on public.payments(status);

create index if not exists idx_auctions_status on public.auctions(status);
create index if not exists idx_auction_bids_auction on public.auction_bids(auction_id);
create index if not exists idx_trade_ins_status on public.trade_in_requests(status);
create index if not exists idx_import_requests_status on public.import_requests(status);
create index if not exists idx_notifications_user on public.notifications(user_id, read);


-- ============================================================
-- 17. UPDATED_AT TIMESTAMP FUNCTION & TRIGGERS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists vehicles_updated_at on public.vehicles;
create trigger vehicles_updated_at before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists inquiries_updated_at on public.vehicle_inquiries;
create trigger inquiries_updated_at before update on public.vehicle_inquiries
for each row execute function public.set_updated_at();

drop trigger if exists inspection_requests_updated_at on public.inspection_requests;
create trigger inspection_requests_updated_at before update on public.inspection_requests
for each row execute function public.set_updated_at();

drop trigger if exists test_drive_updated_at on public.test_drive_requests;
create trigger test_drive_updated_at before update on public.test_drive_requests
for each row execute function public.set_updated_at();

drop trigger if exists reservations_updated_at on public.reservations;
create trigger reservations_updated_at before update on public.reservations
for each row execute function public.set_updated_at();

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();


-- ============================================================
-- 18. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    assigned_role public.user_role;
    raw_role_str text;
begin
    raw_role_str := lower(coalesce(new.raw_user_meta_data ->> 'role', 'buyer'));

    if raw_role_str in ('admin', 'super_admin', 'staff') then
        assigned_role := 'buyer'; -- Public signup fallback
    elsif raw_role_str = 'seller' or raw_role_str = 'dealer' then
        assigned_role := 'seller';
    else
        assigned_role := 'buyer';
    end if;

    insert into public.profiles (
        id,
        email,
        full_name,
        first_name,
        last_name,
        phone,
        role,
        seller_type,
        business_name
    )
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'full_name', trim(concat(new.raw_user_meta_data ->> 'first_name', ' ', new.raw_user_meta_data ->> 'last_name'))),
        new.raw_user_meta_data ->> 'first_name',
        new.raw_user_meta_data ->> 'last_name',
        new.raw_user_meta_data ->> 'phone',
        assigned_role,
        cast(coalesce(new.raw_user_meta_data ->> 'seller_type', 'private') as public.seller_type),
        new.raw_user_meta_data ->> 'business_name'
    )
    on conflict (id) do update set
        email = excluded.email,
        full_name = coalesce(excluded.full_name, profiles.full_name),
        phone = coalesce(excluded.phone, profiles.phone);

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- ============================================================
-- 19. ROLE AUTHORIZATION HELPER FUNCTION
-- ============================================================

create or replace function public.has_role(
    required_role public.user_role
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_active = true
        and (
            role = required_role
            or role = 'admin'
            or role = 'super_admin'
            or (
                required_role = 'staff'
                and role in ('admin', 'super_admin')
            )
        )
    );
$$;


-- ============================================================
-- 20. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

alter table public.profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.vehicle_features enable row level security;
alter table public.favorites enable row level security;
alter table public.vehicle_inquiries enable row level security;
alter table public.inspection_requests enable row level security;
alter table public.test_drive_requests enable row level security;
alter table public.reservations enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.seller_listings enable row level security;
alter table public.auctions enable row level security;
alter table public.auction_bids enable row level security;
alter table public.trade_in_requests enable row level security;
alter table public.import_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.vehicle_history enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
for select using (auth.uid() = id or public.has_role('staff'));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

-- Vehicles Policies (Public reads active/available, staff/admin full control)
drop policy if exists "Public can view active vehicles" on public.vehicles;
create policy "Public can view active vehicles" on public.vehicles
for select using (status in ('active', 'available', 'reserved'));

drop policy if exists "Staff can manage vehicles" on public.vehicles;
create policy "Staff can manage vehicles" on public.vehicles
for all using (public.has_role('staff')) with check (public.has_role('staff'));

-- Vehicle Images & Features
drop policy if exists "Public can view vehicle images" on public.vehicle_images;
create policy "Public can view vehicle images" on public.vehicle_images for select using (true);

drop policy if exists "Staff can manage vehicle images" on public.vehicle_images;
create policy "Staff can manage vehicle images" on public.vehicle_images for all using (public.has_role('staff')) with check (public.has_role('staff'));

drop policy if exists "Public can view vehicle features" on public.vehicle_features;
create policy "Public can view vehicle features" on public.vehicle_features for select using (true);

drop policy if exists "Staff can manage vehicle features" on public.vehicle_features;
create policy "Staff can manage vehicle features" on public.vehicle_features for all using (public.has_role('staff')) with check (public.has_role('staff'));

-- Favorites
drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites" on public.favorites for all using (auth.uid() = user_id);

-- Inquiries
drop policy if exists "Anyone can create inquiries" on public.vehicle_inquiries;
create policy "Anyone can create inquiries" on public.vehicle_inquiries for insert with check (user_id is null or buyer_id is null or auth.uid() in (user_id, buyer_id));

drop policy if exists "Users can view relevant inquiries" on public.vehicle_inquiries;
create policy "Users can view relevant inquiries" on public.vehicle_inquiries for select using (auth.uid() in (user_id, buyer_id, seller_id) or public.has_role('staff'));

-- Inspection Requests
drop policy if exists "Anyone create inspection requests" on public.inspection_requests;
create policy "Anyone create inspection requests" on public.inspection_requests for insert with check (true);

drop policy if exists "Users view relevant inspection requests" on public.inspection_requests;
create policy "Users view relevant inspection requests" on public.inspection_requests for select using (auth.uid() in (buyer_id, seller_id) or public.has_role('staff'));

drop policy if exists "Staff update inspection requests" on public.inspection_requests;
create policy "Staff update inspection requests" on public.inspection_requests for update using (auth.uid() = seller_id or public.has_role('staff'));

-- Reservations & Payments
drop policy if exists "Users view own reservations" on public.reservations;
create policy "Users view own reservations" on public.reservations for select using (user_id = auth.uid() or public.has_role('staff'));

drop policy if exists "Anyone create reservations" on public.reservations;
create policy "Anyone create reservations" on public.reservations for insert with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Users view own payments" on public.payments;
create policy "Users view own payments" on public.payments for select using (user_id = auth.uid() or public.has_role('staff'));

-- Seller Listings
drop policy if exists "Anyone submit seller listing" on public.seller_listings;
create policy "Anyone submit seller listing" on public.seller_listings for insert with check (true);

drop policy if exists "Staff manage seller listings" on public.seller_listings;
create policy "Staff manage seller listings" on public.seller_listings for all using (public.has_role('staff'));

-- Auctions & Bids
drop policy if exists "Public view live auctions" on public.auctions;
create policy "Public view live auctions" on public.auctions for select using (true);

drop policy if exists "Public view auction bids" on public.auction_bids;
create policy "Public view auction bids" on public.auction_bids for select using (true);

drop policy if exists "Users place auction bids" on public.auction_bids;
create policy "Users place auction bids" on public.auction_bids for insert with check (auth.uid() = buyer_id);

-- Trade-In & Import Requests
drop policy if exists "Users manage own trade-ins" on public.trade_in_requests;
create policy "Users manage own trade-ins" on public.trade_in_requests for select using (user_id = auth.uid() or public.has_role('staff'));

drop policy if exists "Anyone insert trade-ins" on public.trade_in_requests;
create policy "Anyone insert trade-ins" on public.trade_in_requests for insert with check (true);

drop policy if exists "Users manage own imports" on public.import_requests;
create policy "Users manage own imports" on public.import_requests for select using (user_id = auth.uid() or public.has_role('staff'));

drop policy if exists "Anyone insert imports" on public.import_requests;
create policy "Anyone insert imports" on public.import_requests for insert with check (true);

-- Notifications
drop policy if exists "Users view own notifications" on public.notifications;
create policy "Users view own notifications" on public.notifications for select using (user_id = auth.uid());


-- ============================================================
-- 21. STORAGE BUCKETS & STORAGE POLICIES
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicles', 
  'vehicles', 
  true, 
  15728640, -- 15MB max file size
  array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do update set public = true;

alter table storage.objects enable row level security;

do $$ begin
    create policy "Public read access for vehicle storage images"
    on storage.objects for select using (bucket_id = 'vehicles');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Staff upload access for vehicle storage images"
    on storage.objects for insert
    with check (
      bucket_id = 'vehicles'
      and (
        auth.role() = 'service_role' or public.has_role('staff')
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Staff delete access for vehicle storage images"
    on storage.objects for delete
    using (
      bucket_id = 'vehicles'
      and (
        auth.role() = 'service_role' or public.has_role('staff')
      )
    );
exception when duplicate_object then null; end $$;


-- ============================================================
-- 22. INVENTORY SEARCH VIEW
-- ============================================================

create or replace view public.available_inventory
as
select
    v.id,
    v.stock_number,
    v.vin,
    v.make,
    v.model,
    v.variant,
    v.trim,
    v.year,
    v.condition,
    v.body_type,
    v.drivetrain,
    v.drive_type,
    v.transmission,
    v.fuel_type,
    v.engine,
    v.engine_cc,
    v.engine_size,
    v.color,
    v.exterior_color,
    v.interior_color,
    v.doors,
    v.seats,
    v.mileage,
    v.price,
    v.sale_price,
    v.monthly_payment,
    v.currency,
    v.title,
    v.description,
    v.status,
    v.verification_status,
    v.logbook_verified,
    v.is_featured,
    v.featured,
    v.location,
    v.slug,
    v.dealer_name,
    v.created_at,

    (
        select vi.image_url
        from public.vehicle_images vi
        where vi.vehicle_id = v.id
        order by vi.is_primary desc, vi.display_order asc, vi.sort_order asc
        limit 1
    ) as primary_image

from public.vehicles v
where v.status in ('active', 'available');


-- ============================================================
-- 23. SUPABASE REALTIME PUBLICATION SETUP
-- ============================================================

do $$ begin
    alter publication supabase_realtime add table public.vehicles;
    alter publication supabase_realtime add table public.vehicle_images;
    alter publication supabase_realtime add table public.vehicle_inquiries;
    alter publication supabase_realtime add table public.inspection_requests;
    alter publication supabase_realtime add table public.reservations;
    alter publication supabase_realtime add table public.notifications;
    alter publication supabase_realtime add table public.auctions;
    alter publication supabase_realtime add table public.auction_bids;
exception when others then null; end $$;


-- ============================================================
-- 24. DATA INTEGRITY CONSTRAINTS
-- ============================================================

alter table public.vehicles
drop constraint if exists vehicles_sale_price_check;

alter table public.vehicles
add constraint vehicles_sale_price_check
check (
    sale_price is null
    or price is null
    or sale_price <= price
);


-- ============================================================
-- END OF YARDLY AUTOMOTIVE COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================================
