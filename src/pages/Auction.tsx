import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Gavel, Clock, ArrowUpRight, ShieldCheck, AlertCircle, CheckCircle2, User, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { AuctionService, AuthService, AuthUser } from '../lib/supabase/client';
import { Auction, AuctionBid, Vehicle } from '../types/database';
import { getVehiclePrimaryImage } from '../lib/utils/imageResolver';
import { useNavigate } from 'react-router-dom';

export const AuctionMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'ending_soon' | 'upcoming' | 'ended'>('all');
  
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmountInput, setBidAmountInput] = useState<number>(0);
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAuctions = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);

      const list = await AuctionService.getAll();
      setAuctions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
    const interval = setInterval(loadAuctions, 10000); // Live sync every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredAuctions = auctions.filter(a => {
    if (activeTab === 'all') return true;
    return a.status === activeTab;
  });

  const handleOpenAuction = (auc: Auction) => {
    setSelectedAuction(auc);
    setBidAmountInput(auc.current_bid + (auc.minimum_increment || 10000));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) {
      setErrorMsg('You must be signed in as a buyer to place a bid.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!selectedAuction) return;

    setBiddingLoading(true);

    try {
      const res = await AuctionService.placeBid(selectedAuction.id, currentUser, bidAmountInput);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to place bid.');
      } else {
        setSuccessMsg(`Congratulations! Your bid of KES ${bidAmountInput.toLocaleString()} was placed successfully.`);
        await loadAuctions();
        if (res.auction) {
          setSelectedAuction({
            ...selectedAuction,
            current_bid: res.auction.current_bid,
            bid_count: res.auction.bid_count,
            bids: res.auction.bids
          });
          setBidAmountInput(res.auction.current_bid + (res.auction.minimum_increment || 10000));
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred while processing your bid.');
    } finally {
      setBiddingLoading(false);
    }
  };

  const formatCountdown = (endTimeStr: string) => {
    const diff = new Date(endTimeStr).getTime() - new Date().getTime();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-[#0038BC] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold uppercase tracking-wider text-[#D9EAFF] mb-3">
              <Gavel className="w-4 h-4 text-[#2D8CFF]" />
              <span>LIVE AUTOMOTIVE AUCTIONS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Verban Verified Vehicle Auctions
            </h1>
            <p className="text-sm text-[#D9EAFF] mt-1 max-w-xl">
              Bid with confidence on inspected vehicles from certified Kenyan car yards and direct importers with transparent reserve prices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black text-white">{auctions.filter(a => a.status === 'live' || a.status === 'ending_soon').length}</div>
              <div className="text-[10px] font-bold uppercase text-[#D9EAFF]">Live Auctions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-8 w-full flex-grow">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#D9EAFF] pb-4 mb-8">
          {(['all', 'live', 'ending_soon', 'upcoming', 'ended'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-[#1769E0] text-white shadow-sm'
                  : 'bg-white text-[#64748B] border border-[#D9EAFF] hover:border-[#1769E0]'
              }`}
            >
              {tab.replace('_', ' ')} ({auctions.filter(a => tab === 'all' || a.status === tab).length})
            </button>
          ))}
        </div>

        {/* Auctions Grid */}
        {filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-12 text-center space-y-3">
            <Gavel className="w-12 h-12 text-[#64748B] mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-[#10233F]">No auctions found in this category</h3>
            <p className="text-xs text-[#64748B]">Check back soon for newly published verified auctions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auc) => {
              const v = auc.vehicle;
              const primaryImg = v ? (getVehiclePrimaryImage(v)?.image_url || '/logo.jpeg') : '/logo.jpeg';
              
              return (
                <div key={auc.id} className="bg-white rounded-3xl border border-[#D9EAFF] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                  
                  {/* Image & Status Badge */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={primaryImg}
                      alt={v ? `${v.make} ${v.model}` : 'Auction Vehicle'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant={auc.status === 'ending_soon' ? 'warning' : auc.status === 'live' ? 'success' : 'secondary'}>
                        {auc.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {auc.status !== 'ended' && (
                      <div className="absolute bottom-3 right-3 bg-[#10233F]/90 backdrop-blur-md text-white text-[11px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formatCountdown(auc.end_time)}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-bold text-[#64748B] uppercase">
                        {v?.year} • {v?.location || 'Nairobi'} • {v?.mileage.toLocaleString()} KM
                      </div>
                      <h3 className="text-lg font-black text-[#10233F] mt-0.5">
                        {v ? `${v.make} ${v.model} ${v.variant || ''}` : `Auction #${auc.id}`}
                      </h3>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#D0E6FD] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-[#64748B] uppercase">Current High Bid</div>
                        <div className="text-xl font-black text-[#0038BC]">
                          KES {auc.current_bid.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-[#64748B] uppercase">Total Bids</div>
                        <div className="text-sm font-extrabold text-[#10233F]">{auc.bid_count || 0} bids</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleOpenAuction(auc)}
                      fullWidth
                      className="font-extrabold py-2.5"
                      icon={<Gavel className="w-4 h-4" />}
                    >
                      {auc.status === 'ended' ? 'View Auction Results' : 'Place Bid Now'}
                    </Button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Auction Detail & Bidding Modal */}
      {selectedAuction && (
        <div className="fixed inset-0 z-50 bg-[#10233F]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#D9EAFF] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            
            <button
              onClick={() => setSelectedAuction(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7FAFF] border border-[#D9EAFF] text-[#10233F] font-bold flex items-center justify-center hover:bg-slate-100"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedAuction.status === 'ending_soon' ? 'warning' : 'success'}>
                  {selectedAuction.status.toUpperCase()}
                </Badge>
                <span className="text-xs font-mono text-[#64748B]">Time remaining: {formatCountdown(selectedAuction.end_time)}</span>
              </div>
              <h2 className="text-2xl font-black text-[#10233F] mt-1">
                {selectedAuction.vehicle ? `${selectedAuction.vehicle.year} ${selectedAuction.vehicle.make} ${selectedAuction.vehicle.model}` : 'Auction Details'}
              </h2>
            </div>

            {/* Bidding Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F7FAFF] border border-[#D0E6FD]">
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Current High Bid</div>
                <div className="text-lg font-black text-[#0038BC]">KES {selectedAuction.current_bid.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Min Increment</div>
                <div className="text-sm font-bold text-[#10233F]">KES {(selectedAuction.minimum_increment || 10000).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Next Min Bid</div>
                <div className="text-sm font-extrabold text-emerald-600">
                  KES {(selectedAuction.current_bid + (selectedAuction.minimum_increment || 10000)).toLocaleString()}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Place Bid Form */}
            {selectedAuction.status !== 'ended' && selectedAuction.status !== 'cancelled' && (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <Input
                  label="Your Bid Amount (KES) *"
                  type="number"
                  value={bidAmountInput}
                  onChange={(e) => setBidAmountInput(parseInt(e.target.value) || 0)}
                  required
                />
                <Button type="submit" fullWidth loading={biddingLoading} className="font-extrabold py-3">
                  Submit Official Bid
                </Button>
              </form>
            )}

            {/* Recent Bid History */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] mb-2">Bid History Log</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 border-t border-[#D9EAFF] pt-2">
                {selectedAuction.bids && selectedAuction.bids.length > 0 ? (
                  selectedAuction.bids.map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#10233F]">{b.buyer_name}</span>
                        <span className="text-[10px] text-[#64748B] ml-2">{new Date(b.created_at).toLocaleTimeString()}</span>
                      </div>
                      <span className="font-mono font-black text-[#0038BC]">KES {b.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#64748B]">No bids placed yet. Be the first bidder!</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
