import { useState } from 'react';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  Check,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Fingerprint,
  KeyRound,
  Smartphone,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { AuthState } from '@/App';

interface AuthFlowProps {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  onComplete: () => void;
}

type UserType = 'individual' | 'business';

export function AuthFlow({ authState, setAuthState, onComplete }: AuthFlowProps) {
  const [userType, setUserType] = useState<UserType>('individual');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setAuthState('otp');
    toast.success('OTP sent to your email!');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setAuthState('otp');
    toast.success('OTP sent to your email!');
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(digit => !digit)) {
      toast.error('Please enter complete OTP');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setAuthState('pin');
    toast.success('OTP verified! Set your PIN');
  };

  const handlePinSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.some(digit => !digit)) {
      toast.error('Please enter complete PIN');
      return;
    }
    if (confirmPin.some(digit => !digit)) {
      toast.error('Please confirm your PIN');
      return;
    }
    if (pin.join('') !== confirmPin.join('')) {
      toast.error('PINs do not match');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onComplete();
    toast.success('Welcome to Velcro!');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handlePinChange = (index: number, value: string, type: 'pin' | 'confirm') => {
    if (value.length > 1) return;
    if (type === 'pin') {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      if (value && index < 3) {
        document.getElementById(`pin-${index + 1}`)?.focus();
      }
    } else {
      const newConfirmPin = [...confirmPin];
      newConfirmPin[index] = value;
      setConfirmPin(newConfirmPin);
      if (value && index < 3) {
        document.getElementById(`confirm-pin-${index + 1}`)?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-velcro-green/5 to-transparent rounded-full" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-velcro-navy/5 to-transparent rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center h-12 sm:h-16 mb-3 sm:mb-4">
            <img src="/logos/velcro.png" alt="Velcro" className="h-full w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-sm">Payments made simple</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-gray-100">
          {authState === 'signup' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-velcro-green/20 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-velcro-green/20">
                  <UserCircle className="text-velcro-green" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Create Account</h2>
                <p className="text-gray-500 text-sm">Join thousands using Velcro</p>
              </div>

              {/* User Type Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                <button
                  onClick={() => setUserType('individual')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${userType === 'individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <User size={18} />
                  <span className="hidden sm:inline">Individual</span>
                  <span className="sm:hidden">Personal</span>
                </button>
                <button
                  onClick={() => setUserType('business')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${userType === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Building2 size={18} />
                  Business
                </button>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label className="text-gray-600 text-sm mb-1.5 block">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="pl-11 py-3 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600 text-sm mb-1.5 block">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-11 py-3 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600 text-sm mb-1.5 block">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-11 py-3 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Already have an account?{' '}
                <button 
                  onClick={() => setAuthState('login')}
                  className="text-velcro-green hover:text-velcro-green-dark font-medium"
                >
                  Sign In
                </button>
              </p>
            </>
          )}

          {authState === 'login' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                  <CheckCircle className="text-blue-600" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Welcome Back</h2>
                <p className="text-gray-500 text-sm">Sign in to your Velcro account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="text-gray-600 text-sm mb-1.5 block">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-11 py-3 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 mt-2 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <span>Passwordless login with OTP</span>
                </div>
              </div>

              <p className="text-center text-gray-500 text-sm mt-6">
                Don't have an account?{' '}
                <button 
                  onClick={() => setAuthState('signup')}
                  className="text-velcro-green hover:text-velcro-green-dark font-medium"
                >
                  Sign Up
                </button>
              </p>
            </>
          )}

          {authState === 'otp' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <KeyRound className="text-amber-600" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Enter OTP</h2>
                <p className="text-gray-500 text-sm">We've sent a 6-digit code to {formData.email || 'your email'}</p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Didn't receive code?{' '}
                <button 
                  onClick={() => toast.success('New OTP sent!')}
                  className="text-velcro-green hover:text-velcro-green-dark font-medium"
                >
                  Resend
                </button>
              </p>
            </>
          )}

          {authState === 'pin' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-200">
                  <KeyRound className="text-purple-600" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Create PIN</h2>
                <p className="text-gray-500 text-sm">Set a 4-digit PIN for secure transactions</p>
              </div>

              <form onSubmit={handlePinSet} className="space-y-6">
                {/* PIN Input */}
                <div>
                  <Label className="text-sm text-gray-600 mb-3 block">Enter PIN</Label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {pin.map((digit, index) => (
                      <input
                        key={index}
                        id={`pin-${index}`}
                        type={showPin ? 'text' : 'password'}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value, 'pin')}
                        className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Confirm PIN Input */}
                <div>
                  <Label className="text-sm text-gray-600 mb-3 block">Confirm PIN</Label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {confirmPin.map((digit, index) => (
                      <input
                        key={index}
                        id={`confirm-pin-${index}`}
                        type={showPin ? 'text' : 'password'}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value, 'confirm')}
                        className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Show/Hide PIN */}
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="flex items-center gap-2 text-sm text-gray-500 mx-auto"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPin ? 'Hide PIN' : 'Show PIN'}
                </button>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={18} className="mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center">
              <CheckCircle size={12} />
            </div>
            <span>Secure by Anchor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center">
              <Lock size={12} />
            </div>
            <span>256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
