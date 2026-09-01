import { createClient } from '@supabase/supabase-js';
import { 
  Vehicle, 
  SellerListingSubmission, 
  Reservation, 
  PaymentRecord, 
  VehicleInquiry, 
  Profile, 
  Auction, 
  AuctionBid, 
  TradeInRequest, 
  ImportRequest, 
  Favorite, 
  NotificationItem, 
  UserRole, 
  SellerType 
} from '../../types/database';
import { 
  INITIAL_MOCK_VEHICLES, 
  INITIAL_MOCK_SUBMISSIONS, 
  INITIAL_MOCK_RESERVATIONS, 
  INITIAL_MOCK_PAYMENTS, 
  INITIAL_MOCK_INQUIRIES,
  INITIAL_MOCK_BUYERS,
  INITIAL_MOCK_SELLERS,
  INITIAL_MOCK_AUCTIONS,
  INITIAL_MOCK_TRADE_INS,
  INITIAL_MOCK_IMPORTS,
  INITIAL_MOCK_FAVORITES,
  INITIAL_MOCK_NOTIFICATIONS
} from './mockData';
import { resolveVehicleImages } from '../utils/imageResolver';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.includes('supabase.co') && 
  supabaseAnonKey && 
  !supabaseAnonKey.includes('dummy')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local persistent storage keys
const LOCAL_STORAGE_KEY_VEHICLES = 'yardly_demo_vehicles';
const LOCAL_STORAGE_KEY_SUBMISSIONS = 'yardly_demo_submissions';
const LOCAL_STORAGE_KEY_RESERVATIONS = 'yardly_demo_reservations';
const LOCAL_STORAGE_KEY_PAYMENTS = 'yardly_demo_payments';
const LOCAL_STORAGE_KEY_INQUIRIES = 'yardly_demo_inquiries';
const LOCAL_STORAGE_KEY_USERS = 'yardly_demo_users';
const LOCAL_STORAGE_KEY_CURRENT_USER = 'yardly_current_user';
const LOCAL_STORAGE_KEY_AUCTIONS = 'yardly_demo_auctions';
const LOCAL_STORAGE_KEY_TRADE_INS = 'yardly_demo_trade_ins';
const LOCAL_STORAGE_KEY_IMPORTS = 'yardly_demo_imports';
const LOCAL_STORAGE_KEY_FAVORITES = 'yardly_demo_favorites';
const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'yardly_demo_notifications';

const MOCK_DATASET_VERSION = 'v2026_09_01_generic_fallback_engine_v12';

function getStored<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;

  // Clear stale cached demo dataset if dataset version has changed
  if (key === LOCAL_STORAGE_KEY_VEHICLES) {
    const versionKey = 'yardly_demo_dataset_version';
    const storedVersion = localStorage.getItem(versionKey);
    if (storedVersion !== MOCK_DATASET_VERSION) {
      localStorage.setItem(versionKey, MOCK_DATASET_VERSION);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
  }

  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(item);
  } catch {
    return initial;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  seller_type?: SellerType;
  business_name?: string;
}

