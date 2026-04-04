import { X, Download, ArrowDownLeft, ArrowUpRight, Repeat, Landmark, Send, CircleDollarSign, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  type: 'receive' | 'send' | 'convert' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  from?: string;
  to?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
}

interface CurrencyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  currency: {
    code: string;
    name: string;
    symbol: string;
    balance: number;
    logo?: string;
  } | null;
}

const getTransactionHistory = (currencyCode: string): Transaction[] => {
  const histories: Record<string, Transaction[]> = {
    NGN: [
      { id: 1, type: 'receive', amount: 50000, currency: 'NGN', from: 'John Doe', date: 'Today, 2:30 PM', status: 'completed', description: 'Payment for services' },
      { id: 2, type: 'send', amount: 25000, currency: 'NGN', to: 'Sarah Smith', date: 'Yesterday, 4:15 PM', status: 'completed', description: 'Rent payment' },
      { id: 3, type: 'convert', amount: 100000, currency: 'NGN', date: 'Yesterday, 10:00 AM', status: 'completed', description: 'Converted to USDC' },
      { id: 4, type: 'deposit', amount: 200000, currency: 'NGN', date: 'Mar 28, 2024', status: 'completed', description: 'Bank transfer' },
      { id: 5, type: 'send', amount: 15000, currency: 'NGN', to: 'Mike Johnson', date: 'Mar 27, 2024', status: 'completed', description: 'Dinner split' },
      { id: 6, type: 'receive', amount: 75000, currency: 'NGN', from: 'ABC Company', date: 'Mar 25, 2024', status: 'completed', description: 'Salary payment' },
      { id: 7, type: 'withdrawal', amount: 50000, currency: 'NGN', date: 'Mar 24, 2024', status: 'completed', description: 'ATM withdrawal' },
    ],
    USD: [
      { id: 1, type: 'receive', amount: 500, currency: 'USD', from: 'Client A', date: 'Mar 20, 2024', status: 'completed', description: 'Freelance payment' },
      { id: 2, type: 'convert', amount: 300, currency: 'USD', date: 'Mar 18, 2024', status: 'completed', description: 'Converted from NGN' },
    ],
    EUR: [
      { id: 1, type: 'receive', amount: 200, currency: 'EUR', from: 'European Client', date: 'Mar 15, 2024', status: 'completed', description: 'Consulting fee' },
    ],
    GBP: [
      { id: 1, type: 'convert', amount: 150, currency: 'GBP', date: 'Mar 10, 2024', status: 'completed', description: 'Converted from USD' },
    ],
    KES: [],
    EGP: [],
    ZAR: [],
  };
  
  return histories[currencyCode] || [];
};

export function CurrencyHistoryModal({ isOpen, onClose, onDeposit, onWithdraw, currency }: CurrencyHistoryModalProps) {
  if (!isOpen || !currency) return null;

  const transactions = getTransactionHistory(currency.code);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receive':
        return <ArrowDownLeft size={18} className="text-green-600" />;
      case 'send':
        return <ArrowUpRight size={18} className="text-red-600" />;
      case 'convert':
        return <Repeat size={18} className="text-blue-600" />;
      case 'deposit':
        return <Landmark size={18} className="text-purple-600" />;
      case 'withdrawal':
        return <Send size={18} className="text-orange-600" />;
      default:
        return <CircleDollarSign size={18} className="text-gray-600" />;
    }
  };

  const getTransactionBg = (type: string) => {
    switch (type) {
      case 'receive':
        return 'bg-green-100';
      case 'send':
        return 'bg-red-100';
      case 'convert':
        return 'bg-blue-100';
      case 'deposit':
        return 'bg-purple-100';
      case 'withdrawal':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getTransactionLabel = (tx: Transaction) => {
    switch (tx.type) {
      case 'receive':
        return `Received from ${tx.from}`;
      case 'send':
        return `Sent to ${tx.to}`;
      case 'convert':
        return 'Currency conversion';
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return tx.description || 'Transaction';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'receive':
      case 'deposit':
        return '+';
      case 'send':
      case 'withdrawal':
        return '-';
      default:
        return '';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'receive':
      case 'deposit':
        return 'text-green-600';
      case 'send':
      case 'withdrawal':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const handleExport = () => {
    toast.success('Transaction history exported!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                {currency.logo ? (
                  <img src={currency.logo} alt={currency.code} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-2xl">💰</span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-gray-900">{currency.code} History</h2>
                <p className="text-sm text-gray-500">{currency.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Balance Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                <p className="text-2xl font-display font-bold text-gray-900">
                  {currency.symbol}{currency.balance.toLocaleString()}
                </p>
              </div>
              {/* Deposit/Withdraw Buttons */}
              <div className="flex gap-2">
                {onDeposit && (
                  <Button
                    size="sm"
                    onClick={onDeposit}
                    className="bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy rounded-lg"
                  >
                    <Plus size={16} className="mr-1" />
                    Deposit
                  </Button>
                )}
                {onWithdraw && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onWithdraw}
                    className="border-gray-200 hover:bg-gray-50 rounded-lg"
                  >
                    <Minus size={16} className="mr-1" />
                    Withdraw
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Transactions List */}
        <div className="overflow-y-auto max-h-[50vh]">
          {transactions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getTransactionBg(tx.type)} rounded-xl flex items-center justify-center`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{getTransactionLabel(tx)}</p>
                        <p className="text-gray-400 text-xs">{tx.date}</p>
                        {tx.description && tx.type === 'convert' && (
                          <p className="text-gray-500 text-xs mt-0.5">{tx.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${getAmountColor(tx.type)}`}>
                        {getAmountPrefix(tx.type)}{currency.symbol}{tx.amount.toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        ${tx.status === 'completed' ? 'bg-green-100 text-green-600' : 
                          tx.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                          'bg-red-100 text-red-600'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CircleDollarSign size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-1">Your {currency.code} transaction history will appear here</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            className="w-full border-gray-200 hover:bg-white"
            onClick={handleExport}
          >
            <Download size={16} className="mr-2" />
            Export History
          </Button>
        </div>
      </div>
    </div>
  );
}
