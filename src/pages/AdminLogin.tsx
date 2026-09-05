import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, CheckCircle2, ArrowLeft, LogOut } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthService, AuthUser } from '../lib/supabase/client';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    AuthService.getCurrentUser().then(user => {
      setCurrentUser(user);
      if (user && user.role === 'admin') {
        navigate('/admin', { replace: true });
      }
    }).catch(() => setCurrentUser(null));
  }, [navigate]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await AuthService.adminSignIn(email, password);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Invalid administrator credentials. Access denied.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Administrator authentication successful! Launching Admin Console...');
      setTimeout(() => {
        setLoading(false);
        navigate('/admin', { replace: true });
      }, 600);
    } catch (err) {
      console.error('Admin login exception:', err);
      setErrorMsg('A secure server authorization failure occurred. Access denied.');
      setLoading(false);
    }
  };

  const handleSignOutNonAdmin = async () => {
    await AuthService.signOut();
    setCurrentUser(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
      <Navbar />

      <div className="max-w-md mx-auto my-auto px-4 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-12 w-full">
        
        {/* Admin Login Card Container */}
        <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Top Decorative Blue Brand Stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#0038BC]" />

          {/* Logo & Header */}
          <div className="text-center space-y-3 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-[#F7FAFF] border border-[#D9EAFF] p-2 shadow-md mx-auto flex items-center justify-center">
              <ShieldCheck className="w-9 h-9 text-[#0038BC]" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9EAFF]/50 border border-[#D9EAFF] text-[10px] font-black uppercase tracking-wider text-[#0038BC]">
              <ShieldCheck className="w-3 h-3" />
              <span>Restricted Access Portal</span>
            </div>

            <h1 className="text-2xl font-black text-[#10233F] tracking-tight">
              Executive Admin Portal
            </h1>
            <p className="text-xs text-[#64748B] font-medium leading-relaxed max-w-xs mx-auto">
              Secure administrator authentication & privilege control for Varban Auto Flex operations.
            </p>
          </div>

          {/* Authenticated as non-admin warning banner */}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-left">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>LoggedIn Account Not Authorized ({currentUser.email})</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-snug">
                Your account is currently registered as <strong>{currentUser.role.toUpperCase()}</strong>. Administrator privileges are required to access this portal.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleSignOutNonAdmin}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-extrabold hover:bg-amber-700 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out & Log In as Admin</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <Input
              label="Administrator Email *"
              type="email"
              placeholder="Varbanauto@admin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-[#64748B]" />}
              required
              autoComplete="username"
            />

            <Input
              label="Administrator Password *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-[#64748B]" />}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="py-3 font-black text-xs uppercase tracking-wider bg-[#0038BC] hover:bg-[#1769E0] shadow-md"
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              {loading ? 'Authenticating Privileges...' : 'Authenticate Admin Session'}
            </Button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-3 border-t border-[#D9EAFF] flex items-center justify-between text-xs text-[#64748B]">
            <Link to="/" className="font-bold text-[#1769E0] hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </Link>
            <Link to="/login" className="font-bold text-[#64748B] hover:text-[#10233F]">
              Standard Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
