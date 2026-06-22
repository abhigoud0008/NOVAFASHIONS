import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Phone, Lock, X, CheckCircle, UserCheck } from 'lucide-react';
import { loginWithPhone, PhoneUser } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: PhoneUser) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync field values on open
  React.useEffect(() => {
    if (isOpen) {
      setPhone('');
      setPassword('');
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone.trim() || !password) {
      setErrorMsg('Please enter both phone number and passcode.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithPhone(phone, password);
      
      setSuccessMsg(`Account secured successfully for ${user.phone}! Redirecting...`);
      
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing auth transaction.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4" id="auth-modal-screen">
      {/* Background radial glares */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto shadow-md bg-primary">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-black text-lg text-gray-800 uppercase tracking-tight mt-3">
            SECURE CUSTOMER GATEWAY
          </h3>
          <p className="text-gray-500 text-xs font-sans max-w-xs mx-auto">
            Direct credentials authentication. If you do not have an account yet, your phone number will be registered automatically upon form submission!
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold mb-4 text-center"
          >
            ❌ {errorMsg}
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-semibold mb-4 flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 text-green-600 animate-pulse" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-[10px] uppercase text-gray-400 mb-1.5 font-bold">
              Your Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                required
                placeholder="Enter 10-digit phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 outline-none text-gray-800 focus:border-primary transition-all font-semibold"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-gray-400 mb-1.5 font-bold">
              Password / Passcode
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Create or enter passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 outline-none text-gray-800 focus:border-primary transition-all font-semibold"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-sans font-black text-xs uppercase tracking-widest py-3.5 rounded-xl cursor-pointer hover:shadow-md transition-all disabled:opacity-50 bg-primary hover:bg-blue-700"
          >
            {loading ? 'PROCESSING SECURITY TUNNEL...' : 'SECURE LOGIN & ACCESS'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-gray-150 text-center text-[10px] text-gray-400 font-sans italic">
          🔒 Secure multi-user telemetry active. All traffic is fully encrypted for client privacy.
        </div>
      </motion.div>
    </div>
  );
}