// Authentication Service
export const AuthService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Yardly User',
          phone: user.user_metadata?.phone,
          role: (user.user_metadata?.role as UserRole) || 'admin',
          seller_type: user.user_metadata?.seller_type,
          business_name: user.user_metadata?.business_name
        };
      }
    }
    const currentUser = getStored<AuthUser | null>(LOCAL_STORAGE_KEY_CURRENT_USER, null);
    if (currentUser) return currentUser;

    // Default admin profile for seamless demo access if no user logged in
    return {
      id: 'admin-default-id',
      email: 'admin@yardly.co.ke',
      full_name: 'YARDLY Car-Yard Admin',
      role: 'admin'
    };
  },

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Yardly User',
          phone: data.user.user_metadata?.phone,
          role: (data.user.user_metadata?.role as UserRole) || 'buyer',
          seller_type: data.user.user_metadata?.seller_type,
          business_name: data.user.user_metadata?.business_name
        };
        setStored(LOCAL_STORAGE_KEY_CURRENT_USER, user);
        return { success: true, user };
      }
    }

    const users = getStored<Array<AuthUser & { password?: string }>>(LOCAL_STORAGE_KEY_USERS, [
      {
        id: 'admin-default-id',
        email: 'admin@yardly.co.ke',
        password: 'Admin@123',
        full_name: 'YARDLY Car-Yard Admin',
        role: 'admin'
      },
      {
        id: 'buyer-001',
        email: 'buyer@yardly.co.ke',
        password: 'Buyer@123',
        full_name: 'Maina Kamau',
        phone: '0712052104',
        role: 'buyer'
      },
      {
        id: 'seller-001',
        email: 'seller@yardly.co.ke',
        password: 'Seller@123',
        full_name: 'Nairobi Motors Hub',
        phone: '0712052104',
        role: 'seller',
        seller_type: 'dealer',
        business_name: 'Nairobi Motors Hub Ltd'
      }
    ]);

    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found && found.password && found.password !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    const user: AuthUser = found
      ? { 
          id: found.id, 
          email: found.email, 
          full_name: found.full_name, 
          phone: found.phone, 
          role: found.role, 
          seller_type: found.seller_type, 
          business_name: found.business_name 
        }
      : { 
          id: 'u-' + Date.now(), 
          email, 
          full_name: email.split('@')[0] || 'Yardly User', 
          role: email.includes('admin') ? 'admin' : email.includes('seller') ? 'seller' : 'buyer' 
        };

    setStored(LOCAL_STORAGE_KEY_CURRENT_USER, user);
    return { success: true, user };
  },

  async signUp(
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole = 'buyer', 
    phone?: string, 
    sellerType?: SellerType, 
    businessName?: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName, 
            phone, 
            role, 
            seller_type: sellerType, 
            business_name: businessName 
          }
        }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName,
          phone,
          role,
          seller_type: sellerType,
          business_name: businessName
        };
        setStored(LOCAL_STORAGE_KEY_CURRENT_USER, user);
        return { success: true, user };
      }
    }

    const users = getStored<Array<AuthUser & { password?: string }>>(LOCAL_STORAGE_KEY_USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser = {
      id: 'u-' + Date.now(),
      email,
      password,
      full_name: fullName,
      phone,
      role,
      seller_type: sellerType,
      business_name: businessName
    };

    users.push(newUser);
    setStored(LOCAL_STORAGE_KEY_USERS, users);

    const userSession: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      phone: newUser.phone,
      role: newUser.role,
      seller_type: newUser.seller_type,
      business_name: newUser.business_name
    };
    setStored(LOCAL_STORAGE_KEY_CURRENT_USER, userSession);

    return { success: true, user: userSession };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    }
  }
};

// Vehicle Management Service
export const VehicleService = {
  async getAll(): Promise<Vehicle[]> {
    let list: Vehicle[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, images:vehicle_images(*), features:vehicle_features(feature_name)')
        .order('created_at', { ascending: false });
      if (!error && data) list = data as Vehicle[];
    }
    
    if (!list || list.length === 0) {
      list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    }

    // Ensure every single vehicle has a valid photography gallery resolved
    return list.map(v => {
      if (!v.images || v.images.length === 0 || !v.images[0]?.image_url) {
        v.images = resolveVehicleImages(v);
      }
      return v;
    });
  },

  async getById(id: string): Promise<Vehicle | null> {
    const vehicles = await this.getAll();
    return vehicles.find(v => v.id === id) || null;
  },

  async filterVehicles(params: {
    make?: string;
    model?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    bodyType?: string;
    transmission?: string;
    fuelType?: string;
    verifiedOnly?: boolean;
    featuredOnly?: boolean;
    status?: string;
    sortBy?: 'newest' | 'price_low' | 'price_high' | 'mileage_low';
  }): Promise<Vehicle[]> {
    let list = await this.getAll();

    if (params.status) {
      list = list.filter(v => v.status === params.status);
    } else {
      list = list.filter(v => v.status === 'active' || v.status === 'reserved');
    }

    if (params.make) {
      list = list.filter(v => v.make.toLowerCase() === params.make?.toLowerCase());
    }
    if (params.model) {
      list = list.filter(v => v.model.toLowerCase().includes(params.model?.toLowerCase() || ''));
    }
    if (params.location) {
      list = list.filter(v => v.location.toLowerCase() === params.location?.toLowerCase());
    }
    if (params.minPrice) {
      list = list.filter(v => v.price >= params.minPrice!);
    }
    if (params.maxPrice) {
      list = list.filter(v => v.price <= params.maxPrice!);
    }
    if (params.minYear) {
      list = list.filter(v => v.year >= params.minYear!);
    }
    if (params.maxYear) {
      list = list.filter(v => v.year <= params.maxYear!);
    }
    if (params.bodyType) {
      list = list.filter(v => v.body_type.toLowerCase() === params.bodyType?.toLowerCase());
    }
    if (params.transmission) {
      list = list.filter(v => v.transmission.toLowerCase() === params.transmission?.toLowerCase());
    }
    if (params.fuelType) {
      list = list.filter(v => v.fuel_type.toLowerCase() === params.fuelType?.toLowerCase());
    }
    if (params.verifiedOnly) {
      list = list.filter(v => v.verification_status === 'verified');
    }
    if (params.featuredOnly) {
      list = list.filter(v => v.featured);
    }

    if (params.sortBy === 'price_low') {
      list.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === 'price_high') {
      list.sort((a, b) => b.price - a.price);
    } else if (params.sortBy === 'mileage_low') {
      list.sort((a, b) => a.mileage - b.mileage);
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  },

  async addVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: 'v-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    list.unshift(newVehicle);
    setStored(LOCAL_STORAGE_KEY_VEHICLES, list);
    return newVehicle;
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    const index = list.findIndex(v => v.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      setStored(LOCAL_STORAGE_KEY_VEHICLES, list);
      return list[index];
    }
    return null;
  },

  async updateStatus(id: string, status: Vehicle['status']): Promise<void> {
    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    const item = list.find(v => v.id === id);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
      setStored(LOCAL_STORAGE_KEY_VEHICLES, list);
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    const updated = list.filter(v => v.id !== id);
    setStored(LOCAL_STORAGE_KEY_VEHICLES, updated);
  }
};

