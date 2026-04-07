import { useState, useEffect } from 'react';
import { Gift, Lock, Check, Loader2, AlertCircle, Clock, Copy, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ClaimPageProps {
  linkId?: string;
}

interface LinkData {
  id: string;
  amount: number;
  currency: string;
  note: string;
  hasPin: boolean;
  senderName: string;
  senderAvatar?: string;
  expiresAt: Date;
  status: 'active' | 'claimed' | 'expired';
}

const currencySymbols: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  KES: 'KSh',
  EGP: 'E£',
  ZAR: 'R',
  USDC: '$',
};

// Mock function to fetch link data - in real app, this would be an API call
const fetchLinkData = async (id: string): Promise<LinkData | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data for demo
  if (id.length === 8) {
    return {
      id,
      amount: 5000,
      currency: 'NGN',
      note: 'Thanks for the help with the project! 🎉',
      hasPin: true,
      senderName: 'Shehu Kamal',
      senderAvatar: '/avatars/default.png',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'active',
    };
  }
  return null;
};

export function ClaimPage({ linkId: propLinkId }: ClaimPageProps) {
  const [linkId, setLinkId] = useState(propLinkId || '');
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);

  // Get link ID from URL if not provided as prop
  useEffect(() => {
    if (!propLinkId) {
      const path = window.location.pathname;
      const match = path.match(/\/claim\/([A-Z0-9]+)/i);
      if (match) {
        setLinkId(match[1].toUpperCase());
        loadLinkData(match[1].toUpperCase());
      }
    } else {
      loadLinkData(propLinkId);
    }
  }, [propLinkId]);

  const loadLinkData = async (id: string) => {
    setIsLoading(true);
    setError(null);
    const data = await fetchLinkData(id);
    if (data) {
      setLinkData(data);
    } else {
      setError('Invalid or expired link');
    }
    setIsLoading(false);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  const handleClaim = async () => {
    if (linkData?.hasPin && pin.length !== 4) {
      toast.error('Please enter the 4-digit PIN');
      return;
    }

    setIsClaiming(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real app, verify PIN and claim on backend
    setIsClaiming(false);
    setClaimed(true);
    toast.success(`Successfully claimed ${currencySymbols[linkData?.currency || 'NGN']}${linkData?.amount.toLocaleString()}!`);
  };

  const getTimeRemaining = () => {
    if (!linkData) return '';
    const now = new Date();
    const expiry = new Date(linkData.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    return `${hours}h remaining`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-velcro-navy to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-velcro-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-velcro-navy to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Link Not Found</h2>
          <p className="text-gray-500 mb-6">This link is invalid, expired, or has already been claimed.</p>
          <a 
            href="https://usevelcro.com"
            className="inline-flex items-center gap-2 text-velcro-navy font-medium hover:underline"
          >
            <ChevronLeft size={18} />
            Go to Velcro
          </a>
        </div>
      </div>
    );
  }

  // Already claimed
  if (linkData.status === 'claimed' || claimed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-velcro-navy to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Money Received!</h2>
          <p className="text-gray-500 mb-6">
            You've successfully claimed
          </p>
          <div className="bg-velcro-green/10 rounded-2xl p-6 mb-6">
            <p className="text-4xl font-display font-bold text-velcro-navy">
              {currencySymbols[linkData.currency]}{linkData.amount.toLocaleString()}
            </p>
            <p className="text-gray-600 mt-2">{linkData.currency}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            The money has been added to your Velcro wallet
          </p>
          <div className="flex gap-3">
            <a 
              href="https://usevelcro.com/download"
              className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold py-3 rounded-xl transition-colors"
            >
              Open Velcro App
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Don't have the app?{' '}
            <a href="https://usevelcro.com/signup" className="text-velcro-navy hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Expired
  if (linkData.status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-velcro-navy to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Link Expired</h2>
          <p className="text-gray-500 mb-6">This payment link has expired and can no longer be claimed.</p>
          <a 
            href="https://usevelcro.com"
            className="inline-flex items-center gap-2 text-velcro-navy font-medium hover:underline"
          >
            <ChevronLeft size={18} />
            Go to Velcro
          </a>
        </div>
      </div>
    );
  }

  // Main claim view
  return (
    <div className="min-h-screen bg-gradient-to-br from-velcro-navy to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-velcro-green/10 p-6 text-center">
          <div className="w-20 h-20 bg-velcro-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Gift size={40} className="text-velcro-navy" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">You've Received Money!</h1>
          <p className="text-gray-500 mt-1">From {linkData.senderName}</p>
        </div>

        <div className="p-6">
          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-5xl font-display font-bold text-gray-900">
              {currencySymbols[linkData.currency]}{linkData.amount.toLocaleString()}
            </p>
            <p className="text-gray-500 mt-2">{linkData.currency}</p>
          </div>

          {/* Note */}
          {linkData.note && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-600 text-center italic">"{linkData.note}"</p>
            </div>
          )}

          {/* Expiry */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Clock size={16} />
            <span>Expires in {getTimeRemaining()}</span>
          </div>

          {/* PIN Input if required */}
          {linkData.hasPin && !showPinInput && (
            <div className="mb-6">
              <Button
                onClick={() => setShowPinInput(true)}
                className="w-full bg-velcro-navy hover:bg-velcro-navy/90 text-white h-12 rounded-xl"
              >
                <Lock size={18} className="mr-2" />
                Enter PIN to Claim
              </Button>
            </div>
          )}

          {showPinInput && linkData.hasPin && (
            <div className="mb-6">
              <label className="text-sm text-gray-600 mb-3 block text-center">
                Enter 4-digit PIN
              </label>
              <div className="flex gap-2 justify-center mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold
                      ${pin.length > i 
                        ? 'border-velcro-green bg-velcro-green/5 text-gray-900' 
                        : 'border-gray-200 text-gray-300'
                      }`}
                  >
                    {pin.length > i ? '•' : ''}
                  </div>
                ))}
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={handlePinChange}
                className="absolute opacity-0 w-0 h-0"
                autoFocus
                placeholder="0000"
              />
            </div>
          )}

          {/* Claim Button */}
          {(!linkData.hasPin || showPinInput) && (
            <Button
              onClick={handleClaim}
              disabled={isClaiming || (linkData.hasPin && pin.length !== 4)}
              className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl disabled:opacity-50"
            >
              {isClaiming ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Claiming...
                </>
              ) : (
                `Claim ${currencySymbols[linkData.currency]}${linkData.amount.toLocaleString()}`
              )}
            </Button>
          )}

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              By claiming, you agree to Velcro's{' '}
              <a href="https://usevelcro.com/terms" className="text-velcro-navy hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <a href="https://usevelcro.com" className="font-semibold text-velcro-navy hover:underline">
              Velcro
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
