import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Car, CheckCircle2, XCircle, DollarSign, Users, Eye, FileText, AlertTriangle, ArrowLeft, LogOut, User } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { VehicleService, SellerSubmissionService, ReservationService, PaymentService, InquiryService, AuthService, AuthUser } from '../lib/supabase/client';
import { Vehicle, SellerListingSubmission, Reservation, PaymentRecord, VehicleInquiry } from '../types/database';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [submissions, setSubmissions] = useState<SellerListingSubmission[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [inquiries, setInquiries] = useState<VehicleInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'inventory' | 'submissions' | 'leads' | 'payments'>('submissions');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);

        const [vList, sList, rList, pList, iList] = await Promise.all([
          VehicleService.getAll(),
          SellerSubmissionService.getAll(),
          ReservationService.getAll(),
          PaymentService.getAll(),
          InquiryService.getAll()
        ]);
        setVehicles(vList);
        setSubmissions(sList);
        setReservations(rList);
        setPayments(pList);
        setInquiries(iList);
      } catch (err) {
        console.error('Failed to load admin dataset', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleSignOut = async () => {
    await AuthService.signOut();
    navigate('/auth');
  };

  const handleApproveSubmission = async (id: string) => {
    await SellerSubmissionService.updateStatus(id, 'approved');
    setSubmissions(await SellerSubmissionService.getAll());
    setVehicles(await VehicleService.getAll());
  };

  const handleRejectSubmission = async (id: string) => {
    await SellerSubmissionService.updateStatus(id, 'rejected', 'Document / pricing mismatch');
    setSubmissions(await SellerSubmissionService.getAll());
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending_review');

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
      <Navbar />

      {/* Admin Dashboard Header */}
      <div className="bg-[#0038BC] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D8CFF] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>CAR YARD ADMINISTRATION HUB</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Marketplace Control Console</h1>
            {currentUser && (
              <div className="text-xs text-[#D9EAFF] mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Logged in as <strong>{currentUser.full_name}</strong> ({currentUser.email})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="verified" size="md">
              Admin Authenticated
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#D9EAFF] shadow-sm">
            <div className="text-xs font-bold text-[#64748B] uppercase">Active Vehicles</div>
            <div className="text-2xl font-black text-[#10233F] mt-1">{vehicles.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#D9EAFF] shadow-sm">
            <div className="text-xs font-bold text-[#64748B] uppercase">Pending Submissions</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingSubmissions.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#D9EAFF] shadow-sm">
            <div className="text-xs font-bold text-[#64748B] uppercase">Confirmed Reservations</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{reservations.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#D9EAFF] shadow-sm">
            <div className="text-xs font-bold text-[#64748B] uppercase">Total Payments</div>
            <div className="text-2xl font-black text-[#0038BC] mt-1">{payments.length}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#D9EAFF] pb-4 mb-6">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs transition-all ${
              activeTab === 'submissions'
                ? 'bg-[#1769E0] text-white'
                : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            Pending Seller Submissions ({pendingSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#1769E0] text-white'
                : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            Vehicle Inventory ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs transition-all ${
              activeTab === 'leads'
                ? 'bg-[#1769E0] text-white'
                : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            Buyer Leads ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs transition-all ${
              activeTab === 'payments'
                ? 'bg-[#1769E0] text-white'
                : 'bg-white text-[#64748B] border border-[#D9EAFF]'
            }`}
          >
            M-Pesa Payments Audit ({payments.length})
          </button>
        </div>

        {/* TAB 1: Submissions */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#10233F]">Seller Listing Submissions</h3>
            {submissions.length === 0 ? (
              <p className="text-xs text-[#64748B]">No seller submissions to review.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-5 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#10233F]">{sub.year} {sub.make} {sub.model}</span>
                        <Badge variant={sub.status === 'pending_review' ? 'warning' : sub.status === 'approved' ? 'success' : 'secondary'}>
                          {sub.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-[#64748B] mt-1">
                        Seller: {sub.seller_name} ({sub.seller_phone}) • Reg: {sub.registration_number} • Price: KES {sub.asking_price.toLocaleString()}
                      </div>
                      {sub.logbook_document_url && (
                        <div className="text-[11px] text-[#0038BC] font-semibold mt-1">
                          Logbook Document Attached: {sub.logbook_document_url}
                        </div>
                      )}
                    </div>

                    {sub.status === 'pending_review' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApproveSubmission(sub.id)}
                          icon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          Approve & Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRejectSubmission(sub.id)}
                          icon={<XCircle className="w-4 h-4" />}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Inventory */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#10233F]">Live Marketplace Inventory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7FAFF] text-[#64748B] uppercase font-bold border-b border-[#D9EAFF]">
                  <tr>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Yard / Dealer</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9EAFF]">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-[#F7FAFF]">
                      <td className="p-3 font-bold text-[#10233F]">{v.year} {v.make} {v.model}</td>
                      <td className="p-3 text-[#64748B]">{v.dealer_name || 'Private'}</td>
                      <td className="p-3 font-black text-[#0038BC]">KES {v.price.toLocaleString()}</td>
                      <td className="p-3 text-[#64748B]">{v.location}</td>
                      <td className="p-3"><Badge variant="success">{v.status}</Badge></td>
                      <td className="p-3">
                        <Link to={`/vehicles/${v.id}`}>
                          <Button size="sm" variant="ghost">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Leads */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#10233F]">Buyer Inquiries & Inspection Leads</h3>
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-4 rounded-2xl border border-[#D0E6FD] bg-[#F7FAFF] flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-[#10233F]">{inq.name} ({inq.phone})</div>
                    <div className="text-[#64748B]">{inq.message}</div>
                    <div className="text-[10px] text-[#0038BC] font-semibold mt-1">Source: {inq.source}</div>
                  </div>
                  <Badge variant="primary">{inq.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Payments */}
        {activeTab === 'payments' && (
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9EAFF] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#10233F]">M-Pesa & Payment Audit Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7FAFF] text-[#64748B] uppercase font-bold border-b border-[#D9EAFF]">
                  <tr>
                    <th className="p-3">Receipt / Ref</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9EAFF]">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 font-mono font-bold text-[#0038BC]">{p.mpesa_receipt_number || p.id}</td>
                      <td className="p-3 font-black text-[#10233F]">KES {p.amount.toLocaleString()}</td>
                      <td className="p-3 text-[#64748B]">{p.phone_number}</td>
                      <td className="p-3 uppercase font-bold text-[#1769E0]">{p.provider}</td>
                      <td className="p-3"><Badge variant="success">{p.status}</Badge></td>
                      <td className="p-3 text-[#64748B]">{new Date(p.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