// Seller Submission Service
export const SellerSubmissionService = {
  async getAll(): Promise<SellerListingSubmission[]> {
    return getStored<SellerListingSubmission[]>(LOCAL_STORAGE_KEY_SUBMISSIONS, INITIAL_MOCK_SUBMISSIONS);
  },

  async create(submission: Omit<SellerListingSubmission, 'id' | 'status' | 'created_at'>): Promise<SellerListingSubmission> {
    const record: SellerListingSubmission = {
      ...submission,
      id: 'sub-' + Date.now(),
      status: 'pending_review',
      created_at: new Date().toISOString()
    };
    const list = getStored<SellerListingSubmission[]>(LOCAL_STORAGE_KEY_SUBMISSIONS, INITIAL_MOCK_SUBMISSIONS);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_SUBMISSIONS, list);
    return record;
  },

  async updateStatus(id: string, status: SellerListingSubmission['status'], rejection_reason?: string): Promise<void> {
    const list = getStored<SellerListingSubmission[]>(LOCAL_STORAGE_KEY_SUBMISSIONS, INITIAL_MOCK_SUBMISSIONS);
    const item = list.find(s => s.id === id);
    if (item) {
      item.status = status;
      if (rejection_reason) item.rejection_reason = rejection_reason;
      setStored(LOCAL_STORAGE_KEY_SUBMISSIONS, list);

      if (status === 'approved') {
        await VehicleService.addVehicle({
          dealer_name: item.seller_name,
          seller_type: item.seller_type,
          make: item.make,
          model: item.model,
          year: item.year,
          price: item.asking_price,
          currency: 'KES',
          mileage: item.mileage,
          engine_cc: item.engine_cc,
          fuel_type: item.fuel_type,
          transmission: item.transmission,
          body_type: item.body_type,
          color: 'Standard',
          location: item.location,
          description: item.description,
          status: 'active',
          verification_status: 'verified',
          logbook_verified: Boolean(item.logbook_document_url),
          featured: false,
          images: item.images.map((url, i) => ({
            id: `img-${Date.now()}-${i}`,
            vehicle_id: '',
            image_url: url,
            display_order: i + 1,
            is_primary: i === 0,
            created_at: new Date().toISOString()
          }))
        });
      }
    }
  }
};

// Buyer & Seller Profiles Management Service
export const BuyerService = {
  async getAll(): Promise<Profile[]> {
    const users = getStored<Profile[]>(LOCAL_STORAGE_KEY_USERS, INITIAL_MOCK_BUYERS);
    return users.filter(u => u.role === 'buyer');
  },

  async updateStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
    const users = getStored<Profile[]>(LOCAL_STORAGE_KEY_USERS, INITIAL_MOCK_BUYERS);
    const found = users.find(u => u.id === id);
    if (found) {
      found.status = status;
      setStored(LOCAL_STORAGE_KEY_USERS, users);
    }
  }
};

