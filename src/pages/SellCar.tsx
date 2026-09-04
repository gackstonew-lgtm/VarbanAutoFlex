import React, { useState } from 'react';
import { ShieldCheck, Upload, Trash2, CheckCircle2, Car, AlertCircle, ArrowRight, FileText } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SellerSubmissionService } from '../lib/supabase/client';
import { EmailService } from '../lib/email/resend';
import { siteConfig } from '../config/site';

export const SellCar: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [sellerType, setSellerType] = useState<'private' | 'dealer'>('private');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('+254 780618608');
  const [sellerEmail, setSellerEmail] = useState('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2019');
  const [regNum, setRegNum] = useState('');
  const [mileage, setMileage] = useState('');
  const [engineCc, setEngineCc] = useState('');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Petrol');
  const [bodyType, setBodyType] = useState('SUV');
  const [location, setLocation] = useState('Nairobi');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'Brand New' | 'Foreign Used' | 'Locally Used'>('Foreign Used');
  const [images, setImages] = useState<string[]>([]);
  const [logbookUrl, setLogbookUrl] = useState('');
  const [logbookFileName, setLogbookFileName] = useState('');

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleLogbookFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogbookFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogbookUrl(reader.result as string || file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName || !sellerPhone || !sellerEmail || !model || !price || !regNum) {
      setErrorMsg('Please fill in all required fields including seller info, vehicle model, registration number, and asking price.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const submission = await SellerSubmissionService.create({
        seller_name: sellerName,
        seller_phone: sellerPhone,
        seller_email: sellerEmail,
        seller_type: sellerType,
        make,
        model,
        year: Number(year),
        registration_number: regNum,
        mileage: Number(mileage) || 0,
        engine_cc: Number(engineCc) || 2000,
        transmission: transmission as any,
        fuel_type: fuelType as any,
        body_type: bodyType as any,
        location,
        asking_price: Number(price),
        description,
        condition,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'],
        logbook_document_url: logbookUrl || undefined
      });

      // Dispatch confirmation email
      const html = EmailService.generateSellerSubmissionEmailHtml(sellerName, `${year} ${make} ${model}`);
      await EmailService.sendEmail({
        to: sellerEmail,
        subject: `Vehicle Listing Submitted — ${siteConfig.name}`,
        html
      });

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0038BC] to-[#1769E0] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#D9EAFF]" />
            DIRECT TO VERIFIED BUYERS
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Sell Your Car Without the Hassle
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto">
            List your vehicle with Verban Auto and reach serious, verified buyers and car yards across Kenya.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-12 w-full flex-grow">
        {submitted ? (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-8 sm:p-12 text-center space-y-6 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#10233F]">Listing Submitted Successfully!</h2>
            <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
              Your vehicle listing for <strong>{year} {make} {model}</strong> has been submitted. Our car-yard administration team will review your logbook and specifications within 24 hours.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => setSubmitted(false)} variant="outline" className="font-bold">
                Submit Another Vehicle
              </Button>
              <a href="/buy">
                <Button variant="primary" className="font-bold">
                  Browse Marketplace
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#D9EAFF] p-6 sm:p-10 shadow-xl space-y-8">
            
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Seller Details */}
            <div className="space-y-4">
              <div className="border-b border-[#D9EAFF] pb-3">
                <h3 className="text-lg font-extrabold text-[#10233F]">1. Seller Information</h3>
                <p className="text-xs text-[#64748B]">Provide your contact information for buyer inquiries.</p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-bold text-[#10233F] uppercase">I am a:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSellerType('private')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      sellerType === 'private'
                        ? 'bg-[#1769E0] text-white shadow-sm'
                        : 'bg-[#F7FAFF] text-[#64748B] border border-[#D0E6FD]'
                    }`}
                  >
                    Private Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellerType('dealer')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      sellerType === 'dealer'
                        ? 'bg-[#1769E0] text-white shadow-sm'
                        : 'bg-[#F7FAFF] text-[#64748B] border border-[#D0E6FD]'
                    }`}
                  >
                    Car Yard / Dealer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Baraka Mwangi"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number (M-Pesa) *"
                  placeholder="e.g. 0712345678"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  required
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* STEP 2: Vehicle Specs */}
            <div className="space-y-4">
              <div className="border-b border-[#D9EAFF] pb-3">
                <h3 className="text-lg font-extrabold text-[#10233F]">2. Vehicle Specifications</h3>
                <p className="text-xs text-[#64748B]">Accurate specs increase buyer inquiry conversion rates.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                    Make *
                  </label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm font-semibold text-[#10233F]"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Subaru">Subaru</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="BMW">BMW</option>
                    <option value="Isuzu">Isuzu</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Land Rover">Land Rover</option>
                    <option value="Ford">Ford</option>
                  </select>
                </div>

                <Input
                  label="Model *"
                  placeholder="e.g. Harrier, Prado, CX-5"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />

                <Input
                  label="Year of Manufacture *"
                  type="number"
                  placeholder="e.g. 2019"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Registration Number (Hidden) *"
                  placeholder="e.g. KDH 452X"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  helperText="Used strictly for admin logbook audit"
                  required
                />

                <Input
                  label="Mileage (KM) *"
                  type="number"
                  placeholder="e.g. 62000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  required
                />

                <Input
                  label="Engine Capacity (CC) *"
                  type="number"
                  placeholder="e.g. 2000"
                  value={engineCc}
                  onChange={(e) => setEngineCc(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                    Transmission *
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm font-semibold text-[#10233F]"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                    Fuel Type *
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm font-semibold text-[#10233F]"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                    Body Type *
                  </label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm font-semibold text-[#10233F]"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Station Wagon">Station Wagon</option>
                    <option value="Pickup / Truck">Pickup / Truck</option>
                    <option value="Van / Minibus">Van / Minibus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                    Location *
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm font-semibold text-[#10233F]"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Eldoret">Eldoret</option>
                    <option value="Kisumu">Kisumu</option>
                  </select>
                </div>

                <Input
                  label="Asking Price (KES) *"
                  type="number"
                  placeholder="e.g. 3850000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                    Vehicle Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] px-4 py-3 text-sm font-semibold text-[#10233F]"
                  >
                    <option value="Foreign Used">Foreign Used (Import)</option>
                    <option value="Locally Used">Locally Used (Kenyan)</option>
                    <option value="Brand New">Brand New</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                  Detailed Vehicle Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Highlight key features, sunroof, leather seats, service history..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#D0E6FD] bg-[#F7FAFF] p-4 text-sm text-[#10233F] focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                />
              </div>
            </div>

            {/* STEP 3: Photos & Documentation */}
            <div className="space-y-4">
              <div className="border-b border-[#D9EAFF] pb-3">
                <h3 className="text-lg font-extrabold text-[#10233F]">3. Photos & Logbook Verification</h3>
                <p className="text-xs text-[#64748B]">Upload vehicle photographs (.jpg, .png) and logbook documents (.pdf, .doc).</p>
              </div>

              {/* Photo Upload (.jpg) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider">
                  Upload Vehicle Photographs (JPG / PNG / WebP) *
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1769E0] text-white text-xs font-extrabold shadow hover:bg-[#0038BC] transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Select Photo Files (.jpg)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      multiple
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-[#64748B] font-medium">
                    {images.length} photo(s) attached
                  </span>
                </div>
              </div>

              {/* Photo Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 group border border-[#D9EAFF] shadow-sm">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md transition-all"
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Logbook Upload (.pdf/.doc) */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider">
                  Upload Logbook / Registration Document (.pdf / .doc) *
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#10233F] text-white text-xs font-extrabold shadow hover:bg-[#0038BC] transition-all">
                    <FileText className="w-4 h-4 text-[#2D8CFF]" />
                    <span>Select Document (.pdf / .doc)</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleLogbookFileUpload}
                      className="hidden"
                    />
                  </label>
                  {logbookFileName && (
                    <div className="flex items-center gap-2 bg-[#D9EAFF] text-[#0038BC] px-3 py-1.5 rounded-lg text-xs font-bold">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{logbookFileName}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B]">Restricted logbook audit document. Encrypted for verified admin inspection only.</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={loading}
                className="font-bold text-base"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Submit Listing for Verification
              </Button>
            </div>

          </form>
        )}
      </div>

    </div>
  );
};
