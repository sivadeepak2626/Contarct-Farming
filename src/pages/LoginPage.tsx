import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Sprout, ShieldCheck, UserCheck, Building2, Users } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@farmcontract.in');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        navigate('/');
      } else {
        setError('Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'farmer' | 'buyer' | 'officer') => {
    setError(null);
    setSubmitting(true);
    try {
      const ok = await quickSwitchRole(role);
      if (ok) {
        navigate('/');
      }
    } catch (err: any) {
      setError('Failed to log in as demo persona.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fbfbf8]">
      {/* Left Branding / Visual Hero */}
      <div className="relative md:w-1/2 bg-[#143224] text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">FarmContract</h1>
              <p className="text-xs text-emerald-300">Contract Farming Management System</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-10 max-w-lg">
          <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-white/10 rounded-md border border-white/15">
            Full Stack CSE Capstone Project &middot; MERN Stack
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight leading-snug">
            Bridging Smallholders, Field Agronomists, and Corporate Buyers
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
            Standardized production agreements, automated value calculations, GPS &amp; field stage inspections, and transparent payment settlement ledgers.
          </p>

          {/* Key Tech Badges */}
          <div className="flex flex-wrap gap-2 mt-5 text-[11px]">
            <span className="px-2.5 py-1 bg-white/10 rounded-md text-emerald-200">MongoDB &amp; Mongoose</span>
            <span className="px-2.5 py-1 bg-white/10 rounded-md text-emerald-200">Express.js REST APIs</span>
            <span className="px-2.5 py-1 bg-white/10 rounded-md text-emerald-200">React.js &amp; Tailwind</span>
            <span className="px-2.5 py-1 bg-white/10 rounded-md text-emerald-200">JWT Role-Based Access</span>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-stone-400">
          &copy; 2026 FarmContract Enterprise &middot; Built with MERN Architecture
        </div>

        {/* Ambient Field Photography */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/farm_hero_field_1791919035593.jpg"
            alt="Farm Fields Aerial"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Form Card */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Portal Authentication</h2>
            <p className="text-xs text-stone-500 mt-1">
              Select a quick demo persona or sign in with your registered account
            </p>
          </div>

          {/* Quick 1-Click Demo Personas */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Quick 1-Click Evaluation Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 text-left rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-stone-600 mt-0.5 truncate">admin@farmcontract.in</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('farmer')}
                className="p-2.5 text-left rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                  <Users className="w-4 h-4 text-amber-800" />
                  <span>Farmer</span>
                </div>
                <div className="text-[10px] text-stone-600 mt-0.5 truncate">Ramesh Patel (FARM-001)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('buyer')}
                className="p-2.5 text-left rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-100 hover:border-teal-400 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-teal-950 text-xs">
                  <Building2 className="w-4 h-4 text-teal-800" />
                  <span>Buyer</span>
                </div>
                <div className="text-[10px] text-stone-600 mt-0.5 truncate">AgroCorp (BUY-001)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('officer')}
                className="p-2.5 text-left rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-800" />
                  <span>Field Officer</span>
                </div>
                <div className="text-[10px] text-stone-600 mt-0.5 truncate">Dr. Priya Rao (FO-001)</div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200" />
            <span className="flex-shrink mx-3 text-stone-400 text-[11px] uppercase">Or log in manually</span>
            <div className="flex-grow border-t border-stone-200" />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@farmcontract.in"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
