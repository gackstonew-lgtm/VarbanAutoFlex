import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Car, 
  Heart, 
  RefreshCw, 
  Globe, 
  Gavel, 
  MessageSquare, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  PlusCircle,
  Eye,
  Lock
} from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { 
  AuthService, 
  AuthUser, 
  VehicleService, 
  FavoriteService, 
  TradeInService, 
  ImportService, 
  AuctionService, 
  InquiryService, 
  NotificationService 
} from '../lib/supabase/client';
import { 
  Vehicle, 
  Favorite, 
  TradeInRequest, 
  ImportRequest, 
  Auction, 
  VehicleInquiry, 
  NotificationItem 
} from '../types/database';

export const AccountDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'profile' | 'listings' | 'favorites' | 'tradeins' | 'imports' | 'auctions' | 'inquiries' | 'notifications'>('profile');

  // Data states
  const [myListings, setMyListings] = useState<Vehicle[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [tradeIns, setTradeIns] = useState<TradeInRequest[]>([]);
  const [imports, setImports] = useState<ImportRequest[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [inquiries, setInquiries] = useState<VehicleInquiry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBusiness, setEditBusiness] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadAccountData() {
      try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setCurrentUser(user);
        setEditName(user.full_name || '');
        setEditPhone(user.phone || '');
        setEditBusiness(user.business_name || '');

        // Fetch datasets for current user
        const [vList, favList, trdList, impList, aucList, inqList, notifList] = await Promise.all([
          VehicleService.getAll(),
          FavoriteService.getByUserId(user.id),
          TradeInService.getAll(),
          ImportService.getAll(),
          AuctionService.getAll(),
          InquiryService.getAll(),
          NotificationService.getByUserId(user.id)
        ]);

        setMyListings(vList.filter(v => v.dealer_name === user.full_name || v.dealer_name === user.business_name));
        setFavorites(favList);
        setTradeIns(trdList.filter(t => t.user_id === user.id || t.email === user.email));
        setImports(impList.filter(i => i.user_id === user.id || i.email === user.email));
        setAuctions(aucList);
        setInquiries(inqList.filter(i => i.buyer_id === user.id || i.email === user.email));
        setNotifications(notifList);

      } catch (err) {
        console.error('Failed to load user profile data', err);
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, [navigate]);

  const handleSignOut = async () => {
    await AuthService.signOut();
    navigate('/');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      currentUser.full_name = editName;
      currentUser.phone = editPhone;
      currentUser.business_name = editBusiness;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFF] flex flex-col justify-center items-center">
        <Navbar />
        <div className="my-auto text-xs font-bold text-[#64748B]">Loading your account dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
      <Navbar />

      {/* Account Header */}
      <div className="bg-[#0038BC] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-black">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D8CFF] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>YARDLY USER PORTAL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                {currentUser?.full_name}
              </h1>
              <div className="text-xs text-[#D9EAFF] mt-0.5">
                {currentUser?.email} • Role: <span className="uppercase font-bold text-amber-300">{currentUser?.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.role === 'admin' && (
              <Link to="/admin">
                <Button size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                  Admin Console
                </Button>
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#D9EAFF] pb-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'profile' ? 'bg-[#1769E0] text-white shadow-sm' : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          {(currentUser?.role === 'seller' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'listings' ? 'bg-[#1769E0] text-white shadow-sm' : 'bg-white text-[#64748B] border border-[#D9EAFF]'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>My Vehicle Listings ({myListings.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'favorites' ? 'bg-[#1769E0] text-white shadow-sm' : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Vehicles ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tradeins')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'tradeins' ? 'bg-[#1769E0] text-white shadow-sm' : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Trade-Ins ({tradeIns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('imports')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'imports' ? 'bg-[#1769E0] text-white shadow-sm' : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Imports ({imports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'auctions' ? 'bg-[#1769E0] text-white shadow-sm' : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>Auction Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'notifications' ? 'bg-[#1769E0] text-white shadow-sm' : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications ({notifications.filter(n => !n.read).length})</span>
          </button>
        </div>

        {/* TAB 1: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
            <h3 className="text-lg font-black text-[#10233F]">Profile & Account Settings</h3>
            
            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Full Name *"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <Input
                label="Email Address (Account ID)"
                value={currentUser?.email}
                disabled
              />
              <Input
                label="Phone Number"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
              />
              {(currentUser?.role === 'seller' || currentUser?.role === 'dealer') && (
                <Input
                  label="Dealership / Business Name"
                  value={editBusiness}
                  onChange={(e) => setEditBusiness(e.target.value)}
                  placeholder="e.g. Mwangi Motors Ltd"
                />
              )}

              <Button type="submit" className="font-extrabold">
                Save Profile Changes
              </Button>
            </form>
          </div>
        )}

        {/* TAB 2: My Listings */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-[#10233F]">My Vehicles & Listings</h3>
              <Link to="/sell">
                <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                  List New Vehicle
                </Button>
              </Link>
            </div>

            {myListings.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6">You have no active vehicle listings. Click "List New Vehicle" to add your car.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListings.map(v => (
                  <div key={v.id} className="p-4 rounded-2xl border border-[#D9EAFF] bg-[#F7FAFF] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#10233F] text-sm">{v.year} {v.make} {v.model}</div>
                      <div className="text-xs text-[#0038BC] font-black">KES {v.price.toLocaleString()}</div>
                      <Badge variant={v.status === 'active' ? 'success' : 'secondary'} size="sm" className="mt-1">
                        {v.status}
                      </Badge>
                    </div>
                    <Link to={`/vehicles/${v.id}`}>
                      <Button size="sm" variant="ghost" icon={<Eye className="w-4 h-4" />}>View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Saved Vehicles */}
        {activeTab === 'favorites' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-[#10233F]">Saved Vehicles & Bookmarks</h3>
            {favorites.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6">No saved vehicles found. Browse marketplace cars and tap the bookmark icon to save.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map(f => (
                  <div key={f.id} className="p-4 rounded-2xl border border-[#D9EAFF] bg-[#F7FAFF] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#10233F] text-sm">{f.vehicle ? `${f.vehicle.year} ${f.vehicle.make} ${f.vehicle.model}` : 'Vehicle'}</div>
                      <div className="text-xs text-[#0038BC] font-black">KES {f.vehicle?.price.toLocaleString()}</div>
                    </div>
                    {f.vehicle && (
                      <Link to={`/vehicles/${f.vehicle.id}`}>
                        <Button size="sm" variant="outline">View Car</Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Trade-Ins */}
        {activeTab === 'tradeins' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-[#10233F]">My Trade-In Requests</h3>
              <Link to="/trade-in">
                <Button size="sm" variant="outline">Submit Trade-In</Button>
              </Link>
            </div>
            {tradeIns.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6">No trade-in requests logged.</p>
            ) : (
              <div className="space-y-3">
                {tradeIns.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#0038BC]">{t.reference_id}</span>
                      <div className="font-bold text-[#10233F] mt-0.5">{t.year} {t.make} {t.model}</div>
                      <div className="text-[#64748B]">Expected: KES {t.expected_value.toLocaleString()}</div>
                    </div>
                    <Badge variant={t.status === 'completed' ? 'success' : 'warning'}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Imports */}
        {activeTab === 'imports' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-[#10233F]">Direct Import Sourcing Orders</h3>
              <Link to="/import">
                <Button size="sm" variant="outline">Request Direct Import</Button>
              </Link>
            </div>
            {imports.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6">No direct import requests active.</p>
            ) : (
              <div className="space-y-3">
                {imports.map(i => (
                  <div key={i.id} className="p-4 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#0038BC]">{i.reference_number}</span>
                      <div className="font-bold text-[#10233F] mt-0.5">{i.make} {i.model} ({i.preferred_source_country})</div>
                      <div className="text-[#64748B]">Budget: KES {i.budget.toLocaleString()}</div>
                    </div>
                    <Badge variant="primary">{i.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-[#10233F]">Notifications & Activity Alerts</h3>
            {notifications.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6">No notifications to display.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 rounded-2xl border border-[#D9EAFF] bg-[#F7FAFF] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#10233F]">{n.title}</div>
                      <div className="text-[#64748B] mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-[#64748B] mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    <Badge variant={n.read ? 'secondary' : 'warning'}>
                      {n.read ? 'Read' : 'New'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
