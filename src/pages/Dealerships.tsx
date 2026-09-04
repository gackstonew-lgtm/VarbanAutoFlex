import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Building, MapPin, ShieldCheck, Phone, Mail, Car, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';

export const DealershipsPage: React.FC = () => {
  const yards = [
    {
      name: 'Nairobi Motors Hub Ltd',
      location: 'Ngong Road, Nairobi',
      inventoryCount: '15+ Vehicles',
      specialty: 'Toyota, Lexus, Land Rover',
      phone: '+254 700 888 999',
      verified: true
    },
    {
      name: 'YARDY Imports Hub',
      location: 'Mombasa Road, Nairobi',
      inventoryCount: '10+ Direct Container Imports',
      specialty: 'Japanese & UK Direct Imports',
      phone: '+254 712 052 104',
      verified: true
    },
    {
      name: 'Coastline Auto Yard',
      location: 'Nyali, Mombasa',
      inventoryCount: '8+ Vehicles',
      specialty: 'Nissan, Mazda, Subaru',
      phone: '+254 733 998 877',
      verified: true
    },
    {
      name: 'Rift Valley Commercial Motors',
      location: 'Nakuru Town',
      inventoryCount: '6+ Trucks & Pickups',
      specialty: 'Isuzu, Ford, Toyota Hilux',
      phone: '+254 722 554 433',
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-8 font-sans">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0038BC] via-[#0751C9] to-[#1769E0] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold uppercase tracking-wider text-[#D9EAFF]">
            <Building className="w-4 h-4 text-[#2D8CFF]" />
            <span>VERIFIED KENYAN CAR YARD DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Partner Dealerships & Car Yards
          </h1>
          <p className="text-sm sm:text-base text-[#D9EAFF] max-w-2xl mx-auto">
            Explore verified car yards and licensed auto dealers across Nairobi, Mombasa, and Nakuru. Every listed dealer is logbook-audited and background-verified by Varban Auto Flex.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-8">
        
        {/* Dealership Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {yards.map((yard, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-[#D9EAFF] shadow-sm hover:border-[#1769E0]/50 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="verified" size="sm">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Logbook Verified Yard
                  </Badge>
                  <span className="text-xs font-bold text-[#1769E0]">{yard.inventoryCount}</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#10233F]">{yard.name}</h3>
                <div className="text-xs text-[#64748B] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1769E0]" />
                    <span>{yard.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#1769E0]" />
                    <span>Specialties: {yard.specialty}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D9EAFF] flex items-center justify-between gap-3">
                <a href={`tel:${yard.phone}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10233F] hover:text-[#1769E0]">
                  <Phone className="w-3.5 h-3.5 text-[#1769E0]" />
                  <span>{yard.phone}</span>
                </a>
                <Link to="/buy">
                  <Button size="sm" variant="outline" className="font-extrabold text-xs">
                    View Yard Inventory
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
