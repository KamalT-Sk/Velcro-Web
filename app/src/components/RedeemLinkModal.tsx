import { useState } from 'react';
import { X, Gift, Lock, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface RedeemLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkData?: {
    id: string;
    amount: number;
    currency: string;
    note: string;
    hasPin: boolean;
    senderName: string;
  } | null;
  onRedeem: (linkId: string, pin?: string) => void;
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

export function RedeemLinkModal({ isOpen, onClose, linkData, onRedeem }: RedeemLinkModalProps) {
  const [pin, setPin] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  if (!isOpen) return null;

  // If no link data, show input to enter link code
  if (!linkData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-velcro-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift size={32} className="text-velcro-navy" />
            </div>
            <h2 className="text-xl font-display font-bold text-gray-900">Redeem Payment Link</h2>
            <p className="text-gray-500 text-sm mt-1">Enter the link code to claim your money</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Link Code</Label>
              <Input
                placeholder="Enter code (e.g., ABC123XY)"
                className="py-4 text-center text-lg font-mono tracking-wider uppercase rounded-xl"
              />
            </div>
            <Button 
              className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              onClick={() => toast.info('Enter a valid link code to redeem')}
            >
              Check Link
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Don't have a code? Ask the sender to share their payment link with you.
          </p>
        </div>
      </div>
    );
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  const handleRedeem = async () => {
    if (linkData.hasPin && pin.length !== 4) {
      toast.error('Please enter the 4-digit PIN');
      return;
    }

    setIsRedeeming(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onRedeem(linkData.id, linkData.hasPin ? pin : undefined);
    setIsRedeeming(false);
    setRedeemed(true);
    toast.success(`Successfully claimed ${currencySymbols[linkData.currency]}${linkData.amount.toLocaleString()}!`);
  };

  const handleClose = () => {
    setPin('');
    setRedeemed(false);
    onClose();
  };

  // Success state
  if (redeemed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-scale-in">
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
          <p className="text-sm text-gray-500">
            Funds have been added to your Velcro wallet
          </p>
          <Button
            onClick={handleClose}
            className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-velcro-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-velcro-navy" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900">You've Received Money!</h2>
          <p className="text-gray-500 text-sm mt-1">From {linkData.senderName}</p>
        </div>

        {/* Amount Display */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-center">
          <p className="text-5xl font-display font-bold text-gray-900">
            {currencySymbols[linkData.currency]}{linkData.amount.toLocaleString()}
          </p>
          <p className="text-gray-500 mt-2">{linkData.currency}</p>
          {linkData.note && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">"{linkData.note}"</p>
            </div>
          )}
        </div>

        {/* PIN Input if required */}
        {linkData.hasPin && (
          <div className="mb-6">
            <Label className="text-sm text-gray-600 mb-3 flex items-center gap-2 justify-center">
              <Lock size={14} />
              Enter 4-digit PIN to claim
            </Label>
            <div className="flex gap-2 justify-center">
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

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl mb-6">
          <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            This money will be added directly to your Velcro wallet. If you don't have an account, you'll be prompted to create one.
          </p>
        </div>

        <Button
          onClick={handleRedeem}
          disabled={isRedeeming || (linkData.hasPin && pin.length !== 4)}
          className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl disabled:opacity-50"
        >
          {isRedeeming ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Claiming...
            </>
          ) : (
            `Claim ${currencySymbols[linkData.currency]}${linkData.amount.toLocaleString()}`
          )}
        </Button>
      </div>
    </div>
  );
}
