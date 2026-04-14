import { useState, useEffect } from 'react';
import { X, Info, ChevronDown, Send, AtSign, MessageCircle, Landmark, ArrowRight, Phone, Check, User, RefreshCw, Link2, Search, Lock, Download, Copy, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { UserKYC } from '@/App';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  userKYC?: UserKYC;
  velcroTag?: string;
}

interface Currency {
  code: string;
  name: string;
  logo: string;
  balance: number;
  symbol: string;
}

const currencies: Currency[] = [
  { code: 'NGN', name: 'Nigerian Naira', logo: 'logos/ng.png', balance: 2450000.50, symbol: '₦' },
  { code: 'USD', name: 'US Dollar', logo: 'logos/us.png', balance: 0, symbol: '$' },
  { code: 'EUR', name: 'Euro', logo: 'logos/eu.png', balance: 0, symbol: '€' },
  { code: 'GBP', name: 'British Pound', logo: 'logos/gb.png', balance: 0, symbol: '£' },
  { code: 'KES', name: 'Kenyan Shilling', logo: 'logos/ke.png', balance: 0, symbol: 'KSh' },
  { code: 'EGP', name: 'Egyptian Pound', logo: 'logos/eg.png', balance: 0, symbol: 'E£' },
  { code: 'ZAR', name: 'South African Rand', logo: 'logos/za.png', balance: 0, symbol: 'R' },
];

