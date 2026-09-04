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
import { saveVehicleImageToIndexedDB, getAllVehicleImagesFromIndexedDB } from '../utils/imageStore';

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

const MOCK_DATASET_VERSION = 'v2026_09_02_new_vehicles_batch_v5';

let inMemoryVehiclesCache: Vehicle[] | null = null;

function sanitizeVehiclesForStorage(vehicles: Vehicle[]): Vehicle[] {
  if (!Array.isArray(vehicles)) return [];
  return vehicles.map(v => ({
    ...v,
    images: (v.images || []).map(img => {
      if (img.image_url && img.image_url.startsWith('data:')) {
        saveVehicleImageToIndexedDB(img.id, img.image_url);
        return {
          ...img,
          image_url: `idb://${img.id}`
        };
      }
      return img;
    })
  }));
}

// Clean bloated legacy Base64 storage strings & /logo.jpeg fallbacks on startup
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
    if (raw && (raw.includes('data:image') || raw.includes('/logo.jpeg'))) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((v: any) => ({
          ...v,
          images: (v.images || []).filter((img: any) => img.image_url !== '/logo.jpeg')
        }));
        inMemoryVehiclesCache = cleaned;
        const sanitized = sanitizeVehiclesForStorage(cleaned);
        localStorage.setItem(LOCAL_STORAGE_KEY_VEHICLES, JSON.stringify(sanitized));
      }
    }
  } catch {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_VEHICLES);
    } catch {
      // Ignore
    }
  }
}

function getStored<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;

  if (key === LOCAL_STORAGE_KEY_VEHICLES && inMemoryVehiclesCache && inMemoryVehiclesCache.length > 0) {
    return inMemoryVehiclesCache as unknown as T;
  }

  // Clear bloated/corrupted legacy demo dataset if version has changed
  if (key === LOCAL_STORAGE_KEY_VEHICLES) {
    const versionKey = 'yardly_demo_dataset_version';
    const storedVersion = localStorage.getItem(versionKey);
    if (storedVersion !== MOCK_DATASET_VERSION) {
      try {
        localStorage.setItem(versionKey, MOCK_DATASET_VERSION);
        const sanitizedInitial = sanitizeVehiclesForStorage(initial as unknown as Vehicle[]);
        localStorage.setItem(key, JSON.stringify(sanitizedInitial));
      } catch {
        // Ignore storage quota exception
      }
      return initial;
    }
  }

  try {
    const item = localStorage.getItem(key);
    if (!item) {
      const sanitizedInitial = key === LOCAL_STORAGE_KEY_VEHICLES 
        ? sanitizeVehiclesForStorage(initial as unknown as Vehicle[]) 
        : initial;
      localStorage.setItem(key, JSON.stringify(sanitizedInitial));
      return initial;
    }
    const parsed = JSON.parse(item);
    if (key === LOCAL_STORAGE_KEY_VEHICLES && Array.isArray(parsed)) {
      inMemoryVehiclesCache = parsed as Vehicle[];
    }
    return parsed;
  } catch {
    return initial;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  if (key === LOCAL_STORAGE_KEY_VEHICLES && Array.isArray(value)) {
    inMemoryVehiclesCache = value as unknown as Vehicle[];
    try {
      const sanitized = sanitizeVehiclesForStorage(value as unknown as Vehicle[]);
      localStorage.setItem(key, JSON.stringify(sanitized));
    } catch (err) {
      console.warn('localStorage setItem quota avoided for vehicles:', err);
    }
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`localStorage setItem failed for key ${key}:`, err);
  }
}