export const SellerService = {
  async getAll(): Promise<Profile[]> {
    const users = getStored<Profile[]>(LOCAL_STORAGE_KEY_USERS, INITIAL_MOCK_SELLERS);
    return users.filter(u => u.role === 'seller' || u.role === 'dealer');
  },

  async updateVerification(id: string, status: 'verified' | 'rejected'): Promise<void> {
    const users = getStored<Profile[]>(LOCAL_STORAGE_KEY_USERS, INITIAL_MOCK_SELLERS);
    const found = users.find(u => u.id === id);
    if (found) {
      found.status = status === 'verified' ? 'active' : 'suspended';
      setStored(LOCAL_STORAGE_KEY_USERS, users);
    }
  }
};

// Auction Service
export const AuctionService = {
  async getAll(): Promise<Auction[]> {
    const auctions = getStored<Auction[]>(LOCAL_STORAGE_KEY_AUCTIONS, INITIAL_MOCK_AUCTIONS);
    const vehicles = await VehicleService.getAll();
    
    // Attach vehicle details & update live statuses based on server time
    const now = new Date().getTime();
    return auctions.map(auc => {
      const v = vehicles.find(item => item.id === auc.vehicle_id);
      let status = auc.status;
      const start = new Date(auc.start_time).getTime();
      const end = new Date(auc.end_time).getTime();

      if (status !== 'cancelled') {
        if (now < start) {
          status = 'upcoming';
        } else if (now >= start && now < end) {
          status = (end - now <= 24 * 3600 * 1000) ? 'ending_soon' : 'live';
        } else if (now >= end) {
          status = 'ended';
        }
      }

      return {
        ...auc,
        status,
        vehicle: v
      };
    });
  },

  async getById(id: string): Promise<Auction | null> {
    const list = await this.getAll();
    return list.find(a => a.id === id) || null;
  },

  async createAuction(data: Omit<Auction, 'id' | 'bid_count' | 'created_at' | 'current_bid'>): Promise<Auction> {
    const newAuc: Auction = {
      ...data,
      id: 'auc-' + Date.now(),
      current_bid: data.starting_bid,
      bid_count: 0,
      created_at: new Date().toISOString()
    };
    const list = getStored<Auction[]>(LOCAL_STORAGE_KEY_AUCTIONS, INITIAL_MOCK_AUCTIONS);
    list.unshift(newAuc);
    setStored(LOCAL_STORAGE_KEY_AUCTIONS, list);
    return newAuc;
  },

  async placeBid(auctionId: string, buyer: AuthUser, amount: number): Promise<{ success: boolean; auction?: Auction; error?: string }> {
    const list = getStored<Auction[]>(LOCAL_STORAGE_KEY_AUCTIONS, INITIAL_MOCK_AUCTIONS);
    const auc = list.find(a => a.id === auctionId);
    if (!auc) return { success: false, error: 'Auction not found.' };

    const now = new Date().getTime();
    const end = new Date(auc.end_time).getTime();
    if (now >= end || auc.status === 'ended' || auc.status === 'cancelled') {
      return { success: false, error: 'This auction has ended and is no longer accepting bids.' };
    }

    const minBidRequired = auc.current_bid + (auc.minimum_increment || 10000);
    if (amount < minBidRequired) {
      return { success: false, error: `Bid amount must be at least KES ${minBidRequired.toLocaleString()}` };
    }

    const newBid: AuctionBid = {
      id: 'bid-' + Date.now(),
      auction_id: auctionId,
      buyer_id: buyer.id,
      buyer_name: buyer.full_name,
      buyer_email: buyer.email,
      amount,
      created_at: new Date().toISOString()
    };

    if (!auc.bids) auc.bids = [];
    auc.bids.unshift(newBid);
    auc.current_bid = amount;
    auc.bid_count = (auc.bid_count || 0) + 1;
    auc.updated_at = new Date().toISOString();

    setStored(LOCAL_STORAGE_KEY_AUCTIONS, list);

    // Notify user
    await NotificationService.createNotification({
      user_id: buyer.id,
      type: 'auction_bid',
      title: 'Bid Placed Successfully',
      message: `You placed a bid of KES ${amount.toLocaleString()} on auction #${auctionId}`,
      link: '/auction'
    });

    return { success: true, auction: auc };
  },

  async updateStatus(id: string, status: Auction['status']): Promise<void> {
    const list = getStored<Auction[]>(LOCAL_STORAGE_KEY_AUCTIONS, INITIAL_MOCK_AUCTIONS);
    const auc = list.find(a => a.id === id);
    if (auc) {
      auc.status = status;
      setStored(LOCAL_STORAGE_KEY_AUCTIONS, list);
    }
  }
};

