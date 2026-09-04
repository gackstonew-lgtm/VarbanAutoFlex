import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Gauge, 
  Fuel, 
  Cog, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Calculator, 
  Share2, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Heart,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { VehicleService, InquiryService, InspectionService, RealtimeService } from '../lib/supabase/client';
import { Vehicle, VehicleImage } from '../types/database';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CheckoutModal } from '../components/payment/CheckoutModal';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { VehicleGallery } from '../components/vehicle/VehicleGallery';
import { resolveVehicleImages } from '../lib/utils/imageResolver';
import { siteConfig } from '../config/site';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [inspectionOpen, setInspectionOpen] = useState(false);

  // Inquiry Form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('I would like to schedule a physical viewing of this vehicle.');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  // Financing Calculator state
  const [depositPercent, setDepositPercent] = useState(20); // 20%
  const [tenureMonths, setTenureMonths] = useState(48); // 4 years
  const interestRatePAnnum = siteConfig.financing.defaultInterestRate;

  useEffect(() => {
    async function loadVehicle() {
      if (!id) return;
      try {
        const item = await VehicleService.getById(id);
        setVehicle(item);
      } catch (err) {
        console.error('Failed to load vehicle details', err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();

    const unsub = RealtimeService.subscribeToTable('vehicles', () => {
      loadVehicle();
    });

    return () => {
      unsub();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 w-full animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-xl w-1/4" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto p-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#10233F]">Vehicle Not Found</h2>
          <p className="text-xs text-[#64748B]">The vehicle you requested could not be located or has been sold.</p>
          <Link to="/buy">
            <Button variant="primary">Return to Buy Cars</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Pre-filled WhatsApp message URL generator
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model} listed at KES ${vehicle.price.toLocaleString()} on Varban Auto Flex.`
  );
  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${whatsappMessage}`;

  // Financing Calculator Calculation
  const depositAmount = (vehicle.price * depositPercent) / 100;
  const loanPrincipal = vehicle.price - depositAmount;
  const monthlyInterestRate = interestRatePAnnum / 100 / 12;
  const estimatedMonthlyPayment = Math.round(
    (loanPrincipal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths)) /
    (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1)
  );

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryLoading(true);
    try {
      await InquiryService.create({
        vehicle_id: vehicle.id,
        name: inquiryName,
        phone: inquiryPhone,
        email: inquiryEmail,
        message: inquiryMsg,
        source: 'inspection_request'
      });
      await InspectionService.create({
        vehicle_id: vehicle.id,
        seller_id: vehicle.seller_id,
        buyer_name: inquiryName,
        buyer_phone: inquiryPhone,
        buyer_email: inquiryEmail,
        preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        preferred_time: '10:00 AM',
        location: vehicle.location || 'Nairobi',
        notes: inquiryMsg
      });
      setInquirySuccess(true);
    } catch (err) {
      console.error('Inspection submission error:', err);
    } finally {
      setInquiryLoading(false);
    }
  };

  const imagesList: VehicleImage[] = resolveVehicleImages(vehicle);

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col pb-24 lg:pb-12">
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-[#D9EAFF] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/buy" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1769E0] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="p-2 rounded-xl text-[#64748B] hover:bg-[#F7FAFF]">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Unified Responsive Gallery Component */}
            <VehicleGallery
              images={imagesList}
              altTitle={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            />

            {/* Title & Key Spec Chips */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9EAFF] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#0751C9] mb-1">
                    {vehicle.dealer_name || 'Verified Car Yard'} • {vehicle.location}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10233F]">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-xs text-[#64748B] mt-1">{vehicle.variant || `${vehicle.engine_cc}cc Turbo`}</p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Cash Price</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#0038BC]">
                    KES {vehicle.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Specs Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7FAFF] p-4 rounded-2xl border border-[#D9EAFF]">
                <div className="flex items-center gap-2.5">
                  <Gauge className="w-5 h-5 text-[#1769E0]" />
                  <div>
                    <div className="text-[10px] text-[#64748B] font-bold uppercase">Mileage</div>
                    <div className="text-xs font-extrabold text-[#10233F]">{vehicle.mileage.toLocaleString()} KM</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Cog className="w-5 h-5 text-[#1769E0]" />
                  <div>
                    <div className="text-[10px] text-[#64748B] font-bold uppercase">Transmission</div>
                    <div className="text-xs font-extrabold text-[#10233F]">{vehicle.transmission}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Fuel className="w-5 h-5 text-[#1769E0]" />
                  <div>
                    <div className="text-[10px] text-[#64748B] font-bold uppercase">Fuel</div>
                    <div className="text-xs font-extrabold text-[#10233F]">{vehicle.fuel_type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#1769E0]" />
                  <div>
                    <div className="text-[10px] text-[#64748B] font-bold uppercase">Year</div>
                    <div className="text-xs font-extrabold text-[#10233F]">{vehicle.year}</div>
                  </div>
                </div>
              </div>

              {/* Estimated Market Reference Card */}
              {vehicle.estimated_market_value && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#F7FAFF] to-[#EBF4FF] border border-[#D0E6FD] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0038BC] uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-[#1769E0]" />
                      <span>Estimated Market Reference</span>
                    </div>
                    <Badge variant="verified" size="sm">
                      {vehicle.valuation_confidence || 'High'} Confidence
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Market Range</div>
                      <div className="text-sm font-extrabold text-[#10233F]">
                        KES {(vehicle.market_value_low || vehicle.price * 0.95).toLocaleString()} – KES {(vehicle.market_value_high || vehicle.price * 1.05).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Estimated Market Value</div>
                      <div className="text-sm font-black text-[#0038BC]">
                        KES {vehicle.estimated_market_value.toLocaleString()}
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Valuation Source</div>
                      <div className="text-xs font-semibold text-[#64748B]">
                        {vehicle.valuation_source || 'Kenyan Auto Index 2026'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-extrabold text-[#10233F] uppercase tracking-wider mb-2">Vehicle Overview</h3>
                <p className="text-sm text-[#10233F]/80 leading-relaxed">{vehicle.description}</p>
              </div>

              {/* Features List */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div>
                  <h3 className="text-sm font-extrabold text-[#10233F] uppercase tracking-wider mb-3">Key Features</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {vehicle.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#10233F]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Financing Estimator */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9EAFF] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#1769E0]" />
                <h3 className="text-lg font-extrabold text-[#10233F]">Vehicle Financing Estimator</h3>
              </div>
              <p className="text-xs text-[#64748B]">Calculate estimated monthly repayments based on standard Kenyan auto loan terms (14% p.a.).</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase mb-1">Deposit (%): {depositPercent}%</label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(Number(e.target.value))}
                    className="w-full text-[#1769E0]"
                  />
                  <span className="text-xs text-[#64748B]">KES {depositAmount.toLocaleString()}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase mb-1">Loan Tenure: {tenureMonths} Months</label>
                  <select
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#D9EAFF] text-xs font-bold bg-white text-[#10233F]"
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                  </select>
                </div>

                <div className="p-4 bg-[#F7FAFF] rounded-2xl border border-[#D9EAFF] text-center">
                  <div className="text-[10px] font-bold uppercase text-[#64748B]">Est. Monthly Repayment</div>
                  <div className="text-xl font-black text-[#0038BC] mt-0.5">
                    KES {estimatedMonthlyPayment.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-1">*Subject to bank appraisal</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Action Box & Reservation */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-lg sticky top-24 space-y-6">
              <div className="space-y-2">
                <Badge variant="verified">
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  Varban Verified Vehicle
                </Badge>
                <div className="text-2xl font-black text-[#10233F]">
                  KES {vehicle.price.toLocaleString()}
                </div>
                <p className="text-xs text-[#64748B]">
                  Reserve for KES {siteConfig.reservation.defaultDepositKES.toLocaleString()} to lock this vehicle for {siteConfig.reservation.holdingPeriodDays} days.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => setCheckoutOpen(true)}
                  className="font-extrabold py-3 text-sm shadow-md"
                  icon={<Lock className="w-4 h-4" />}
                >
                  Reserve Car Now
                </Button>

                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => setInspectionOpen(true)}
                  className="font-extrabold py-2.5 text-xs"
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Schedule Yard Inspection
                </Button>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <button className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <Phone className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </button>
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#D9EAFF] text-xs text-[#64748B] space-y-2">
                <div className="font-bold text-[#10233F]">Why Reserve via Varban Auto Flex?</div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Logbook & Ownership document verification</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>3-Day holding guarantee against other buyers</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% Refundable deposit if inspection fails</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Reservation Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          vehicle={vehicle}
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
        />
      )}

      {/* Schedule Inspection Modal */}
      {inspectionOpen && (
        <Modal title="Schedule Yard Inspection" isOpen={inspectionOpen} onClose={() => setInspectionOpen(false)}>
          {inquirySuccess ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#10233F]">Inspection Request Received!</h3>
              <p className="text-xs text-[#64748B]">Our sales representative will contact you shortly to confirm your inspection booking.</p>
              <Button onClick={() => setInspectionOpen(false)}>Close</Button>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Kelvin Mutua"
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                required
              />
              <Input
                label="Phone Number *"
                placeholder="0712 345 678"
                value={inquiryPhone}
                onChange={(e) => setInquiryPhone(e.target.value)}
                required
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="kmutua@gmail.com"
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">Message</label>
                <textarea
                  rows={3}
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D9EAFF] text-xs"
                />
              </div>
              <Button type="submit" fullWidth loading={inquiryLoading} className="font-extrabold">
                Submit Inspection Booking
              </Button>
            </form>
          )}
        </Modal>
      )}

    </div>
  );
};
