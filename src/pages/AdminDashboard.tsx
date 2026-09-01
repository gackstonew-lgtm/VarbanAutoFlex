import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Car, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Users, 
  Eye, 
  FileText, 
  AlertTriangle, 
  LogOut, 
  User, 
  RefreshCw, 
  Gavel, 
  Globe, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  BarChart3, 
  Building,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Upload
} from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { 
  VehicleService, 
  SellerSubmissionService, 
  ReservationService, 
  PaymentService, 
  InquiryService, 
  AuthService, 
  AuctionService, 
  TradeInService, 
  ImportService, 
  BuyerService, 
  SellerService, 
  AuthUser 
} from '../lib/supabase/client';
import { 
  Vehicle, 
  SellerListingSubmission, 
  Reservation, 
  PaymentRecord, 
  VehicleInquiry, 
  Auction, 
  TradeInRequest, 
  ImportRequest, 
  Profile, 
  FuelType, 
  TransmissionType, 
  BodyType, 
  VehicleStatus, 
  TradeInStatus, 
  ImportStatus,
  AuctionStatus 
} from '../types/database';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { getVehiclePrimaryImage, resolveVehicleImages } from '../lib/utils/imageResolver';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  // Datasets
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [submissions, setSubmissions] = useState<SellerListingSubmission[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [inquiries, setInquiries] = useState<VehicleInquiry[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [tradeIns, setTradeIns] = useState<TradeInRequest[]>([]);
  const [imports, setImports] = useState<ImportRequest[]>([]);
  const [buyers, setBuyers] = useState<Profile[]>([]);
  const [sellers, setSellers] = useState<Profile[]>([]);

  const [loading, setLoading] = useState(true);

  // Active Menu Section
  const [activeSection, setActiveSection] = useState<'overview' | 'vehicles' | 'images' | 'auctions' | 'tradeins' | 'imports' | 'inquiries' | 'buyers' | 'sellers' | 'analytics'>('overview');
  
  // Search & Filter Query
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilterStatus, setVehicleFilterStatus] = useState<string>('all');

  // Vehicle Modal State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [savingVehicle, setSavingVehicle] = useState(false);
  
  // Form State for Vehicle Add/Edit
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vYear, setVYear] = useState<number>(2022);
  const [vPrice, setVPrice] = useState<number>(3500000);
  const [vMileage, setVMileage] = useState<number>(45000);
  const [vEngineCc, setVEngineCc] = useState<number>(2000);
  const [vFuelType, setVFuelType] = useState<FuelType>('Petrol');
  const [vTransmission, setVTransmission] = useState<TransmissionType>('Automatic');
  const [vBodyType, setVBodyType] = useState<BodyType>('SUV');
  const [vLocation, setVLocation] = useState('Nairobi');
  const [vDescription, setVDescription] = useState('');
  const [vImageUrl, setVImageUrl] = useState('');
  const [vImages, setVImages] = useState<string[]>([]);
  const [vDealerName, setVDealerName] = useState('YARDLY Certified');

  // Photo File Upload Handlers for Admin
  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setVImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveAdminImage = (index: number) => {
    setVImages(prev => prev.filter((_, i) => i !== index));
  };

  // Auction Modal State
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [aucVehicleId, setAucVehicleId] = useState('');
  const [aucStartBid, setAucStartBid] = useState<number>(3000000);
  const [aucMinIncrement, setAucMinIncrement] = useState<number>(50000);
  const [aucDurationHours, setAucDurationHours] = useState<number>(48);

  const loadData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || user.role !== 'admin') {
        navigate('/login', { replace: true });
        return;
      }
      setCurrentUser(user);

      const [vList, sList, rList, pList, iList, aList, tList, impList, bList, selList] = await Promise.all([
        VehicleService.getAll(),
        SellerSubmissionService.getAll(),
        ReservationService.getAll(),
        PaymentService.getAll(),
        InquiryService.getAll(),
        AuctionService.getAll(),
        TradeInService.getAll(),
        ImportService.getAll(),
        BuyerService.getAll(),
        SellerService.getAll()
      ]);

      setVehicles(vList);
      setSubmissions(sList);
      setReservations(rList);
      setPayments(pList);
      setInquiries(iList);
      setAuctions(aList);
      setTradeIns(tList);
      setImports(impList);
      setBuyers(bList);
      setSellers(selList);
    } catch (err) {
      console.error('Failed to load admin dataset', err);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = async () => {
    await AuthService.signOut();
    navigate('/login');
  };

  // Vehicle CRUD Handlers
  const handleOpenAddVehicle = () => {
    setEditingVehicleId(null);
    setVMake('');
    setVModel('');
    setVYear(2022);
    setVPrice(3500000);
    setVMileage(45000);
    setVEngineCc(2000);
    setVFuelType('Petrol');
    setVTransmission('Automatic');
    setVBodyType('SUV');
    setVLocation('Nairobi');
    setVDescription('');
    setVImageUrl('');
    setVImages([]);
    setVDealerName('YARDLY Certified');
    setShowVehicleModal(true);
  };

  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setVMake(v.make);
    setVModel(v.model);
    setVYear(v.year);
    setVPrice(v.price);
    setVMileage(v.mileage);
    setVEngineCc(v.engine_cc);
    setVFuelType(v.fuel_type);
    setVTransmission(v.transmission);
    setVBodyType(v.body_type);
    setVLocation(v.location);
    setVDescription(v.description);
    setVImageUrl(v.images?.[0]?.image_url || '');
    setVImages(v.images?.map(img => img.image_url) || []);
    setVDealerName(v.dealer_name || 'YARDLY Certified');
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVehicle(true);

    try {
      let imageList = [...vImages];
      if (vImageUrl && vImageUrl.trim() && !imageList.includes(vImageUrl.trim())) {
        imageList.push(vImageUrl.trim());
      }

      const finalImages = imageList.length > 0
        ? imageList.map((url, idx) => ({
            id: `img-${Date.now()}-${idx}`,
            vehicle_id: editingVehicleId || '',
            image_url: url,
            display_order: idx + 1,
            is_primary: idx === 0,
            created_at: new Date().toISOString()
          }))
        : [];

      if (editingVehicleId) {
        await VehicleService.updateVehicle(editingVehicleId, {
          make: vMake,
          model: vModel,
          year: vYear,
          price: vPrice,
          mileage: vMileage,
          engine_cc: vEngineCc,
          fuel_type: vFuelType,
          transmission: vTransmission,
          body_type: vBodyType,
          location: vLocation,
          description: vDescription,
          dealer_name: vDealerName,
          images: finalImages
        });
      } else {
        await VehicleService.addVehicle({
          make: vMake,
          model: vModel,
          year: vYear,
          price: vPrice,
          currency: 'KES',
          mileage: vMileage,
          engine_cc: vEngineCc,
          fuel_type: vFuelType,
          transmission: vTransmission,
          body_type: vBodyType,
          color: 'Silver',
          location: vLocation,
          description: vDescription,
          status: 'active',
          verification_status: 'verified',
          logbook_verified: true,
          featured: false,
          seller_type: 'dealer',
          dealer_name: vDealerName,
          images: finalImages
        });
      }
      setShowVehicleModal(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save vehicle.';
      alert(msg);
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Are you sure you want to remove this vehicle from the marketplace?')) {
      await VehicleService.deleteVehicle(id);
      await loadData();
    }
  };

  // Auction Handlers
  const handleCreateAuctionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aucVehicleId) return;

    const start = new Date().toISOString();
    const end = new Date(Date.now() + aucDurationHours * 3600 * 1000).toISOString();

    await AuctionService.createAuction({
      vehicle_id: aucVehicleId,
      starting_bid: aucStartBid,
      minimum_increment: aucMinIncrement,
      start_time: start,
      end_time: end,
      status: 'live'
    });

    setShowAuctionModal(false);
    await loadData();
  };

  // Status Updaters
  const handleUpdateTradeInStatus = async (id: string, status: TradeInStatus) => {
    await TradeInService.updateStatus(id, status);
    await loadData();
  };

  const handleUpdateImportStatus = async (id: string, status: ImportStatus) => {
    await ImportService.updateStatus(id, status);
    await loadData();
  };

  const handleUpdateInquiryStatus = async (id: string, status: VehicleInquiry['status']) => {
    await InquiryService.updateStatus(id, status);
    await loadData();
  };

  const handleToggleBuyerStatus = async (id: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await BuyerService.updateStatus(id, nextStatus);
    await loadData();
  };

  const handleApproveSubmission = async (id: string) => {
    await SellerSubmissionService.updateStatus(id, 'approved');
    await loadData();
  };

  const handleRejectSubmission = async (id: string) => {
    await SellerSubmissionService.updateStatus(id, 'rejected', 'Documentation mismatch');
    await loadData();
  };

  // Filtering vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = `${v.year} ${v.make} ${v.model} ${v.location}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = vehicleFilterStatus === 'all' || v.status === vehicleFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPhotosCataloged = vehicles.reduce((sum, v) => sum + (v.images?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
      <Navbar />

      {/* Admin Control Bar Header */}
      <div className="bg-[#0038BC] text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D8CFF] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>YARDLY EXECUTIVE MANAGEMENT CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">Marketplace Operations & Control</h1>
            {currentUser && (
              <div className="text-xs text-[#D9EAFF] mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Logged in as <strong>{currentUser.full_name}</strong> ({currentUser.email})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="verified" size="md">
              Master Admin Active
            </Badge>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] lg:pb-8 w-full flex-grow flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation Menu */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2">
          <div className="bg-white rounded-2xl border border-[#D9EAFF] p-3 shadow-sm space-y-1">
            
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] px-3 py-1">
              Core Overview
            </div>
            <button
              onClick={() => setActiveSection('overview')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all ${
                activeSection === 'overview' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] px-3 py-1 pt-2 border-t border-[#D9EAFF]">
              Inventory & Assets
            </div>
            <button
              onClick={() => setActiveSection('vehicles')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSection === 'vehicles' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4" />
                <span>Vehicles Inventory</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">{vehicles.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('images')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSection === 'images' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4" />
                <span>Image Asset Report</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">{totalPhotosCataloged}</span>
            </button>

            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] px-3 py-1 pt-2 border-t border-[#D9EAFF]">
              Marketplace Workflows
            </div>
            <button
              onClick={() => setActiveSection('auctions')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSection === 'auctions' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gavel className="w-4 h-4" />
                <span>Auctions Control</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">{auctions.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('tradeins')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSection === 'tradeins' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4" />
                <span>Trade-In Requests</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">{tradeIns.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('imports')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSection === 'imports' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4" />
                <span>Direct Import Service</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">{imports.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('inquiries')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSection === 'inquiries' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Buyer Inquiries</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">{inquiries.length}</span>
            </button>

            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] px-3 py-1 pt-2 border-t border-[#D9EAFF]">
              Users & Partners
            </div>
            <button
              onClick={() => setActiveSection('buyers')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSection === 'buyers' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Buyers Directory</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">{buyers.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('sellers')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                activeSection === 'sellers' ? 'bg-[#1769E0] text-white shadow-sm' : 'text-[#10233F] hover:bg-[#F7FAFF]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4" />
                <span>Sellers & Dealers</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">{sellers.length}</span>
            </button>

          </div>
        </aside>

        {/* Main Section Content Container */}
        <main className="flex-grow space-y-6">

          {/* SECTION 1: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#D9EAFF] shadow-sm">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">Active Vehicles</div>
                  <div className="text-2xl font-black text-[#10233F] mt-1">{vehicles.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#D9EAFF] shadow-sm">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">Cataloged Photos</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{totalPhotosCataloged}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#D9EAFF] shadow-sm">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">Live Auctions</div>
                  <div className="text-2xl font-black text-[#1769E0] mt-1">{auctions.filter(a => a.status === 'live' || a.status === 'ending_soon').length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#D9EAFF] shadow-sm">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">Trade-In Queue</div>
                  <div className="text-2xl font-black font-mono text-amber-600 mt-1">{tradeIns.length}</div>
                </div>
              </div>

              {/* Pending Seller Listing Submissions */}
              <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-[#10233F]">Pending Seller Listing Submissions ({submissions.filter(s => s.status === 'pending_review').length})</h3>
                {submissions.filter(s => s.status === 'pending_review').length === 0 ? (
                  <p className="text-xs text-[#64748B]">No seller submissions awaiting verification.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.filter(s => s.status === 'pending_review').map(sub => (
                      <div key={sub.id} className="p-4 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-[#10233F]">{sub.year} {sub.make} {sub.model}</div>
                          <div className="text-xs text-[#64748B] mt-0.5">
                            Seller: <strong>{sub.seller_name}</strong> ({sub.seller_phone}) • Asking: KES {sub.asking_price.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="success" onClick={() => handleApproveSubmission(sub.id)} icon={<CheckCircle2 className="w-4 h-4" />}>
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleRejectSubmission(sub.id)} icon={<XCircle className="w-4 h-4" />}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SECTION 2: Vehicles CRUD */}
          {activeSection === 'vehicles' && (
            <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-[#10233F]">Vehicles Inventory ({filteredVehicles.length})</h3>
                  <p className="text-xs text-[#64748B]">Manage all active, draft, featured and archived marketplace cars.</p>
                </div>

                <Button onClick={handleOpenAddVehicle} icon={<PlusCircle className="w-4 h-4" />} className="font-extrabold">
                  Add New Vehicle
                </Button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="Search by make, model, year, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D9EAFF] text-xs font-bold text-[#10233F] focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                  />
                </div>
                <select
                  value={vehicleFilterStatus}
                  onChange={(e) => setVehicleFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-[#D9EAFF] text-xs font-bold text-[#10233F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Vehicles Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAFF] text-[#64748B] uppercase font-bold border-b border-[#D9EAFF]">
                    <tr>
                      <th className="p-3">Vehicle Details</th>
                      <th className="p-3">Photos</th>
                      <th className="p-3">Seller / Yard</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9EAFF]">
                    {filteredVehicles.map(v => (
                      <tr key={v.id} className="hover:bg-[#F7FAFF]">
                        <td className="p-3">
                          <div className="font-extrabold text-[#10233F]">{v.year} {v.make} {v.model}</div>
                          <div className="text-[10px] text-[#64748B]">{v.transmission} • {v.fuel_type} • {v.mileage.toLocaleString()} KM</div>
                        </td>
                        <td className="p-3 font-bold text-[#0038BC]">
                          {v.images?.length || 0} Photos
                        </td>
                        <td className="p-3 text-[#64748B]">{v.dealer_name || 'Private Seller'}</td>
                        <td className="p-3 font-black text-[#0038BC]">KES {v.price.toLocaleString()}</td>
                        <td className="p-3"><Badge variant={v.status === 'active' ? 'success' : 'secondary'}>{v.status}</Badge></td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => handleOpenEditVehicle(v)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#10233F]">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteVehicle(v.id)} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* SECTION 3: Admin Image Asset & Matching Review Report */}
          {activeSection === 'images' && (
            <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-[#10233F]">Admin Image Asset & Specification Report</h3>
                  <p className="text-xs text-[#64748B]">Review photographic coverage, matching confidence, and Kenyan market valuations.</p>
                </div>
                <Badge variant="verified" size="md">
                  {totalPhotosCataloged} Images Indexed
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAFF] text-[#64748B] uppercase font-bold border-b border-[#D9EAFF]">
                    <tr>
                      <th className="p-3">Listing Title</th>
                      <th className="p-3">Hero Thumbnail</th>
                      <th className="p-3">Image Count</th>
                      <th className="p-3">Matching Confidence</th>
                      <th className="p-3">Market Valuation Reference</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9EAFF]">
                    {vehicles.map(v => {
                      const allImages = resolveVehicleImages(v);
                      const primaryImg = getVehiclePrimaryImage(v)?.image_url || '/logo.jpeg';
                      return (
                        <tr key={v.id} className="hover:bg-[#F7FAFF]">
                          <td className="p-3">
                            <div className="font-extrabold text-[#10233F]">{v.year} {v.make} {v.model}</div>
                            <div className="text-[10px] text-[#64748B]">{v.dealer_name || 'Yard Unit'}</div>
                          </td>
                          <td className="p-3">
                            <img src={primaryImg} alt={v.model} className="w-14 h-10 object-cover rounded-lg border border-[#D9EAFF]" />
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-[#0038BC] bg-[#D9EAFF] px-2.5 py-1 rounded-full text-[11px]">
                              {allImages.length} Photos
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge variant={v.vehicle_match_status === 'verified' ? 'verified' : 'warning'}>
                              {v.vehicle_match_status === 'verified' ? 'HIGH CONFIDENCE (100%)' : 'PENDING REVIEW'}
                            </Badge>
                          </td>
                          <td className="p-3 font-semibold text-[#10233F]">
                            {v.estimated_market_value ? `KES ${v.estimated_market_value.toLocaleString()} (${v.valuation_confidence || 'High'})` : 'Under Appraisal'}
                          </td>
                          <td className="p-3 text-right">
                            <Link to={`/vehicles/${v.id}`}>
                              <Button size="sm" variant="outline" icon={<Eye className="w-3.5 h-3.5" />}>View Gallery</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: Auctions Control */}
          {activeSection === 'auctions' && (
            <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-[#10233F]">Auctions Control ({auctions.length})</h3>
                  <p className="text-xs text-[#64748B]">Manage active auctions, set starting bids and timers.</p>
                </div>
                <Button onClick={() => setShowAuctionModal(true)} icon={<PlusCircle className="w-4 h-4" />}>
                  Create Auction
                </Button>
              </div>

              <div className="space-y-4">
                {auctions.map(auc => (
                  <div key={auc.id} className="p-4 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-[#10233F]">
                        {auc.vehicle ? `${auc.vehicle.year} ${auc.vehicle.make} ${auc.vehicle.model}` : `Auction #${auc.id}`}
                      </div>
                      <div className="text-[#0038BC] font-mono font-bold mt-0.5">
                        Current Bid: KES {auc.current_bid.toLocaleString()} ({auc.bid_count} bids)
                      </div>
                    </div>
                    <Badge variant={auc.status === 'live' ? 'success' : 'secondary'}>{auc.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: Trade-Ins */}
          {activeSection === 'tradeins' && (
            <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-[#10233F]">Trade-In Requests ({tradeIns.length})</h3>
              <div className="space-y-3">
                {tradeIns.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#0038BC]">{t.reference_id}</span>
                      <div className="font-bold text-[#10233F] text-sm mt-0.5">{t.year} {t.make} {t.model}</div>
                      <div className="text-[#64748B]">Owner: {t.full_name} ({t.phone}) • Expected: KES {t.expected_value.toLocaleString()}</div>
                    </div>
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateTradeInStatus(t.id, e.target.value as TradeInStatus)}
                      className="px-3 py-1.5 rounded-xl border border-[#D9EAFF] text-xs font-bold text-[#10233F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                    >
                      <option value="new">New</option>
                      <option value="under_review">Under Review</option>
                      <option value="valuation">Valuation</option>
                      <option value="offer_sent">Offer Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: Imports */}
          {activeSection === 'imports' && (
            <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-[#10233F]">Direct Import Sourcing Orders ({imports.length})</h3>
              <div className="space-y-3">
                {imports.map(i => (
                  <div key={i.id} className="p-4 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#0038BC]">{i.reference_number}</span>
                      <div className="font-bold text-[#10233F] text-sm mt-0.5">{i.make} {i.model} (Source: {i.preferred_source_country})</div>
                      <div className="text-[#64748B]">Client: {i.full_name} ({i.phone}) • Budget: KES {i.budget.toLocaleString()}</div>
                    </div>
                    <select
                      value={i.status}
                      onChange={(e) => handleUpdateImportStatus(i.id, e.target.value as ImportStatus)}
                      className="px-3 py-1.5 rounded-xl border border-[#D9EAFF] text-xs font-bold text-[#10233F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="sourcing">Sourcing</option>
                      <option value="quotation">Quotation</option>
                      <option value="shipping">Shipping</option>
                      <option value="customs">Customs</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: Inquiries */}
          {activeSection === 'inquiries' && (
            <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-[#10233F]">Buyer Inquiries ({inquiries.length})</h3>
              <div className="space-y-3">
                {inquiries.map(inq => (
                  <div key={inq.id} className="p-4 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-[#10233F]">{inq.name} ({inq.phone})</div>
                      <div className="text-[#64748B] mt-0.5">{inq.message}</div>
                    </div>
                    <select
                      value={inq.status}
                      onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as VehicleInquiry['status'])}
                      className="px-3 py-1.5 rounded-xl border border-[#D9EAFF] text-xs font-bold text-[#10233F] bg-white"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: Buyers Directory */}
          {activeSection === 'buyers' && (
            <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-[#10233F]">Registered Buyers Directory ({buyers.length})</h3>
              <div className="space-y-3">
                {buyers.map(b => (
                  <div key={b.id} className="p-4 rounded-2xl border border-[#D9EAFF] bg-[#F7FAFF] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#10233F]">{b.full_name}</div>
                      <div className="text-[#64748B]">{b.email} • {b.phone || 'No phone provided'}</div>
                    </div>
                    <Button size="sm" variant={b.status === 'active' ? 'danger' : 'success'} onClick={() => handleToggleBuyerStatus(b.id, b.status)}>
                      {b.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: Sellers Directory */}
          {activeSection === 'sellers' && (
            <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-[#10233F]">Verified Sellers & Dealers ({sellers.length})</h3>
              <div className="space-y-3">
                {sellers.map(s => (
                  <div key={s.id} className="p-4 rounded-2xl border border-[#D9EAFF] bg-[#F7FAFF] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#10233F]">{s.business_name || s.full_name}</div>
                      <div className="text-[#64748B]">Type: {s.seller_type || 'dealer'} • {s.email}</div>
                    </div>
                    <Badge variant="verified">Verified Seller</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Add / Edit Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-[#10233F]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#D9EAFF] max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            <button
              onClick={() => setShowVehicleModal(false)}
              className="absolute top-4 right-4 text-sm font-bold text-[#64748B] hover:text-[#10233F]"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-[#10233F]">
              {editingVehicleId ? 'Edit Vehicle Listing' : 'Add New Vehicle to Marketplace'}
            </h3>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Make *" value={vMake} onChange={(e) => setVMake(e.target.value)} required />
                <Input label="Model *" value={vModel} onChange={(e) => setVModel(e.target.value)} required />
                <Input label="Year *" type="number" value={vYear} onChange={(e) => setVYear(parseInt(e.target.value) || 2022)} required />
                <Input label="Price (KES) *" type="number" value={vPrice} onChange={(e) => setVPrice(parseInt(e.target.value) || 0)} required />
                <Input label="Mileage (KM) *" type="number" value={vMileage} onChange={(e) => setVMileage(parseInt(e.target.value) || 0)} required />
                <Input label="Engine (CC) *" type="number" value={vEngineCc} onChange={(e) => setVEngineCc(parseInt(e.target.value) || 2000)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#10233F] mb-1">Transmission</label>
                  <select value={vTransmission} onChange={(e) => setVTransmission(e.target.value as TransmissionType)} className="w-full p-2.5 rounded-xl border border-[#D9EAFF] text-xs font-bold">
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#10233F] mb-1">Fuel Type</label>
                  <select value={vFuelType} onChange={(e) => setVFuelType(e.target.value as FuelType)} className="w-full p-2.5 rounded-xl border border-[#D9EAFF] text-xs font-bold">
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload (.jpg) */}
              <div className="space-y-2 border-t border-b border-[#D9EAFF] py-3">
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider">
                  Vehicle Photographs (Import JPG / PNG files from device) *
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1769E0] text-white text-xs font-extrabold shadow hover:bg-[#0038BC] transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Select JPG / PNG Files</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      multiple
                      onChange={handleAdminPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-[#64748B] font-medium">
                    {vImages.length} photo(s) selected
                  </span>
                </div>

                {/* Photo Previews */}
                {vImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 max-h-44 overflow-y-auto p-2 bg-[#F7FAFF] rounded-xl border border-[#D9EAFF]">
                    {vImages.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 group border border-[#D9EAFF] shadow-xs">
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 text-[8px] font-black uppercase bg-[#1769E0] text-white px-1.5 py-0.5 rounded">Primary</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAdminImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow transition-all"
                          aria-label="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Dealer / Car Yard Name" value={vDealerName} onChange={(e) => setVDealerName(e.target.value)} />
                <Input label="Optional Image URL Fallback" value={vImageUrl} onChange={(e) => setVImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">Description</label>
                <textarea rows={2} value={vDescription} onChange={(e) => setVDescription(e.target.value)} className="w-full p-3 rounded-xl border border-[#D9EAFF] text-xs" />
              </div>

              <Button type="submit" disabled={savingVehicle} fullWidth className="font-extrabold">
                {savingVehicle ? 'Saving Vehicle to Inventory...' : editingVehicleId ? 'Update Vehicle' : 'Publish Vehicle'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Create Auction Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 z-50 bg-[#10233F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D9EAFF] max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setShowAuctionModal(false)} className="absolute top-4 right-4 text-xs font-bold">✕</button>
            <h3 className="text-lg font-black text-[#10233F]">Create New Auction</h3>
            
            <form onSubmit={handleCreateAuctionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">Select Vehicle *</label>
                <select value={aucVehicleId} onChange={(e) => setAucVehicleId(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs font-bold" required>
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} - KES {v.price.toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <Input label="Starting Bid (KES) *" type="number" value={aucStartBid} onChange={(e) => setAucStartBid(parseInt(e.target.value) || 0)} required />
              <Input label="Minimum Increment (KES) *" type="number" value={aucMinIncrement} onChange={(e) => setAucMinIncrement(parseInt(e.target.value) || 0)} required />
              <Input label="Duration (Hours) *" type="number" value={aucDurationHours} onChange={(e) => setAucDurationHours(parseInt(e.target.value) || 24)} required />

              <Button type="submit" fullWidth className="font-extrabold">
                Launch Live Auction
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