const banks = [
  { code: '044', name: 'Access Bank' },
  { code: '023', name: 'Citibank' },
  { code: '050', name: 'Ecobank' },
  { code: '011', name: 'First Bank' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '221', name: 'Stanbic IBTC' },
  { code: '068', name: 'Standard Chartered' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

type WithdrawMethod = 'bank' | 'velcrotag' | 'whatsapp' | 'link';

export function WithdrawModal({ isOpen, onClose, userKYC, velcroTag }: WithdrawModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [showCurrencySelect, setShowCurrencySelect] = useState(false);
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>('bank');
  const [recipientTag, setRecipientTag] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isVerifyingTag, setIsVerifyingTag] = useState(false);
  const [tagVerified, setTagVerified] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [note, setNote] = useState('');
  const [view, setView] = useState<'form' | 'confirm' | 'pin' | 'success'>('form');
  const [pin, setPin] = useState(['', '', '', '']);
  const [generatedLink, setGeneratedLink] = useState('');

  // Auto-verify bank account when account number reaches 10 digits
  useEffect(() => {
    if (withdrawMethod === 'bank' && bankCode && accountNumber.length === 10) {
      verifyBankAccount();
    }
  }, [accountNumber, bankCode]);

  // Verify VelcroTag when user stops typing
  useEffect(() => {
    if (withdrawMethod === 'velcrotag' && recipientTag.length >= 3) {
      const timeout = setTimeout(() => {
        verifyVelcroTag();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [recipientTag]);

  const verifyBankAccount = async () => {
    if (!bankCode || accountNumber.length !== 10) return;
    
    setIsVerifyingAccount(true);
    setAccountVerified(false);
    
    // Simulate API call to verify account
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock account name generation
    const bank = banks.find(b => b.code === bankCode);
    if (bank) {
      setAccountName(`SHEHU KAMAL`);
      setAccountVerified(true);
      toast.success('Account verified!');
    }
    
    setIsVerifyingAccount(false);
  };

  const verifyVelcroTag = async () => {
    setIsVerifyingTag(true);
    setTagVerified(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock verification
    if (recipientTag.toLowerCase() === 'kamal123') {
      setRecipientName('Shehu Kamal');
      setTagVerified(true);
    } else if (recipientTag.length >= 3) {
      setRecipientName('John Doe');
      setTagVerified(true);
    }
    
    setIsVerifyingTag(false);
  };

  if (!isOpen) return null;

  const handleInitiateWithdraw = () => {
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > selectedCurrency.balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (withdrawMethod === 'bank') {
      if (!bankCode || !accountNumber || !accountVerified) {
        toast.error('Please verify bank account details');
        return;
      }
    } else if (withdrawMethod === 'velcrotag') {
      if (!recipientTag || !tagVerified) {
        toast.error('Please enter a valid VelcroTag');
        return;
      }
    } else if (withdrawMethod === 'whatsapp') {
      if (!recipientPhone || recipientPhone.length < 10) {
        toast.error('Please enter a valid WhatsApp number');
        return;
      }
    }
    
    setView('confirm');
  };

  const handleConfirmWithdraw = () => {
    setView('pin');
    setPin(['', '', '', '']);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      const nextInput = document.getElementById(`withdraw-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`withdraw-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleWithdraw = async () => {
    if (pin.some(digit => !digit)) {
      toast.error('Please enter your 4-digit PIN');
      return;
    }
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > selectedCurrency.balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (withdrawMethod === 'bank') {
      if (!bankCode || !accountNumber || !accountVerified) {
        toast.error('Please verify bank account details');
        return;
      }
    } else if (withdrawMethod === 'velcrotag') {
      if (!recipientTag || !tagVerified) {
        toast.error('Please enter a valid VelcroTag');
        return;
      }
    } else if (withdrawMethod === 'whatsapp') {
      if (!recipientPhone || recipientPhone.length < 10) {
        toast.error('Please enter a valid WhatsApp number');
        return;
      }
    } else if (withdrawMethod === 'link') {
      // Link validation - just need amount
      if (!amount || amountNum <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    let successMessage = '';
    if (withdrawMethod === 'bank') {
      successMessage = `Transfer of ${selectedCurrency.symbol}${withdrawAmount.toLocaleString()} to ${accountName} initiated!`;
    } else if (withdrawMethod === 'velcrotag') {
      successMessage = `Transfer of ${selectedCurrency.symbol}${withdrawAmount.toLocaleString()} to @${recipientTag} (${recipientName}) successful!`;
    } else if (withdrawMethod === 'whatsapp') {
      successMessage = `Transfer of ${selectedCurrency.symbol}${withdrawAmount.toLocaleString()} to WhatsApp ${recipientPhone} successful!`;
    } else if (withdrawMethod === 'link') {
      successMessage = `Payment link created for ${selectedCurrency.symbol}${withdrawAmount.toLocaleString()}! Share it with your recipient.`;
      // Generate a unique link
      const linkId = Math.random().toString(36).substring(2, 10).toUpperCase();
      setGeneratedLink(`https://usevelcro.com/pay/${linkId}`);
    }
    
    toast.success(successMessage);
    setView('success');
    setPin(['', '', '', '']);
    setAmount('');
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
    setAccountVerified(false);
    setRecipientTag('');
    setRecipientName('');
    setTagVerified(false);
    setRecipientPhone('');
    setNote('');
    setBankSearch('');
  };

  const calculateFee = (amt: number) => {
    if (selectedCurrency.code === 'NGN') {
      if (amt < 10000) return 25;
      if (amt < 100000) return 30;
      return 100;
    }
    return Math.min(amt * 0.005, 5);
  };

  const amountNum = Number(amount) || 0;
  const fee = calculateFee(amountNum);
  const total = amountNum + fee;

  const selectedBank = banks.find(b => b.code === bankCode);

  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        {view === 'form' && (
          <>
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Send size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">Transfer</h2>
                    <p className="text-sm text-gray-500">Send money to anyone</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Currency Selection */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">Select Currency</Label>
            <div className="relative">
              <button
                onClick={() => setShowCurrencySelect(!showCurrencySelect)}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white"
              >
                <div className="flex items-center gap-3">
                  <img src={selectedCurrency.logo} alt={selectedCurrency.code} className="w-8 h-8 object-contain" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedCurrency.code}</p>
                    <p className="text-xs text-gray-500">{selectedCurrency.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedCurrency.symbol}{selectedCurrency.balance.toLocaleString()}
                  </span>
                  <ChevronDown size={18} className="text-gray-400" />
                </div>
              </button>
              
              {showCurrencySelect && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => {
                        setSelectedCurrency(currency);
                        setShowCurrencySelect(false);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-center gap-3">
                        <img src={currency.logo} alt={currency.code} className="w-6 h-6 object-contain" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{currency.code}</p>
                          <p className="text-xs text-gray-500">{currency.name}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {currency.symbol}{currency.balance.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Amount */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">{selectedCurrency.symbol}</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 py-5 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
              />
            </div>
          </div>

          {/* Withdraw Method Selection */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">Transfer Method</Label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setWithdrawMethod('bank')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                  ${withdrawMethod === 'bank' 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                <Landmark size={20} className={withdrawMethod === 'bank' ? 'text-velcro-green' : 'text-gray-400'} />
                <span className={`text-xs font-medium ${withdrawMethod === 'bank' ? 'text-gray-900' : 'text-gray-600'}`}>
                  Bank
                </span>
              </button>
              <button
                onClick={() => setWithdrawMethod('velcrotag')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                  ${withdrawMethod === 'velcrotag' 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                <AtSign size={20} className={withdrawMethod === 'velcrotag' ? 'text-velcro-green' : 'text-gray-400'} />
                <span className={`text-xs font-medium ${withdrawMethod === 'velcrotag' ? 'text-gray-900' : 'text-gray-600'}`}>
                  VelcroTag
                </span>
              </button>
              <button
                onClick={() => setWithdrawMethod('whatsapp')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                  ${withdrawMethod === 'whatsapp' 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                <MessageCircle size={20} className={withdrawMethod === 'whatsapp' ? 'text-velcro-green' : 'text-gray-400'} />
                <span className={`text-xs font-medium ${withdrawMethod === 'whatsapp' ? 'text-gray-900' : 'text-gray-600'}`}>
                  WhatsApp
                </span>
              </button>
              <button
                onClick={() => setWithdrawMethod('link')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                  ${withdrawMethod === 'link' 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                <Link2 size={20} className={withdrawMethod === 'link' ? 'text-velcro-green' : 'text-gray-400'} />
                <span className={`text-xs font-medium ${withdrawMethod === 'link' ? 'text-gray-900' : 'text-gray-600'}`}>
                  Send Link
                </span>
              </button>
            </div>
          </div>
          
          {/* Bank Details */}
          {withdrawMethod === 'bank' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Landmark size={18} className="text-gray-400" />
                <span className="text-sm font-medium">Bank Account Details</span>
              </div>
              
              {/* Bank Selection */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Select Bank</Label>
                <div className="relative">
                  <button
                    onClick={() => setShowBankSelect(!showBankSelect)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white text-left"
                  >
                    <span className={selectedBank ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedBank ? selectedBank.name : 'Select your bank'}
                    </span>
                    <ChevronDown size={18} className="text-gray-400" />
                  </button>
                  
                  {showBankSelect && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-72 overflow-hidden">
                      {/* Bank Search */}
                      <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search banks..."
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      {/* Bank List */}
                      <div className="max-h-56 overflow-y-auto">
                        {filteredBanks.length > 0 ? (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank.code}
                              onClick={() => {
                                setBankCode(bank.code);
                                setShowBankSelect(false);
                                setBankSearch('');
                                setAccountName('');
                                setAccountVerified(false);
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                            >
                              <p className="font-medium text-sm">{bank.name}</p>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No banks found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Account Number */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Account Number</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter 10-digit account number"
                    value={accountNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAccountNumber(val);
                      if (val.length !== 10) {
                        setAccountName('');
                        setAccountVerified(false);
                      }
                    }}
                    maxLength={10}
                    className="py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl pr-10"
                  />
                  {accountNumber.length === 10 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isVerifyingAccount ? (
                        <RefreshCw size={18} className="text-gray-400 animate-spin" />
                      ) : accountVerified ? (
                        <Check size={18} className="text-green-500" />
                      ) : null}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {accountNumber.length}/10 digits
                </p>
              </div>
              
              {/* Account Name - Auto-generated */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Account Name</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={isVerifyingAccount ? 'Verifying...' : accountNumber.length === 10 ? 'Click verify to fetch name' : 'Enter account number first'}
                    value={accountName}
                    disabled
                    className={`py-4 rounded-xl ${
                      accountVerified 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  />
                  {accountVerified && (
                    <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                </div>
                {accountVerified && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check size={12} />
                    Account verified successfully
                  </p>
                )}
              </div>
            </div>
          )}

          {/* VelcroTag Transfer */}
          {withdrawMethod === 'velcrotag' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <AtSign size={18} className="text-gray-400" />
                <span className="text-sm font-medium">VelcroTag Transfer</span>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Recipient VelcroTag</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">@</span>
                  <Input
                    type="text"
                    placeholder="username"
                    value={recipientTag}
                    onChange={(e) => {
                      setRecipientTag(e.target.value.replace('@', ''));
                      setTagVerified(false);
                      setRecipientName('');
                    }}
                    className="pl-10 py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl pr-10"
                  />
                  {recipientTag.length >= 3 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isVerifyingTag ? (
                        <RefreshCw size={18} className="text-gray-400 animate-spin" />
                      ) : tagVerified ? (
                        <Check size={18} className="text-green-500" />
                      ) : null}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the recipient's VelcroTag (e.g., kamal123)
                </p>
              </div>

              {/* Recipient Name - Auto-displayed */}
              {tagVerified && recipientName && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Recipient Name</p>
                      <p className="font-semibold text-gray-900">{recipientName}</p>
                    </div>
                    <Check size={18} className="text-green-500 ml-auto" />
                  </div>
                </div>
              )}

              {userKYC?.tier !== 'none' && velcroTag && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Your VelcroTag for receiving:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium text-gray-900">@{velcroTag}</span>
                    <span className="text-xs text-velcro-green">Share this to receive payments</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Transfer */}
          {withdrawMethod === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle size={18} className="text-gray-400" />
                <span className="text-sm font-medium">WhatsApp Transfer</span>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Recipient WhatsApp Number</Label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="tel"
                    placeholder="080 0000 0000"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    maxLength={11}
                    className="pl-11 py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter full number starting with 0. The recipient will receive a WhatsApp message to claim the funds.
                </p>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Note (Optional)</Label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a message..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none resize-none h-20 text-sm"
                  maxLength={100}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{note.length}/100</p>
              </div>
            </div>
          )}

          {/* Send Link */}
          {withdrawMethod === 'link' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Link2 size={18} className="text-gray-400" />
                <span className="text-sm font-medium">Send Payment Link</span>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium mb-2">How it works</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Generate a unique payment link</li>
                  <li>• Share via WhatsApp, SMS, or any app</li>
                  <li>• Recipient clicks link to claim funds</li>
                  <li>• PIN protection available</li>
                </ul>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Link Expiration</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['24 hours', '7 days', '30 days'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      className="p-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-velcro-green hover:bg-velcro-green/5 transition-all"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">PIN Protection (Optional)</Label>
                <Input
                  type="password"
                  placeholder="4-digit PIN"
                  maxLength={4}
                  className="py-4 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recipient must enter this PIN to claim funds
                </p>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Note (Optional)</Label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a message for recipient..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none resize-none h-20 text-sm"
                  maxLength={100}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{note.length}/100</p>
              </div>
            </div>
          )}
          
          {/* Fee Breakdown */}
          {amountNum > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">{selectedCurrency.symbol}{amountNum.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {selectedCurrency.code === 'NGN' ? 'Fee' : 'Fee (0.5%)'}
                </span>
                <span className="font-medium">{selectedCurrency.symbol}{fee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Total</span>
                <span className="font-bold text-gray-900">{selectedCurrency.symbol}{total.toLocaleString()}</span>
              </div>
            </div>
          )}
          
        </div>
        
            {/* Footer */}
            <div className="p-5 border-t border-gray-100">
              <Button
                onClick={handleInitiateWithdraw}
                disabled={isLoading || (withdrawMethod === 'bank' && !accountVerified) || (withdrawMethod === 'velcrotag' && !tagVerified) || !amountNum}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl disabled:opacity-50"
              >
                {withdrawMethod === 'bank' ? 'Transfer to Bank' : withdrawMethod === 'link' ? 'Generate Link' : 'Send Money'}
              </Button>
            </div>
          </>
        )}

        {/* Confirmation View */}
        {view === 'confirm' && (
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Confirm Transfer</h3>
              <button onClick={() => setView('form')} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">{selectedCurrency.symbol}{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium">{selectedCurrency.symbol}{calculateFee(Number(amount))}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Total</span>
                  <span className="font-bold text-lg">{selectedCurrency.symbol}{(Number(amount) + calculateFee(Number(amount))).toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  {withdrawMethod === 'bank' && accountName && (
                    <>Transfer to: <strong>{accountName}</strong><br />Account: {accountNumber}<br />Bank: {banks.find(b => b.code === bankCode)?.name}</>
                  )}
                  {withdrawMethod === 'velcrotag' && tagVerified && (
                    <>Send to: <strong>@{recipientTag}</strong> ({recipientName})</>
                  )}
                  {withdrawMethod === 'whatsapp' && (
                    <>Send to WhatsApp: <strong>{recipientPhone}</strong></>
                  )}
                  {withdrawMethod === 'link' && (
                    <>Create payment link for <strong>{selectedCurrency.symbol}{Number(amount).toLocaleString()}</strong></>
                  )}
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <Button variant="outline" onClick={() => setView('form')} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmWithdraw} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl">Confirm</Button>
            </div>
          </div>
        )}

        {/* PIN View */}
        {view === 'pin' && (
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Enter PIN</h3>
              <button onClick={() => setView('form')} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                <Lock size={28} className="text-gray-700" />
              </div>
              <p className="text-gray-500 text-sm mb-6">Enter your 4-digit PIN to confirm</p>
              <div className="flex gap-3 mb-6">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`withdraw-pin-${index}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <Button onClick={handleWithdraw} disabled={isLoading} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : null}
                Confirm Transfer
              </Button>
            </div>
          </div>
        )}

        {/* Success View */}
        {view === 'success' && (
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">
                {withdrawMethod === 'link' ? 'Link Created!' : 'Transfer Successful'}
              </h3>
              <button onClick={() => { setView('form'); onClose(); }} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
                <Check size={40} className="text-gray-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {withdrawMethod === 'link' ? 'Link Ready!' : 'Transfer Complete!'}
              </p>
              <p className="text-gray-500 text-center mb-6">
                {withdrawMethod === 'bank' && accountName && (
                  <>Your transfer to {accountName} has been initiated.</>
                )}
                {withdrawMethod === 'velcrotag' && tagVerified && (
                  <>Money sent to @{recipientTag} ({recipientName}).</>
                )}
                {withdrawMethod === 'whatsapp' && (
                  <>WhatsApp transfer to {recipientPhone} initiated.</>
                )}
                {withdrawMethod === 'link' && (
                  <>Share this link with your recipient to claim the funds.</>
                )}
              </p>
              
              {/* Link-specific UI */}
              {withdrawMethod === 'link' && generatedLink && (
                <div className="w-full max-w-xs mb-6 space-y-3">
                  {/* Link display */}
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <input 
                      type="text" 
                      value={generatedLink} 
                      readOnly 
                      className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        toast.success('Link copied!');
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  
                  {/* Share buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const message = `Hi! I've sent you ${selectedCurrency.symbol}${Number(amount).toLocaleString()}. Click this link to claim: ${generatedLink}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors"
                    >
                      <img src="images/whatsapp-logo.png" alt="WhatsApp" className="w-5 h-5" />
                      <span className="text-sm font-medium text-green-700">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        const subject = 'Payment from Velcro';
                        const body = `Hi! I've sent you ${selectedCurrency.symbol}${Number(amount).toLocaleString()}. Click this link to claim: ${generatedLink}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                      }}
                      className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                    >
                      <Mail size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Email</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Non-link methods show amount summary and receipt */}
              {withdrawMethod !== 'link' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 w-full max-w-xs mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium">{selectedCurrency.symbol}{Number(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total</span>
                      <span className="font-bold">{selectedCurrency.symbol}{total.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      toast.success('Receipt downloaded!');
                    }} 
                    variant="outline" 
                    className="w-full max-w-xs mb-3 rounded-xl"
                  >
                    <Download size={18} className="mr-2" />
                    Download Receipt
                  </Button>
                </>
              )}
            </div>
            <div className="p-5 border-t border-gray-100">
              <Button onClick={() => { setView('form'); onClose(); }} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
