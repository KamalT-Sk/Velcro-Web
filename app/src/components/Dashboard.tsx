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
  Download,
  RefreshCcw,
  Wallet,
  LogOut,
  Link2,
  Check
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
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', balance: 2450000.50, isActive: true, isComingSoon: false, logo: 'logos/ng.png' },
  { code: 'USD', name: 'US Dollar', symbol: '$', balance: 0, isActive: false, isComingSoon: false, logo: 'logos/us.png' },
  { code: 'EUR', name: 'Euro', symbol: '€', balance: 0, isActive: false, isComingSoon: false, logo: 'logos/eu.png' },
  { code: 'GBP', name: 'British Pound', symbol: '£', balance: 0, isActive: false, isComingSoon: false, logo: 'logos/gb.png' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', balance: 0, isActive: false, isComingSoon: false, logo: 'logos/ke.png' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', balance: 0, isActive: false, isComingSoon: false, logo: 'logos/eg.png' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', balance: 0, isActive: false, isComingSoon: false, logo: 'logos/za.png' },
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
  { id: 3, type: 'convert', amount: 100000, currency: 'NGN', from: 'NGN', to: 'USDC', date: 'Yesterday, 10:00 AM', status: 'completed', description: 'Converted to USDC' },
  { id: 4, type: 'receive', amount: 15000, currency: 'NGN', from: 'Mike Johnson', date: 'Mar 28, 2024', status: 'completed', description: 'Dinner split' },
];

interface DashboardProps {
  userKYC: UserKYC;
  velcroTag: string;
  velcroPoints: number;
  hasWallet?: boolean;
  onGenerateWallet?: () => void;
}

export function Dashboard({ userKYC, velcroTag, velcroPoints, hasWallet = false, onGenerateWallet }: DashboardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(velcroPoints);
  const [isRefreshingPoints, setIsRefreshingPoints] = useState(false);
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
        return <Download size={16} className="text-white" strokeWidth={2.5} />;
      case 'send':
        return <Send size={16} className="text-white" strokeWidth={2.5} />;
      case 'convert':
        return <RefreshCcw size={16} className="text-white" strokeWidth={2.5} />;
      case 'deposit':
        return <Plus size={16} className="text-white" strokeWidth={2.5} />;
      case 'withdrawal':
        return <LogOut size={16} className="text-white" strokeWidth={2.5} />;
      default:
        return <Wallet size={16} className="text-white" strokeWidth={2.5} />;
    }
  };

  const getTransactionBg = (type: string) => {
    switch (type) {
      case 'receive':
        return 'bg-velcro-green';
      case 'send':
        return 'bg-velcro-navy';
      case 'convert':
        return 'bg-velcro-navy/80';
      case 'deposit':
        return 'bg-velcro-green/80';
      case 'withdrawal':
        return 'bg-velcro-navy/60';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with VelcroTag & VelcroPoints - Small on top left */}
      <div className="flex flex-col gap-4 pl-14 lg:pl-0">
        {/* Top row: Title/Welcome + Points/Tag */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, Shehu Kamal!</p>
          </div>
          
          <div className="flex items-center gap-3">
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
            
            {/* VelcroPoints - Refreshable */}
            <button
              onClick={async () => {
                setIsRefreshingPoints(true);
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Randomly add 0-50 points to simulate new activity
                const newPoints = currentPoints + Math.floor(Math.random() * 50);
                setCurrentPoints(newPoints);
                setIsRefreshingPoints(false);
              }}
              disabled={isRefreshingPoints}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm hover:bg-amber-100 transition-colors disabled:opacity-70"
            >
              <span className={`font-medium text-amber-900 ${isRefreshingPoints ? 'animate-pulse' : ''}`}>{currentPoints.toLocaleString()} pts</span>
            </button>
          </div>
        </div>
        
        {/* Headline */}
        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-gray-900">Your Global Account</h2>
          <p className="text-gray-500 text-sm mt-1">Receive, hold, and spend money across currencies — instantly.</p>
        </div>
        
        {/* KYC Banner - Full width */}
        {userKYC.tier === 'none' && (
          <button 
            onClick={() => {}}
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:shadow-md transition-all w-fit"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-amber-900">Complete KYC</p>
              <p className="text-xs text-amber-700">Unlock full features</p>
            </div>
          </button>
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
                <img src={currency.logo} alt={currency.code} className="w-8 h-8 object-contain rounded-sm" />
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
            <img src="images/solana-logo.png" alt="Solana" className="w-4 h-4 object-contain" />
            <span className="text-xs text-purple-700 font-medium">Powered by Solana</span>
          </div>
        </div>
        
        {!hasWallet ? (
          /* No Wallet - Show Generate CTA */
          <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <img src="images/usdc-logo.png" alt="USDC" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <p className="font-semibold">USDC Wallet</p>
                      <p className="text-white/60 text-sm">Stablecoins on Solana</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-4">
                    Create a wallet to buy, sell, spend, and store USDC securely. No KYC required to start.
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Check size={12} className="text-green-400" />
                      $100 limit without KYC
                    </span>
                    <span className="flex items-center gap-1">
                      <Check size={12} className="text-green-400" />
                      Instant setup
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={onGenerateWallet}
                  className="bg-white hover:bg-white/90 text-purple-900 font-semibold px-6 py-3 rounded-xl flex-shrink-0"
                >
                  <Wallet size={18} className="mr-2" />
                  Generate Wallet
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Has Wallet - Show Balance */
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
                      <img src="images/usdc-logo.png" alt="USDC" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <p className="font-semibold">USDC Balance</p>
                      <p className="text-white/60 text-sm flex items-center gap-1">
                        <img src="images/solana-logo.png" alt="Solana" className="w-4 h-4 object-contain" />
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
        )}
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
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${getTransactionBg(tx.type)}`}>
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {tx.type === 'receive' ? `Received from ${tx.from}` : 
                     tx.type === 'send' ? `Sent to ${tx.to}` : 
                     tx.from && tx.to ? `Converted ${tx.from} to ${tx.to}` : tx.description || 'Currency Conversion'}
                  </p>
                  <p className="text-gray-400 text-xs font-medium tracking-wide uppercase mt-0.5">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm
                  ${tx.type === 'receive' ? 'text-emerald-600' : 
                    tx.type === 'send' ? 'text-slate-700' : 'text-gray-900'}`}>
                  {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                  {tx.type === 'convert' ? '' : '₦'}
                  {tx.amount.toLocaleString()}
                </p>
                <p className="text-emerald-600 text-xs font-medium">{tx.status}</p>
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
