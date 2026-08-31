import { createClient } from '@supabase/supabase-js';
import { Vehicle, SellerListingSubmission, Reservation, PaymentRecord, VehicleInquiry, Profile } from '../../types/database';
import { INITIAL_MOCK_VEHICLES, INITIAL_MOCK_SUBMISSIONS, INITIAL_MOCK_RESERVATIONS, INITIAL_MOCK_PAYMENTS, INITIAL_MOCK_INQUIRIES } from './mockData';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseUrl.includes('supabase.co') && supabaseAnonKey && !supabaseAnonKey.includes('dummy'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local persistent memory store for fallback demo mode
const LOCAL_STORAGE_KEY_VEHICLES = 'yardly_demo_vehicles';
const LOCAL_STORAGE_KEY_SUBMISSIONS = 'yardly_demo_submissions';
const LOCAL_STORAGE_KEY_RESERVATIONS = 'yardly_demo_reservations';
const LOCAL_STORAGE_KEY_PAYMENTS = 'yardly_demo_payments';
const LOCAL_STORAGE_KEY_INQUIRIES = 'yardly_demo_inquiries';
const LOCAL_STORAGE_KEY_USERS = 'yardly_demo_users';
const LOCAL_STORAGE_KEY_CURRENT_USER = 'yardly_current_user';

function getStored<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;
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
  role: 'admin' | 'dealer' | 'buyer';
}

// Authentication Service (Supabase Auth + Local Persistent Fallback)
export const AuthService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Yardly Admin',
          role: 'admin'
        };
      }
    }
    const currentUser = getStored<AuthUser | null>(LOCAL_STORAGE_KEY_CURRENT_USER, null);
    if (currentUser) return currentUser;

    // Default admin profile for seamless demo access
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
          full_name: data.user.user_metadata?.full_name || 'Yardly Admin',
          role: 'admin'
        };
        setStored(LOCAL_STORAGE_KEY_CURRENT_USER, user);
        return { success: true, user };
      }
    }

    // Local persistent authentication fallback
    const users = getStored<Array<AuthUser & { password?: string }>>(LOCAL_STORAGE_KEY_USERS, [
      {
        id: 'admin-default-id',
        email: 'admin@yardly.co.ke',
        password: 'Admin@123',
        full_name: 'YARDLY Car-Yard Admin',
        role: 'admin'
      }
    ]);

    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found && found.password && found.password !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    const user: AuthUser = found
      ? { id: found.id, email: found.email, full_name: found.full_name, role: found.role }
      : { id: 'u-' + Date.now(), email, full_name: email.split('@')[0] || 'Yardly Admin', role: 'admin' };

    setStored(LOCAL_STORAGE_KEY_CURRENT_USER, user);
    return { success: true, user };
  },

  async signUp(email: string, password: string, fullName: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: 'admin' }
        }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName,
          role: 'admin'
        };
        setStored(LOCAL_STORAGE_KEY_CURRENT_USER, user);
        return { success: true, user };
      }
    }

    // Local persistent registration fallback
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
      role: 'admin' as const
    };

    users.push(newUser);
    setStored(LOCAL_STORAGE_KEY_USERS, users);
    
    const userSession: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role
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

// Data Access API Services
export const VehicleService = {
  async getAll(): Promise<Vehicle[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, images:vehicle_images(*), features:vehicle_features(feature_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Vehicle[];
    }
    return getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
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
    sortBy?: 'newest' | 'price_low' | 'price_high' | 'mileage_low';
  }): Promise<Vehicle[]> {
    let list = await this.getAll();

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

    // Sort logic
    if (params.sortBy === 'price_low') {
      list.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === 'price_high') {
      list.sort((a, b) => b.price - a.price);
    } else if (params.sortBy === 'mileage_low') {
      list.sort((a, b) => a.mileage - b.mileage);
    } else {
      // Default: newest
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

  async updateStatus(id: string, status: Vehicle['status']): Promise<void> {
    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    const item = list.find(v => v.id === id);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
      setStored(LOCAL_STORAGE_KEY_VEHICLES, list);
    }
  }
};

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
        // Convert to active vehicle listing
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

    // Mark vehicle as reserved
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
  }
};
