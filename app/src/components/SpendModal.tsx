import { useState, useEffect } from 'react';
import { X, CreditCard, ChevronDown, Search, Check, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SpendModalProps {
  isOpen: boolean;
  onClose: () => void;
  usdcBalance: number;
  onSpend: (details: { amount: number; fee: number; bankName: string; accountNumber: string; accountName: string }) => void;
}

const RATE = 1500; // ₦1,500 per $1 USDC

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

export function SpendModal({ isOpen, onClose, usdcBalance, onSpend }: SpendModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [view, setView] = useState<'form' | 'confirm' | 'pin' | 'success'>('form');
  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (bankCode && accountNumber.length === 10) {
      verifyBankAccount();
    }
  }, [accountNumber, bankCode]);

  const verifyBankAccount = async () => {
    if (!bankCode || accountNumber.length !== 10) return;
    setIsVerifyingAccount(true);
    setAccountVerified(false);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const bank = banks.find(b => b.code === bankCode);
    if (bank) {
      setAccountName('SHEHU KAMAL');
      setAccountVerified(true);
      toast.success('Account verified!');
    }
    setIsVerifyingAccount(false);
  };

  if (!isOpen) return null;

  const amountNum = Number(amount) || 0;
  const usdcAmount = currency === 'NGN' ? amountNum / RATE : amountNum;
  const displayAmount = currency === 'NGN' ? amountNum : amountNum;
  const fee = 0;
  const totalUSDC = usdcAmount + fee;

  const selectedBank = banks.find(b => b.code === bankCode);
  const filteredBanks = banks.filter(bank => bank.name.toLowerCase().includes(bankSearch.toLowerCase()));

  const handleInitiate = () => {
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (totalUSDC > usdcBalance) {
      toast.error('Insufficient USDC balance');
      return;
    }
    if (!bankCode || !accountNumber || !accountVerified) {
      toast.error('Please verify bank account details');
      return;
    }
    setView('confirm');
  };

  const handleConfirm = () => {
    setView('pin');
    setPin(['', '', '', '']);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      const nextInput = document.getElementById(`spend-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`spend-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSpend = async () => {
    if (pin.some(digit => !digit)) {
      toast.error('Please enter your 4-digit PIN');
      return;
    }
    if (!amountNum || amountNum <= 0 || totalUSDC > usdcBalance) {
      toast.error('Invalid amount or insufficient balance');
      return;
    }
    if (!bankCode || !accountNumber || !accountVerified) {
      toast.error('Please verify bank account details');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    onSpend({
      amount: usdcAmount,
      fee,
      bankName: selectedBank?.name || '',
      accountNumber,
      accountName,
    });

    setView('success');
    setPin(['', '', '', '']);
  };

  const resetForm = () => {
    setAmount('');
    setCurrency('NGN');
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
    setAccountVerified(false);
    setBankSearch('');
    setShowBankSelect(false);
    setView('form');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        {view === 'form' && (
          <>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CreditCard size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">Spend USDC</h2>
                    <p className="text-sm text-gray-500">Transfer stablecoins to any bank</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Balance */}
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="text-sm text-gray-500">Available Balance</span>
                <span className="font-semibold text-gray-900">${usdcBalance.toLocaleString()}</span>
              </div>

              {/* Amount */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Amount</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      {currency === 'NGN' ? '₦' : '$'}
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 py-5 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                    />
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value as 'NGN' | 'USD');
                      setAmount('');
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none text-sm font-medium"
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                {amountNum > 0 && currency === 'NGN' && (
                  <p className="text-xs text-gray-500 mt-2">
                    ≈ ${usdcAmount.toFixed(2)} USDC will be deducted
                  </p>
                )}
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
                          <div className="p-4 text-center text-gray-500 text-sm">No banks found</div>
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
                <p className="text-xs text-gray-400 mt-1">{accountNumber.length}/10 digits</p>
              </div>

              {/* Account Name */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Account Name</Label>
                <Input
                  type="text"
                  placeholder={isVerifyingAccount ? 'Verifying...' : accountNumber.length === 10 ? 'Click verify to fetch name' : 'Enter account number first'}
                  value={accountName}
                  disabled
                  className={`py-4 rounded-xl ${accountVerified ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 text-gray-500'}`}
                />
                {accountVerified && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check size={12} />
                    Account verified successfully
                  </p>
                )}
              </div>

              {/* Simple summary instead of fee breakdown */}
              {amountNum > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">You send</span>
                    <span className="font-bold text-gray-900">
                      {currency === 'NGN' ? `₦${amountNum.toLocaleString()}` : `$${amountNum.toLocaleString()}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">No fees. Our rates cover it.</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100">
              <Button
                onClick={handleInitiate}
                disabled={isLoading || !accountVerified || !amountNum || totalUSDC > usdcBalance}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl disabled:opacity-50"
              >
                Spend USDC
              </Button>
            </div>
          </>
        )}

        {view === 'confirm' && (
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Confirm Spend</h3>
              <button onClick={() => setView('form')} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">You send</span>
                  <span className="font-medium">
                    {currency === 'NGN' ? `₦${amountNum.toLocaleString()}` : `$${amountNum.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>USDC deduction</span>
                  <span>${usdcAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Fee</span>
                  <span className="font-bold text-green-600">Free</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  Transfer to: <strong>{accountName}</strong><br />
                  Account: {accountNumber}<br />
                  Bank: {selectedBank?.name}
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <Button variant="outline" onClick={() => setView('form')} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirm} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl">Confirm</Button>
            </div>
          </div>
        )}

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
                    id={`spend-pin-${index}`}
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
              <Button onClick={handleSpend} disabled={isLoading} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
                Confirm Spend
              </Button>
            </div>
          </div>
        )}

        {view === 'success' && (
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Spend Successful</h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
                <Check size={40} className="text-gray-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">Transfer Initiated!</p>
              <p className="text-gray-500 text-center mb-6">
                Your spend of {currency === 'NGN' ? `₦${amountNum.toLocaleString()}` : `$${amountNum.toLocaleString()}`} to {accountName} has been initiated.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 w-full max-w-xs">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">{currency === 'NGN' ? `₦${amountNum.toLocaleString()}` : `$${amountNum.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-bold text-green-600">Free</span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <Button onClick={handleClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
