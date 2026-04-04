import { useState } from 'react';
import { X, Check, ArrowRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type WhatsAppStep = 'phone' | 'otp' | 'success';

interface WhatsAppSyncModalProps {
  onClose: () => void;
  onSync: (phoneNumber: string) => void;
}

export function WhatsAppSyncModal({ onClose, onSync }: WhatsAppSyncModalProps) {
  const [step, setStep] = useState<WhatsAppStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      document.getElementById(`wa-otp-${index + 1}`)?.focus();
    }
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
                <h2 className="font-display font-bold text-lg">WhatsApp Sync</h2>
                <p className="text-white/80 text-xs">Connect your WhatsApp for seamless payments</p>
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
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img src="/images/whatsapp-logo.png" alt="WhatsApp" className="w-12 h-12" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-1">Enter your WhatsApp number</h3>
                <p className="text-gray-500 text-sm">We'll send a verification code to your WhatsApp</p>
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
              </form>
            </div>
          )}

          {/* Step 2: OTP Verification */}
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
                      onChange={(e) => handleOtpChange(index, e.target.value)}
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
                  onClick={() => setStep('phone')}
                  className="w-full text-gray-500 text-sm hover:text-gray-700"
                >
                  Change phone number
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-[#25D366]" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-2">WhatsApp Connected!</h3>
              <p className="text-gray-500 text-sm mb-6">
                You can now send and receive money directly through WhatsApp. All transactions will be synced with your dashboard.
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
