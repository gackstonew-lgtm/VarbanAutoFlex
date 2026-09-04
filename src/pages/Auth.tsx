import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthService } from '../lib/supabase/client';
import { SellerType, UserRole } from '../types/database';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [registerRole, setRegisterRole] = useState<'buyer' | 'seller'>('buyer');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sellerType, setSellerType] = useState<SellerType>('dealer');
  const [businessName, setBusinessName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      let loggedInRole: string = 'buyer';
      if (isRegister) {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please re-enter your password.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        const res = await AuthService.signUp(
          email, 
          password, 
          fullName, 
          registerRole === 'seller' ? 'seller' : 'buyer', 
          phone, 
          registerRole === 'seller' ? sellerType : undefined, 
          registerRole === 'seller' ? businessName : undefined
        );

        if (!res.success) {
          setErrorMsg(res.error || 'Failed to register account.');
          setLoading(false);
          return;
        }
        loggedInRole = res.user?.role || 'buyer';
        setSuccessMsg(`Account created successfully as ${registerRole.toUpperCase()}! Redirecting...`);
      } else {
        const res = await AuthService.signIn(email, password);
        if (!res.success || !res.user) {
          setErrorMsg(res.error || 'Invalid email or password.');
          setLoading(false);
          return;
        }
        loggedInRole = res.user.role;
        setSuccessMsg('Signed in successfully! Redirecting...');
      }

      setTimeout(() => {
        setLoading(false);
        if (loggedInRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      }, 700);
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected authentication error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
      <Navbar />

      <div className="max-w-lg mx-auto my-auto px-4 pt-12 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-12 w-full">
        <div className="bg-white rounded-3xl border border-[#D9EAFF] p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#D9EAFF] p-1 shadow-md mx-auto flex items-center justify-center">
              <img
                src="/logo.jpeg"
                alt="Verban Auto Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-[#10233F]">
              {isRegister ? `Register as a ${registerRole === 'seller' ? 'Seller / Dealer' : 'Buyer'}` : 'Verban Partner & Buyer Sign In'}
            </h2>
            <p className="text-xs text-[#64748B]">
              {isRegister 
                ? 'Create your Verban Auto account to buy, bid, list cars or request imports' 
                : 'Access your vehicle inventory, saved cars, trade-ins & bidding portal'}
            </p>
          </div>

          {/* Registration Mode Selector */}
          {isRegister && (
            <div className="grid grid-cols-2 gap-2 bg-[#F7FAFF] p-1.5 rounded-2xl border border-[#D9EAFF]">
              <button
                type="button"
                onClick={() => setRegisterRole('buyer')}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  registerRole === 'buyer'
                    ? 'bg-[#1769E0] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#10233F]'
                }`}
              >
                Register as Buyer
              </button>
              <button
                type="button"
                onClick={() => setRegisterRole('seller')}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  registerRole === 'seller'
                    ? 'bg-[#1769E0] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#10233F]'
                }`}
              >
                Register as Seller
              </button>
            </div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <>
                <Input
                  label={registerRole === 'seller' ? 'Full Name / Representative Name *' : 'Full Name *'}
                  placeholder="e.g. Maina Kamau"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<User className="w-4 h-4 text-[#64748B]" />}
                  required
                />

                <Input
                  label="Phone Number *"
                  placeholder="+254 712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone className="w-4 h-4 text-[#64748B]" />}
                  required
                />

                {registerRole === 'seller' && (
                  <>
                    <Input
                      label="Business / Dealership Name"
                      placeholder="e.g. Mwangi Car Yard Ltd"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      icon={<Building className="w-4 h-4 text-[#64748B]" />}
                    />

                    <div>
                      <label className="block text-xs font-bold text-[#10233F] mb-1.5">Seller Type *</label>
                      <select
                        value={sellerType}
                        onChange={(e) => setSellerType(e.target.value as SellerType)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D9EAFF] text-xs font-bold text-[#10233F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                      >
                        <option value="private">Individual Private Seller</option>
                        <option value="dealer">Car Yard / Commercial Dealer</option>
                        <option value="importer">Direct Importer</option>
                        <option value="business">Corporate / Business Fleet</option>
                      </select>
                    </div>
                  </>
                )}
              </>
            )}

            <Input
              label="Email Address *"
              type="email"
              placeholder="user@verban.co.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-[#64748B]" />}
              required
            />

            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-[#64748B]" />}
              required
            />

            {isRegister && (
              <Input
                label="Confirm Password *"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-4 h-4 text-[#64748B]" />}
                required
              />
            )}

            <Button type="submit" fullWidth loading={loading} className="font-extrabold py-3">
              {isRegister ? `Create ${registerRole === 'seller' ? 'Seller' : 'Buyer'} Account` : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-xs text-[#64748B] pt-3 border-t border-[#D9EAFF]">
            {isRegister ? 'Already registered?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="font-bold text-[#1769E0] hover:underline"
            >
              {isRegister ? 'Sign In Here' : 'Create Account Now'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