// Trade-In Service
export const TradeInService = {
  async getAll(): Promise<TradeInRequest[]> {
    return getStored<TradeInRequest[]>(LOCAL_STORAGE_KEY_TRADE_INS, INITIAL_MOCK_TRADE_INS);
  },

  async create(req: Omit<TradeInRequest, 'id' | 'reference_id' | 'status' | 'created_at'>): Promise<TradeInRequest> {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const record: TradeInRequest = {
      ...req,
      id: 'trd-' + Date.now(),
      reference_id: `TRD-${new Date().getFullYear()}-${randomCode}`,
      status: 'new',
      created_at: new Date().toISOString()
    };
    const list = getStored<TradeInRequest[]>(LOCAL_STORAGE_KEY_TRADE_INS, INITIAL_MOCK_TRADE_INS);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_TRADE_INS, list);
    return record;
  },

  async updateStatus(id: string, status: TradeInRequest['status'], adminValuation?: number, adminNotes?: string): Promise<void> {
    const list = getStored<TradeInRequest[]>(LOCAL_STORAGE_KEY_TRADE_INS, INITIAL_MOCK_TRADE_INS);
    const item = list.find(t => t.id === id);
    if (item) {
      item.status = status;
      if (adminValuation !== undefined) item.admin_valuation = adminValuation;
      if (adminNotes !== undefined) item.admin_notes = adminNotes;
      item.updated_at = new Date().toISOString();
      setStored(LOCAL_STORAGE_KEY_TRADE_INS, list);
    }
  }
};

// Import Service
export const ImportService = {
  async getAll(): Promise<ImportRequest[]> {
    return getStored<ImportRequest[]>(LOCAL_STORAGE_KEY_IMPORTS, INITIAL_MOCK_IMPORTS);
  },

  async create(req: Omit<ImportRequest, 'id' | 'reference_number' | 'status' | 'created_at'>): Promise<ImportRequest> {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const record: ImportRequest = {
      ...req,
      id: 'imp-' + Date.now(),
      reference_number: `IMP-${new Date().getFullYear()}-${randomCode}`,
      status: 'new',
      created_at: new Date().toISOString()
    };
    const list = getStored<ImportRequest[]>(LOCAL_STORAGE_KEY_IMPORTS, INITIAL_MOCK_IMPORTS);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_IMPORTS, list);
    return record;
  },

  async updateStatus(id: string, status: ImportRequest['status'], notes?: string, assignedTo?: string): Promise<void> {
    const list = getStored<ImportRequest[]>(LOCAL_STORAGE_KEY_IMPORTS, INITIAL_MOCK_IMPORTS);
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = status;
      if (notes !== undefined) item.admin_notes = notes;
      if (assignedTo !== undefined) item.assigned_to = assignedTo;
      item.updated_at = new Date().toISOString();
      setStored(LOCAL_STORAGE_KEY_IMPORTS, list);
    }
  }
};

// Favorites / Saved Vehicles Service
export const FavoriteService = {
  async getByUserId(userId: string): Promise<Favorite[]> {
    const list = getStored<Favorite[]>(LOCAL_STORAGE_KEY_FAVORITES, INITIAL_MOCK_FAVORITES);
    const userFavs = list.filter(f => f.user_id === userId);
    const vehicles = await VehicleService.getAll();
    return userFavs.map(f => ({
      ...f,
      vehicle: vehicles.find(v => v.id === f.vehicle_id)
    }));
  },

  async toggleFavorite(userId: string, vehicleId: string): Promise<boolean> {
    const list = getStored<Favorite[]>(LOCAL_STORAGE_KEY_FAVORITES, INITIAL_MOCK_FAVORITES);
    const existingIndex = list.findIndex(f => f.user_id === userId && f.vehicle_id === vehicleId);

    if (existingIndex !== -1) {
      list.splice(existingIndex, 1);
      setStored(LOCAL_STORAGE_KEY_FAVORITES, list);
      return false; // Removed
    } else {
      list.push({
        id: 'fav-' + Date.now(),
        user_id: userId,
        vehicle_id: vehicleId,
        created_at: new Date().toISOString()
      });
      setStored(LOCAL_STORAGE_KEY_FAVORITES, list);
      return true; // Added
    }
  },

  async isFavorite(userId: string, vehicleId: string): Promise<boolean> {
    const list = getStored<Favorite[]>(LOCAL_STORAGE_KEY_FAVORITES, INITIAL_MOCK_FAVORITES);
    return list.some(f => f.user_id === userId && f.vehicle_id === vehicleId);
  }
};