// Helper to upload Base64 images to Supabase Storage bucket 'vehicles'
export async function uploadVehicleImageToSupabase(vehicleId: string, imageSource: string): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    return imageSource;
  }

  // If already an HTTP/HTTPS URL, return directly
  if (!imageSource.startsWith('data:')) {
    return imageSource;
  }

  try {
    const [header, base64Data] = imageSource.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const extension = mime.split('/')[1] || 'jpg';
    
    const binary = atob(base64Data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([array], { type: mime });
    const fileName = `vehicles/${vehicleId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vehicles')
      .upload(fileName, blob, {
        contentType: mime,
        upsert: true
      });

    if (uploadError) {
      console.warn('Supabase storage upload notice:', uploadError.message);
      return imageSource;
    }

    const { data: publicUrlData } = supabase.storage
      .from('vehicles')
      .getPublicUrl(uploadData.path);

    return publicUrlData?.publicUrl || imageSource;
  } catch (err) {
    console.warn('Failed to upload image to Supabase Storage, using fallback:', err);
    return imageSource;
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

// Secure Password Hashing Helper
async function hashPassword(password: string): Promise<string> {
  const salted = 'yardly_auth_salt_2026:' + password;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salted);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'sha256_mock_' + Math.abs(hash).toString(16);
}

// Server / API Level Admin Authorization Guard
export async function requireAdminRole(): Promise<AuthUser> {
  const user = await AuthService.getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Access denied: Administrator privileges required.');
  }
  return user;
}

interface StoredUserAccount extends AuthUser {
  passwordHash?: string;
  password?: string;
}

async function getStoredUsers(): Promise<StoredUserAccount[]> {
  const users = getStored<StoredUserAccount[]>(LOCAL_STORAGE_KEY_USERS, []);

  // Ensure dedicated primary admin account exists with hashed credentials
  let adminAcc = users.find(u => u.email.toLowerCase() === 'admin@varbanautohub.com');
  const adminHash = await hashPassword('Admin123');

  if (!adminAcc) {
    adminAcc = {
      id: 'admin-primary-001',
      email: 'admin@varbanautohub.com',
      passwordHash: adminHash,
      full_name: 'Varban Auto Flex System Administrator',
      role: 'admin'
    };
    users.unshift(adminAcc);
    setStored(LOCAL_STORAGE_KEY_USERS, users);
  } else if (!adminAcc.passwordHash || adminAcc.passwordHash !== adminHash) {
    adminAcc.passwordHash = adminHash;
    adminAcc.role = 'admin';
    delete adminAcc.password;
    setStored(LOCAL_STORAGE_KEY_USERS, users);
  }

  // Ensure demo accounts have hashes
  for (const u of users) {
    if (!u.passwordHash && u.password) {
      u.passwordHash = await hashPassword(u.password);
      delete u.password;
    }
  }

  return users;
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
          full_name: user.user_metadata?.full_name || 'Varban User',
          phone: user.user_metadata?.phone,
          role: (user.user_metadata?.role as UserRole) || 'buyer',
          seller_type: user.user_metadata?.seller_type,
          business_name: user.user_metadata?.business_name
        };
      }
    }
    const currentUser = getStored<AuthUser | null>(LOCAL_STORAGE_KEY_CURRENT_USER, null);
    if (currentUser) {
      const { ...safeUser } = currentUser as any;
      delete safeUser.password;
      delete safeUser.passwordHash;
      return safeUser;
    }

    return null;
  },

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Varban User',
          phone: data.user.user_metadata?.phone,
          role: (data.user.user_metadata?.role as UserRole) || 'buyer',
          seller_type: data.user.user_metadata?.seller_type,
          business_name: data.user.user_metadata?.business_name
        };
        setStored(LOCAL_STORAGE_KEY_CURRENT_USER, user);
        return { success: true, user };
      }
    }

    const users = await getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }

    const inputHash = await hashPassword(password);
    const isValid = found.passwordHash === inputHash;

    if (!isValid) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }

    const sessionUser: AuthUser = {
      id: found.id,
      email: found.email,
      full_name: found.full_name,
      phone: found.phone,
      role: found.role,
      seller_type: found.seller_type,
      business_name: found.business_name
    };

    setStored(LOCAL_STORAGE_KEY_CURRENT_USER, sessionUser);
    return { success: true, user: sessionUser };
  },

  async signUp(
    email: string, 
    password: string, 
    fullName: string, 
    requestedRole: UserRole = 'buyer', 
    phone?: string, 
    sellerType?: SellerType, 
    businessName?: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    // CRITICAL SECURITY ENFORCEMENT: Public registration can NEVER assign admin role!
    const sanitizedRole: UserRole = requestedRole === 'seller' ? 'seller' : 'buyer';

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName, 
            phone, 
            role: sanitizedRole, 
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
          role: sanitizedRole,
          seller_type: sellerType,
          business_name: businessName
        };
        setStored(LOCAL_STORAGE_KEY_CURRENT_USER, user);
        return { success: true, user };
      }
    }

    const users = await getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser: StoredUserAccount = {
      id: 'u-' + Date.now(),
      email,
      passwordHash,
      full_name: fullName,
      phone,
      role: sanitizedRole,
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

    const idbMap = await getAllVehicleImagesFromIndexedDB();

    return list.map(v => {
      if (v.images && v.images.length > 0) {
        v.images = v.images
          .filter(img => img.image_url !== '/logo.jpeg')
          .map(img => {
            if (img.image_url && img.image_url.startsWith('idb://')) {
              const idbKey = img.image_url.replace('idb://', '');
              const storedBlob = idbMap[idbKey];
              if (storedBlob) {
                return { ...img, image_url: storedBlob };
              }
            }
            return img;
          });
      }

      if (!v.images || v.images.length === 0 || !v.images[0]?.image_url || v.images[0].image_url === '/logo.jpeg') {
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

    const s = String(params.sortBy || '').toLowerCase();
    if (s === 'price_low' || s === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (s === 'price_high' || s === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (s === 'mileage_low' || s === 'mileage-asc') {
      list.sort((a, b) => a.mileage - b.mileage);
    } else if (s === 'year-desc' || s === 'year_high') {
      list.sort((a, b) => b.year - a.year);
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  },

  async addVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    await requireAdminRole();
    const vehicleId = 'v-' + Date.now();

    // 1. Process and upload any Base64 images to Supabase Storage
    const uploadedImages = await Promise.all(
      (vehicle.images || []).map(async (img, idx) => {
        const publicUrl = await uploadVehicleImageToSupabase(vehicleId, img.image_url);
        return {
          ...img,
          id: img.id || `img-${vehicleId}-${idx}`,
          vehicle_id: vehicleId,
          image_url: publicUrl,
          display_order: idx + 1,
          is_primary: idx === 0,
          created_at: img.created_at || new Date().toISOString()
        };
      })
    );

    const newVehicle: Vehicle = {
      ...vehicle,
      id: vehicleId,
      images: uploadedImages,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 2. Persist to Supabase PostgreSQL Database if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: insertedDbVehicle, error: vErr } = await supabase
          .from('vehicles')
          .insert([{
            make: vehicle.make,
            model: vehicle.model,
            variant: vehicle.variant || '',
            year: vehicle.year,
            price: vehicle.price,
            currency: vehicle.currency || 'KES',
            mileage: vehicle.mileage,
            engine_cc: vehicle.engine_cc,
            fuel_type: vehicle.fuel_type,
            transmission: vehicle.transmission,
            body_type: vehicle.body_type,
            color: vehicle.color || 'Silver',
            location: vehicle.location,
            description: vehicle.description,
            status: vehicle.status || 'active',
            verification_status: vehicle.verification_status || 'verified',
            logbook_verified: vehicle.logbook_verified ?? true,
            featured: vehicle.featured ?? false,
            seller_type: vehicle.seller_type || 'dealer',
            dealer_name: vehicle.dealer_name || 'Varban Certified'
          }])
          .select()
          .single();

        if (!vErr && insertedDbVehicle) {
          const dbVehicleId = insertedDbVehicle.id;
          newVehicle.id = dbVehicleId;

          if (uploadedImages.length > 0) {
            await supabase.from('vehicle_images').insert(
              uploadedImages.map((img, idx) => ({
                vehicle_id: dbVehicleId,
                image_url: img.image_url,
                display_order: idx + 1,
                is_primary: idx === 0
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Supabase DB insertion notice:', err);
      }
    }

    // 3. Update memory state and sanitized storage (safe from quota errors)
    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    list.unshift(newVehicle);
    setStored(LOCAL_STORAGE_KEY_VEHICLES, list);

    RealtimeService.broadcastLocalEvent('vehicles', newVehicle);
    return newVehicle;
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    await requireAdminRole();

    // 1. Process & upload any new Base64 images to Supabase Storage
    let updatedImages = updates.images;
    if (updates.images && updates.images.length > 0) {
      updatedImages = await Promise.all(
        updates.images.map(async (img, idx) => {
          const publicUrl = await uploadVehicleImageToSupabase(id, img.image_url);
          return {
            ...img,
            id: img.id || `img-${id}-${idx}`,
            vehicle_id: id,
            image_url: publicUrl,
            display_order: idx + 1,
            is_primary: idx === 0
          };
        })
      );
    }

    const mergedUpdates = {
      ...updates,
      ...(updatedImages ? { images: updatedImages } : {}),
      updated_at: new Date().toISOString()
    };

    // 2. Persist to Supabase Database if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('vehicles')
          .update({
            make: updates.make,
            model: updates.model,
            year: updates.year,
            price: updates.price,
            mileage: updates.mileage,
            engine_cc: updates.engine_cc,
            fuel_type: updates.fuel_type,
            transmission: updates.transmission,
            body_type: updates.body_type,
            location: updates.location,
            description: updates.description,
            dealer_name: updates.dealer_name,
            status: updates.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (updatedImages && updatedImages.length > 0) {
          await supabase.from('vehicle_images').delete().eq('vehicle_id', id);
          await supabase.from('vehicle_images').insert(
            updatedImages.map((img, idx) => ({
              vehicle_id: id,
              image_url: img.image_url,
              display_order: idx + 1,
              is_primary: idx === 0
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase DB update notice:', err);
      }
    }

    // 3. Update memory state & safe sanitized storage (no quota errors)
    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    const index = list.findIndex(v => v.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...mergedUpdates
      };
      setStored(LOCAL_STORAGE_KEY_VEHICLES, list);
      RealtimeService.broadcastLocalEvent('vehicles', list[index]);
      return list[index];
    }
    return null;
  },

  async updateStatus(id: string, status: Vehicle['status']): Promise<void> {
    await requireAdminRole();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('vehicles').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      } catch (err) {
        console.warn('Supabase DB status update notice:', err);
      }
    }

    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    const item = list.find(v => v.id === id);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
      setStored(LOCAL_STORAGE_KEY_VEHICLES, list);
      RealtimeService.broadcastLocalEvent('vehicles', item);
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    await requireAdminRole();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('vehicle_images').delete().eq('vehicle_id', id);
        await supabase.from('vehicles').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase DB delete notice:', err);
      }
    }

    const list = getStored<Vehicle[]>(LOCAL_STORAGE_KEY_VEHICLES, INITIAL_MOCK_VEHICLES);
    const updated = list.filter(v => v.id !== id);
    setStored(LOCAL_STORAGE_KEY_VEHICLES, updated);
    RealtimeService.broadcastLocalEvent('vehicles', { id, deleted: true });
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
    await requireAdminRole();
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
    await requireAdminRole();
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
    await requireAdminRole();
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
    await requireAdminRole();
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
    await requireAdminRole();
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
    await requireAdminRole();
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
    await requireAdminRole();
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*, vehicle:vehicles(make, model, year, price)')
          .order('created_at', { ascending: false });
        if (!error && data) return data as Reservation[];
      } catch (err) {
        console.warn('Supabase reservation fetch notice:', err);
      }
    }
    return getStored<Reservation[]>(LOCAL_STORAGE_KEY_RESERVATIONS, INITIAL_MOCK_RESERVATIONS);
  },

  async create(res: Omit<Reservation, 'id' | 'created_at' | 'status'>): Promise<Reservation> {
    const record: Reservation = {
      ...res,
      id: 'res-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .insert([{
            vehicle_id: res.vehicle_id,
            user_id: res.user_id,
            buyer_name: res.buyer_name,
            buyer_phone: res.buyer_phone,
            buyer_email: res.buyer_email,
            amount: res.amount,
            currency: res.currency || 'KES',
            status: 'pending',
            expires_at: res.expires_at
          }])
          .select()
          .single();

        if (!error && data) {
          record.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase reservation insert notice:', err);
      }
    }

    const list = getStored<Reservation[]>(LOCAL_STORAGE_KEY_RESERVATIONS, INITIAL_MOCK_RESERVATIONS);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_RESERVATIONS, list);

    await VehicleService.updateStatus(res.vehicle_id, 'reserved');
    return record;
  },

  async updateStatus(id: string, status: Reservation['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('reservations')
          .update({ status })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase reservation status update notice:', err);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('vehicle_inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as VehicleInquiry[];
      } catch (err) {
        console.warn('Supabase inquiry fetch notice:', err);
      }
    }
    return getStored<VehicleInquiry[]>(LOCAL_STORAGE_KEY_INQUIRIES, INITIAL_MOCK_INQUIRIES);
  },

  async create(inquiry: Omit<VehicleInquiry, 'id' | 'created_at' | 'status'>): Promise<VehicleInquiry> {
    const record: VehicleInquiry = {
      ...inquiry,
      id: 'inq-' + Date.now(),
      status: 'new',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('vehicle_inquiries')
          .insert([{
            vehicle_id: inquiry.vehicle_id,
            buyer_id: inquiry.buyer_id,
            name: inquiry.name,
            phone: inquiry.phone,
            email: inquiry.email,
            message: inquiry.message,
            source: inquiry.source || 'web',
            status: 'new'
          }])
          .select()
          .single();

        if (!error && data) {
          record.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase inquiry insert notice:', err);
      }
    }

    const list = getStored<VehicleInquiry[]>(LOCAL_STORAGE_KEY_INQUIRIES, INITIAL_MOCK_INQUIRIES);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_INQUIRIES, list);
    return record;
  },

  async updateStatus(id: string, status: VehicleInquiry['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('vehicle_inquiries')
          .update({ status })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase inquiry status update notice:', err);
      }
    }

    const list = getStored<VehicleInquiry[]>(LOCAL_STORAGE_KEY_INQUIRIES, INITIAL_MOCK_INQUIRIES);
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = status;
      setStored(LOCAL_STORAGE_KEY_INQUIRIES, list);
    }
  }
};

const LOCAL_STORAGE_KEY_INSPECTIONS = 'yardly_demo_inspections';

export const InspectionService = {
  async getAll(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inspection_requests')
          .select('*, vehicle:vehicles(make, model, year, price, location)')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase inspection fetch notice:', err);
      }
    }
    return getStored<any[]>(LOCAL_STORAGE_KEY_INSPECTIONS, []);
  },

  async create(req: {
    vehicle_id: string;
    buyer_id?: string;
    seller_id?: string;
    buyer_name: string;
    buyer_phone: string;
    buyer_email: string;
    preferred_date: string;
    preferred_time: string;
    location?: string;
    notes?: string;
  }): Promise<any> {
    const record = {
      ...req,
      id: 'insp-' + Date.now(),
      location: req.location || 'Nairobi',
      status: 'requested',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inspection_requests')
          .insert([{
            vehicle_id: req.vehicle_id,
            buyer_id: req.buyer_id,
            seller_id: req.seller_id,
            buyer_name: req.buyer_name,
            buyer_phone: req.buyer_phone,
            buyer_email: req.buyer_email,
            preferred_date: req.preferred_date,
            preferred_time: req.preferred_time,
            location: req.location || 'Nairobi',
            notes: req.notes,
            status: 'requested'
          }])
          .select()
          .single();

        if (!error && data) {
          record.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase inspection insert notice:', err);
      }
    }

    const list = getStored<any[]>(LOCAL_STORAGE_KEY_INSPECTIONS, []);
    list.unshift(record);
    setStored(LOCAL_STORAGE_KEY_INSPECTIONS, list);
    return record;
  },

  async updateStatus(id: string, status: string, sellerNotes?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('inspection_requests')
          .update({ status, seller_notes: sellerNotes, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase inspection status update notice:', err);
      }
    }

    const list = getStored<any[]>(LOCAL_STORAGE_KEY_INSPECTIONS, []);
    const found = list.find(i => i.id === id);
    if (found) {
      found.status = status;
      if (sellerNotes) found.seller_notes = sellerNotes;
      found.updated_at = new Date().toISOString();
      setStored(LOCAL_STORAGE_KEY_INSPECTIONS, list);
    }
  }
};

// Native BroadcastChannel for zero-latency local multi-window / multi-tab sync
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('yardly_realtime_sync_channel')
  : null;

export const RealtimeService = {
  broadcastLocalEvent(table: string, payload?: any): void {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ table, payload, timestamp: Date.now() });
      } catch (err) {
        console.warn('BroadcastChannel notice:', err);
      }
    }
  },

  subscribeToTable(table: string, onPayload: (payload: any) => void): () => void {
    const unsubscribers: Array<() => void> = [];

    // 1. Supabase Realtime WebSocket Subscription (Cloud Cross-Device Sync)
    if (isSupabaseConfigured && supabase) {
      try {
        const canonicalChannelName = `yardly_realtime_${table}`;
        const channel = supabase
          .channel(canonicalChannelName)
          .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
            console.log(`[Supabase Realtime] ${table} event received:`, payload);
            if (table === 'vehicles') inMemoryVehiclesCache = null;
            onPayload(payload);
          })
          .subscribe((status) => {
            console.log(`[Supabase Realtime] ${table} channel status:`, status);
          });

        unsubscribers.push(() => {
          supabase.removeChannel(channel);
        });
      } catch (err) {
        console.warn(`[Supabase Realtime] ${table} subscription error:`, err);
      }
    }

    // 2. BroadcastChannel Subscription (Instant Cross-Tab / Cross-Window Sync)
    if (broadcastChannel) {
      const handleBroadcast = (event: MessageEvent) => {
        if (event.data && (event.data.table === table || event.data.table === '*')) {
          if (table === 'vehicles') inMemoryVehiclesCache = null;
          onPayload(event.data.payload || event.data);
        }
      };
      broadcastChannel.addEventListener('message', handleBroadcast);
      unsubscribers.push(() => {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      });
    }

    // 3. Storage Event Listener (Fallback Cross-Window Sync)
    if (typeof window !== 'undefined') {
      const handleStorage = (e: StorageEvent) => {
        if (e.key && e.key.includes(table)) {
          if (table === 'vehicles') inMemoryVehiclesCache = null;
          onPayload({ event: 'storage_update', key: e.key });
        }
      };
      window.addEventListener('storage', handleStorage);
      unsubscribers.push(() => {
        window.removeEventListener('storage', handleStorage);
      });
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }
};
