import { useState, useEffect } from 'react';
import { 
  Copy, 
  ExternalLink,
  Info,
  AlertCircle,
  ChevronDown,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  RefreshCw,
  Timer,
  Building2,
  Landmark,
  Send,
  History,
  ArrowRightLeft,
  X,
  Hash,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { UserKYC } from '@/App';

const EXTERNAL_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', logo: 'images/usdc-logo.png' },
  { symbol: 'USDT', name: 'Tether USD', logo: 'logos/usdt.png' },
  { symbol: 'CNGN', name: 'CNGN Stable', logo: 'logos/cngn.png' },
];

const BLOCKCHAINS = [
  { name: 'Solana', logo: 'images/solana-logo.png', tokens: ['USDC', 'USDT'] },
  { name: 'Ethereum', logo: 'logos/ethereum.png', tokens: ['USDC', 'USDT'] },
  { name: 'BSC', logo: 'logos/bsc.png', tokens: ['USDC', 'USDT', 'CNGN'] },
  { name: 'Polygon', logo: 'logos/polygon.png', tokens: ['USDC', 'USDT'] },
  { name: 'Arbitrum', logo: 'logos/arbitrum.png', tokens: ['USDC', 'USDT'] },
  { name: 'Base', logo: 'logos/base.png', tokens: ['USDC', 'USDT'] },
  { name: 'Tron', logo: 'logos/tron.png', tokens: ['USDT'] },
];

const NIGERIAN_BANKS = [
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

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'send' | 'receive';
  amount: number;
  token: string;
  chain?: string;
  ngnAmount?: number;
  address?: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  timestamp: string;
  reference: string;
  fee: number;
}

const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'buy',
    amount: 500,
    token: 'USDC',
    chain: 'Solana',
    ngnAmount: 750000,
    status: 'completed',
    timestamp: '2024-04-07T10:30:00',
    reference: 'VEL-BUY-001',
    fee: 2.5,
  },
  {
    id: 'tx2',
    type: 'sell',
    amount: 200,
    token: 'USDC',
    ngnAmount: 296000,
    status: 'completed',
    timestamp: '2024-04-06T14:20:00',
    reference: 'VEL-SELL-002',
    fee: 1.0,
  },
  {
    id: 'tx3',
    type: 'send',
    amount: 150,
    token: 'USDC',
    chain: 'Ethereum',
    address: '0x1234...5678',
    status: 'completed',
    timestamp: '2024-04-05T09:15:00',
    reference: 'VEL-SEND-003',
    fee: 0.75,
  },
];

interface OneTimeAddress {
  address: string;
  chain: string;
  token: string;
  expiresAt: number;
  reference: string;
}

interface CryptoHubProps {
  userKYC: UserKYC;
  onOpenKYC: () => void;
}

type TimerType = ReturnType<typeof setInterval>;

