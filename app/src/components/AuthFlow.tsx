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
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  Smartphone,
  UserCircle,
  MessageCircle,
  ArrowLeft,
  Shield
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
type SignUpStep = 'name-email' | 'email-otp' | 'phone' | 'whatsapp-otp' | 'pin';

export function AuthFlow({ authState, setAuthState, onComplete }: AuthFlowProps) {
  const [userType, setUserType] = useState<UserType>('individual');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('name-email');
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '']);
  const [whatsappOtp, setWhatsappOtp] = useState(['', '', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpFlow, setIsSignUpFlow] = useState(false);

  // Step 1: Handle Name + Email submission
  const handleNameEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSignUpFlow(true);
    setSignUpStep('email-otp');
    toast.success('OTP sent to your email!');
  };

  // Step 2: Handle Email OTP verification
  const handleEmailOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.some(digit => !digit)) {
      toast.error('Please enter complete OTP');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSignUpStep('phone');
    toast.success('Email verified!');
  };

  // Step 3: Handle Phone submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) {
      toast.error('Please enter your phone number');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSignUpStep('whatsapp-otp');
    toast.success('OTP sent to your WhatsApp!');
  };

  // Step 4: Handle WhatsApp OTP verification
  const handleWhatsappOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsappOtp.some(digit => !digit)) {
      toast.error('Please enter complete OTP');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSignUpStep('pin');
    toast.success('Phone verified! Set your PIN');
  };

  // Handle PIN set
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSignUpFlow(false);
    setEmailOtp(['', '', '', '', '']);
    setPin(['', '', '', '']);
    setAuthState('otp');
    toast.success('OTP sent to your email!');
  };

  const handleOtpChange = (index: number, value: string, type: 'email' | 'whatsapp') => {
    if (value.length > 1) return;
    if (type === 'email') {
      const newOtp = [...emailOtp];
      newOtp[index] = value;
      setEmailOtp(newOtp);
      if (value && index < 4) {
        document.getElementById(`email-otp-${index + 1}`)?.focus();
      }
    } else {
      const newOtp = [...whatsappOtp];
      newOtp[index] = value;
      setWhatsappOtp(newOtp);
      if (value && index < 4) {
        document.getElementById(`whatsapp-otp-${index + 1}`)?.focus();
      }
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

  const resendOtp = (type: 'email' | 'whatsapp') => {
    toast.success(`OTP resent to your ${type === 'email' ? 'email' : 'WhatsApp'}!`);
  };

  // Progress indicator for signup steps
  const renderProgress = () => {
    const steps = [
      { id: 'name-email', label: 'Account' },
      { id: 'email-otp', label: 'Verify Email' },
      { id: 'phone', label: 'Phone' },
      { id: 'whatsapp-otp', label: 'Verify Phone' },
      { id: 'pin', label: 'PIN' },
    ];
    const currentIndex = steps.findIndex(s => s.id === signUpStep);
    
    return (
      <div className="flex items-center justify-center gap-1 mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentIndex ? 'bg-velcro-green' : 'bg-gray-200'
              }`}
            />
            {index < steps.length - 1 && (
              <div className={`w-4 h-0.5 ${index < currentIndex ? 'bg-velcro-green' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Progress indicator for login steps
  const renderLoginProgress = () => {
    const steps = [
      { id: 'login', label: 'Email' },
      { id: 'otp', label: 'Verify' },
      { id: 'pin', label: 'PIN' },
    ];
    
    // Determine current step index based on authState
    let currentIndex = 0;
    if (authState === 'otp') currentIndex = 1;
    else if (authState === 'pin') currentIndex = 2;
    
    return (
      <div className="flex items-center justify-center gap-1 mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentIndex ? 'bg-velcro-green' : 'bg-gray-200'
              }`}
            />
            {index < steps.length - 1 && (
              <div className={`w-4 h-0.5 ${index < currentIndex ? 'bg-velcro-green' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
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
            <img src="logos/velcro.png" alt="Velcro" className="h-full w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-sm">Move Money Globally - Without Limits</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-gray-100">
          
          {/* SIGNUP FLOW */}
          {authState === 'signup' && (
            <>
              {renderProgress()}

              {/* STEP 1: Name + Email */}
              {signUpStep === 'name-email' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <UserCircle className="text-gray-700" size={28} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Create Account</h2>
                    <p className="text-gray-500 text-sm">Let's get started with your details</p>
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

                  <form onSubmit={handleNameEmailSubmit} className="space-y-4">
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

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-velcro-green hover:bg-velcro-green/90 text-white font-semibold h-12 rounded-xl mt-2"
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

                  <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => {
                        setAuthState('login');
                        setEmailOtp(['', '', '', '', '']);
                        setPin(['', '', '', '']);
                      }}
                      className="text-velcro-green hover:text-velcro-green-dark font-medium"
                    >
                      Sign In
                    </button>
                  </p>
                </>
              )}

              {/* STEP 2: Email OTP */}
              {signUpStep === 'email-otp' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <Mail className="text-gray-700" size={28} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Verify Email</h2>
                    <p className="text-gray-500 text-sm">Enter the 5-digit code sent to</p>
                    <p className="text-gray-900 font-medium text-sm mt-1">{formData.email}</p>
                  </div>

                  <form onSubmit={handleEmailOtpVerify} className="space-y-6">
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {emailOtp.map((digit, index) => (
                        <input
                          key={index}
                          id={`email-otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value, 'email')}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-gray-500 text-sm">
                        Didn't receive code?{' '}
                        <button 
                          type="button"
                          onClick={() => resendOtp('email')}
                          className="text-velcro-green hover:text-velcro-green-dark font-medium"
                        >
                          Resend
                        </button>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSignUpStep('name-email')}
                        className="flex-1 h-12 rounded-xl"
                      >
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || emailOtp.some(digit => !digit)}
                        className="flex-1 bg-velcro-green hover:bg-velcro-green/90 text-white font-semibold h-12 rounded-xl"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {/* STEP 3: Phone Number */}
              {signUpStep === 'phone' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="text-gray-700" size={28} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Phone Number</h2>
                    <p className="text-gray-500 text-sm">Add your WhatsApp number</p>
                  </div>

                  {/* WhatsApp Info Box */}
                  <div className="p-4 bg-velcro-green/10 rounded-xl border border-velcro-green/20 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-velcro-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={20} className="text-velcro-green" />
                      </div>
                      <div>
                        <p className="text-sm text-velcro-green font-medium">Use your WhatsApp number</p>
                        <p className="text-xs text-gray-600 mt-1">
                          We'll send your OTP via WhatsApp for faster and more secure verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <Label className="text-gray-600 text-sm mb-1.5 block">WhatsApp Number</Label>
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

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSignUpStep('email-otp')}
                        className="flex-1 h-12 rounded-xl"
                      >
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-velcro-green hover:bg-velcro-green/90 text-white font-semibold h-12 rounded-xl"
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
                    </div>
                  </form>
                </>
              )}

              {/* STEP 4: WhatsApp OTP */}
              {signUpStep === 'whatsapp-otp' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="text-gray-700" size={28} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Verify WhatsApp</h2>
                    <p className="text-gray-500 text-sm">Enter the 5-digit code sent to</p>
                    <p className="text-gray-900 font-medium text-sm mt-1">{formData.phone}</p>
                  </div>

                  <form onSubmit={handleWhatsappOtpVerify} className="space-y-6">
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {whatsappOtp.map((digit, index) => (
                        <input
                          key={index}
                          id={`whatsapp-otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value, 'whatsapp')}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-gray-500 text-sm">
                        Didn't receive code?{' '}
                        <button 
                          type="button"
                          onClick={() => resendOtp('whatsapp')}
                          className="text-velcro-green hover:text-velcro-green-dark font-medium"
                        >
                          Resend
                        </button>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSignUpStep('phone')}
                        className="flex-1 h-12 rounded-xl"
                      >
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || whatsappOtp.some(digit => !digit)}
                        className="flex-1 bg-velcro-green hover:bg-velcro-green/90 text-white font-semibold h-12 rounded-xl"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {/* STEP 5: PIN Setup */}
              {signUpStep === 'pin' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <Lock className="text-gray-700" size={28} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Create PIN</h2>
                    <p className="text-gray-500 text-sm">Secure your account with a 4-digit PIN</p>
                  </div>

                  <form onSubmit={handlePinSet} className="space-y-6">
                    {/* PIN Input */}
                    <div>
                      <Label className="text-gray-600 text-sm mb-3 block text-center">Enter PIN</Label>
                      <div className="flex justify-center gap-3">
                        {pin.map((digit, index) => (
                          <input
                            key={index}
                            id={`pin-${index}`}
                            type={showPin ? 'text' : 'password'}
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value, 'pin')}
                            className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Confirm PIN */}
                    <div>
                      <Label className="text-gray-600 text-sm mb-3 block text-center">Confirm PIN</Label>
                      <div className="flex justify-center gap-3">
                        {confirmPin.map((digit, index) => (
                          <input
                            key={index}
                            id={`confirm-pin-${index}`}
                            type={showPin ? 'text' : 'password'}
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value, 'confirm')}
                            className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Show PIN Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="flex items-center justify-center gap-2 text-gray-500 text-sm mx-auto hover:text-gray-700"
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showPin ? 'Hide PIN' : 'Show PIN'}
                    </button>

                    <Button
                      type="submit"
                      disabled={isLoading || pin.some(d => !d) || confirmPin.some(d => !d)}
                      className="w-full bg-velcro-green hover:bg-velcro-green/90 text-white font-semibold h-12 rounded-xl"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Complete Setup
                          <Sparkles size={18} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </>
          )}

          {/* LOGIN FLOW */}
          {authState === 'login' && (
            <>
              {renderLoginProgress()}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-gray-700" size={28} />
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

              <div className="mt-6 p-4 bg-velcro-green/5 rounded-xl border border-velcro-green/10">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-velcro-green/10 border border-velcro-green/20 flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-velcro-green" />
                  </div>
                  <span>Passwordless login with OTP</span>
                </div>
              </div>

              <p className="text-center text-gray-500 text-sm mt-6">
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setAuthState('signup');
                    setSignUpStep('name-email');
                    setFormData({ fullName: '', email: '', phone: '' });
                    setEmailOtp(['', '', '', '', '']);
                    setWhatsappOtp(['', '', '', '', '']);
                  }}
                  className="text-velcro-green hover:text-velcro-green-dark font-medium"
                >
                  Sign Up
                </button>
              </p>
            </>
          )}

          {/* OTP Screen for Login */}
          {authState === 'otp' && !isSignUpFlow && (
            <>
              {renderLoginProgress()}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="text-gray-700" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Enter OTP</h2>
                <p className="text-gray-500 text-sm">We've sent a 5-digit code to {formData.email || 'your email'}</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (emailOtp.some(digit => !digit)) {
                  toast.error('Please enter complete OTP');
                  return;
                }
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setAuthState('pin');
                  toast.success('OTP verified! Enter your PIN');
                }, 1000);
              }} className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {emailOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`login-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        if (e.target.value.length > 1) return;
                        const newOtp = [...emailOtp];
                        newOtp[index] = e.target.value;
                        setEmailOtp(newOtp);
                        if (e.target.value && index < 4) {
                          document.getElementById(`login-otp-${index + 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-gray-500 text-sm">
                    Didn't receive code?{' '}
                    <button 
                      type="button"
                      onClick={() => toast.success('OTP resent!')}
                      className="text-velcro-green hover:text-velcro-green-dark font-medium"
                    >
                      Resend
                    </button>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || emailOtp.some(digit => !digit)}
                  className="w-full bg-velcro-green hover:bg-velcro-green/90 text-white font-semibold h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </Button>
              </form>
            </>
          )}

          {/* PIN Screen for Login */}
          {authState === 'pin' && !isSignUpFlow && (
            <>
              {renderLoginProgress()}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-gray-700" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Enter PIN</h2>
                <p className="text-gray-500 text-sm">Enter your 4-digit PIN to continue</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (pin.some(digit => !digit)) {
                  toast.error('Please enter complete PIN');
                  return;
                }
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  onComplete();
                  toast.success('Welcome back!');
                }, 1000);
              }} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      id={`login-pin-${index}`}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        if (e.target.value.length > 1) return;
                        const newPin = [...pin];
                        newPin[index] = e.target.value;
                        setPin(newPin);
                        if (e.target.value && index < 3) {
                          document.getElementById(`login-pin-${index + 1}`)?.focus();
                        }
                      }}
                      className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="flex items-center justify-center gap-2 text-gray-500 text-sm mx-auto hover:text-gray-700"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPin ? 'Hide PIN' : 'Show PIN'}
                </button>

                <Button
                  type="submit"
                  disabled={isLoading || pin.some(digit => !digit)}
                  className="w-full bg-velcro-green hover:bg-velcro-green/90 text-white font-semibold h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
