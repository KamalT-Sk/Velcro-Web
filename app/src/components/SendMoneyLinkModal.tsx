import { useState, useRef, useEffect } from 'react';
import { X, Link2, Copy, Check, Clock, Lock, MessageSquare, ChevronDown, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SendMoneyLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: Record<string, number>;
  onCreateLink: (link: PaymentSendLink) => void;
}

export interface PaymentSendLink {
  id: string;
  amount: number;
  currency: string;
  note: string;
  pincode: string | null;
  expiresAt: Date;
  expiresInHours: number;
  status: 'active' | 'claimed' | 'expired';
  claimUrl: string;
  createdAt: Date;
  claimedBy?: string;
  claimedAt?: Date;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  logo: string;
  balance: number;
}

const expirationOptions = [
  { label: '1 hour', hours: 1 },
  { label: '6 hours', hours: 6 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
];

export function SendMoneyLinkModal({ isOpen, onClose, balances, onCreateLink }: SendMoneyLinkModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [note, setNote] = useState('');
  const [usePincode, setUsePincode] = useState(false);
  const [pincode, setPincode] = useState('');
  const [expirationHours, setExpirationHours] = useState(24);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<PaymentSendLink | null>(null);
  const [copied, setCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const currencies: Currency[] = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', logo: '/logos/ng.png', balance: balances.NGN || 0 },
    { code: 'USD', name: 'US Dollar', symbol: '$', logo: '/logos/us.png', balance: balances.USD || 0 },
    { code: 'EUR', name: 'Euro', symbol: '€', logo: '/logos/eu.png', balance: balances.EUR || 0 },
    { code: 'GBP', name: 'British Pound', symbol: '£', logo: '/logos/gb.png', balance: balances.GBP || 0 },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', logo: '/logos/ke.png', balance: balances.KES || 0 },
    { code: 'USDC', name: 'USD Coin', symbol: '$', logo: '/images/usdc-logo.png', balance: balances.USDC || 0 },
  ];

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
    };

    if (showCurrencyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCurrencyDropdown]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxAmount = () => {
    if (selectedCurrencyData) {
      const maxAmount = selectedCurrencyData.balance * 0.995; // Leave buffer for fees
      setAmount(maxAmount.toFixed(2));
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPincode(value);
  };

  const generateLinkId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreateLink = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (numAmount > (selectedCurrencyData?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }
    if (usePincode && pincode.length !== 4) {
      toast.error('Please enter a 4-digit PIN');
      return;
    }

    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const linkId = generateLinkId();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const newLink: PaymentSendLink = {
      id: linkId,
      amount: numAmount,
      currency: selectedCurrency,
      note: note.trim() || 'Money sent via Velcro',
      pincode: usePincode ? pincode : null,
      expiresAt,
      expiresInHours: expirationHours,
      status: 'active',
      claimUrl: `https://claim.usevelcro.com/${linkId}`,
      createdAt: new Date(),
    };

    onCreateLink(newLink);
    setCreatedLink(newLink);
    setIsCreating(false);
    toast.success('Payment link created successfully!');
  };

  const copyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink.claimUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (createdLink && navigator.share) {
      try {
        await navigator.share({
          title: 'Velcro Payment Link',
          text: `You\'ve received ${selectedCurrencyData?.symbol}${createdLink.amount.toLocaleString()}! ${createdLink.note}`,
          url: createdLink.claimUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyLink();
    }
  };

  const handleClose = () => {
    setAmount('');
    setNote('');
    setUsePincode(false);
    setPincode('');
    setExpirationHours(24);
    setCreatedLink(null);
    setCopied(false);
    onClose();
  };

  const handleCreateAnother = () => {
    setAmount('');
    setNote('');
    setUsePincode(false);
    setPincode('');
    setExpirationHours(24);
    setCreatedLink(null);
    setCopied(false);
  };

  // Success state after link creation
  if (createdLink) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            
            <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Link Created!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Share this link with anyone to claim {selectedCurrencyData?.symbol}{createdLink.amount.toLocaleString()}
            </p>

            {/* Link Display */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
                <Link2 size={18} className="text-gray-400 flex-shrink-0" />
                <span className="flex-1 font-mono text-sm text-gray-700 truncate">
                  {createdLink.claimUrl}
                </span>
                <button
                  onClick={copyLink}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Link Details */}
            <div className="space-y-3 mb-6 text-left bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-gray-900">
                  {selectedCurrencyData?.symbol}{createdLink.amount.toLocaleString()} {createdLink.currency}
                </span>
              </div>
              {createdLink.pincode && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Lock size={14} /> PIN
                  </span>
                  <span className="font-mono font-semibold text-gray-900">{createdLink.pincode}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock size={14} /> Expires
                </span>
                <span className="text-gray-900">
                  {expirationOptions.find(o => o.hours === createdLink.expiresInHours)?.label}
                </span>
              </div>
              {createdLink.note && (
                <div className="pt-2 border-t border-blue-200">
                  <span className="text-gray-600 text-sm block mb-1">Note:</span>
                  <span className="text-gray-900 text-sm italic">"{createdLink.note}"</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={shareLink}
                className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              >
                Share Link
              </Button>
              <Button
                onClick={handleCreateAnother}
                variant="outline"
                className="w-full rounded-xl"
              >
                Create Another Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-velcro-green/20 rounded-xl flex items-center justify-center">
                <Link2 size={20} className="text-velcro-navy" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-gray-900">Send via Link</h2>
                <p className="text-sm text-gray-500">Create a claimable payment link</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-5 space-y-5">
          {/* Amount Section */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Amount to Send</span>
              <button 
                onClick={handleMaxAmount}
                className="text-xs text-velcro-navy font-medium hover:underline"
              >
                Max: {selectedCurrencyData?.symbol}{selectedCurrencyData?.balance.toLocaleString()}
              </button>
            </div>
            
            <div className="flex gap-3">
              {/* Currency Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <img 
                    src={selectedCurrencyData?.logo} 
                    alt={selectedCurrency} 
                    className="w-6 h-6 object-contain" 
                  />
                  <span className="font-semibold text-gray-900">{selectedCurrency}</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                
                {showCurrencyDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    {currencies.filter(c => c.balance > 0).map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => {
                          setSelectedCurrency(currency.code);
                          setShowCurrencyDropdown(false);
                          setAmount('');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <img src={currency.logo} alt={currency.code} className="w-6 h-6 object-contain" />
                        <div>
                          <p className="font-medium text-gray-900">{currency.code}</p>
                          <p className="text-xs text-gray-500">{currency.symbol}{currency.balance.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Amount Input */}
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="flex-1 bg-transparent text-right text-2xl font-display font-bold text-gray-900 placeholder-gray-300 outline-none"
              />
            </div>
            
            {parseFloat(amount) > (selectedCurrencyData?.balance || 0) && (
              <p className="text-xs text-red-500 mt-2">Insufficient balance</p>
            )}
          </div>

          {/* Note */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <MessageSquare size={14} />
              Note (Optional)
            </Label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a message for the recipient..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none resize-none h-20 text-sm"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{note.length}/100</p>
          </div>

          {/* Expiration */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Clock size={14} />
              Link Expires In
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {expirationOptions.map((option) => (
                <button
                  key={option.hours}
                  onClick={() => setExpirationHours(option.hours)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all
                    ${expirationHours === option.hours
                      ? 'bg-velcro-green text-velcro-navy'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* PIN Protection */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-gray-500" />
                <div>
                  <p className="font-medium text-sm text-gray-900">Protect with PIN</p>
                  <p className="text-xs text-gray-500">Require 4-digit PIN to claim</p>
                </div>
              </div>
              <Switch
                checked={usePincode}
                onCheckedChange={setUsePincode}
              />
            </div>
            
            {usePincode && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Label className="text-xs text-gray-500 mb-2 block">Set 4-digit PIN</Label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold
                        ${pincode.length > i 
                          ? 'border-velcro-green bg-velcro-green/5 text-gray-900' 
                          : 'border-gray-200 text-gray-300'
                        }`}
                    >
                      {pincode.length > i ? '•' : ''}
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pincode}
                  onChange={handlePincodeChange}
                  className="absolute opacity-0 w-0 h-0"
                  autoFocus={usePincode}
                  placeholder="0000"
                />
                <p className="text-xs text-gray-400 text-center mt-2">
                  Click to enter PIN
                </p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
            <Shield size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Anyone with this link can claim the money. Keep it secure and share only with intended recipients.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-gray-100">
          <Button
            onClick={handleCreateLink}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (selectedCurrencyData?.balance || 0) || (usePincode && pincode.length !== 4) || isCreating}
            className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <RefreshCw size={18} className="animate-spin mr-2" />
                Creating Link...
              </>
            ) : (
              'Create Payment Link'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