export function CryptoHub({ userKYC, onOpenKYC }: CryptoHubProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'buy' | 'sell' | 'send' | 'history'>('wallet');
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [solanaBalance, setSolanaBalance] = useState(1250.00);
  const solanaAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
  
  const buyRate = 1500;
  const sellRate = 1480;
  
  // BUY state
  const [buyMode, setBuyMode] = useState<'main' | 'external'>('main');
  const [buyAmount, setBuyAmount] = useState('');
  const [buyInputCurrency, setBuyInputCurrency] = useState<'usd' | 'ngn'>('usd');
  
  // Display amount in selected currency
  const displayBuyAmount = buyInputCurrency === 'usd' 
    ? buyAmount 
    : (buyAmount ? (Number(buyAmount) * buyRate).toFixed(2) : '');
  
  const handleBuyAmountChange = (value: string) => {
    if (buyInputCurrency === 'usd') {
      setBuyAmount(value);
    } else {
      // Convert NGN input to USD
      const ngnAmount = Number(value);
      setBuyAmount(ngnAmount > 0 ? (ngnAmount / buyRate).toFixed(2) : '');
    }
    setBuyOneTimeAddress(null);
  };
  const [buyExternalToken, setBuyExternalToken] = useState('USDC');
  const [buyExternalChain, setBuyExternalChain] = useState('Ethereum');
  const [buyExternalAddress, setBuyExternalAddress] = useState('');
  const [showBuyTokenSelect, setShowBuyTokenSelect] = useState(false);
  const [showBuyChainSelect, setShowBuyChainSelect] = useState(false);
  const [buyOneTimeAddress, setBuyOneTimeAddress] = useState<OneTimeAddress | null>(null);
  const [buyTimeLeft, setBuyTimeLeft] = useState(1800);
  const [isGeneratingBuyAddress, setIsGeneratingBuyAddress] = useState(false);
  
  // SELL state
  const [sellMode, setSellMode] = useState<'main' | 'external'>('main');
  const [sellAmount, setSellAmount] = useState('');
  const [sellNGNDestination, setSellNGNDestination] = useState<'main' | 'external'>('main');
  const [sellExternalToken, setSellExternalToken] = useState('USDC');
  const [sellExternalChain, setSellExternalChain] = useState('Ethereum');
  const [showSellTokenSelect, setShowSellTokenSelect] = useState(false);
  const [showSellChainSelect, setShowSellChainSelect] = useState(false);
  const [externalBankCode, setExternalBankCode] = useState('');
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [externalAccountNumber, setExternalAccountNumber] = useState('');
  const [externalAccountName, setExternalAccountName] = useState('');
  const [sellOneTimeAddress, setSellOneTimeAddress] = useState<OneTimeAddress | null>(null);
  const [sellTimeLeft, setSellTimeLeft] = useState(1800);
  const [isGeneratingSellAddress, setIsGeneratingSellAddress] = useState(false);
  
  // SEND state (main wallet only - USDC on Solana)
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  
  // Confirmation + PIN flow state
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const [showBuyPin, setShowBuyPin] = useState(false);
  const [showSellConfirm, setShowSellConfirm] = useState(false);
  const [showSellPin, setShowSellPin] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showSendPin, setShowSendPin] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [processingAction, setProcessingAction] = useState(false);
  
  const remainingLimit = userKYC?.cryptoLimit ? userKYC.cryptoLimit - solanaBalance : 100 - solanaBalance;

  // Auto-verify bank account when 10 digits entered
  useEffect(() => {
    if (sellNGNDestination === 'external' && externalAccountNumber.length === 10 && externalBankCode && !externalAccountName) {
      // Simulate bank verification
      const timer = setTimeout(() => {
        setExternalAccountName('SHEHU KAMAL');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [externalAccountNumber, externalBankCode, sellNGNDestination, externalAccountName]);

  useEffect(() => {
    let interval: TimerType;
    if (buyOneTimeAddress && buyTimeLeft > 0) {
      interval = setInterval(() => {
        setBuyTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (buyTimeLeft === 0) {
      setBuyOneTimeAddress(null);
    }
    return () => clearInterval(interval);
  }, [buyOneTimeAddress, buyTimeLeft]);

  useEffect(() => {
    let interval: TimerType;
    if (sellOneTimeAddress && sellTimeLeft > 0) {
      interval = setInterval(() => {
        setSellTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (sellTimeLeft === 0) {
      setSellOneTimeAddress(null);
    }
    return () => clearInterval(interval);
  }, [sellOneTimeAddress, sellTimeLeft]);

  const copyAddress = () => {
    navigator.clipboard.writeText(solanaAddress);
    toast.success('Solana address copied!');
  };

  const copyOneTimeAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateFee = (amount: number) => amount * 0.005;

  // Confirmation + PIN handlers
  const handleInitiateBuy = () => {
    const amount = Number(buyAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setShowBuyConfirm(true);
  };

  const handleConfirmBuy = () => {
    setShowBuyConfirm(false);
    setShowBuyPin(true);
    setPin(['', '', '', '']);
  };

  const handleInitiateSell = () => {
    const amount = Number(sellAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > solanaBalance) {
      toast.error('Insufficient USDC balance');
      return;
    }
    const tier = userKYC?.tier || 'none';
    const cryptoLimit = userKYC?.cryptoLimit || 100;
    if (tier === 'none' && amount > cryptoLimit - solanaBalance + amount) {
      toast.error(`Exceeds your $${cryptoLimit} limit. Complete KYC for higher limits.`);
      return;
    }
    setShowSellConfirm(true);
  };

  const handleConfirmSell = () => {
    setShowSellConfirm(false);
    setShowSellPin(true);
    setPin(['', '', '', '']);
  };

  const handleInitiateSend = () => {
    const amount = Number(sendAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > solanaBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (!sendAddress) {
      toast.error('Please enter recipient address');
      return;
    }
    setShowSendConfirm(true);
  };

  const handleConfirmSend = () => {
    setShowSendConfirm(false);
    setShowSendPin(true);
    setPin(['', '', '', '']);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      document.getElementById(`crypto-pin-${index + 1}`)?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`crypto-pin-${index - 1}`)?.focus();
    }
  };

  const handlePinSubmit = async (action: 'buy' | 'sell' | 'send') => {
    if (pin.some(digit => !digit)) {
      toast.error('Please enter your 4-digit PIN');
      return;
    }
    setProcessingAction(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (action === 'buy') {
      await executeBuy();
      setShowBuyPin(false);
    } else if (action === 'sell') {
      await executeSell();
      setShowSellPin(false);
    } else if (action === 'send') {
      await executeSend();
      setShowSendPin(false);
    }
    setPin(['', '', '', '']);
    setProcessingAction(false);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeOnly = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const generateBuyOneTimeAddress = async () => {
    const amount = Number(buyAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!buyExternalAddress) {
      toast.error('Please enter your external wallet address');
      return;
    }

    setIsGeneratingBuyAddress(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const prefixes: Record<string, string> = {
      'Solana': '7xK', 'Ethereum': '0x', 'BSC': '0x', 'Polygon': '0x',
      'Arbitrum': '0x', 'Base': '0x', 'Tron': 'T',
    };
    const prefix = prefixes[buyExternalChain] || '0x';
    const randomChars = Array(40).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    
    const newAddress: OneTimeAddress = {
      address: prefix + randomChars,
      chain: buyExternalChain,
      token: buyExternalToken,
      expiresAt: Date.now() + 1800000,
      reference: 'VEL-BUY-' + Date.now().toString(36).toUpperCase(),
    };
    
    setBuyOneTimeAddress(newAddress);
    setBuyTimeLeft(1800);
    setIsGeneratingBuyAddress(false);
    toast.success(`One-time ${buyExternalToken} address generated on ${buyExternalChain}`);
  };

  const generateSellOneTimeAddress = async () => {
    const amount = Number(sellAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (sellNGNDestination === 'external') {
      if (!externalBankCode || !externalAccountNumber || !externalAccountName) {
        toast.error('Please fill in all bank details');
        return;
      }
    }

    setIsGeneratingSellAddress(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const prefixes: Record<string, string> = {
      'Solana': '7xK', 'Ethereum': '0x', 'BSC': '0x', 'Polygon': '0x',
      'Arbitrum': '0x', 'Base': '0x', 'Tron': 'T',
    };
    const prefix = prefixes[sellExternalChain] || '0x';
    const randomChars = Array(40).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    
    const newAddress: OneTimeAddress = {
      address: prefix + randomChars,
      chain: sellExternalChain,
      token: sellExternalToken,
      expiresAt: Date.now() + 1800000,
      reference: 'VEL-SELL-' + Date.now().toString(36).toUpperCase(),
    };
    
    setSellOneTimeAddress(newAddress);
    setSellTimeLeft(1800);
    setIsGeneratingSellAddress(false);
    toast.success(`Send ${sellExternalToken} to this address within 30 minutes`);
  };

  const executeBuy = async () => {
    const amount = Number(buyAmount);
    const fee = calculateFee(amount);
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'buy',
      amount,
      token: 'USDC',
      chain: 'Solana',
      ngnAmount: amount * buyRate,
      status: 'pending',
      timestamp: new Date().toISOString(),
      reference: 'VEL-BUY-' + Date.now().toString(36).toUpperCase(),
      fee,
    };
    
    setTransactions([newTx, ...transactions]);
    toast.success(`Processing purchase of ${amount} USDC...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSolanaBalance(prev => prev + amount);
    setTransactions(prev => prev.map(tx => tx.id === newTx.id ? { ...tx, status: 'completed' } : tx));
    toast.success(`${amount} USDC credited!`);
    setBuyAmount('');
  };

  const executeSell = async () => {
    const amount = Number(sellAmount);
    const fee = calculateFee(amount);
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'sell',
      amount,
      token: 'USDC',
      ngnAmount: amount * sellRate,
      status: 'processing',
      timestamp: new Date().toISOString(),
      reference: 'VEL-SELL-' + Date.now().toString(36).toUpperCase(),
      fee,
    };
    
    setTransactions([newTx, ...transactions]);
    const destination = sellNGNDestination === 'main' ? 'main NGN account' : 'external NGN account';
    
    toast.success(`Selling ${amount} USDC...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSolanaBalance(prev => prev - amount);
    setTransactions(prev => prev.map(tx => tx.id === newTx.id ? { ...tx, status: 'completed' } : tx));
    toast.success(`₦${(amount * sellRate).toLocaleString()} credited to ${destination}!`);
    setSellAmount('');
  };

  const executeSend = async () => {
    const amount = Number(sendAmount);
    const fee = calculateFee(amount);
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'send',
      amount,
      token: 'USDC',
      chain: 'Solana',
      address: sendAddress,
      status: 'processing',
      timestamp: new Date().toISOString(),
      reference: 'VEL-SEND-' + Date.now().toString(36).toUpperCase(),
      fee,
    };
    
    setTransactions([newTx, ...transactions]);
    toast.success(`Sending ${amount} USDC...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSolanaBalance(prev => prev - amount);
    setTransactions(prev => prev.map(tx => tx.id === newTx.id ? { ...tx, status: 'completed' } : tx));
    toast.success(`${amount} USDC sent!`);
    setSendAmount('');
    setSendAddress('');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy': return <ArrowDownLeft size={18} className="text-green-600" />;
      case 'sell': return <ArrowUpRight size={18} className="text-red-600" />;
      case 'send': return <Send size={18} className="text-blue-600" />;
      case 'receive': return <ArrowDownLeft size={18} className="text-purple-600" />;
      default: return <ArrowRightLeft size={18} className="text-gray-600" />;
    }
  };

  const getTransactionBg = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-100';
      case 'sell': return 'bg-red-100';
      case 'send': return 'bg-blue-100';
      case 'receive': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  // Transaction Detail Modal
  const TransactionDetailModal = () => {
    if (!selectedTransaction) return null;
    const tx = selectedTransaction;

    const copyToClipboard = (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'completed': return <CheckCircle2 size={24} className="text-green-600" />;
        case 'failed': return <XCircle size={24} className="text-red-600" />;
        case 'pending': return <Clock size={24} className="text-amber-600" />;
        case 'processing': return <RefreshCw size={24} className="text-blue-600 animate-spin" />;
        default: return <AlertTriangle size={24} className="text-gray-600" />;
      }
    };

    const getStatusBg = (status: string) => {
      switch (status) {
        case 'completed': return 'bg-green-100';
        case 'failed': return 'bg-red-100';
        case 'pending': return 'bg-amber-100';
        case 'processing': return 'bg-blue-100';
        default: return 'bg-gray-100';
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-gray-900">Transaction Details</h2>
              <button onClick={() => setSelectedTransaction(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className={`p-4 rounded-xl flex items-center gap-3 ${getStatusBg(tx.status)}`}>
              {getStatusIcon(tx.status)}
              <div>
                <p className="font-semibold text-gray-900 capitalize">{tx.status}</p>
                <p className="text-sm text-gray-600">
                  {tx.status === 'completed' ? 'Transaction completed' : 
                   tx.status === 'pending' ? 'Waiting for confirmation' :
                   tx.status === 'processing' ? 'Processing' : 'Transaction failed'}
                </p>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">
                {tx.type === 'send' ? 'Amount Sent' : tx.type === 'receive' ? 'Amount Received' : tx.type === 'buy' ? 'Amount Bought' : 'Amount Sold'}
              </p>
              <p className="text-3xl font-display font-bold text-gray-900">
                {tx.type === 'sell' || tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token}
              </p>
              {tx.ngnAmount && <p className="text-gray-500 text-sm mt-1">≈ ₦{tx.ngnAmount.toLocaleString()} NGN</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{tx.reference}</span>
                  <button onClick={() => copyToClipboard(tx.reference, 'Reference')} className="p-1 hover:bg-gray-200 rounded">
                    <Copy size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium capitalize">{tx.type}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Token</span>
                <div className="flex items-center gap-2">
                  <img src={EXTERNAL_TOKENS.find(t => t.symbol === tx.token)?.logo} alt={tx.token} className="w-5 h-5" />
                  <span className="text-sm font-medium">{tx.token}</span>
                </div>
              </div>

              {tx.chain && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Blockchain</span>
                  <div className="flex items-center gap-2">
                    <img src={BLOCKCHAINS.find(c => c.name === tx.chain)?.logo} alt={tx.chain} className="w-5 h-5" />
                    <span className="text-sm font-medium">{tx.chain}</span>
                  </div>
                </div>
              )}

              {tx.address && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 block mb-2">{tx.type === 'send' ? 'Recipient' : 'Sender'}</span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono break-all">{tx.address}</code>
                    <button onClick={() => copyToClipboard(tx.address!, 'Address')} className="p-2 hover:bg-gray-200 rounded">
                      <Copy size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Date</span>
                <span className="text-sm">{formatDate(tx.timestamp)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Time</span>
                <span className="text-sm">{formatTimeOnly(tx.timestamp)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Fee (0.5%)</span>
                <span className="text-sm font-medium">${tx.fee.toFixed(2)}</span>
              </div>
            </div>

            {/* Support Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions or issues with this transaction? Our support team is here to help.
              </p>
              <div className="space-y-2">
                {/* Email Support */}
                <button
                  onClick={() => {
                    const subject = `Crypto Transaction Support - ${tx.reference}`;
                    const body = `Hello Velcro Support,

I need assistance with the following crypto transaction:

Transaction Details:
- Reference: ${tx.reference}
- Type: ${tx.type.toUpperCase()}
- Token: ${tx.token}
- Amount: ${tx.amount} ${tx.token}
- Status: ${tx.status}
- Date: ${formatDate(tx.timestamp)}

Please assist with this transaction.

Thank you.`;
                    window.open(`mailto:support@usevelcro.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                  }}
                  className="w-full flex items-center px-4 py-3 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-colors"
                >
                  <Mail size={18} className="text-blue-600 mr-3" />
                  <div className="text-left flex-1">
                    <span className="text-sm font-medium text-gray-900">Email Support</span>
                    <p className="text-xs text-gray-500">support@usevelcro.com</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </button>

                {/* WhatsApp Support */}
                <button
                  onClick={() => {
                    const message = `Hello Velcro Support, I need help with my crypto transaction (Ref: ${tx.reference}). Amount: ${tx.amount} ${tx.token}, Type: ${tx.type.toUpperCase()}, Status: ${tx.status}.`;
                    window.open(`https://wa.me/2348001234567?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full flex items-center px-4 py-3 border border-green-200 hover:bg-green-50 hover:border-green-300 rounded-xl transition-colors"
                >
                  <img src="images/whatsapp-logo.png" alt="WhatsApp" className="w-5 h-5 mr-3" />
                  <div className="text-left flex-1">
                    <span className="text-sm font-medium text-gray-900">WhatsApp Support</span>
                    <p className="text-xs text-gray-500">+234 800 123 4567</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700 text-center">
                  Include your Transaction Reference when contacting support for faster assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-12 lg:pl-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <img src="images/solana-logo.png" alt="Solana" className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-gray-900">Stable Hub</h1>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Solana</span>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Powered by Solana blockchain
            </p>
          </div>
        </div>
      </div>

      {/* KYC Banner */}
      {userKYC?.tier === 'none' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Crypto Trading Limits Apply</p>
              <p className="text-xs text-amber-600 mt-1">
                Limit: ${userKYC?.cryptoLimit || 100} | Used: ${solanaBalance.toFixed(2)} | Remaining: ${Math.max(0, remainingLimit).toFixed(2)}
              </p>
              <button
                onClick={onOpenKYC}
                className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Upgrade Tier to Increase Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <img src="images/usdc-logo.png" alt="USDC" className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <img src="images/solana-logo.png" alt="Solana" className="w-5 h-5" />
                  <span className="text-white/70 text-sm">USDC on Solana</span>
                </div>
                <p className="text-4xl font-display font-bold">{showBalance ? `$${solanaBalance.toLocaleString()}` : '****'}</p>
                <p className="text-white/60 text-sm">≈ ₦{(solanaBalance * 1500).toLocaleString()} NGN</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1000); }}
                className="p-2.5 hover:bg-white/10 rounded-xl"
                title="Refresh"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-white/90' : 'text-white/70'} />
              </button>
              <button onClick={() => setShowBalance(!showBalance)} className="p-2.5 hover:bg-white/10 rounded-xl">
                {showBalance ? <EyeOff size={20} className="text-white/70" /> : <Eye size={20} className="text-white/70" />}
              </button>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-xs mb-1">Your Solana Address</p>
                <p className="font-mono text-sm truncate">{solanaAddress}</p>
              </div>
              <button onClick={copyAddress} className="p-2 hover:bg-white/10 rounded-xl ml-2">
                <Copy size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 relative z-20">
            <button type="button" onClick={() => setActiveTab('buy')} className="flex flex-col items-center gap-2 p-3 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl transition-all cursor-pointer">
              <ArrowDownLeft size={20} />
              <span className="text-xs font-medium">Buy</span>
            </button>
            <button type="button" onClick={() => setActiveTab('sell')} className="flex flex-col items-center gap-2 p-3 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl transition-all cursor-pointer">
              <ArrowUpRight size={20} />
              <span className="text-xs font-medium">Sell</span>
            </button>
            <button type="button" onClick={() => setActiveTab('send')} className="flex flex-col items-center gap-2 p-3 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl transition-all cursor-pointer">
              <Send size={20} />
              <span className="text-xs font-medium">Send Out</span>
            </button>
            <button type="button" onClick={() => setActiveTab('history')} className="flex flex-col items-center gap-2 p-3 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl transition-all cursor-pointer">
              <History size={20} />
              <span className="text-xs font-medium">History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rates Banner */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">Buy: <span className="font-semibold text-green-600">₦{buyRate.toLocaleString()}</span></span>
            <span className="text-gray-500">Sell: <span className="font-semibold text-red-600">₦{sellRate.toLocaleString()}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Info size={12} />
            <span>0.5% processing fee with no cap</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {[
          { id: 'wallet', label: 'Wallet', icon: Wallet },
          { id: 'buy', label: 'Buy', icon: ArrowDownLeft },
          { id: 'sell', label: 'Sell', icon: ArrowUpRight },
          { id: 'send', label: 'Send Out', icon: Send },
          { id: 'history', label: 'History', icon: History },
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

      {/* WALLET TAB */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">Your Assets</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <img src="images/usdc-logo.png" alt="USDC" className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">USDC</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <img src="images/solana-logo.png" alt="Solana" className="w-4 h-4" />
                    <span>Solana</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${solanaBalance.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{solanaBalance.toLocaleString()} USDC</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Supported Networks</h3>
            <div className="flex flex-wrap gap-2">
              {BLOCKCHAINS.map((chain) => (
                <div key={chain.name} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl">
                  <img src={chain.logo} alt={chain.name} className="w-5 h-5" />
                  <span className="text-sm text-gray-700">{chain.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BUY TAB */}
      {activeTab === 'buy' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-6">Buy Crypto</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => { setBuyMode('main'); setBuyOneTimeAddress(null); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${buyMode === 'main' ? 'border-purple-500 bg-purple-50' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <img src="images/solana-logo.png" alt="Solana" className="w-6 h-6" />
                <span className={`font-medium ${buyMode === 'main' ? 'text-gray-900' : 'text-gray-600'}`}>To Solana Wallet</span>
              </div>
              <p className="text-xs text-gray-500">USDC directly to main wallet</p>
            </button>
            <button
              onClick={() => { setBuyMode('external'); setBuyOneTimeAddress(null); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${buyMode === 'external' ? 'border-purple-500 bg-purple-50' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={20} className={buyMode === 'external' ? 'text-purple-600' : 'text-gray-400'} />
                <span className={`font-medium ${buyMode === 'external' ? 'text-gray-900' : 'text-gray-600'}`}>To External Wallet</span>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500 mr-1">Any chain</p>
                <div className="flex -space-x-1">
                  {BLOCKCHAINS.slice(0, 4).map((chain) => (
                    <img key={chain.name} src={chain.logo} alt={chain.name} className="w-4 h-4 rounded-full border border-white" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 ml-1">+ more</p>
              </div>
            </button>
          </div>

          <div className="mb-6">
            {/* Currency Toggle */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setBuyInputCurrency('usd')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  buyInputCurrency === 'usd' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>$</span>
                <span>USD</span>
              </button>
              <button
                onClick={() => setBuyInputCurrency('ngn')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  buyInputCurrency === 'ngn' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>₦</span>
                <span>NGN</span>
              </button>
            </div>

            {/* Amount Input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                {buyInputCurrency === 'usd' ? '$' : '₦'}
              </span>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={displayBuyAmount}
                onChange={(e) => handleBuyAmountChange(e.target.value)}
                className="pl-10 py-5 text-xl font-semibold rounded-xl" 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm uppercase">
                {buyInputCurrency}
              </span>
            </div>

            {/* Conversion Info */}
            {buyAmount && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">
                  {buyInputCurrency === 'usd' ? (
                    <>≈ ₦{(Number(buyAmount) * buyRate).toLocaleString()} NGN</>
                  ) : (
                    <>≈ ${(Number(buyAmount) / buyRate).toFixed(2)} USD</>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">Rate: $1 = ₦{buyRate.toLocaleString()}</p>
              </div>
            )}
          </div>

          {buyMode === 'external' && (
            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Select Token</Label>
                <button onClick={() => setShowBuyTokenSelect(!showBuyTokenSelect)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={EXTERNAL_TOKENS.find(t => t.symbol === buyExternalToken)?.logo} alt={buyExternalToken} className="w-8 h-8" />
                    <span className="font-medium">{buyExternalToken}</span>
                  </div>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
                {showBuyTokenSelect && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                    {EXTERNAL_TOKENS.map((token) => (
                      <button key={token.symbol} onClick={() => { setBuyExternalToken(token.symbol); setShowBuyTokenSelect(false); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50">
                        <img src={token.logo} alt={token.symbol} className="w-8 h-8" />
                        <span className="font-medium">{token.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Select Blockchain</Label>
                <button onClick={() => setShowBuyChainSelect(!showBuyChainSelect)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={BLOCKCHAINS.find(c => c.name === buyExternalChain)?.logo} alt={buyExternalChain} className="w-6 h-6" />
                    <span className="font-medium">{buyExternalChain}</span>
                  </div>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
                {showBuyChainSelect && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                    {BLOCKCHAINS.filter(c => c.tokens.includes(buyExternalToken)).map((chain) => (
                      <button key={chain.name} onClick={() => { setBuyExternalChain(chain.name); setShowBuyChainSelect(false); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50">
                        <img src={chain.logo} alt={chain.name} className="w-6 h-6" />
                        <span className="font-medium">{chain.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Your External Wallet Address</Label>
                <Input type="text" placeholder={`Enter ${buyExternalChain} address`} value={buyExternalAddress}
                  onChange={(e) => { setBuyExternalAddress(e.target.value); setBuyOneTimeAddress(null); }}
                  className="py-4 rounded-xl font-mono text-sm" />
              </div>

              {!buyOneTimeAddress && (
                <Button onClick={generateBuyOneTimeAddress} disabled={isGeneratingBuyAddress || !buyAmount || !buyExternalAddress}
                  className="w-full bg-purple-600 text-white h-12 rounded-xl">
                  {isGeneratingBuyAddress ? <RefreshCw size={18} className="animate-spin mr-2" /> : <Wallet size={18} className="mr-2" />}
                  Buy to External Address
                </Button>
              )}

              {buyOneTimeAddress && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Timer size={18} className="text-amber-600" />
                    <span className="font-medium text-amber-800">Expires in {formatTime(buyTimeLeft)}</span>
                  </div>
                  <p className="text-xs text-amber-700 mb-2">Send {buyExternalToken} ({buyExternalChain}) to:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white p-3 rounded-lg font-mono text-sm break-all">{buyOneTimeAddress.address}</code>
                    <button onClick={() => copyOneTimeAddress(buyOneTimeAddress.address)} className="p-2 hover:bg-amber-200 rounded-lg">
                      <Copy size={18} className="text-amber-700" />
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">Ref: {buyOneTimeAddress.reference}</p>
                  <div className="mt-3 p-3 bg-amber-100/50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>After sending, check your <strong>History</strong> tab for transaction status. Funds will be credited once confirmed on the blockchain.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {buyMode === 'main' && (
            <>
              <div className="p-3 bg-blue-50 rounded-xl mb-4">
                <p className="text-sm text-blue-700 flex items-start gap-2">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Amount will be debited from your main <strong>NGN Wallet</strong></span>
                </p>
              </div>
              <Button onClick={handleInitiateBuy} disabled={!buyAmount || Number(buyAmount) <= 0}
                className="w-full bg-purple-600 text-white h-12 rounded-xl">
                Buy USDC to Solana Wallet
              </Button>
            </>
          )}
        </div>
      )}

      {/* SELL TAB */}
      {activeTab === 'sell' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-6">Sell Crypto</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => { setSellMode('main'); setSellOneTimeAddress(null); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${sellMode === 'main' ? 'border-purple-500 bg-purple-50' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <img src="images/solana-logo.png" alt="Solana" className="w-6 h-6" />
                <span className={`font-medium ${sellMode === 'main' ? 'text-gray-900' : 'text-gray-600'}`}>From Solana</span>
              </div>
              <p className="text-xs text-gray-500">Sell from main wallet</p>
              <p className="text-xs text-purple-600 mt-1">${solanaBalance.toLocaleString()} available</p>
            </button>
            <button onClick={() => { setSellMode('external'); setSellOneTimeAddress(null); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${sellMode === 'external' ? 'border-purple-500 bg-purple-50' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={20} className={sellMode === 'external' ? 'text-purple-600' : 'text-gray-400'} />
                <span className={`font-medium ${sellMode === 'external' ? 'text-gray-900' : 'text-gray-600'}`}>From External</span>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500 mr-1">Send from external wallet</p>
                <div className="flex -space-x-1">
                  {BLOCKCHAINS.slice(0, 4).map((chain) => (
                    <img key={chain.name} src={chain.logo} alt={chain.name} className="w-4 h-4 rounded-full border border-white" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 ml-1">+ more</p>
              </div>
            </button>
          </div>

          <div className="mb-6">
            <Label className="text-sm text-gray-600 mb-2 block">Amount ({sellMode === 'main' ? 'USDC' : sellExternalToken})</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
              <Input type="number" placeholder="0.00" value={sellAmount}
                onChange={(e) => { setSellAmount(e.target.value); setSellOneTimeAddress(null); }}
                className="pl-10 py-6 text-lg rounded-xl" />
            </div>
            {sellAmount && (
              <div className="mt-2 space-y-1">
                <p className="text-purple-600 font-medium text-sm">≈ ₦{(Number(sellAmount) * sellRate).toLocaleString()} NGN</p>
                <p className="text-xs text-gray-500">Fee (0.5%): ${calculateFee(Number(sellAmount)).toFixed(2)}</p>
              </div>
            )}
          </div>

          {sellMode === 'external' && (
            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Select Token</Label>
                <button onClick={() => setShowSellTokenSelect(!showSellTokenSelect)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white">
                  <div className="flex items-center gap-3">
                    <img src={EXTERNAL_TOKENS.find(t => t.symbol === sellExternalToken)?.logo} alt={sellExternalToken} className="w-8 h-8" />
                    <span className="font-medium">{sellExternalToken}</span>
                  </div>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
                {showSellTokenSelect && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                    {EXTERNAL_TOKENS.map((token) => (
                      <button key={token.symbol} onClick={() => { setSellExternalToken(token.symbol); setShowSellTokenSelect(false); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50">
                        <img src={token.logo} alt={token.symbol} className="w-8 h-8" />
                        <span className="font-medium">{token.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Select Blockchain</Label>
                <button onClick={() => setShowSellChainSelect(!showSellChainSelect)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white">
                  <div className="flex items-center gap-3">
                    <img src={BLOCKCHAINS.find(c => c.name === sellExternalChain)?.logo} alt={sellExternalChain} className="w-6 h-6" />
                    <span className="font-medium">{sellExternalChain}</span>
                  </div>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
                {showSellChainSelect && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                    {BLOCKCHAINS.filter(c => c.tokens.includes(sellExternalToken)).map((chain) => (
                      <button key={chain.name} onClick={() => { setSellExternalChain(chain.name); setShowSellChainSelect(false); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50">
                        <img src={chain.logo} alt={chain.name} className="w-6 h-6" />
                        <span className="font-medium">{chain.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NGN Destination */}
          <div className="mb-6">
            <Label className="text-sm text-gray-600 mb-2 block">NGN Destination</Label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSellNGNDestination('main')}
                className={`p-4 rounded-xl border-2 text-left ${sellNGNDestination === 'main' ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                <Landmark size={18} className={sellNGNDestination === 'main' ? 'text-green-600' : 'text-gray-400'} />
                <span className={`font-medium ${sellNGNDestination === 'main' ? 'text-gray-900' : 'text-gray-600'}`}>Main NGN Account</span>
                <p className="text-xs text-gray-500">9PSB - ****6789</p>
              </button>
              <button onClick={() => setSellNGNDestination('external')}
                className={`p-4 rounded-xl border-2 text-left ${sellNGNDestination === 'external' ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                <Building2 size={18} className={sellNGNDestination === 'external' ? 'text-green-600' : 'text-gray-400'} />
                <span className={`font-medium ${sellNGNDestination === 'external' ? 'text-gray-900' : 'text-gray-600'}`}>External Bank</span>
                <p className="text-xs text-gray-500">Any Nigerian bank</p>
              </button>
            </div>
          </div>

          {/* Bank Details - Last on the page (only for external bank) */}
          {sellNGNDestination === 'external' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl mb-6">
              {/* Bank Name */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Bank Name</Label>
                <button 
                  onClick={() => setShowBankSelect(!showBankSelect)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white"
                >
                  <span className={externalBankCode ? 'text-gray-900' : 'text-gray-400'}>
                    {externalBankCode 
                      ? NIGERIAN_BANKS.find(b => b.code === externalBankCode)?.name 
                      : 'Select bank'}
                  </span>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
                {showBankSelect && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-auto">
                    {NIGERIAN_BANKS.map((bank) => (
                      <button 
                        key={bank.code} 
                        onClick={() => { 
                          setExternalBankCode(bank.code); 
                          setShowBankSelect(false);
                          setExternalAccountName('');
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
                      >
                        <span className="font-medium">{bank.name}</span>
                        {externalBankCode === bank.code && <Check size={16} className="text-green-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Account Number */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Account Number</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Enter 10-digit account number" 
                    value={externalAccountNumber} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setExternalAccountNumber(val);
                      if (val.length !== 10) {
                        setExternalAccountName('');
                      }
                    }}
                    maxLength={10}
                    className="py-4 rounded-xl focus:border-velcro-green focus:ring-velcro-green/20 pr-10" 
                  />
                  {externalAccountNumber.length === 10 && externalAccountName && (
                    <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{externalAccountNumber.length}/10 digits</p>
              </div>
              
              {/* Account Name - Auto-populated */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Account Name</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder={externalAccountNumber.length === 10 ? 'Account name will appear here' : 'Enter account number first'}
                    value={externalAccountName} 
                    disabled
                    className={`py-4 rounded-xl ${
                      externalAccountName 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-gray-50 text-gray-500'
                    }`} 
                  />
                  {externalAccountName && (
                    <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                </div>
                {externalAccountName && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check size={12} />
                    Account verified
                  </p>
                )}
              </div>
            </div>
          )}

          {sellMode === 'external' && !sellOneTimeAddress && (
            <Button onClick={generateSellOneTimeAddress} disabled={isGeneratingSellAddress || !sellAmount}
              className="w-full bg-purple-600 text-white h-12 rounded-xl mb-4">
              {isGeneratingSellAddress ? <RefreshCw size={18} className="animate-spin mr-2" /> : <Wallet size={18} className="mr-2" />}
              Generate Deposit Address
            </Button>
          )}

          {sellMode === 'external' && sellOneTimeAddress && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer size={18} className="text-amber-600" />
                <span className="font-medium text-amber-800">Send within {formatTime(sellTimeLeft)}</span>
              </div>
              <p className="text-xs text-amber-700 mb-2">Send exactly <strong>${sellAmount} {sellExternalToken}</strong> to:</p>
              <div className="flex items-center gap-2 mb-2">
                <code className="flex-1 bg-white p-3 rounded-lg font-mono text-sm break-all">{sellOneTimeAddress.address}</code>
                <button onClick={() => copyOneTimeAddress(sellOneTimeAddress.address)} className="p-2 hover:bg-amber-200 rounded-lg">
                  <Copy size={18} className="text-amber-700" />
                </button>
              </div>
              <p className="text-xs text-amber-600">Network: {sellExternalChain}</p>
              <div className="mt-3 p-3 bg-amber-100/50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>After sending, check your <strong>History</strong> tab for transaction status. NGN will be credited once confirmed on the blockchain.</span>
                </p>
              </div>
            </div>
          )}

          {sellMode === 'main' && (
            <Button onClick={handleInitiateSell} disabled={!sellAmount || Number(sellAmount) <= 0 || Number(sellAmount) > solanaBalance}
              className="w-full bg-gray-900 text-white h-12 rounded-xl">
              Sell USDC & Receive NGN
            </Button>
          )}
        </div>
      )}

      {/* SEND TAB */}
      {activeTab === 'send' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-2">Send Out Crypto</h2>
          <p className="text-sm text-gray-500 mb-6">Send from your main Solana USDC wallet</p>
          
          <div className="space-y-6">
            {/* Wallet Info Card */}
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <img src="images/usdc-logo.png" alt="USDC" className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">USDC</p>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <img src="images/solana-logo.png" alt="Solana" className="w-4 h-4" />
                    <span>Solana Main Wallet</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-purple-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Available Balance</span>
                  <span className="font-semibold text-gray-900">${solanaBalance.toLocaleString()} USDC</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Amount (USDC)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={sendAmount} 
                  onChange={(e) => setSendAmount(e.target.value)} 
                  className="pl-10 py-6 text-lg rounded-xl" 
                />
              </div>
              {sendAmount && <p className="text-xs text-gray-500 mt-2">Fee (0.5%): ${calculateFee(Number(sendAmount)).toFixed(2)}</p>}
            </div>

            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Recipient Address</Label>
              <Input 
                type="text" 
                placeholder="Enter Solana address" 
                value={sendAddress} 
                onChange={(e) => setSendAddress(e.target.value)} 
                className="py-4 rounded-xl font-mono text-sm" 
              />
            </div>

            <Button 
              onClick={handleInitiateSend} 
              disabled={!sendAmount || Number(sendAmount) <= 0 || !sendAddress || Number(sendAmount) > solanaBalance}
              className="w-full bg-purple-600 text-white h-12 rounded-xl"
            >
              <Send size={18} className="mr-2" />
              Send USDC from Solana
            </Button>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <History size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500 text-sm">Your crypto transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <button key={tx.id} onClick={() => setSelectedTransaction(tx)}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-soft transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTransactionBg(tx.type)}`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 capitalize">{tx.type}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              tx.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(tx.timestamp)} at {formatTimeOnly(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{tx.type === 'sell' || tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token}</p>
                      {tx.ngnAmount && <p className="text-xs text-gray-500">≈ ₦{tx.ngnAmount.toLocaleString()}</p>}
                      <p className="text-xs text-gray-400">Fee: ${tx.fee}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && <TransactionDetailModal />}

      {/* 
      {showBuyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBuyConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownLeft size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Purchase</h3>
              <p className="text-gray-500 text-sm mt-1">Review your buy details</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">You pay</span>
                <span className="font-medium text-gray-900">₦{(Number(buyAmount) * buyRate).toLocaleString()} NGN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">You receive</span>
                <span className="font-bold text-gray-900">{Number(buyAmount).toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Fee</span>
                <span className="font-medium text-gray-900">${calculateFee(Number(buyAmount)).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBuyConfirm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmBuy} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {showBuyPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBuyPin(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Enter PIN</h3>
              <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN to confirm</p>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`crypto-pin-${index}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  disabled={processingAction}
                />
              ))}
            </div>
            <Button onClick={() => handlePinSubmit('buy')} disabled={processingAction} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl">
              {processingAction ? (
                <>
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </div>
        </div>
      )}

      {showSellConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSellConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight size={28} className="text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Sell</h3>
              <p className="text-gray-500 text-sm mt-1">Review your sell details</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">You sell</span>
                <span className="font-medium text-gray-900">{Number(sellAmount).toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">You receive</span>
                <span className="font-bold text-gray-900">₦{(Number(sellAmount) * sellRate).toLocaleString()} NGN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Destination</span>
                <span className="font-medium text-gray-900">{sellNGNDestination === 'main' ? 'Main Wallet' : 'External Account'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSellConfirm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmSell} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl">Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {showSellPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSellPin(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Enter PIN</h3>
              <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN to confirm</p>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`crypto-pin-${index}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-gray-700 focus:ring-2 focus:ring-gray-700/20 outline-none"
                  disabled={processingAction}
                />
              ))}
            </div>
            <Button onClick={() => handlePinSubmit('sell')} disabled={processingAction} className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl">
              {processingAction ? (
                <>
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm Sell'
              )}
            </Button>
          </div>
        </div>
      )}

      {showSendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSendConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Send</h3>
              <p className="text-gray-500 text-sm mt-1">Review transaction details</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Amount</span>
                <span className="font-bold text-gray-900">{Number(sendAmount).toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">To</span>
                <span className="font-medium text-gray-900 text-right truncate max-w-[150px]">{sendAddress.slice(0, 8)}...{sendAddress.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Network</span>
                <span className="font-medium text-gray-900">Solana</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSendConfirm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmSend} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {showSendPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSendPin(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Enter PIN</h3>
              <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN to confirm</p>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`crypto-pin-${index}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  disabled={processingAction}
                />
              ))}
            </div>
            <Button onClick={() => handlePinSubmit('send')} disabled={processingAction} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl">
              {processingAction ? (
                <>
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Confirm Send'
              )}
            </Button>
          </div>
        </div>
      )}
      */}
      {/* BUY Confirmation Modal */}
      {showBuyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBuyConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownLeft size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Purchase</h3>
              <p className="text-gray-500 text-sm mt-1">Review your buy details</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">You pay</span>
                <span className="font-medium text-gray-900">₦{(Number(buyAmount) * buyRate).toLocaleString()} NGN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">You receive</span>
                <span className="font-bold text-gray-900">{Number(buyAmount).toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Fee</span>
                <span className="font-medium text-gray-900">${calculateFee(Number(buyAmount)).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBuyConfirm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmBuy} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* BUY PIN Modal */}
      {showBuyPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBuyPin(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Enter PIN</h3>
              <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN to confirm</p>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`crypto-pin-${index}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  disabled={processingAction}
                />
              ))}
            </div>
            <Button onClick={() => handlePinSubmit('buy')} disabled={processingAction} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl">
              {processingAction ? (
                <>
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* SELL Confirmation Modal */}
      {showSellConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSellConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight size={28} className="text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Sell</h3>
              <p className="text-gray-500 text-sm mt-1">Review your sell details</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">You sell</span>
                <span className="font-medium text-gray-900">{Number(sellAmount).toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">You receive</span>
                <span className="font-bold text-gray-900">₦{(Number(sellAmount) * sellRate).toLocaleString()} NGN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Destination</span>
                <span className="font-medium text-gray-900">{sellNGNDestination === 'main' ? 'Main Wallet' : 'External Account'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSellConfirm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmSell} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl">Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* SELL PIN Modal */}
      {showSellPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSellPin(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Enter PIN</h3>
              <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN to confirm</p>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`crypto-pin-${index}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-gray-700 focus:ring-2 focus:ring-gray-700/20 outline-none"
                  disabled={processingAction}
                />
              ))}
            </div>
            <Button onClick={() => handlePinSubmit('sell')} disabled={processingAction} className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl">
              {processingAction ? (
                <>
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm Sell'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* SEND Confirmation Modal */}
      {showSendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSendConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Send</h3>
              <p className="text-gray-500 text-sm mt-1">Review transaction details</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Amount</span>
                <span className="font-bold text-gray-900">{Number(sendAmount).toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">To</span>
                <span className="font-medium text-gray-900 text-right truncate max-w-[150px]">{sendAddress.slice(0, 8)}...{sendAddress.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Network</span>
                <span className="font-medium text-gray-900">Solana</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSendConfirm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmSend} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* SEND PIN Modal */}
      {showSendPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSendPin(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Enter PIN</h3>
              <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN to confirm</p>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`crypto-pin-${index}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  disabled={processingAction}
                />
              ))}
            </div>
            <Button onClick={() => handlePinSubmit('send')} disabled={processingAction} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl">
              {processingAction ? (
                <>
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Confirm Send'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
