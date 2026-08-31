import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Gauge, Fuel, Cog, Calendar, Phone, MessageSquare, Calculator, Share2, ArrowLeft, CheckCircle2, Lock, Sparkles, Heart } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { VehicleService, InquiryService } from '../lib/supabase/client';
import { Vehicle, VehicleImage } from '../types/database';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CheckoutModal } from '../components/payment/CheckoutModal';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { VehicleImageWithFallback } from '../components/ui/VehicleImageWithFallback';
import { siteConfig } from '../config/site';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
    `Hi, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model} listed at KES ${vehicle.price.toLocaleString()} on YARDLY.`
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
      setInquirySuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setInquiryLoading(false);
    }
  };

  const imagesList: VehicleImage[] = vehicle.images && vehicle.images.length > 0
    ? vehicle.images
    : [{
        id: 'placeholder-img',
        vehicle_id: vehicle.id,
        image_url: '',
        display_order: 1,
        is_primary: true,
        source_type: 'demo',
        license_status: 'pending',
        created_at: new Date().toISOString()
      }];

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
            
            {/* Gallery Component */}
            <div className="space-y-4">
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-100 border border-[#D9EAFF] shadow-lg">
                <VehicleImageWithFallback
                  image={imagesList[activeImageIndex]}
                  make={vehicle.make}
                  model={vehicle.model}
                  year={vehicle.year}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="verified">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Verified Demo Listing
                  </Badge>
                  {vehicle.logbook_verified && (
                    <Badge variant="secondary">Logbook Checked</Badge>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {imagesList.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === i ? 'border-[#1769E0] scale-95' : 'border-transparent opacity-70'
                      }`}
                    >
                      <VehicleImageWithFallback
                        image={img}
                        make={vehicle.make}
                        model={vehicle.model}
                        year={vehicle.year}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] p-2.5 text-xs font-bold"
                  >
                    <option value={24}>24 Months (2 Yrs)</option>
                    <option value={36}>36 Months (3 Yrs)</option>
                    <option value={48}>48 Months (4 Yrs)</option>
                    <option value={60}>60 Months (5 Yrs)</option>
                  </select>
                </div>

                <div className="bg-[#F7FAFF] p-4 rounded-2xl border border-[#D0E6FD] text-center">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase">Estimated Monthly Payment</div>
                  <div className="text-xl font-black text-[#0038BC]">
                    KES {estimatedMonthlyPayment.toLocaleString()} / mo
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Desktop Action Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-lg sticky top-28 space-y-6">
              
              <div className="space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  variant="primary"
                  onClick={() => setCheckoutOpen(true)}
                  className="font-bold text-base shadow-lg"
                >
                  Reserve This Car • KES 50,000
                </Button>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button fullWidth variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold">
                    <MessageSquare className="w-4 h-4 mr-2 text-emerald-600" />
                    WhatsApp Seller
                  </Button>
                </a>

                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => setInspectionOpen(true)}
                  className="font-bold"
                >
                  Schedule Physical Inspection
                </Button>
              </div>

              <div className="pt-4 border-t border-[#D9EAFF] space-y-3 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1769E0]" />
                  <span>Logbook verified by YARDLY audit team.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#1769E0]" />
                  <span>M-Pesa holding deposit is 100% refundable.</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D9EAFF] p-3 px-4 flex items-center gap-3 shadow-2xl">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-grow">
          <Button fullWidth variant="outline" className="border-emerald-500 text-emerald-700 text-xs px-2 py-3">
            WhatsApp
          </Button>
        </a>
        <Button
          fullWidth
          variant="primary"
          onClick={() => setCheckoutOpen(true)}
          className="text-xs px-2 py-3 font-bold"
        >
          Reserve • KES 50K
        </Button>
      </div>

      {/* Reservation Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        vehicle={vehicle}
      />

      {/* Schedule Inspection Modal */}
      <Modal
        isOpen={inspectionOpen}
        onClose={() => setInspectionOpen(false)}
        title="Schedule Physical Inspection"
        subtitle={`Schedule a viewing for the ${vehicle.year} ${vehicle.make} ${vehicle.model} at ${vehicle.location}.`}
      >
        {inquirySuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-[#10233F]">Inspection Request Received!</h3>
            <p className="text-xs text-[#64748B]">Our yard manager will reach out via phone to confirm your schedule.</p>
            <Button onClick={() => setInspectionOpen(false)} fullWidth>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <Input label="Your Name *" value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} required />
            <Input label="Phone Number *" value={inquiryPhone} onChange={(e) => setInquiryPhone(e.target.value)} required />
            <Input label="Email Address *" type="email" value={inquiryEmail} onChange={(e) => setInquiryEmail(e.target.value)} required />
            <Button type="submit" fullWidth loading={inquiryLoading} className="font-bold">Confirm Inspection Request</Button>
          </form>
        )}
      </Modal>

    </div>
  );
};