// Notification Service
export const NotificationService = {
  async getByUserId(userId: string): Promise<NotificationItem[]> {
    const list = getStored<NotificationItem[]>(LOCAL_STORAGE_KEY_NOTIFICATIONS, INITIAL_MOCK_NOTIFICATIONS);
    return list.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createNotification(notif: Omit<NotificationItem, 'id' | 'read' | 'created_at'>): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now(),
      read: false,
      created_at: new Date().toISOString()
    };
    const list = getStored<NotificationItem[]>(LOCAL_STORAGE_KEY_NOTIFICATIONS, INITIAL_MOCK_NOTIFICATIONS);
    list.unshift(newNotif);
    setStored(LOCAL_STORAGE_KEY_NOTIFICATIONS, list);
    return newNotif;
  },

  async markAsRead(id: string): Promise<void> {
    const list = getStored<NotificationItem[]>(LOCAL_STORAGE_KEY_NOTIFICATIONS, INITIAL_MOCK_NOTIFICATIONS);
    const found = list.find(n => n.id === id);
    if (found) {
      found.read = true;
      setStored(LOCAL_STORAGE_KEY_NOTIFICATIONS, list);
    }
  }
};

// Payment & Reservation Services
export const ReservationService = {
  async getAll(): Promise<Reservation[]> {
    return getStored<Reservation[]>(LOCAL_STORAGE_KEY_RESERVATIONS, INITIAL_MOCK_RESERVATIONS);
  },

  async create(res: Omit<Reservation, 'id' | 'created_at' | 'status'>): Promise<Reservation> {
    const record: Reservation = {
      ...res,
      id: 'res-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    const list = getStored<Reservation[]>(LOCAL_STORAGE_KEY_RESERVATIONS, INITIAL_MOCK_RESERVATIONS);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_RESERVATIONS, list);

    await VehicleService.updateStatus(res.vehicle_id, 'reserved');
    return record;
  },

  async updateStatus(id: string, status: Reservation['status']): Promise<void> {
    const list = getStored<Reservation[]>(LOCAL_STORAGE_KEY_RESERVATIONS, INITIAL_MOCK_RESERVATIONS);
    const item = list.find(r => r.id === id);
    if (item) {
      item.status = status;
      setStored(LOCAL_STORAGE_KEY_RESERVATIONS, list);
    }
  }
};

export const PaymentService = {
  async getAll(): Promise<PaymentRecord[]> {
    return getStored<PaymentRecord[]>(LOCAL_STORAGE_KEY_PAYMENTS, INITIAL_MOCK_PAYMENTS);
  },

  async record(payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRecord> {
    const record: PaymentRecord = {
      ...payment,
      id: 'pay-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const list = getStored<PaymentRecord[]>(LOCAL_STORAGE_KEY_PAYMENTS, INITIAL_MOCK_PAYMENTS);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_PAYMENTS, list);
    return record;
  }
};

export const InquiryService = {
  async getAll(): Promise<VehicleInquiry[]> {
    return getStored<VehicleInquiry[]>(LOCAL_STORAGE_KEY_INQUIRIES, INITIAL_MOCK_INQUIRIES);
  },

  async create(inquiry: Omit<VehicleInquiry, 'id' | 'created_at' | 'status'>): Promise<VehicleInquiry> {
    const record: VehicleInquiry = {
      ...inquiry,
      id: 'inq-' + Date.now(),
      status: 'new',
      created_at: new Date().toISOString()
    };
    const list = getStored<VehicleInquiry[]>(LOCAL_STORAGE_KEY_INQUIRIES, INITIAL_MOCK_INQUIRIES);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_INQUIRIES, list);
    return record;
  },

  async updateStatus(id: string, status: VehicleInquiry['status']): Promise<void> {
    const list = getStored<VehicleInquiry[]>(LOCAL_STORAGE_KEY_INQUIRIES, INITIAL_MOCK_INQUIRIES);
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = status;
      setStored(LOCAL_STORAGE_KEY_INQUIRIES, list);
    }
  }
};
