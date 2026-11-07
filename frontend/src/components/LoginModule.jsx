import React, { useState } from 'react';
import {
  GraduationCap,
  Store,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { loginUser, registerUser } from '../api';

const ROLES = [
  {
    id: 'student',
    title: 'Student Portal',
    badge: 'Student',
    icon: GraduationCap,
    desc: 'For KEC students to buy & sell notes, gadgets, hostel gear & cycles peer-to-peer.',
    tag: 'Hostel & Room Verified',
    theme: {
      color: 'emerald',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
      iconBg: 'bg-emerald-500',
    },
    demoEmail: 'student.demo@campus.edu',
    demoName: 'Dinesh (Student)',
    demoLocation: 'Hostel Block B - Room 204',
  },
  {
    id: 'staff',
    title: 'Faculty / Staff Portal',
    badge: 'Faculty & Staff',
    icon: Building2,
    desc: 'For college professors, department heads, lab instructors & campus staff.',
    tag: 'Official Department Verified',
    theme: {
      color: 'amber',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50',
      badgeBg: 'bg-amber-100 text-amber-800',
      btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25',
      iconBg: 'bg-amber-500',
    },
    demoEmail: 'staff.demo@campus.edu',
    demoName: 'Prof. Rajesh Kumar (Faculty)',
    demoLocation: 'Computer Science & Engg Cabin 108',
  },
  {
    id: 'seller',
    title: 'Campus Seller / Store',
    badge: 'Merchant / Stall',
    icon: Store,
    desc: 'For student entrepreneurs, stationery stall owners, tech repairs & club merchandise.',
    tag: 'Campus Merchant Verified',
    theme: {
      color: 'indigo',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25',
      iconBg: 'bg-indigo-500',
    },
    demoEmail: 'seller.demo@campus.edu',
    demoName: 'Campus Book Store & Stationery',
    demoLocation: 'KEC Student Center Stall 4',
  },
];

const HOSTEL_BLOCKS = [
  'Hostel Block A (Boys)',
  'Hostel Block B (Boys)',
  'Hostel Block C (Girls)',
  'Hostel Block D (Girls)',
  'PG Hostel Block',
  'Day Scholar (Bus Route 12)',
  'Day Scholar (Erode/Perundurai)',
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mechatronics Engineering',
  'Management Studies (MBA)',
];

export default function LoginModule({ onAuthSuccess, onContinueAsGuest }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [hostelBlock, setHostelBlock] = useState('Hostel Block B (Boys)');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [storeName, setStoreName] = useState('Campus Stationery Stall 4');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0];
  const RoleIcon = currentRole.icon;

  // Handle standard login / register submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser({
          email: email.trim(),
          password,
          role: selectedRole,
        });
        localStorage.setItem('campus_token', data.token);
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        const payload = {
          name: name.trim(),
          email: email.trim(),
          password,
          whatsappNumber: whatsappNumber.trim(),
          role: selectedRole,
          hostelBlock:
            selectedRole === 'student'
              ? hostelBlock.trim()
              : selectedRole === 'staff'
              ? `${department.trim()} Dept`
              : storeName.trim() || 'Campus Seller',
          department: selectedRole === 'staff' ? department.trim() : '',
          storeName: selectedRole === 'seller' ? storeName.trim() : '',
        };

        const data = await registerUser(payload);
        localStorage.setItem('campus_token', data.token);
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      }
    } catch (err) {
      console.error('Auth submit error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click Demo Login for any role
  const handleQuickDemoLogin = async (roleId) => {
    setError('');
    setLoading(true);
    const targetRole = ROLES.find((r) => r.id === roleId) || currentRole;
    const demoPassword = 'password123';
    const demoEmail = targetRole.demoEmail;

    try {
      try {
        const data = await loginUser({
          email: demoEmail,
          password: demoPassword,
          role: roleId,
        });
        localStorage.setItem('campus_token', data.token);
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        return;
      } catch (loginErr) {
        // If demo user does not exist in DB yet, auto-register on the fly
        const regData = await registerUser({
          name: targetRole.demoName,
          email: demoEmail,
          password: demoPassword,
          whatsappNumber: '+919876543210',
          role: roleId,
          hostelBlock: targetRole.demoLocation,
          department: roleId === 'staff' ? 'Computer Science & Engineering' : '',
          storeName: roleId === 'seller' ? 'Campus Stationery Stall 4' : '',
        });
        localStorage.setItem('campus_token', regData.token);
        localStorage.setItem('campus_user', JSON.stringify(regData.user));
        onAuthSuccess(regData.user);
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError(
        'Could not complete demo login: ' +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00171a] via-[#00282d] to-[#001417] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Decorative Ambient Radial Glows */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-[#23e5db]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-20 w-80 h-80 rounded-full bg-[#ffce32]/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#002f34] flex items-center justify-center text-white shadow-md border border-[#23e5db]/40">
            <svg
              className="w-5 h-5 text-[#23e5db]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                CAMPUS
              </span>
              <span className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black tracking-wider uppercase bg-[#ffce32] text-[#002f34] shadow-xs">
                CONNECT
              </span>
            </div>
            <span className="text-[10px] text-teal-200/70 font-semibold tracking-wider uppercase block">
              Kongu Engineering College
            </span>
          </div>
        </div>

        {/* Guest Access Link */}
        {onContinueAsGuest && (
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="text-xs font-bold text-teal-200 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore as Guest</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* Main Center Gateway Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#ffce32] text-[#002f34] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-[#002f34]" />
            <span>Role-Based Campus Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Sign In to Campus Connect
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Please select whether you are a <span className="text-emerald-400 font-bold">Student</span>, <span className="text-amber-400 font-bold">Faculty / Staff</span>, or <span className="text-indigo-400 font-bold">Campus Seller</span> to enter your personalized dashboard.
          </p>
        </div>

        {/* Step 1: Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setError('');
                }}
                className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white shadow-xl -translate-y-1'
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isSelected
                          ? `${role.theme.iconBg} text-white shadow-md`
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSelected ? role.theme.badgeBg : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {role.badge}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-black ${
                      isSelected ? 'text-[#002f34]' : 'text-white'
                    }`}
                  >
                    {role.title}
                  </h3>
                  <p
                    className={`text-xs mt-1.5 leading-relaxed font-medium ${
                      isSelected ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {role.desc}
                  </p>
                </div>

                <div
                  className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-bold ${
                    isSelected
                      ? 'border-slate-100 text-[#002f34]'
                      : 'border-white/10 text-teal-300'
                  }`}
                >
                  <span>{role.tag}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-emerald-600 text-white' : 'border border-white/30'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 2: Authentication Form Card */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100">
          
          {/* Card Header & Tab Switcher */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${currentRole.theme.iconBg}`}
              >
                <RoleIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#002f34] leading-tight">
                  {currentRole.title}
                </h2>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {isLogin ? 'Sign in with your campus account' : 'Register your new campus profile'}
                </p>
              </div>
            </div>

            {/* Toggle Login vs Register */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isLogin
                    ? 'bg-white text-[#002f34] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isLogin
                    ? 'bg-white text-[#002f34] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Registration-only fields */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dinesh Kumar"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#002f34] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Number (for campus buyers & sellers)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#002f34] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Role Specific Field */}
                {selectedRole === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hostel Block / Day Scholar
                    </label>
                    <select
                      value={hostelBlock}
                      onChange={(e) => setHostelBlock(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#002f34] focus:bg-white transition-all cursor-pointer"
                    >
                      {HOSTEL_BLOCKS.map((hb) => (
                        <option key={hb} value={hb}>
                          {hb}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedRole === 'staff' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Faculty Branch
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#002f34] focus:bg-white transition-all cursor-pointer"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedRole === 'seller' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store Name / Business Title
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. KEC Stationery & Book Stall"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#002f34] focus:bg-white transition-all"
                    />
                  </div>
                )}
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentRole.demoEmail}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#002f34] focus:bg-white transition-all"
                />
              </div>
              {!isLogin && (
                <p className="text-[11px] text-teal-700 font-semibold mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>College email required (e.g. @student.college.edu, @campus.edu) for Verified Student badge.</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#002f34] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black text-white uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 ${currentRole.theme.btnBg} ${
                loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {isLogin
                      ? `Sign In as ${currentRole.badge}`
                      : `Register as ${currentRole.badge}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Evaluation Demo Row */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ Instant 1-Click Demo Login:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('staff')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('seller')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                <span>Seller</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between text-xs text-teal-200/60 gap-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#23e5db]" />
          <span>Kongu Engineering College Official Student Network • 0% Commission</span>
        </div>
        <div>© 2026 Campus Connect India</div>
      </footer>
    </div>
  );
}
