import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Loader2, KeyRound, GraduationCap, Store, Building2, CheckCircle2 } from 'lucide-react';
import { loginUser, registerUser } from '../api';

const ROLES = [
  {
    id: 'student',
    title: 'Student Portal',
    badge: 'Student',
    icon: GraduationCap,
    desc: 'For college students to buy & sell peer-to-peer',
    color: 'emerald',
    activeTabClass: 'border-emerald-600 text-emerald-700 bg-emerald-50/50',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
    demoEmail: 'student.demo@campus.edu',
    demoName: 'Dinesh (Student)',
    demoLocation: 'Block B - Room 204',
  },
  {
    id: 'seller',
    title: 'Seller Center',
    badge: 'Campus Seller',
    icon: Store,
    desc: 'For student entrepreneurs & campus shop owners',
    color: 'indigo',
    activeTabClass: 'border-indigo-600 text-indigo-700 bg-indigo-50/50',
    btnClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
    demoEmail: 'seller.demo@campus.edu',
    demoName: 'Campus Book Store & Stationery',
    demoLocation: 'KEC Student Center Stall 4',
  },
  {
    id: 'staff',
    title: 'Staff / Faculty Portal',
    badge: 'Faculty / Staff',
    icon: Building2,
    desc: 'For college professors, lab in-charges & staff',
    color: 'amber',
    activeTabClass: 'border-amber-600 text-amber-700 bg-amber-50/50',
    btnClass: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
    demoEmail: 'staff.demo@campus.edu',
    demoName: 'Prof. Rajesh Kumar (Faculty)',
    demoLocation: 'Computer Science Dept - Cabin 108',
  },
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialRole = 'student' }) {
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [isLogin, setIsLogin] = useState(true);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Role-specific fields
  const [hostelBlock, setHostelBlock] = useState('Block A - Room 101');
  const [storeName, setStoreName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  if (!isOpen) return null;

  const currentRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Log in verifying role portal
        const data = await loginUser({
          email: email.trim(),
          password,
          role: selectedRole,
        });
        localStorage.setItem('campus_token', data.token);
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      } else {
        // Register new user with selected role
        const payload = {
          name: name.trim(),
          email: email.trim(),
          password,
          whatsappNumber: whatsappNumber.trim(),
          role: selectedRole,
          hostelBlock: selectedRole === 'student' ? hostelBlock.trim() : (storeName || department || 'Campus'),
          department: selectedRole === 'staff' ? department.trim() : '',
          storeName: selectedRole === 'seller' ? storeName.trim() : '',
        };

        const data = await registerUser(payload);
        localStorage.setItem('campus_token', data.token);
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Dedicated One-Click Demo Login for the active role
  const handleRoleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const demoPassword = 'password123';
    const demoEmail = currentRoleConfig.demoEmail;

    try {
      try {
        const data = await loginUser({
          email: demoEmail,
          password: demoPassword,
          role: selectedRole,
        });
        localStorage.setItem('campus_token', data.token);
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
        return;
      } catch (loginErr) {
        // If not registered yet, auto-register the demo account
        const regData = await registerUser({
          name: currentRoleConfig.demoName,
          email: demoEmail,
          password: demoPassword,
          whatsappNumber: '+919876543210',
          role: selectedRole,
          hostelBlock: currentRoleConfig.demoLocation,
          department: selectedRole === 'staff' ? 'Computer Science & Engineering' : '',
          storeName: selectedRole === 'seller' ? 'Campus Bookstore & Tech' : '',
        });
        localStorage.setItem('campus_token', regData.token);
        localStorage.setItem('campus_user', JSON.stringify(regData.user));
        onAuthSuccess(regData.user);
        onClose();
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Could not initialize demo login: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const RoleIcon = currentRoleConfig.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Role Selector Tabs */}
        <div className="bg-slate-100/80 p-2 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Select Your Portal
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    setError('');
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${
                    isSelected
                      ? role.id === 'student' ? 'text-emerald-600' : role.id === 'seller' ? 'text-indigo-600' : 'text-amber-600'
                      : 'text-slate-400'
                  }`} />
                  <span>{role.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portal Header Banner */}
        <div className={`px-6 py-3.5 border-b border-slate-100 flex items-center justify-between ${
          selectedRole === 'student' ? 'bg-emerald-50/60' : selectedRole === 'seller' ? 'bg-indigo-50/60' : 'bg-amber-50/60'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              selectedRole === 'student' ? 'bg-emerald-100 text-emerald-700' : selectedRole === 'seller' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <RoleIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{currentRoleConfig.title}</h2>
              <p className="text-[11px] text-slate-500">{currentRoleConfig.desc}</p>
            </div>
          </div>

          {/* Sign In vs Create Account Toggle */}
          <div className="flex rounded-lg bg-white/80 p-0.5 border border-slate-200/70 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                isLogin ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
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
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                !isLogin ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Fields */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {selectedRole === 'staff' ? 'Faculty / Staff Name' : selectedRole === 'seller' ? 'Seller / Contact Name' : 'Student Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === 'staff' ? 'Dr. Ramesh Kumar' : selectedRole === 'seller' ? 'Campus Book Store (Rajesh)' : 'Farzana'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {selectedRole === 'staff' ? 'Official Staff / College Email' : selectedRole === 'seller' ? 'Seller / Business Email' : 'College Email'} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={selectedRole === 'staff' ? 'faculty@college.edu' : selectedRole === 'seller' ? 'seller@college.edu' : 'student@college.edu'}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Student specific: Hostel Block */}
              {selectedRole === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hostel / Campus Block
                  </label>
                  <input
                    type="text"
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value)}
                    placeholder="e.g. Block A - Room 101"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              )}

              {/* Seller specific: Store Name & Location */}
              {selectedRole === 'seller' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store / Business Name
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. KEC Stationary"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Campus Stall / Room
                    </label>
                    <input
                      type="text"
                      value={hostelBlock}
                      onChange={(e) => setHostelBlock(e.target.value)}
                      placeholder="e.g. Canteen Stall 2"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Staff specific: Department & Cabin */}
              {selectedRole === 'staff' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cabin / Office Room
                    </label>
                    <input
                      type="text"
                      value={hostelBlock}
                      onChange={(e) => setHostelBlock(e.target.value)}
                      placeholder="e.g. Admin Block - 204"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${currentRoleConfig.btnClass}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In as {currentRoleConfig.badge}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register as {currentRoleConfig.badge}</span>
              </>
            )}
          </button>

          {/* Quick Demo Login Option for selected role */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleRoleDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>One-Click Demo {currentRoleConfig.badge} Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
