import { useState } from 'react';
import { 
  Copy, 
  Eye, 
  EyeOff,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ArrowRightLeft,
  Plus,
  Send,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CurrencyHistoryModal } from './CurrencyHistoryModal';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import { TransactionDetailModal } from './TransactionDetailModal';
import { ConvertModal } from './ConvertModal';
import { SendMoneyLinkModal, type PaymentSendLink } from './SendMoneyLinkModal';
import { SendMoneyLinksManager } from './SendMoneyLinksManager';
import type { UserKYC } from '@/App';

// Currency data with logo paths
interface Currency {
  code: string;
  name: string;
  symbol: string;
  balance: number;
  isActive: boolean;
  isComingSoon: boolean;
  logo: string;
}

const initialCurrencies: Currency[] = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', balance: 2450000.50, isActive: true, isComingSoon: false, logo: '/logos/ng.png' },
  { code: 'USD', name: 'US Dollar', symbol: '$', balance: 0, isActive: false, isComingSoon: false, logo: '/logos/us.png' },
  { code: 'EUR', name: 'Euro', symbol: '€', balance: 0, isActive: false, isComingSoon: false, logo: '/logos/eu.png' },
  { code: 'GBP', name: 'British Pound', symbol: '£', balance: 0, isActive: false, isComingSoon: false, logo: '/logos/gb.png' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', balance: 0, isActive: false, isComingSoon: false, logo: '/logos/ke.png' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', balance: 0, isActive: false, isComingSoon: false, logo: '/logos/eg.png' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', balance: 0, isActive: false, isComingSoon: false, logo: '/logos/za.png' },
];

// Exchange rates (relative to USD)
const exchangeRates: Record<string, number> = {
  USD: 1,
  NGN: 0.00067,
  EUR: 1.08,
  GBP: 1.27,
  KES: 0.0077,
  EGP: 0.020,
  ZAR: 0.054,
  USDC: 1,
};

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

const recentTransactions: Transaction[] = [
  { id: 1, type: 'receive', amount: 50000, currency: 'NGN', from: 'John Doe', date: 'Today, 2:30 PM', status: 'completed', description: 'Payment for services' },
  { id: 2, type: 'send', amount: 25000, currency: 'NGN', to: 'Sarah Smith', date: 'Yesterday, 4:15 PM', status: 'completed', description: 'Rent payment' },
  { id: 3, type: 'convert', amount: 100000, currency: 'NGN', date: 'Yesterday, 10:00 AM', status: 'completed', description: 'Converted to USDC' },
  { id: 4, type: 'receive', amount: 15000, currency: 'NGN', from: 'Mike Johnson', date: 'Mar 28, 2024', status: 'completed', description: 'Dinner split' },
];

interface DashboardProps {
  userKYC: UserKYC;
  velcroTag: string;
  velcroPoints: number;
}

