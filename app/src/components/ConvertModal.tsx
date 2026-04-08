import { useState, useMemo, useRef, useEffect } from 'react';
import { X, ArrowRightLeft, ChevronDown, Info, RefreshCw, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: Record<string, number>;
  onConvert: (fromCurrency: string, toCurrency: string, amount: number) => void;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  logo: string;
  balance: number;
  type: 'fiat' | 'crypto';
}

// Exchange rates (relative to USD)
const exchangeRates: Record<string, number> = {
  USD: 1,
  NGN: 0.00067,      // 1 NGN = $0.00067
  EUR: 1.08,
  GBP: 1.27,
  KES: 0.0077,       // Kenyan Shilling
  EGP: 0.020,        // Egyptian Pound
  ZAR: 0.054,        // South African Rand
  USDC: 1,           // Stablecoin pegged to USD
};

const currencySymbols: Record<string, string> = {
  USD: '$',
  NGN: '₦',
  EUR: '€',
  GBP: '£',
  KES: 'KSh',
  EGP: 'E£',
  ZAR: 'R',
  USDC: '$',
};

export function ConvertModal({ isOpen, onClose, balances, onConvert }: ConvertModalProps) {
  const [fromCurrency, setFromCurrency] = useState<string>('NGN');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [amount, setAmount] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    };

    if (showFromDropdown || showToDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFromDropdown, showToDropdown]);

  // Available currencies based on balances
  const availableCurrencies: Currency[] = useMemo(() => [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', logo: 'logos/ng.png', balance: balances.NGN || 0, type: 'fiat' },
    { code: 'USD', name: 'US Dollar', symbol: '$', logo: 'logos/us.png', balance: balances.USD || 0, type: 'fiat' },
    { code: 'EUR', name: 'Euro', symbol: '€', logo: 'logos/eu.png', balance: balances.EUR || 0, type: 'fiat' },
    { code: 'GBP', name: 'British Pound', symbol: '£', logo: 'logos/gb.png', balance: balances.GBP || 0, type: 'fiat' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', logo: 'logos/ke.png', balance: balances.KES || 0, type: 'fiat' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', logo: 'logos/eg.png', balance: balances.EGP || 0, type: 'fiat' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', logo: 'logos/za.png', balance: balances.ZAR || 0, type: 'fiat' },
    { code: 'USDC', name: 'USD Coin', symbol: '$', logo: '/images/usdc-logo.png', balance: balances.USDC || 1250, type: 'crypto' },
  ], [balances]);

  const fromCurrencyData = availableCurrencies.find(c => c.code === fromCurrency);
  const toCurrencyData = availableCurrencies.find(c => c.code === toCurrency);

  // Calculate conversion rate
  const conversionRate = useMemo(() => {
    if (!fromCurrency || !toCurrency) return 0;
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    return fromRate / toRate;
  }, [fromCurrency, toCurrency]);

  // Calculate converted amount
  const convertedAmount = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    return numAmount * conversionRate;
  }, [amount, conversionRate]);

  // Calculate fees (0.5% for fiat-to-fiat, 1% for crypto conversions)
  const fee = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    const feeRate = (fromCurrencyData?.type === 'crypto' || toCurrencyData?.type === 'crypto') ? 0.01 : 0.005;
    return numAmount * feeRate;
  }, [amount, fromCurrencyData, toCurrencyData]);

  const totalDeduction = parseFloat(amount || '0') + fee;
  const hasEnoughBalance = fromCurrencyData && totalDeduction <= fromCurrencyData.balance;

  if (!isOpen) return null;

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxAmount = () => {
    if (fromCurrencyData) {
      // Leave a small buffer for fees
      const maxAmount = fromCurrencyData.balance * 0.995;
      setAmount(maxAmount.toFixed(2));
    }
  };

  const handleInitiateConvert = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!hasEnoughBalance) {
      toast.error('Insufficient balance');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmConvert = () => {
    setShowConfirm(false);
    setShowPin(true);
    setPin(['', '', '', '']);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      const nextInput = document.getElementById(`convert-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`convert-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleConvert = async () => {
    if (pin.some(digit => !digit)) {
      toast.error('Please enter your 4-digit PIN');
      return;
    }

    const numAmount = parseFloat(amount);
    setIsConverting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onConvert(fromCurrency, toCurrency, numAmount);
    setIsConverting(false);
    setShowPin(false);
    setConversionSuccess(true);
    setPin(['', '', '', '']);
    
    toast.success(`Successfully converted ${currencySymbols[fromCurrency]}${numAmount.toLocaleString()} to ${toCurrency}`);
    
    setTimeout(() => {
      setConversionSuccess(false);
      setAmount('');
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setAmount('');
    setConversionSuccess(false);
    setShowConfirm(false);
    setShowPin(false);
    setPin(['', '', '', '']);
    onClose();
  };

  const selectFromCurrency = (code: string) => {
    setFromCurrency(code);
    setShowFromDropdown(false);
    if (code === toCurrency) {
      // Auto-swap if same currency selected
      setToCurrency(fromCurrency);
    }
    setAmount('');
  };

  const selectToCurrency = (code: string) => {
    setToCurrency(code);
    setShowToDropdown(false);
    if (code === fromCurrency) {
      // Auto-swap if same currency selected
      setFromCurrency(toCurrency);
    }
  };

  if (conversionSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Conversion Successful!</h2>
          <p className="text-gray-500">
            You converted {currencySymbols[fromCurrency]}{parseFloat(amount).toLocaleString()} {fromCurrency} to {currencySymbols[toCurrency]}{convertedAmount.toFixed(2)} {toCurrency}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-velcro-green/20 rounded-xl flex items-center justify-center">
                <ArrowRightLeft size={20} className="text-velcro-navy" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-gray-900">Convert</h2>
                <p className="text-sm text-gray-500">Exchange between currencies</p>
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
          {/* From Currency */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">From</span>
              <button 
                onClick={handleMaxAmount}
                className="text-xs text-velcro-navy font-medium hover:underline"
              >
                Max: {fromCurrencyData?.symbol}{fromCurrencyData?.balance.toLocaleString()}
              </button>
            </div>
            
            <div className="flex gap-3">
              {/* Currency Selector */}
              <div className="relative" ref={fromDropdownRef}>
                <button
                  onClick={() => {
                    setShowFromDropdown(!showFromDropdown);
                    setShowToDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <img 
                    src={fromCurrencyData?.logo} 
                    alt={fromCurrency} 
                    className="w-6 h-6 object-contain" 
                  />
                  <span className="font-semibold text-gray-900">{fromCurrency}</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                
                {/* Dropdown */}
                {showFromDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    {availableCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => selectFromCurrency(currency.code)}
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
            
            {!hasEnoughBalance && amount && (
              <p className="text-xs text-red-500 mt-2">Insufficient balance</p>
            )}
          </div>
          
          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapCurrencies}
              className="w-10 h-10 bg-velcro-green hover:bg-velcro-green-dark rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <ArrowRightLeft size={18} className="text-velcro-navy" />
            </button>
          </div>
          
          {/* To Currency */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">To</span>
              <span className="text-xs text-gray-400">Rate: 1 {fromCurrency} = {conversionRate.toFixed(6)} {toCurrency}</span>
            </div>
            
            <div className="flex gap-3">
              {/* Currency Selector */}
              <div className="relative" ref={toDropdownRef}>
                <button
                  onClick={() => {
                    setShowToDropdown(!showToDropdown);
                    setShowFromDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <img 
                    src={toCurrencyData?.logo} 
                    alt={toCurrency} 
                    className="w-6 h-6 object-contain" 
                  />
                  <span className="font-semibold text-gray-900">{toCurrency}</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                
                {/* Dropdown */}
                {showToDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    {availableCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => selectToCurrency(currency.code)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <img src={currency.logo} alt={currency.code} className="w-6 h-6 object-contain" />
                        <div>
                          <p className="font-medium text-gray-900">{currency.code}</p>
                          <p className="text-xs text-gray-500">{currency.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Converted Amount Display */}
              <div className="flex-1 text-right">
                <p className="text-2xl font-display font-bold text-gray-900">
                  {convertedAmount > 0 ? convertedAmount.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Conversion Details */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Exchange Rate</span>
                <span className="font-medium text-gray-900">1 {fromCurrency} = {conversionRate.toFixed(6)} {toCurrency}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fee ({(fromCurrencyData?.type === 'crypto' || toCurrencyData?.type === 'crypto') ? '1%' : '0.5%'})</span>
                <span className="font-medium text-gray-900">{currencySymbols[fromCurrency]}{fee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Deduction</span>
                <span className="font-medium text-gray-900">{currencySymbols[fromCurrency]}{totalDeduction.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">You Receive</span>
                  <span className="font-bold text-gray-900">{currencySymbols[toCurrency]}{convertedAmount.toFixed(2)} {toCurrency}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <p>Exchange rates are updated in real-time. Crypto conversions include a 1% fee, fiat conversions 0.5%.</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-gray-100">
          <Button
            onClick={handleInitiateConvert}
            disabled={!amount || parseFloat(amount) <= 0 || !hasEnoughBalance || isConverting}
            className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl disabled:opacity-50"
          >
            Convert Now
          </Button>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="absolute inset-0 bg-white rounded-2xl z-10 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Confirm Conversion</h3>
              <button onClick={() => setShowConfirm(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">From</span>
                  <span className="font-medium">{currencySymbols[fromCurrency]}{parseFloat(amount).toLocaleString()} {fromCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">To</span>
                  <span className="font-medium">{currencySymbols[toCurrency]}{convertedAmount.toFixed(2)} {toCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium">{currencySymbols[fromCurrency]}{fee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Total Deduction</span>
                  <span className="font-bold text-lg">{currencySymbols[fromCurrency]}{totalDeduction.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmConvert} className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold rounded-xl">Confirm</Button>
            </div>
          </div>
        )}

        {/* PIN Modal */}
        {showPin && (
          <div className="absolute inset-0 bg-white rounded-2xl z-20 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Enter PIN</h3>
              <button onClick={() => setShowPin(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Lock size={28} className="text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm mb-6">Enter your 4-digit PIN to confirm</p>
              <div className="flex gap-3 mb-6">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`convert-pin-${index}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    disabled={isConverting}
                  />
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <Button onClick={handleConvert} disabled={isConverting} className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl">
                {isConverting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  'Confirm Conversion'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
