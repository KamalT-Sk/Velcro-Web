import { useState, useEffect } from 'react';
import { 
  Copy, 
  ExternalLink,
  TrendingUp,
  Info,
  AlertCircle,
  Lock,
  ChevronDown,
  Check,
  Timer,
  Building2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Wallet,
  CircleDollarSign,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { UserKYC } from '@/App';

interface Token {
  symbol: string;
  name: string;
  balance: number;
  value: number;
}

const tokens: Token[] = [
  { symbol: 'USDC', name: 'USD Coin', balance: 1250.00, value: 1250.00 },
];

const supportedChains = [
  { name: 'Solana', logo: '/images/solana-logo.png', tokens: ['USDC', 'USDT'] },
  { name: 'Ethereum', logo: '/images/solana-logo.png', tokens: ['USDC', 'USDT'] },
  { name: 'BSC', logo: '/images/solana-logo.png', tokens: ['USDC', 'USDT', 'CNGN'] },
  { name: 'Polygon', logo: '/images/solana-logo.png', tokens: ['USDC', 'USDT'] },
  { name: 'Arbitrum', logo: '/images/solana-logo.png', tokens: ['USDC', 'USDT'] },
  { name: 'Base', logo: '/images/solana-logo.png', tokens: ['USDC', 'USDT'] },
  { name: 'Tron', logo: '/images/solana-logo.png', tokens: ['USDT'] },
];

const supportedTokens = [
  { symbol: 'USDC', name: 'USD Coin', logo: '/images/usdc-logo.png' },
  { symbol: 'USDT', name: 'Tether', logo: '/images/usdc-logo.png' },
  { symbol: 'CNGN', name: 'CNGN Stable', logo: '/images/usdc-logo.png' },
];

interface CryptoTransaction {
  id: number;
  type: 'buy' | 'sell' | 'swap' | 'receive' | 'send';
  token?: string;
  from?: string;
  to?: string;
  amount: number;
  value: number;
  date: string;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  txHash?: string;
  fee?: number;
}

const recentCryptoTransactions: CryptoTransaction[] = [
  { id: 1, type: 'buy', token: 'USDC', amount: 500, value: 500, date: 'Today, 10:30 AM', status: 'completed', txHash: '0x7a8b...9c2d', fee: 2.5 },
  { id: 2, type: 'swap', token: 'USDT', from: 'USDT', to: 'USDC', amount: 200, value: 200, date: 'Yesterday, 3:45 PM', status: 'processing', txHash: '0x3f4e...5a6b', fee: 1.0 },
  { id: 3, type: 'receive', token: 'USDC', amount: 250, value: 250, from: 'External Wallet', date: 'Mar 28, 2024', status: 'completed', txHash: '0x9g0h...1i2j', fee: 0 },
  { id: 4, type: 'sell', token: 'USDC', amount: 100, value: 100, date: 'Mar 27, 2024', status: 'failed', fee: 0 },
];

interface CryptoHubProps {
  userKYC: UserKYC;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TimerType = ReturnType<typeof setInterval>;

export function CryptoHub({ userKYC }: CryptoHubProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'buy' | 'sell' | 'swap'>('wallet');
  const [showBalance, setShowBalance] = useState(true);
  
  // BUY state
  const [buyDestination, setBuyDestination] = useState<'external' | 'main'>('external');
  const [buyToken, setBuyToken] = useState('USDC');
  const [buyChain, setBuyChain] = useState('Ethereum');
  const [buyExternalAddress, setBuyExternalAddress] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [showBuyTokenSelect, setShowBuyTokenSelect] = useState(false);
  const [showBuyChainSelect, setShowBuyChainSelect] = useState(false);
  
  // SELL state
  const [sellSource, setSellSource] = useState<'main' | 'external'>('main');
  const [sellAmount, setSellAmount] = useState('');
  const [sellNGNDestination, setSellNGNDestination] = useState<'main' | 'external'>('main');
  const [externalSellToken, setExternalSellToken] = useState('USDC');
  const [externalSellChain, setExternalSellChain] = useState('Ethereum');
  const [externalSellTempAddress, setExternalSellTempAddress] = useState('');
  const [externalSellTimeLeft, setExternalSellTimeLeft] = useState(1800);
  const [externalSellGenerated, setExternalSellGenerated] = useState(false);
  const [showExternalSellTokenSelect, setShowExternalSellTokenSelect] = useState(false);
  const [showExternalSellChainSelect, setShowExternalSellChainSelect] = useState(false);
  
  // SWAP state
  const [swapFromToken, setSwapFromToken] = useState('USDT');
  const [swapFromChain, setSwapFromChain] = useState('Ethereum');
  const [swapFromAmount, setSwapFromAmount] = useState('');
  const [swapToAmount, setSwapToAmount] = useState('');
  const [swapFromAddress, setSwapFromAddress] = useState('');
  const [swapTempAddress, setSwapTempAddress] = useState('');
  const [swapGenerated, setSwapGenerated] = useState(false);
  const [swapTimeLeft, setSwapTimeLeft] = useState(1800);
  const [showSwapFromTokenSelect, setShowSwapFromTokenSelect] = useState(false);
  const [showSwapFromChainSelect, setShowSwapFromChainSelect] = useState(false);
  
  // Transaction detail modal
  const [selectedTransaction, setSelectedTransaction] = useState<CryptoTransaction | null>(null);

  const totalCryptoValue = tokens.reduce((acc, token) => acc + token.value, 0);
  const remainingLimit = userKYC.cryptoLimit - totalCryptoValue;

  // Buy/Sell rates
  const buyRate = 1500; // NGN per USDC
  const sellRate = 1480; // NGN per USDC

  // Timer for external sell address
  useEffect(() => {
    let interval: TimerType;
    if (externalSellGenerated && externalSellTimeLeft > 0) {
      interval = setInterval(() => {
        setExternalSellTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (externalSellTimeLeft === 0) {
      setExternalSellGenerated(false);
      setExternalSellTempAddress('');
    }
    return () => clearInterval(interval);
  }, [externalSellGenerated, externalSellTimeLeft]);

  // Timer for swap address
  useEffect(() => {
    let interval: TimerType;
    if (swapGenerated && swapTimeLeft > 0) {
      interval = setInterval(() => {
        setSwapTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (swapTimeLeft === 0) {
      setSwapGenerated(false);
      setSwapTempAddress('');
    }
    return () => clearInterval(interval);
  }, [swapGenerated, swapTimeLeft]);

  const copyAddress = () => {
    navigator.clipboard.writeText('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    toast.success('Wallet address copied!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateFee = (amount: number) => amount * 0.005;

  const calculateSwapOutput = (input: string) => {
    const inputNum = Number(input);
    if (!inputNum) return '';
    const fee = calculateFee(inputNum);
    return (inputNum - fee).toFixed(2);
  };

  const handleSwapFromChange = (value: string) => {
    setSwapFromAmount(value);
    setSwapToAmount(calculateSwapOutput(value));
  };

  // BUY: User buys crypto to external wallet OR to main wallet
  const handleBuy = () => {
    const amount = Number(buyAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (buyDestination === 'external') {
      if (!buyExternalAddress) {
        toast.error('Please enter your external wallet address');
        return;
      }
      toast.success(`Buying ${amount} ${buyToken} on ${buyChain} to your external wallet: ${buyExternalAddress}`);
    } else {
      toast.success(`Buying ${amount} USDC to your main Solana wallet!`);
    }
    setBuyAmount('');
    setBuyExternalAddress('');
  };

  // SELL from main wallet: Sell USDC on Solana to NGN
  const handleMainSell = () => {
    const amount = Number(sellAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > totalCryptoValue) {
      toast.error('Insufficient USDC balance');
      return;
    }
    if (userKYC.tier === 'none' && amount > remainingLimit) {
      toast.error(`Exceeds your $${userKYC.cryptoLimit} limit. Complete KYC for higher limits.`);
      return;
    }
    
    const destination = sellNGNDestination === 'main' ? 'main NGN account' : 'external NGN account';
    const fee = calculateFee(amount);
    toast.success(`Selling $${amount} USDC from main wallet. Fee: $${fee.toFixed(2)} (0.5%). NGN will be credited to your ${destination}.`);
    setSellAmount('');
  };

  // Generate temporary address for external sell
  const generateExternalSellAddress = () => {
    const prefixes: Record<string, string> = {
      'Solana': '7xK',
      'Ethereum': '0x',
      'BSC': '0x',
      'Polygon': '0x',
      'Arbitrum': '0x',
      'Base': '0x',
      'Tron': 'T',
    };
    const prefix = prefixes[externalSellChain] || '0x';
    const randomChars = Array(40).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    const tempAddr = prefix + randomChars;
    
    setExternalSellTempAddress(tempAddr);
    setExternalSellGenerated(true);
    setExternalSellTimeLeft(1800);
    toast.success(`Temporary ${externalSellToken} address generated on ${externalSellChain}. Expires in 30 minutes.`);
  };

  // Generate temporary address for swap
  const generateSwapAddress = () => {
    if (!swapFromAddress) {
      toast.error('Please enter your external wallet address');
      return;
    }
    const prefixes: Record<string, string> = {
      'Solana': '7xK',
      'Ethereum': '0x',
      'BSC': '0x',
      'Polygon': '0x',
      'Arbitrum': '0x',
      'Base': '0x',
      'Tron': 'T',
    };
    const prefix = prefixes[swapFromChain] || '0x';
    const randomChars = Array(40).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    const tempAddr = prefix + randomChars;
    
    setSwapTempAddress(tempAddr);
    setSwapGenerated(true);
    setSwapTimeLeft(1800);
    toast.success(`Temporary deposit address generated. Send ${swapFromToken} from ${swapFromAddress} to this address.`);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownLeft size={18} className="text-green-600" />;
      case 'sell':
        return <ArrowUpRight size={18} className="text-red-600" />;
      case 'receive':
        return <CircleDollarSign size={18} className="text-blue-600" />;
      case 'swap':
        return <Repeat size={18} className="text-purple-600" />;
      default:
        return <CircleDollarSign size={18} className="text-gray-600" />;
    }
  };

  const getTransactionBg = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100';
      case 'sell':
        return 'bg-red-100';
      case 'receive':
        return 'bg-blue-100';
      case 'swap':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Stable Coin Hub</h1>
          <p className="text-gray-500 text-sm">USDC on Solana - Your main digital asset</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
          <Wallet size={16} className="text-purple-600" />
          <span className="text-xs text-purple-700 font-medium">Powered by Solana</span>
        </div>
      </div>

      {/* Non-KYC Limit Banner */}
      {userKYC.tier === 'none' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Crypto Limits Apply</p>
              <p className="text-xs text-amber-600 mt-1">
                You can trade up to <span className="font-semibold">${userKYC.cryptoLimit}</span> in crypto without KYC. 
                Remaining: <span className="font-semibold">${remainingLimit.toFixed(2)}</span>
              </p>
            </div>
            <button className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-800 text-xs font-medium rounded-lg transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Buy/Sell Rates Banner */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-red-50 border border-gray-100 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Current Rates</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowDownLeft size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">Buy: ₦{buyRate.toLocaleString()}</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <ArrowUpRight size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-700">Sell: ₦{sellRate.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Crypto Card - USDC Only */}
      <div className="usdc-card rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CircleDollarSign size={32} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">USDC Balance</p>
                <p className="text-3xl font-display font-bold">
                  {showBalance ? `$${totalCryptoValue.toLocaleString()}` : '****'}
                </p>
                <p className="text-white/60 text-sm">≈ ₦1,875,000 NGN</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm flex items-center gap-2">
                <Wallet size={14} className="text-white/80" />
                <span className="text-xs font-medium">Solana</span>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <TrendingUp size={18} className="text-white/70" />
              </button>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Your Solana Wallet Address</p>
                <p className="font-mono text-sm hidden sm:block">7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU</p>
                <p className="font-mono text-sm sm:hidden">7xKX...sAsU</p>
              </div>
              <button 
                onClick={copyAddress}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={() => setActiveTab('buy')}
              className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <ArrowDownLeft size={20} />
              <span className="text-xs">Buy</span>
            </button>
            <button 
              onClick={() => setActiveTab('sell')}
              className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <ArrowUpRight size={20} />
              <span className="text-xs">Sell</span>
            </button>
            <button 
              onClick={() => setActiveTab('swap')}
              className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <Repeat size={20} />
              <span className="text-xs">Swap</span>
            </button>
            <button 
              onClick={() => toast.info('Send feature coming soon!')}
              className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <ExternalLink size={20} />
              <span className="text-xs">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
        <Info size={18} className="text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">USDC on Solana is your main asset</p>
          <p className="text-xs text-blue-600 mt-1">
            All crypto transactions have a 0.5% processing fee with no cap.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {[
          { id: 'wallet', label: 'Wallet', icon: Wallet },
          { id: 'buy', label: 'Buy', icon: ArrowDownLeft },
          { id: 'sell', label: 'Sell', icon: ArrowUpRight },
          { id: 'swap', label: 'Swap', icon: Repeat },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">Your Assets</h2>
          <div className="grid gap-3">
            {tokens.map((token) => (
              <div 
                key={token.symbol}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:border-gray-200 hover:shadow-soft transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src="/logos/usdc.png" alt="USDC" className="w-12 h-12 rounded-xl" />
                  <div>
                    <p className="font-semibold text-gray-900">{token.symbol}</p>
                    <p className="text-gray-500 text-sm">{token.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                        <img src="/logos/solana.png" alt="Solana" className="w-3 h-3" />
                        Solana
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {showBalance ? `$${token.value.toLocaleString()}` : '****'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {token.balance.toLocaleString()} {token.symbol}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Supported Chains */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Supported Chains</h3>
            <div className="flex flex-wrap gap-2">
              {supportedChains.map((chain) => (
                <div 
                  key={chain.name}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl"
                >
                  <img src={chain.logo} alt={chain.name} className="w-5 h-5" />
                  <span className="text-sm text-gray-700">{chain.name}</span>
                  <span className="text-xs text-gray-400">{chain.tokens.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BUY */}
      {activeTab === 'buy' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowDownLeft size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900">Buy Crypto</h2>
              <p className="text-gray-500 text-sm">Purchase crypto to your wallet</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Destination Selection */}
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Destination</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBuyDestination('external')}
                  className={`p-4 rounded-xl border-2 transition-all text-left
                    ${buyDestination === 'external' 
                      ? 'border-velcro-green bg-velcro-green/5' 
                      : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet size={18} className={buyDestination === 'external' ? 'text-velcro-green' : 'text-gray-400'} />
                    <span className={`font-medium ${buyDestination === 'external' ? 'text-gray-900' : 'text-gray-600'}`}>
                      External Wallet
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Any blockchain address</p>
                </button>
                <button
                  onClick={() => setBuyDestination('main')}
                  className={`p-4 rounded-xl border-2 transition-all text-left
                    ${buyDestination === 'main' 
                      ? 'border-velcro-green bg-velcro-green/5' 
                      : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CircleDollarSign size={18} className={buyDestination === 'main' ? 'text-velcro-green' : 'text-gray-400'} />
                    <span className={`font-medium ${buyDestination === 'main' ? 'text-gray-900' : 'text-gray-600'}`}>
                      Main Wallet
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">USDC on Solana</p>
                </button>
              </div>
            </div>

            {/* Token Selection (only for external) */}
            {buyDestination === 'external' && (
              <>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Select Token</Label>
                  <div className="relative">
                    <button
                      onClick={() => setShowBuyTokenSelect(!showBuyTokenSelect)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={supportedTokens.find(t => t.symbol === buyToken)?.logo} 
                          alt={buyToken} 
                          className="w-8 h-8 rounded-lg" 
                        />
                        <span className="font-medium">{buyToken}</span>
                      </div>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>
                    
                    {showBuyTokenSelect && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                        {supportedTokens.map((token) => (
                          <button
                            key={token.symbol}
                            onClick={() => {
                              setBuyToken(token.symbol);
                              setShowBuyTokenSelect(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-lg" />
                            <div className="text-left">
                              <p className="font-medium text-sm">{token.symbol}</p>
                              <p className="text-xs text-gray-500">{token.name}</p>
                            </div>
                            {buyToken === token.symbol && <Check size={16} className="ml-auto text-velcro-green" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chain Selection */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Select Blockchain</Label>
                  <div className="relative">
                    <button
                      onClick={() => setShowBuyChainSelect(!showBuyChainSelect)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={supportedChains.find(c => c.name === buyChain)?.logo} alt={buyChain} className="w-6 h-6" />
                        <span className="font-medium">{buyChain}</span>
                      </div>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>
                    
                    {showBuyChainSelect && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-auto">
                        {supportedChains.filter(c => c.tokens.includes(buyToken)).map((chain) => (
                          <button
                            key={chain.name}
                            onClick={() => {
                              setBuyChain(chain.name);
                              setShowBuyChainSelect(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <img src={chain.logo} alt={chain.name} className="w-6 h-6" />
                            <span className="font-medium text-sm">{chain.name}</span>
                            {buyChain === chain.name && <Check size={16} className="ml-auto text-velcro-green" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* External Wallet Address */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Your External Wallet Address</Label>
                  <Input
                    type="text"
                    placeholder={`Enter your ${buyChain} address`}
                    value={buyExternalAddress}
                    onChange={(e) => setBuyExternalAddress(e.target.value)}
                    className="py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl font-mono text-sm"
                  />
                </div>
              </>
            )}

            {/* Amount */}
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="pl-10 py-6 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                />
              </div>
              {buyAmount && (
                <p className="text-velcro-green font-medium text-sm mt-2">
                  ≈ ₦{(Number(buyAmount) * buyRate).toLocaleString()} NGN will be debited
                </p>
              )}
            </div>

            {/* Fee Info */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Processing Fee (0.5%)</span>
                <span className="font-medium text-gray-900">
                  ${buyAmount ? calculateFee(Number(buyAmount)).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">
                  ${buyAmount ? (Number(buyAmount) + calculateFee(Number(buyAmount))).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <Button 
              onClick={handleBuy}
              className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
            >
              Buy {buyDestination === 'main' ? 'USDC (Solana)' : `${buyToken} (${buyChain})`}
            </Button>
          </div>
        </div>
      )}

      {/* SELL */}
      {activeTab === 'sell' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900">Sell Crypto</h2>
              <p className="text-gray-500 text-sm">Sell crypto and receive NGN</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Source Selection */}
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Source</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSellSource('main')}
                  className={`p-4 rounded-xl border-2 transition-all text-left
                    ${sellSource === 'main' 
                      ? 'border-velcro-green bg-velcro-green/5' 
                      : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CircleDollarSign size={18} className={sellSource === 'main' ? 'text-velcro-green' : 'text-gray-400'} />
                    <span className={`font-medium ${sellSource === 'main' ? 'text-gray-900' : 'text-gray-600'}`}>
                      Main Wallet
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">USDC on Solana</p>
                  <p className="text-xs text-velcro-green mt-1">${totalCryptoValue.toLocaleString()} available</p>
                </button>
                <button
                  onClick={() => setSellSource('external')}
                  className={`p-4 rounded-xl border-2 transition-all text-left
                    ${sellSource === 'external' 
                      ? 'border-velcro-green bg-velcro-green/5' 
                      : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet size={18} className={sellSource === 'external' ? 'text-velcro-green' : 'text-gray-400'} />
                    <span className={`font-medium ${sellSource === 'external' ? 'text-gray-900' : 'text-gray-600'}`}>
                      External Wallet
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Send from any blockchain</p>
                </button>
              </div>
            </div>

            {/* MAIN WALLET SELL */}
            {sellSource === 'main' && (
              <>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Amount (USDC)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="pl-10 py-6 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                    />
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    ≈ ₦{sellAmount ? (Number(sellAmount) * sellRate).toLocaleString() : '0'} NGN
                  </p>
                </div>

                {/* NGN Destination Selection */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">NGN Destination</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSellNGNDestination('main')}
                      className={`p-4 rounded-xl border-2 transition-all text-left
                        ${sellNGNDestination === 'main' 
                          ? 'border-velcro-green bg-velcro-green/5' 
                          : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🇳🇬</span>
                        <span className={`font-medium ${sellNGNDestination === 'main' ? 'text-gray-900' : 'text-gray-600'}`}>
                          Main NGN Account
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">9PSB - **** 6789</p>
                    </button>
                    <button
                      onClick={() => setSellNGNDestination('external')}
                      className={`p-4 rounded-xl border-2 transition-all text-left
                        ${sellNGNDestination === 'external' 
                          ? 'border-velcro-green bg-velcro-green/5' 
                          : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 size={18} className={sellNGNDestination === 'external' ? 'text-velcro-green' : 'text-gray-400'} />
                        <span className={`font-medium ${sellNGNDestination === 'external' ? 'text-gray-900' : 'text-gray-600'}`}>
                          External Account
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Any Nigerian bank</p>
                    </button>
                  </div>
                </div>

                {/* External NGN Account Details */}
                {sellNGNDestination === 'external' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Bank Name</Label>
                      <Input type="text" placeholder="Enter bank name" className="py-3 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Account Number</Label>
                      <Input type="text" placeholder="Enter account number" className="py-3 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Account Name</Label>
                      <Input type="text" placeholder="Enter account name" className="py-3 rounded-xl" />
                    </div>
                  </div>
                )}

                {/* Fee Info */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Exchange Rate</span>
                    <span className="font-medium text-gray-900">1 USDC = ₦{sellRate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Processing Fee (0.5%)</span>
                    <span className="font-medium text-gray-900">${sellAmount ? calculateFee(Number(sellAmount)).toFixed(2) : '0.00'}</span>
                  </div>
                </div>

                {userKYC.tier === 'none' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-700 text-sm">
                      <Lock size={14} />
                      <span>Limit: ${userKYC.cryptoLimit} without KYC</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleMainSell}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl"
                >
                  Sell USDC
                </Button>
              </>
            )}

            {/* EXTERNAL WALLET SELL */}
            {sellSource === 'external' && (
              <>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Select Token to Send</Label>
                  <div className="relative">
                    <button
                      onClick={() => setShowExternalSellTokenSelect(!showExternalSellTokenSelect)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CircleDollarSign size={18} className="text-blue-600" />
                        </div>
                        <span className="font-medium">{externalSellToken}</span>
                      </div>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>
                    
                    {showExternalSellTokenSelect && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                        {supportedTokens.map((token) => (
                          <button
                            key={token.symbol}
                            onClick={() => {
                              setExternalSellToken(token.symbol);
                              setShowExternalSellTokenSelect(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CircleDollarSign size={18} className="text-blue-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">{token.symbol}</p>
                              <p className="text-xs text-gray-500">{token.name}</p>
                            </div>
                            {externalSellToken === token.symbol && <Check size={16} className="ml-auto text-velcro-green" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Select Blockchain</Label>
                  <div className="relative">
                    <button
                      onClick={() => setShowExternalSellChainSelect(!showExternalSellChainSelect)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={supportedChains.find(c => c.name === externalSellChain)?.logo} alt={externalSellChain} className="w-6 h-6" />
                        <span className="font-medium">{externalSellChain}</span>
                      </div>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>
                    
                    {showExternalSellChainSelect && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-auto">
                        {supportedChains.filter(c => c.tokens.includes(externalSellToken)).map((chain) => (
                          <button
                            key={chain.name}
                            onClick={() => {
                              setExternalSellChain(chain.name);
                              setShowExternalSellChainSelect(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <img src={chain.logo} alt={chain.name} className="w-6 h-6" />
                            <span className="font-medium text-sm">{chain.name}</span>
                            {externalSellChain === chain.name && <Check size={16} className="ml-auto text-velcro-green" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* NGN Destination Selection */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">NGN Destination</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSellNGNDestination('main')}
                      className={`p-4 rounded-xl border-2 transition-all text-left
                        ${sellNGNDestination === 'main' 
                          ? 'border-velcro-green bg-velcro-green/5' 
                          : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🇳🇬</span>
                        <span className={`font-medium ${sellNGNDestination === 'main' ? 'text-gray-900' : 'text-gray-600'}`}>
                          Main NGN Account
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">9PSB - **** 6789</p>
                    </button>
                    <button
                      onClick={() => setSellNGNDestination('external')}
                      className={`p-4 rounded-xl border-2 transition-all text-left
                        ${sellNGNDestination === 'external' 
                          ? 'border-velcro-green bg-velcro-green/5' 
                          : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 size={18} className={sellNGNDestination === 'external' ? 'text-velcro-green' : 'text-gray-400'} />
                        <span className={`font-medium ${sellNGNDestination === 'external' ? 'text-gray-900' : 'text-gray-600'}`}>
                          External Account
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Any Nigerian bank</p>
                    </button>
                  </div>
                </div>

                {/* External NGN Account Details */}
                {sellNGNDestination === 'external' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Bank Name</Label>
                      <Input type="text" placeholder="Enter bank name" className="py-3 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Account Number</Label>
                      <Input type="text" placeholder="Enter account number" className="py-3 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Account Name</Label>
                      <Input type="text" placeholder="Enter account name" className="py-3 rounded-xl" />
                    </div>
                  </div>
                )}

                {/* Generate Temporary Address */}
                {!externalSellGenerated ? (
                  <Button 
                    onClick={generateExternalSellAddress}
                    className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                  >
                    <RefreshCw size={18} className="mr-2" />
                    Generate Temporary Address
                  </Button>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-green-800">Temporary Address</span>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Timer size={14} />
                        <span className="text-xs font-medium">{formatTime(externalSellTimeLeft)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl">
                      <span className="flex-1 font-mono text-sm text-gray-700 break-all">{externalSellTempAddress}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(externalSellTempAddress);
                          toast.success('Address copied!');
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Copy size={16} className="text-gray-500" />
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-3">
                      Send {externalSellToken} on {externalSellChain} to this address. 
                      Your selected NGN account will be credited instantly upon confirmation.
                    </p>
                  </div>
                )}

                {/* Fee Info */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Exchange Rate</span>
                    <span className="font-medium text-gray-900">1 {externalSellToken} = ₦{sellRate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Processing Fee (0.5%)</span>
                    <span className="font-medium text-gray-900">No cap</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SWAP */}
      {activeTab === 'swap' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Repeat size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900">Swap Tokens</h2>
              <p className="text-gray-500 text-sm">Swap from any chain to your main USDC wallet</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* From Section */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm text-gray-600 mb-2 block">From (Your External Wallet)</Label>
              
              {/* Token Selection */}
              <div className="mb-3">
                <div className="relative">
                  <button
                    onClick={() => setShowSwapFromTokenSelect(!showSwapFromTokenSelect)}
                    className="w-full flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CircleDollarSign size={14} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-sm">{swapFromToken}</span>
                    <ChevronDown size={14} className="text-gray-400 ml-auto" />
                  </button>
                  
                  {showSwapFromTokenSelect && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {supportedTokens.map((token) => (
                        <button
                          key={token.symbol}
                          onClick={() => {
                            setSwapFromToken(token.symbol);
                            setShowSwapFromTokenSelect(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-50"
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CircleDollarSign size={14} className="text-blue-600" />
                          </div>
                          <span className="text-sm">{token.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chain Selection */}
              <div className="mb-3">
                <div className="relative">
                  <button
                    onClick={() => setShowSwapFromChainSelect(!showSwapFromChainSelect)}
                    className="w-full flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <img src={supportedChains.find(c => c.name === swapFromChain)?.logo} alt={swapFromChain} className="w-5 h-5" />
                    <span className="font-medium text-sm">{swapFromChain}</span>
                    <ChevronDown size={14} className="text-gray-400 ml-auto" />
                  </button>
                  
                  {showSwapFromChainSelect && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-auto">
                      {supportedChains.filter(c => c.tokens.includes(swapFromToken)).map((chain) => (
                        <button
                          key={chain.name}
                          onClick={() => {
                            setSwapFromChain(chain.name);
                            setShowSwapFromChainSelect(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-50"
                        >
                          <img src={chain.logo} alt={chain.name} className="w-5 h-5" />
                          <span className="text-sm">{chain.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* External Wallet Address */}
              <Input
                type="text"
                placeholder={`Enter your ${swapFromChain} address`}
                value={swapFromAddress}
                onChange={(e) => setSwapFromAddress(e.target.value)}
                className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl font-mono text-sm"
              />
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center">
              <div className="p-2 bg-gray-100 rounded-full">
                <ArrowDownLeft size={20} className="text-gray-500" />
              </div>
            </div>

            {/* To Section */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm text-gray-600 mb-2 block">To (Your Main Wallet)</Label>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CircleDollarSign size={14} className="text-blue-600" />
                </div>
                <span className="font-medium">USDC</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                  <Wallet size={12} />
                  Solana
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <p className="font-mono text-sm text-gray-700 hidden sm:block">7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU</p>
                <p className="font-mono text-sm text-gray-700 sm:hidden">7xKX...sAsU</p>
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Amount to Swap</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={swapFromAmount}
                  onChange={(e) => handleSwapFromChange(e.target.value)}
                  className="pl-10 py-5 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                />
              </div>
            </div>

            {/* Generate Address or Show Generated */}
            {!swapGenerated ? (
              <Button 
                onClick={generateSwapAddress}
                className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              >
                <RefreshCw size={18} className="mr-2" />
                Generate Deposit Address
              </Button>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-green-800">Deposit Address</span>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Timer size={14} />
                    <span className="text-xs font-medium">{formatTime(swapTimeLeft)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl">
                  <span className="flex-1 font-mono text-sm text-gray-700 break-all">{swapTempAddress}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(swapTempAddress);
                      toast.success('Address copied!');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Copy size={16} className="text-gray-500" />
                  </button>
                </div>
                <p className="text-xs text-green-700 mt-3">
                  Send {swapFromToken} from your {swapFromChain} wallet to this address. 
                  You will receive {swapToAmount} USDC on Solana.
                </p>
              </div>
            )}

            {/* Fee Info */}
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-blue-700">You Send</span>
                <span className="font-medium text-blue-800">{swapFromAmount || '0.00'} {swapFromToken}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-blue-700">Swap Fee (0.5%)</span>
                <span className="font-medium text-blue-800">${swapFromAmount ? calculateFee(Number(swapFromAmount)).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">You Receive</span>
                <span className="font-bold text-blue-800">{swapToAmount || '0.00'} USDC</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Crypto Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            View All
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {recentCryptoTransactions.map((tx, index) => (
            <button 
              key={tx.id}
              onClick={() => setSelectedTransaction(tx)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left
                ${index !== recentCryptoTransactions.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTransactionBg(tx.type)}`}>
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 capitalize">
                    {tx.type === 'swap' ? `Swapped ${tx.from} to ${tx.to}` : 
                     tx.type === 'receive' ? `Received ${tx.token}` : `${tx.type} ${tx.token}`}
                  </p>
                  <p className="text-gray-400 text-xs">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-gray-900">
                  {tx.type === 'swap' ? `${tx.amount} ${tx.from}` : 
                   tx.type === 'receive' ? `+${tx.amount} ${tx.token}` : 
                   `$${tx.value?.toLocaleString()}`}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full
                  ${tx.status === 'completed' ? 'bg-green-100 text-green-600' : 
                    tx.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                    tx.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'}`}>
                  {tx.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedTransaction(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-gray-900">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-medium
                  ${selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-600' : 
                    selectedTransaction.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                    selectedTransaction.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'}`}>
                  {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                </span>
              </div>
              
              {/* Amount */}
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-gray-900">
                  ${selectedTransaction.value.toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm capitalize">{selectedTransaction.type} {selectedTransaction.token}</p>
              </div>
              
              {/* Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Transaction ID</span>
                  <span className="font-mono text-sm">#{selectedTransaction.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Date</span>
                  <span className="text-sm">{selectedTransaction.date}</span>
                </div>
                {selectedTransaction.txHash && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Transaction Hash</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{selectedTransaction.txHash}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTransaction.txHash || '');
                          toast.success('Copied!');
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Fee</span>
                  <span className="text-sm">${selectedTransaction.fee?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              
              {/* Contact Support */}
              <Button
                variant="outline"
                onClick={() => toast.info('Support chat opening...')}
                className="w-full border-gray-200 hover:bg-gray-50 h-12 rounded-xl"
              >
                <MessageCircle size={18} className="mr-2 text-green-600" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
