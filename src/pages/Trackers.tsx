import React, { useState } from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Navigation, ShieldCheck, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const TrackersPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carDetails, setCarDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const trackerFeatures = [
    { title: 'Real-Time GPS Tracking', desc: 'Live mobile app and web portal monitoring across Kenya, Uganda, and Tanzania.' },
    { title: 'Remote Engine Cut-Off', desc: 'Instantly immobilize your vehicle via SMS or mobile app in case of unauthorized access.' },
    { title: 'Geo-Fencing Alerts', desc: 'Receive instant notifications whenever your vehicle enters or exits designated zones.' },
    { title: 'Speed & Fuel Analytics', desc: 'Monitor driver speed, harsh braking, mileage reports, and fuel consumption trends.' }
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-8 font-sans">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0038BC] via-[#0751C9] to-[#1769E0] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold uppercase tracking-wider text-[#D9EAFF]">
            <Navigation className="w-4 h-4 text-[#2D8CFF]" />
            <span>24/7 SATELLITE FLEET & PRIVATE VEHICLE SECURITY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            GPS Tracker Installations
          </h1>
          <p className="text-sm sm:text-base text-[#D9EAFF] max-w-2xl mx-auto">
            Protect your investment with certified real-time GPS tracking, remote immobilizers, and insurance-approved vehicle security systems installed by certified technicians in Nairobi, Mombasa, and Nakuru.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trackerFeatures.map((feat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D9EAFF]/60 text-[#1769E0] flex items-center justify-center font-black">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-extrabold text-[#10233F]">{feat.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Booking / Inquiry Form */}
        <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 sm:p-10 shadow-lg max-w-2xl mx-auto space-y-6">
          <div className="border-b border-[#D9EAFF] pb-4">
            <h2 className="text-xl font-black text-[#10233F]">Book a Tracker Installation</h2>
            <p className="text-xs text-[#64748B] mt-1">Our mobile technicians can visit your yard, home, or office for installation.</p>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#10233F]">Installation Booking Received!</h3>
              <p className="text-xs text-[#64748B]">Our security team will call you shortly to confirm your installation slot.</p>
              <Button onClick={() => setSubmitted(false)} variant="outline">Book Another Vehicle</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Samuel Ochieng"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Phone Number *"
                placeholder="0712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Vehicle Make & Model *"
                placeholder="e.g. 2021 Toyota Prado / Mazda CX-5"
                value={carDetails}
                onChange={(e) => setCarDetails(e.target.value)}
                required
              />
              <Button type="submit" fullWidth className="font-extrabold py-3">
                Request Installation Booking
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
