import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthService } from '../lib/supabase/client';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await AuthService.signUp(email, password, fullName);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to register account.');
          setLoading(false);
          return;
        }
        setSuccessMsg('Account registered successfully! Redirecting to Admin Dashboard...');
      } else {
        const res = await AuthService.signIn(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid credentials.');
          setLoading(false);
          return;
        }
        setSuccessMsg('Signed in successfully! Redirecting...');
      }

      setTimeout(() => {
        setLoading(false);
        navigate('/admin');
      }, 600);
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected authentication error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col">
      <Navbar />

      <div className="max-w-md mx-auto my-auto px-4 py-12 w-full">
        <div className="bg-white rounded-3xl border border-[#D9EAFF] p-8 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#D9EAFF] p-1 shadow-md mx-auto flex items-center justify-center">
              <img
                src="/logo.jpeg"
                alt="Yardly Automotive Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-[#10233F]">
              {isRegister ? 'Register Car-Yard Admin' : 'Car-Yard Partner Login'}
            </h2>
            <p className="text-xs text-[#64748B]">
              {isRegister ? 'Register as a car-yard administrator or dealer' : 'Access your listings, leads & deposit reports'}
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Full Name / Dealership Name *"
                placeholder="e.g. Mwangi Car Yard"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="w-4 h-4 text-[#64748B]" />}
                required
              />
            )}

            <Input
              label="Email Address *"
              type="email"
              placeholder="admin@yardly.co.ke"
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

            <Button type="submit" fullWidth loading={loading} className="font-bold">
              {isRegister ? 'Register Account' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-xs text-[#64748B] pt-2 border-t border-[#D9EAFF]">
            {isRegister ? 'Already have an admin account?' : "Don't have an admin account?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="font-bold text-[#1769E0] hover:underline"
            >
              {isRegister ? 'Sign In' : 'Register Here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
