import { useState } from 'react';
import { X, Check, ArrowRight, Bell, Shield, Lock, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type WhatsAppStep = 'connected' | 'change-verify' | 'change-phone' | 'otp' | 'success';

interface WhatsAppSyncModalProps {
  onClose: () => void;
  onSync: (phoneNumber: string) => void;
  currentNumber: string | null;
  userEmail: string;
}

export function WhatsAppSyncModal({ onClose, onSync, currentNumber, userEmail }: WhatsAppSyncModalProps) {
  const [step, setStep] = useState<WhatsAppStep>(currentNumber ? 'connected' : 'change-phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: When already connected - Show connected state
  const handleStartChange = () => {
    setStep('change-verify');
  };

  // Step 2: Verify identity with email OTP and PIN
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.some(digit => !digit)) {
      toast.error('Please enter complete email OTP');
      return;
    }
    if (pin.some(digit => !digit)) {
      toast.error('Please enter complete PIN');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    toast.success('Identity verified!');
    setStep('change-phone');
  };

  // Step 3: Send OTP to new WhatsApp number
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    toast.success('OTP sent to your WhatsApp!');
    setStep('otp');
  };

  // Step 4: Verify WhatsApp OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(digit => !digit)) {
      toast.error('Please enter complete OTP');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    setStep('success');
    onSync(`+234${phoneNumber}`);
    toast.success('WhatsApp synced successfully!');
  };

  const handleOtpChange = (index: number, value: string, type: 'wa' | 'email') => {
    if (value.length > 1) return;
    if (type === 'wa') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        document.getElementById(`wa-otp-${index + 1}`)?.focus();
      }
    } else {
      const newOtp = [...emailOtp];
      newOtp[index] = value;
      setEmailOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`email-otp-${index + 1}`)?.focus();
      }
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    const maskedUser = user.slice(0, 2) + '***' + user.slice(-1);
    return `${maskedUser}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '';
    return phone.slice(0, 4) + '****' + phone.slice(-3);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/images/whatsapp-logo.png" alt="WhatsApp" className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">
                  {currentNumber ? 'WhatsApp Connected' : 'WhatsApp Sync'}
                </h2>
                <p className="text-white/80 text-xs">
                  {currentNumber ? 'Manage your WhatsApp connection' : 'Connect your WhatsApp for seamless payments'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Step: Already Connected */}
          {step === 'connected' && currentNumber && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={40} className="text-[#25D366]" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-1">WhatsApp Active</h3>
                <p className="text-gray-500 text-sm">Your WhatsApp is connected and ready</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center">
                    <Smartphone size={20} className="text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Connected Number</p>
                    <p className="font-semibold text-gray-900">{maskPhone(currentNumber)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm text-gray-700 font-medium mb-2">WhatsApp Commands:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Type <span className="font-medium text-[#128C7E]">"send"</span> to transfer money</li>
                  <li>• Type <span className="font-medium text-[#128C7E]">"balance"</span> to check wallet</li>
                  <li>• Type <span className="font-medium text-[#128C7E]">"history"</span> for transactions</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleStartChange}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12 rounded-xl"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Change Number
                </Button>
              </div>
            </div>
          )}

          {/* Step: Change - Verify Identity */}
          {step === 'change-verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-amber-500" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-1">Security Verification</h3>
                <p className="text-gray-500 text-sm">Verify your identity to change WhatsApp number</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Why is this required?</p>
                    <p className="text-xs text-amber-600 mt-1">
                      To protect your account, changing your WhatsApp number requires verification of your email and PIN.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyIdentity} className="space-y-4">
                {/* Email OTP */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
                    <span>Email OTP sent to {maskEmail(userEmail)}</span>
                  </label>
                  <div className="flex justify-center gap-2">
                    {emailOtp.map((digit, index) => (
                      <input
                        key={index}
                        id={`email-otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value, 'email')}
                        className="w-12 h-12 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      />
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={() => toast.success('New OTP sent to your email!')}
                    className="text-xs text-amber-600 hover:text-amber-700 mt-2 w-full text-center"
                  >
                    Didn't receive? Resend OTP
                  </button>
                </div>

                {/* PIN */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
                    <Lock size={14} />
                    Enter your 4-digit PIN
                  </label>
                  <div className="flex justify-center gap-3">
                    {pin.map((digit, index) => (
                      <input
                        key={index}
                        id={`pin-${index}`}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || emailOtp.some(d => !d) || pin.some(d => !d)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Identity
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>

                <button 
                  type="button"
                  onClick={() => setStep('connected')}
                  className="w-full text-gray-500 text-sm hover:text-gray-700"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Step: Enter New Phone Number */}
          {step === 'change-phone' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img src="/images/whatsapp-logo.png" alt="WhatsApp" className="w-12 h-12" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-1">
                  {currentNumber ? 'Enter new WhatsApp number' : 'Enter your WhatsApp number'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {currentNumber 
                    ? 'We\'ll send a verification code to the new number' 
                    : "We'll send a verification code to your WhatsApp"}
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">WhatsApp Number</label>
                  <div className="flex">
                    <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 text-sm font-medium flex items-center">
                      +234
                    </span>
                    <Input
                      type="tel"
                      placeholder="800 000 0000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="rounded-l-none py-3 text-lg focus:border-[#25D366] focus:ring-[#25D366]/20"
                    />
                  </div>
                  {currentNumber && (
                    <p className="text-xs text-gray-400 mt-2">
                      Current: {maskPhone(currentNumber)}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-start gap-3">
                    <Bell size={18} className="text-[#25D366] mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium">What to expect</p>
                      <p className="text-xs text-gray-500 mt-1">
                        You'll receive a message from <span className="font-medium text-[#128C7E]">Velcro</span> on WhatsApp with your verification code
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || phoneNumber.length < 10}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>

                {currentNumber && (
                  <button 
                    type="button"
                    onClick={() => setStep('connected')}
                    className="w-full text-gray-500 text-sm hover:text-gray-700"
                  >
                    Cancel change
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Step: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img src="/images/whatsapp-logo.png" alt="WhatsApp" className="w-12 h-12" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-1">Enter verification code</h3>
                <p className="text-gray-500 text-sm">
                  Check your WhatsApp messages from <span className="font-medium text-[#128C7E]">Velcro</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sent to +234{phoneNumber}
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`wa-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value, 'wa')}
                      className="w-14 h-16 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm text-amber-800 text-center">
                    <span className="font-medium">Didn't receive it?</span> Type <span className="font-bold text-[#128C7E]">"hi"</span> to Velcro on WhatsApp to get your code
                  </p>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || otp.some(d => !d)}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Verify & Connect'
                  )}
                </Button>

                <button 
                  type="button"
                  onClick={() => setStep('change-phone')}
                  className="w-full text-gray-500 text-sm hover:text-gray-700"
                >
                  Change phone number
                </button>
              </form>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-[#25D366]" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
                {currentNumber ? 'WhatsApp Updated!' : 'WhatsApp Connected!'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {currentNumber 
                  ? `Your WhatsApp number has been updated to +234${phoneNumber}`
                  : 'You can now send and receive money directly through WhatsApp. All transactions will be synced with your dashboard.'}
              </p>
              
              <div className="p-4 bg-gray-50 rounded-xl mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">How to use:</p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-xs">1</span>
                    Open WhatsApp and find "Velcro" in your contacts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-xs">2</span>
                    Type <span className="font-medium text-gray-700">"send"</span> to transfer money
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-xs">3</span>
                    Type <span className="font-medium text-gray-700">"balance"</span> to check your wallet
                  </li>
                </ul>
              </div>

              <Button 
                onClick={onClose}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold h-12 rounded-xl"
              >
                Got it
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
