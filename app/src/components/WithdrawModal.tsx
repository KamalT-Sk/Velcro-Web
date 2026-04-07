import { useState } from 'react';
import { X, Info, ChevronDown, Send, AtSign, MessageCircle, Landmark, ArrowRight, Phone } from 'lucide-react';
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

type WithdrawMethod = 'bank' | 'velcrotag' | 'phone' | 'whatsapp';

export function WithdrawModal({ isOpen, onClose, userKYC, velcroTag }: WithdrawModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [showCurrencySelect, setShowCurrencySelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>('bank');
  const [recipientTag, setRecipientTag] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [note, setNote] = useState('');

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
      if (!bankName || !accountNumber || !accountName) {
        toast.error('Please fill in all bank details');
        return;
      }
    } else if (withdrawMethod === 'velcrotag') {
      if (!recipientTag) {
        toast.error('Please enter a VelcroTag');
        return;
      }
    } else if (withdrawMethod === 'phone') {
      if (!recipientPhone || recipientPhone.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
    } else if (withdrawMethod === 'whatsapp') {
      if (!recipientPhone) {
        toast.error('Please enter a WhatsApp number');
        return;
      }
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    let successMessage = '';
    if (withdrawMethod === 'bank') {
      successMessage = `Withdrawal of ${selectedCurrency.symbol}${withdrawAmount.toLocaleString()} to bank account initiated!`;
    } else if (withdrawMethod === 'velcrotag') {
      successMessage = `Transfer of ${selectedCurrency.symbol}${withdrawAmount.toLocaleString()} to @${recipientTag} successful!`;
    } else if (withdrawMethod === 'phone') {
      successMessage = `Transfer of ${selectedCurrency.symbol}${withdrawAmount.toLocaleString()} to phone ${recipientPhone} successful!`;
    } else {
      successMessage = `Transfer of ${selectedCurrency.symbol}${withdrawAmount.toLocaleString()} to WhatsApp ${recipientPhone} successful!`;
    }
    
    toast.success(successMessage);
    onClose();
    setAmount('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setRecipientTag('');
    setRecipientPhone('');
    setNote('');
  };

  const calculateFee = (amt: number) => {
    if (selectedCurrency.code === 'NGN') {
      // NGN fee structure: under 10k = 25, 10k-100k = 30, above 100k = 100
      if (amt < 10000) return 25;
      if (amt < 100000) return 30;
      return 100;
    }
    // For other currencies: 0.5% capped at $5 equivalent
    return Math.min(amt * 0.005, 5);
  };

  const amountNum = Number(amount) || 0;
  const fee = calculateFee(amountNum);
  const total = amountNum + fee;

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
                onClick={() => setWithdrawMethod('phone')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                  ${withdrawMethod === 'phone' 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                <Phone size={20} className={withdrawMethod === 'phone' ? 'text-velcro-green' : 'text-gray-400'} />
                <span className={`text-xs font-medium ${withdrawMethod === 'phone' ? 'text-gray-900' : 'text-gray-600'}`}>
                  Phone
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
            </div>
          </div>
          
          {/* Bank Details */}
          {withdrawMethod === 'bank' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Landmark size={18} className="text-gray-400" />
                <span className="text-sm font-medium">Bank Account Details</span>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Bank Name</Label>
                <Input
                  type="text"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Account Number</Label>
                <Input
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Account Name</Label>
                <Input
                  type="text"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                />
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
                    onChange={(e) => setRecipientTag(e.target.value.replace('@', ''))}
                    className="pl-10 py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the recipient's VelcroTag (e.g., kamal123)
                </p>
              </div>

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

          {/* Phone Number Transfer */}
          {withdrawMethod === 'phone' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm font-medium">Phone Number Transfer</span>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Recipient Phone Number</Label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="pl-12 py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recipient will receive an SMS with instructions to claim funds. If they have a Velcro account, money goes directly to their wallet.
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
                    placeholder="+234 800 000 0000"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="pl-12 py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  The recipient will receive a WhatsApp message to claim the funds
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
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ArrowRight size={18} className="mr-2" />
                {withdrawMethod === 'bank' ? 'Withdraw' : 'Send'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
