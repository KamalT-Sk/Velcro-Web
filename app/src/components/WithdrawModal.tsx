import { useState, useEffect } from 'react';
import { X, Info, ChevronDown, Send, AtSign, MessageCircle, Landmark, ArrowRight, Phone, Check, User, RefreshCw, Link2, Search } from 'lucide-react';
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
  { code: 'NGN', name: 'Nigerian Naira', logo: '/logos/ng.png', balance: 2450000.50, symbol: '₦' },
  { code: 'USD', name: 'US Dollar', logo: '/logos/us.png', balance: 0, symbol: '$' },
  { code: 'EUR', name: 'Euro', logo: '/logos/eu.png', balance: 0, symbol: '€' },
  { code: 'GBP', name: 'British Pound', logo: '/logos/gb.png', balance: 0, symbol: '£' },
  { code: 'KES', name: 'Kenyan Shilling', logo: '/logos/ke.png', balance: 0, symbol: 'KSh' },
  { code: 'EGP', name: 'Egyptian Pound', logo: '/logos/eg.png', balance: 0, symbol: 'E£' },
  { code: 'ZAR', name: 'South African Rand', logo: '/logos/za.png', balance: 0, symbol: 'R' },
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

  const handleWithdraw = async () => {
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
    await new Promise(resolve => setTimeout(resolve, 1500));
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
    }
    
    toast.success(successMessage);
    onClose();
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
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
        
        <div className="p-5 space-y-5">
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
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-green-600" />
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
          
          {/* Fee Info */}
          <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700">Transaction Fee</p>
              <p className="text-xs text-blue-600">
                {selectedCurrency.code === 'NGN' 
                  ? 'Under ₦10k: ₦25 | ₦10k-₦100k: ₦30 | Above ₦100k: ₦100'
                  : '0.5% fee capped at $5 equivalent'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-gray-100">
          <Button
            onClick={handleWithdraw}
            disabled={isLoading || (withdrawMethod === 'bank' && !accountVerified) || (withdrawMethod === 'velcrotag' && !tagVerified) || !amountNum}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ArrowRight size={18} className="mr-2" />
                {withdrawMethod === 'bank' ? 'Transfer to Bank' : withdrawMethod === 'link' ? 'Generate Link' : 'Send Money'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
