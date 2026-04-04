import { useState } from 'react';
import { X, Copy, Check, Info, RefreshCw, Wallet, Landmark, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CurrencyAccount {
  code: string;
  name: string;
  logo: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  fee: string;
  requiresGeneration: boolean;
}

const currencyAccounts: CurrencyAccount[] = [
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    logo: '/logos/ng.png',
    bankName: '9 Payment Service Bank (9PSB)',
    accountNumber: '0123456789',
    accountName: 'Shehu Kamal',
    fee: '0.5% (capped at ₦200)',
    requiresGeneration: false,
  },
  {
    code: 'USD',
    name: 'US Dollar',
    logo: '/logos/us.png',
    bankName: 'Community Federal Savings Bank',
    accountNumber: '',
    accountName: 'Shehu Kamal',
    fee: '0.5% (capped at $5)',
    requiresGeneration: true,
  },
  {
    code: 'EUR',
    name: 'Euro',
    logo: '/logos/eu.png',
    bankName: 'Deutsche Bank',
    accountNumber: '',
    accountName: 'Shehu Kamal',
    fee: '0.5% (capped at €5)',
    requiresGeneration: true,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    logo: '/logos/gb.png',
    bankName: 'Barclays Bank',
    accountNumber: '',
    accountName: 'Shehu Kamal',
    fee: '0.5% (capped at £5)',
    requiresGeneration: true,
  },
];

// Generate random account number
const generateAccountNumber = (currency: string): string => {
  if (currency === 'USD') {
    return Array(10).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
  } else if (currency === 'EUR') {
    return 'DE' + Array(20).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
  } else if (currency === 'GBP') {
    return 'GB' + Array(14).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
  }
  return '';
};

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyAccount>(currencyAccounts[0]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [generatedAccounts, setGeneratedAccounts] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateAccount = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newAccountNumber = generateAccountNumber(selectedCurrency.code);
    setGeneratedAccounts(prev => ({
      ...prev,
      [selectedCurrency.code]: newAccountNumber
    }));
    
    setIsGenerating(false);
    toast.success(`${selectedCurrency.code} virtual account generated!`);
  };

  const currentAccountNumber = selectedCurrency.requiresGeneration 
    ? generatedAccounts[selectedCurrency.code] || ''
    : selectedCurrency.accountNumber;

  const hasGeneratedAccount = !!currentAccountNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-gray-900">Add Funds</h2>
                <p className="text-sm text-gray-500">Fund your wallet</p>
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
        
        {/* Currency Selection */}
        <div className="p-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Select Currency</p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {currencyAccounts.map((currency) => (
              <button
                key={currency.code}
                onClick={() => setSelectedCurrency(currency)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                  ${selectedCurrency.code === currency.code 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                <img src={currency.logo} alt={currency.code} className="w-8 h-8 object-contain" />
                <span className={`text-xs font-medium ${selectedCurrency.code === currency.code ? 'text-gray-900' : 'text-gray-500'}`}>
                  {currency.code}
                </span>
              </button>
            ))}
          </div>
          
          {/* Account Details */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Landmark size={24} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank Name</p>
                <p className="font-semibold text-gray-900">{selectedCurrency.bankName}</p>
              </div>
            </div>
            
            {/* Generate Account Button (for USD, EUR, GBP) */}
            {selectedCurrency.requiresGeneration && !hasGeneratedAccount && (
              <div className="py-4">
                <Button
                  onClick={handleGenerateAccount}
                  disabled={isGenerating}
                  className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                >
                  {isGenerating ? (
                    <RefreshCw size={18} className="animate-spin mr-2" />
                  ) : (
                    <Wallet size={18} className="mr-2" />
                  )}
                  Generate Virtual Account
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Click to generate your unique {selectedCurrency.code} virtual account
                </p>
              </div>
            )}
            
            {/* Account Number (shown for NGN or after generation) */}
            {(!selectedCurrency.requiresGeneration || hasGeneratedAccount) && (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Account Number</p>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                    <span className="flex-1 font-mono text-lg text-gray-900">{currentAccountNumber}</span>
                    <button
                      onClick={() => handleCopy(currentAccountNumber, 'Account number')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copiedField === 'Account number' ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Account Name */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Account Name</p>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                    <span className="flex-1 font-medium text-gray-900">{selectedCurrency.accountName}</span>
                    <button
                      onClick={() => handleCopy(selectedCurrency.accountName, 'Account name')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copiedField === 'Account name' ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Fee Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700">Transaction Fee</p>
              <p className="text-xs text-blue-600">{selectedCurrency.fee}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {selectedCurrency.requiresGeneration && !hasGeneratedAccount 
              ? `Generate a virtual account to receive ${selectedCurrency.code} deposits.`
              : `Transfer to this account to fund your ${selectedCurrency.code} wallet. Funds will be credited automatically.`}
          </p>
        </div>
      </div>
    </div>
  );
}