export function Dashboard({ userKYC, velcroTag, velcroPoints }: DashboardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSendLinkModal, setShowSendLinkModal] = useState(false);
  const [showSendLinkManager, setShowSendLinkManager] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [usdcBalance, setUsdcBalance] = useState(1250);
  const [transactions, setTransactions] = useState<Transaction[]>(recentTransactions);
  const [sendMoneyLinks, setSendMoneyLinks] = useState<PaymentSendLink[]>([]);

  const totalBalance = currencies.reduce((acc, curr) => acc + curr.balance, 0);

  const getBalances = () => {
    const balances: Record<string, number> = {};
    currencies.forEach(c => balances[c.code] = c.balance);
    balances['USDC'] = usdcBalance;
    return balances;
  };

  const handleConvert = (fromCurrency: string, toCurrency: string, amount: number) => {
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    const convertedAmount = amount * (fromRate / toRate);
    const feeRate = (fromCurrency === 'USDC' || toCurrency === 'USDC') ? 0.01 : 0.005;
    const totalDeduction = amount * (1 + feeRate);

    // Update balances
    setCurrencies(prev => prev.map(c => {
      if (c.code === fromCurrency) {
        return { ...c, balance: c.balance - totalDeduction };
      }
      if (c.code === toCurrency) {
        return { ...c, balance: c.balance + convertedAmount };
      }
      return c;
    }));

    // Update USDC balance if involved
    if (fromCurrency === 'USDC') {
      setUsdcBalance(prev => prev - totalDeduction);
    }
    if (toCurrency === 'USDC') {
      setUsdcBalance(prev => prev + convertedAmount);
    }

    // Add transaction record
    const newTransaction: Transaction = {
      id: Date.now(),
      type: 'convert',
      amount: amount,
      currency: fromCurrency,
      from: fromCurrency,
      to: toCurrency,
      date: 'Just now',
      status: 'completed',
      description: `Converted ${fromCurrency} to ${toCurrency}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleCreateSendLink = (link: PaymentSendLink) => {
    // Deduct amount from balance
    const feeRate = link.currency === 'USDC' ? 0.01 : 0.005;
    const totalDeduction = link.amount * (1 + feeRate);

    if (link.currency === 'USDC') {
      setUsdcBalance(prev => prev - totalDeduction);
    } else {
      setCurrencies(prev => prev.map(c => 
        c.code === link.currency 
          ? { ...c, balance: c.balance - totalDeduction }
          : c
      ));
    }

    setSendMoneyLinks(prev => [link, ...prev]);

    // Add transaction record
    const newTransaction: Transaction = {
      id: Date.now(),
      type: 'send',
      amount: link.amount,
      currency: link.currency,
      to: 'Payment Link',
      date: 'Just now',
      status: 'completed',
      description: `Payment link created: ${link.note}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleCancelSendLink = (id: string) => {
    const link = sendMoneyLinks.find(l => l.id === id);
    if (!link) return;

    // Return funds to balance
    const feeRate = link.currency === 'USDC' ? 0.01 : 0.005;
    const totalDeduction = link.amount * (1 + feeRate);

    if (link.currency === 'USDC') {
      setUsdcBalance(prev => prev + totalDeduction);
    } else {
      setCurrencies(prev => prev.map(c => 
        c.code === link.currency 
          ? { ...c, balance: c.balance + totalDeduction }
          : c
      ));
    }

    setSendMoneyLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleCurrencyClick = (currency: Currency) => {
    if (currency.isComingSoon) return;
    setSelectedCurrency(currency);
    setShowHistoryModal(true);
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    toast.success('Wallet address copied!');
  };

  const copyVelcroTag = () => {
    navigator.clipboard.writeText(velcroTag);
    toast.success('VelcroTag copied!');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success('Balance refreshed!');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receive':
        return <ArrowDownLeft size={18} className="text-green-600" />;
      case 'send':
        return <ArrowUpRight size={18} className="text-red-600" />;
      case 'convert':
        return <Repeat size={18} className="text-blue-600" />;
      case 'deposit':
        return <ArrowDownLeft size={18} className="text-purple-600" />;
      case 'withdrawal':
        return <Send size={18} className="text-orange-600" />;
      default:
        return <ArrowDownLeft size={18} className="text-gray-600" />;
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with VelcroTag & VelcroPoints - Small on top left */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, Shehu Kamal!</p>
          </div>
          
          {/* VelcroTag - Small, copyable */}
          {userKYC.tier !== 'none' && (
            <button
              onClick={copyVelcroTag}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-velcro-navy text-white rounded-lg text-sm hover:bg-velcro-navy/90 transition-colors"
              title="Click to copy"
            >
              <span className="text-white/70">@</span>
              <span className="font-medium">{velcroTag}</span>
              <Copy size={12} className="text-white/60" />
            </button>
          )}
          
          {/* VelcroPoints - Small */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <RotateCcw size={14} className="text-amber-600" />
            <span className="font-medium text-amber-900">{velcroPoints.toLocaleString()} pts</span>
          </div>
        </div>
        
        {userKYC.tier === 'none' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle size={16} className="text-amber-600" />
            <span className="text-sm text-amber-700">Complete KYC to unlock full features</span>
          </div>
        )}
      </div>

      {/* Total Balance Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-gray-900">
                {showBalance ? `₦${totalBalance.toLocaleString()}` : '****'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">≈ $1,633.50 USD</p>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {showBalance ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
          </button>
        </div>
        
        {/* Quick Actions - Add Funds, Transfer, Convert */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            className="bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl"
            onClick={() => setShowDepositModal(true)}
          >
            <Plus size={18} className="mr-2" />
            Add Funds
          </Button>
          <Button 
            className="bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl"
            onClick={() => setShowWithdrawModal(true)}
          >
            <Send size={18} className="mr-2" />
            Transfer
          </Button>
          <Button 
            className="bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
            onClick={() => setShowConvertModal(true)}
          >
            <ArrowRightLeft size={18} className="mr-2" />
            Convert
          </Button>
        </div>
      </div>

      {/* Currency Wallets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">Multi-Currency Wallets</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              title="Refresh rates"
            >
              <RefreshCw size={18} className={`text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyClick(currency)}
              disabled={currency.isComingSoon}
              className={`relative rounded-xl p-3 transition-all duration-300 text-left
                ${currency.isActive 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : currency.isComingSoon 
                    ? 'bg-gray-50 border border-gray-200 opacity-60'
                    : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-soft'
                }`}
            >
              {currency.isComingSoon && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-medium rounded">
                  Soon
                </span>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <img src={currency.logo} alt={currency.code} className="w-8 h-8 object-contain" />
                <div>
                  <p className={`font-semibold text-xs ${currency.isActive ? 'text-white' : 'text-gray-900'}`}>
                    {currency.code}
                  </p>
                </div>
              </div>
              
              <p className={`text-sm font-display font-bold ${currency.isActive ? 'text-white' : 'text-gray-900'}`}>
                {showBalance 
                  ? `${currency.symbol}${currency.balance.toLocaleString()}` 
                  : '****'}
              </p>
              
              {!currency.isComingSoon && currency.isActive && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-velcro-green rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Solana Stable Hub Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">Solana Stable Hub</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
            <img src="/images/solana-logo.png" alt="Solana" className="w-4 h-4" />
            <span className="text-xs text-purple-700 font-medium">Powered by Solana</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <img src="/images/usdc-logo.png" alt="USDC" className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold">USDC Balance</p>
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <img src="/images/solana-logo.png" alt="Solana" className="w-4 h-4" />
                      Solana Network
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-display font-bold mt-3">
                  {showBalance ? `$${usdcBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '****'}
                </p>
                <p className="text-white/60 text-sm">≈ ₦{(usdcBalance * 1500).toLocaleString()} NGN</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-xl"
                    onClick={() => toast.info('Go to Crypto Hub to buy USDC')}
                  >
                    <ArrowDownLeft size={16} className="mr-1.5" />
                    Buy
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-xl"
                    onClick={() => toast.info('Go to Crypto Hub to sell USDC')}
                  >
                    <ArrowUpRight size={16} className="mr-1.5" />
                    Sell
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span>Buy: ₦1,500</span>
                  <span className="text-white/40">|</span>
                  <span>Sell: ₦1,480</span>
                </div>
              </div>
            </div>
            
            {/* Wallet Address */}
            <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs text-white/60">Solana:</span>
                <span className="text-sm font-mono text-white/80 truncate">
                  7xKX...sAsU
                </span>
              </div>
              <button 
                onClick={copyWalletAddress}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">Recent Transactions</h2>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            View All
          </button>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {transactions.map((tx, index) => (
            <button 
              key={tx.id}
              onClick={() => setSelectedTransaction(tx)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left
                ${index !== transactions.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTransactionBg(tx.type)}`}>
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {tx.type === 'receive' ? `Received from ${tx.from}` : 
                     tx.type === 'send' ? `Sent to ${tx.to}` : `Converted ${tx.from} to ${tx.to}`}
                  </p>
                  <p className="text-gray-400 text-xs">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm
                  ${tx.type === 'receive' ? 'text-green-600' : 
                    tx.type === 'send' ? 'text-red-600' : 'text-gray-900'}`}>
                  {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                  {tx.type === 'convert' ? '' : '₦'}
                  {tx.amount.toLocaleString()}
                </p>
                <p className="text-green-600 text-xs">{tx.status}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CurrencyHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        currency={selectedCurrency}
        onDeposit={() => {
          setShowHistoryModal(false);
          setShowDepositModal(true);
        }}
        onWithdraw={() => {
          setShowHistoryModal(false);
          setShowWithdrawModal(true);
        }}
      />
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        userKYC={userKYC}
        velcroTag={velcroTag}
      />
      <ConvertModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        balances={getBalances()}
        onConvert={handleConvert}
      />
      <SendMoneyLinkModal
        isOpen={showSendLinkModal}
        onClose={() => setShowSendLinkModal(false)}
        balances={getBalances()}
        onCreateLink={handleCreateSendLink}
      />
      <TransactionDetailModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />

      {/* Send Money Links Section - Show if there are active links */}
      {sendMoneyLinks.length > 0 && !showSendLinkManager && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900">Active Payment Links</h2>
              <p className="text-gray-500 text-sm">{sendMoneyLinks.filter(l => l.status === 'active').length} active link(s)</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSendLinkManager(true)}
              className="rounded-xl"
            >
              Manage Links
            </Button>
          </div>
          <div className="space-y-3">
            {sendMoneyLinks.filter(l => l.status === 'active').slice(0, 2).map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-velcro-green/20 rounded-lg flex items-center justify-center">
                    <Link2 size={18} className="text-velcro-navy" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">₦{link.amount.toLocaleString()} {link.currency}</p>
                    <p className="text-xs text-gray-500">Expires in {link.expiresInHours}h</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link.claimUrl);
                    toast.success('Link copied!');
                  }}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <Copy size={16} className="text-gray-500" />
                </button>
              </div>
            ))}
            {sendMoneyLinks.filter(l => l.status === 'active').length > 2 && (
              <button
                onClick={() => setShowSendLinkManager(true)}
                className="w-full py-2 text-sm text-velcro-navy font-medium hover:underline"
              >
                View all {sendMoneyLinks.filter(l => l.status === 'active').length} links
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full Send Money Links Manager */}
      {showSendLinkManager && (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto">
          <div className="max-w-3xl mx-auto p-4 lg:p-8">
            <button
              onClick={() => setShowSendLinkManager(false)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronRight size={20} className="rotate-180" />
              Back to Dashboard
            </button>
            <SendMoneyLinksManager
              links={sendMoneyLinks}
              onCreateNew={() => {
                setShowSendLinkManager(false);
                setShowSendLinkModal(true);
              }}
              onCancelLink={handleCancelSendLink}
            />
          </div>
        </div>
      )}

    </div>
  );
}
