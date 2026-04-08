import { useState } from 'react';
import { 
  CreditCard, 
  Copy, 
  Eye, 
  EyeOff, 
  Lock,
  RefreshCw,
  Pause,
  Play,
  Plus,
  Sparkles,
  Check,
  ExternalLink,
  Globe,
  Zap,
  X,
  ArrowRight,
  HeadphonesIcon,
  Mail,
  Calendar,
  Clock,
  Hash,
  MapPin,
  CreditCardIcon,
  Trash2,
  Share2,
  MoreVertical,
  Wallet,
  TrendingUp,
  Shield,
  Settings,
  ChevronLeft,
  Filter,
  Download,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  KeyRound,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

// Subscription brands data
const subscriptionBrands = [
  { name: 'Netflix', logo: 'brands/netflix.png', color: '#E50914' },
  { name: 'Spotify', logo: 'brands/spotify.png', color: '#1DB954' },
  { name: 'YouTube', logo: 'brands/youtube.png', color: '#FF0000' },
  { name: 'YouTube Premium', logo: 'brands/youtube.png', color: '#FF0000' },
  { name: 'Apple Music', logo: 'brands/apple-music.png', color: '#FA243C' },
  { name: 'Amazon', logo: 'brands/amazon.png', color: '#FF9900' },
  { name: 'Disney+', logo: 'brands/disney.png', color: '#113CCF' },
];

// Helper function to get brand color
const getBrandColor = (merchant: string): string => {
  const brand = subscriptionBrands.find(b => 
    merchant.toLowerCase().includes(b.name.toLowerCase()) ||
    b.name.toLowerCase().includes(merchant.toLowerCase())
  );
  return brand?.color || '#6B7280';
};

// Card transaction type definition
interface CardTransaction {
  id: number;
  merchant: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  logo: string;
  cardLast4: string;
  category: string;
  location: string;
  authCode: string;
  description: string;
}

// Virtual Card interface
interface VirtualCard {
  id: string;
  nickname: string;
  last4: string;
  expiry: string;
  cvv: string;
  fullNumber: string;
  balance: number;
  currency: string;
  status: 'active' | 'paused' | 'expired';
  type: 'visa' | 'mastercard';
  createdAt: string;
  spendingLimits: {
    daily: { limit: number; used: number };
    weekly: { limit: number; used: number };
    monthly: { limit: number; used: number };
  };
  merchantRestrictions: string[];
  geoRestrictions: string[];
  transactions: CardTransaction[];
}

// Virtual card transactions
const cardTransactions: CardTransaction[] = [
  { 
    id: 1, 
    merchant: 'Netflix', 
    amount: 15.99, 
    date: 'Today, 8:00 AM', 
    status: 'completed', 
    logo: 'brands/netflix.png',
    cardLast4: '5678',
    category: 'Entertainment',
    location: 'Online',
    authCode: '847291',
    description: 'Monthly subscription'
  },
  { 
    id: 2, 
    merchant: 'Spotify', 
    amount: 10.99, 
    date: 'Yesterday, 6:30 PM', 
    status: 'completed', 
    logo: 'brands/spotify.png',
    cardLast4: '5678',
    category: 'Entertainment',
    location: 'Online',
    authCode: '762345',
    description: 'Premium subscription'
  },
  { 
    id: 3, 
    merchant: 'YouTube Premium', 
    amount: 11.99, 
    date: 'Mar 28, 2024', 
    status: 'completed', 
    logo: 'brands/youtube.png',
    cardLast4: '5678',
    category: 'Entertainment',
    location: 'Online',
    authCode: '982341',
    description: 'Monthly subscription'
  },
  { 
    id: 4, 
    merchant: 'Apple Music', 
    amount: 10.99, 
    date: 'Mar 25, 2024', 
    status: 'completed', 
    logo: 'brands/apple-music.png',
    cardLast4: '5678',
    category: 'Entertainment',
    location: 'Online',
    authCode: '127643',
    description: 'Individual plan'
  },
];

// Initial cards data
const initialCards: VirtualCard[] = [
  {
    id: '1',
    nickname: 'Main Card',
    last4: '5678',
    expiry: '12/27',
    cvv: '847',
    fullNumber: '4532 8847 1234 5678',
    balance: 500.00,
    currency: 'USD',
    status: 'active',
    type: 'visa',
    createdAt: '2024-01-15',
    spendingLimits: {
      daily: { limit: 1000, used: 150 },
      weekly: { limit: 5000, used: 450 },
      monthly: { limit: 20000, used: 3200 },
    },
    merchantRestrictions: [],
    geoRestrictions: [],
    transactions: cardTransactions,
  },
  {
    id: '2',
    nickname: 'Netflix Subscriptions',
    last4: '9012',
    expiry: '11/26',
    cvv: '321',
    fullNumber: '4532 8847 5678 9012',
    balance: 100.00,
    currency: 'USD',
    status: 'active',
    type: 'visa',
    createdAt: '2024-02-20',
    spendingLimits: {
      daily: { limit: 50, used: 0 },
      weekly: { limit: 200, used: 15.99 },
      monthly: { limit: 500, used: 47.97 },
    },
    merchantRestrictions: ['Netflix', 'Spotify'],
    geoRestrictions: [],
    transactions: cardTransactions.slice(0, 2),
  },
  {
    id: '3',
    nickname: 'Shopping Card',
    last4: '3456',
    expiry: '10/25',
    cvv: '654',
    fullNumber: '4532 8847 9012 3456',
    balance: 0,
    currency: 'USD',
    status: 'paused',
    type: 'mastercard',
    createdAt: '2024-03-01',
    spendingLimits: {
      daily: { limit: 500, used: 0 },
      weekly: { limit: 2000, used: 0 },
      monthly: { limit: 8000, used: 0 },
    },
    merchantRestrictions: [],
    geoRestrictions: ['NG', 'ZA'],
    transactions: [],
  },
];

export function Cards() {
  const [cards, setCards] = useState<VirtualCard[]>(initialCards);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(initialCards[0]);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'virtual' | 'physical'>('virtual');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CardTransaction | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpSource, setTopUpSource] = useState<'naira' | 'usdc'>('naira');
  const [isLoading, setIsLoading] = useState(false);
  
  // Change PIN modal state
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [changePinStep, setChangePinStep] = useState<'bvn' | 'otp' | 'newpin' | 'confirm'>('bvn');
  const [bvn, setBvn] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  // Top Up PIN verification state
  const [showTopUpPinModal, setShowTopUpPinModal] = useState(false);
  const [topUpPin, setTopUpPin] = useState('');
  
  // New card form state
  const [newCardData, setNewCardData] = useState({
    nickname: '',
    type: 'visa' as 'visa' | 'mastercard',
    initialBalance: '',
    source: 'naira' as 'naira' | 'usdc',
    dailyLimit: '1000',
    weeklyLimit: '5000',
    monthlyLimit: '20000',
  });

  // Settings form state
  const [settingsData, setSettingsData] = useState({
    dailyLimit: 0,
    weeklyLimit: 0,
    monthlyLimit: 0,
    blockInternational: false,
    blockOnline: false,
    require3DS: true,
  });

  const copyCardNumber = (card: VirtualCard) => {
    navigator.clipboard.writeText(card.fullNumber);
    toast.success('Card number copied!');
  };

  const copyCardDetails = (card: VirtualCard) => {
    const details = `Card: ${card.fullNumber}\nExpiry: ${card.expiry}\nCVV: ${card.cvv}`;
    navigator.clipboard.writeText(details);
    toast.success('Card details copied!');
  };

  const toggleCardStatus = (cardId: string) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const newStatus = card.status === 'active' ? 'paused' : 'active';
        toast.success(`Card ${newStatus === 'active' ? 'activated' : 'paused'}`);
        return { ...card, status: newStatus };
      }
      return card;
    }));
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardData.nickname) {
      toast.error('Please enter a card nickname');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newCard: VirtualCard = {
      id: Date.now().toString(),
      nickname: newCardData.nickname,
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      expiry: `${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}/${String(Math.floor(27 + Math.random() * 5))}`,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      fullNumber: `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      balance: Number(newCardData.initialBalance) || 0,
      currency: 'USD',
      status: 'active',
      type: newCardData.type,
      createdAt: new Date().toISOString().split('T')[0],
      spendingLimits: {
        daily: { limit: Number(newCardData.dailyLimit) || 1000, used: 0 },
        weekly: { limit: Number(newCardData.weeklyLimit) || 5000, used: 0 },
        monthly: { limit: Number(newCardData.monthlyLimit) || 20000, used: 0 },
      },
      merchantRestrictions: [],
      geoRestrictions: [],
      transactions: [],
    };

    setCards([...cards, newCard]);
    setSelectedCard(newCard);
    setShowCreateModal(false);
    setNewCardData({
      nickname: '',
      type: 'visa',
      initialBalance: '',
      source: 'naira',
      dailyLimit: '1000',
      weeklyLimit: '5000',
      monthlyLimit: '20000',
    });
    toast.success('Virtual card created successfully!');
    setIsLoading(false);
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCards(cards.filter(c => c.id !== selectedCard.id));
    setSelectedCard(cards.find(c => c.id !== selectedCard.id) || null);
    setShowDeleteModal(false);
    toast.success('Card deleted successfully');
    setIsLoading(false);
  };

  // Top Up flow - Step 1: Validate amount and show PIN modal
  const handleTopUpRequest = () => {
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setShowTopUpPinModal(true);
  };
  
  // Top Up flow - Step 2: Verify PIN and complete
  const handleTopUpWithPin = async () => {
    if (topUpPin.length !== 4) {
      toast.error('Please enter a valid 4-digit PIN');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    const amount = Number(topUpAmount);
    
    setCards(cards.map(card => 
      card.id === selectedCard!.id 
        ? { ...card, balance: card.balance + amount }
        : card
    ));
    setSelectedCard({ ...selectedCard!, balance: selectedCard!.balance + amount });
    
    const sourceName = topUpSource === 'naira' ? 'Naira wallet' : 'USDC wallet';
    toast.success(`Added $${amount.toFixed(2)} to ${selectedCard!.nickname} from ${sourceName}`);
    setShowTopUpPinModal(false);
    setShowTopUpModal(false);
    setTopUpAmount('');
    setTopUpPin('');
    setTopUpSource('naira');
  };

  // Change PIN flow handlers
  const handleChangePinSubmitBvn = async () => {
    if (bvn.length !== 11) {
      toast.error('Please enter a valid 11-digit BVN');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    // Simulate sending OTP
    toast.success('OTP sent to your email address');
    setChangePinStep('otp');
  };
  
  const handleChangePinVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    toast.success('OTP verified successfully');
    setChangePinStep('newpin');
  };
  
  const handleChangePinSubmitNewPin = () => {
    if (newPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    
    setChangePinStep('confirm');
  };
  
  const handleChangePinComplete = async () => {
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    toast.success('PIN changed successfully!');
    setShowChangePinModal(false);
    setChangePinStep('bvn');
    setBvn('');
    setOtp('');
    setNewPin('');
    setConfirmPin('');
  };
  
  const resetChangePinFlow = () => {
    setShowChangePinModal(false);
    setChangePinStep('bvn');
    setBvn('');
    setOtp('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleSaveSettings = async () => {
    if (!selectedCard) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCards(cards.map(card => 
      card.id === selectedCard.id 
        ? { 
            ...card, 
            spendingLimits: {
              ...card.spendingLimits,
              daily: { ...card.spendingLimits.daily, limit: settingsData.dailyLimit },
              weekly: { ...card.spendingLimits.weekly, limit: settingsData.weeklyLimit },
              monthly: { ...card.spendingLimits.monthly, limit: settingsData.monthlyLimit },
            }
          }
        : card
    ));
    
    toast.success('Card settings updated');
    setShowSettingsModal(false);
    setIsLoading(false);
  };

  const handleEmailSupport = (tx: CardTransaction) => {
    const subject = `Support Request - Card Transaction #${tx.id.toString().padStart(8, '0')}`;
    const body = `Hello Support,%0D%0A%0D%AI need help with the following card transaction:%0D%0A%0D%0A- Transaction ID: ${tx.id.toString().padStart(8, '0')}%0D%0A- Merchant: ${tx.merchant}%0D%0A- Amount: $${tx.amount.toFixed(2)}%0D%0A- Date: ${tx.date}%0D%0A- Status: ${tx.status}%0D%0A- Auth Code: ${tx.authCode}%0D%0A%0D%0APlease describe your issue here...`;
    window.open(`mailto:support@usevelcro.com?subject=${encodeURIComponent(subject)}&body=${body}`);
    toast.success('Opening email client...');
  };

  const handleWhatsAppSupport = (tx: CardTransaction) => {
    const message = `Hello Support, I need help with Card Transaction #${tx.id.toString().padStart(8, '0')} - $${tx.amount.toFixed(2)} at ${tx.merchant} on ${tx.date}`;
    window.open(`https://wa.me/2348001234567?text=${encodeURIComponent(message)}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  // Calculate spending progress
  const getSpendingProgress = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  // All transactions from all cards
  const allTransactions = cards.flatMap(card => 
    card.transactions.map(tx => ({ ...tx, cardNickname: card.nickname, cardLast4: card.last4 }))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-12 lg:pl-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Cards</h1>
          <p className="text-gray-500 text-sm">Manage your virtual and physical cards</p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-velcro-green" />
          <span className="text-sm text-gray-600">Powered by Bridgecard</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { id: 'virtual', label: 'Virtual Cards' },
          { id: 'physical', label: 'Physical Card' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Virtual Cards Tab */}
      {activeTab === 'virtual' && (
        <div className="space-y-6">
          {/* Cards List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Layers size={20} className="text-gray-400" />
              <span className="text-gray-600">{cards.length} cards</span>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
            >
              <Plus size={18} className="mr-2" />
              Create New Card
            </Button>
          </div>

          {/* Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cards List Sidebar */}
            <div className="lg:col-span-1 space-y-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left relative overflow-hidden
                    ${selectedCard?.id === card.id 
                      ? 'border-velcro-green bg-velcro-green/5 shadow-soft' 
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-soft bg-white'}`}
                >
                  {/* Card Status Indicator */}
                  <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full
                    ${card.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} 
                  />
                  
                  <div className="flex items-center gap-3 mb-3">
                    {/* Card Logo */}
                    <div className="w-12 h-8 rounded flex-shrink-0 overflow-hidden bg-white">
                      {card.type === 'visa' ? (
                        <div className="w-full h-full bg-[#1A1F71] flex items-center justify-center">
                          <span className="text-white font-bold text-xs italic tracking-tight">VISA</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 bg-[#EB001B] rounded-full"></div>
                            <div className="w-4 h-4 bg-[#F79E1B] rounded-full -ml-2 opacity-90"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{card.nickname}</p>
                      <p className="text-xs text-gray-500">**** {card.last4}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className="font-semibold text-gray-900">${card.balance.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Expires</p>
                      <p className="text-sm text-gray-700">{card.expiry}</p>
                    </div>
                  </div>

                  {card.status === 'paused' && (
                    <div className="mt-3 flex items-center gap-1.5 text-amber-600 text-xs">
                      <Pause size={12} />
                      <span>Paused</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Card Details */}
            {selectedCard && (
              <div className="lg:col-span-2 space-y-6">
                {/* Card Visual */}
                <div className="relative">
                  <div className={`virtual-card rounded-2xl p-6 text-white relative overflow-hidden h-56
                    ${selectedCard.type === 'mastercard' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : ''}`}>
                    {/* Card Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/30" />
                      <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/20" />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <span className="font-bold text-lg">V</span>
                          </div>
                          <div>
                            <span className="font-semibold block">{selectedCard.nickname}</span>
                            <span className="text-xs text-white/60">{selectedCard.type.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedCard.status === 'paused' && (
                            <span className="px-2 py-1 bg-red-500/80 text-white text-xs rounded-lg backdrop-blur-sm">
                              Paused
                            </span>
                          )}
                          <span className="text-sm text-white/70">Virtual</span>
                        </div>
                      </div>

                      {/* Card Chip */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-5 border border-yellow-600/30 rounded flex items-center justify-center">
                            <div className="w-6 h-3 border border-yellow-600/30 rounded" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        </div>
                      </div>

                      {/* Card Number */}
                      <div>
                        <p className="font-mono text-xl tracking-wider mb-1">
                          {showCardDetails ? selectedCard.fullNumber : `**** **** **** ${selectedCard.last4}`}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-white/60 text-xs">Expiry</p>
                              <p className="font-mono text-sm">{showCardDetails ? selectedCard.expiry : '**/**'}</p>
                            </div>
                            <div>
                              <p className="text-white/60 text-xs">CVV</p>
                              <p className="font-mono text-sm">{showCardDetails ? selectedCard.cvv : '***'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 text-xs">Card Holder</p>
                            <p className="text-sm font-medium">SHEHU KAMAL</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowCardDetails(!showCardDetails)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      {showCardDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span className="text-sm font-medium">
                        {showCardDetails ? 'Hide' : 'Show'}
                      </span>
                    </button>
                    <button
                      onClick={() => copyCardNumber(selectedCard)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <Copy size={16} />
                      <span className="text-sm font-medium">Copy</span>
                    </button>
                    <button
                      onClick={() => copyCardDetails(selectedCard)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <Share2 size={16} />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                    <button
                      onClick={() => toggleCardStatus(selectedCard.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors
                        ${selectedCard.status === 'paused' ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'}`}
                    >
                      {selectedCard.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                      <span className="text-sm font-medium">
                        {selectedCard.status === 'paused' ? 'Activate' : 'Pause'}
                      </span>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Balance & Top Up */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">Card Balance</p>
                    <p className="text-3xl font-display font-bold text-gray-900">${selectedCard.balance.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm mt-1">{selectedCard.currency}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-14 rounded-xl"
                      onClick={() => setShowTopUpModal(true)}
                    >
                      <Plus size={18} className="mr-2" />
                      Top Up
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-gray-200 h-14 rounded-xl"
                      onClick={() => {
                        setSettingsData({
                          dailyLimit: selectedCard.spendingLimits.daily.limit,
                          weeklyLimit: selectedCard.spendingLimits.weekly.limit,
                          monthlyLimit: selectedCard.spendingLimits.monthly.limit,
                          blockInternational: false,
                          blockOnline: false,
                          require3DS: true,
                        });
                        setShowSettingsModal(true);
                      }}
                    >
                      <Settings size={18} className="mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>

                {/* Spending Limits */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-velcro-green" />
                      <p className="font-semibold text-gray-900">Spending Limits</p>
                    </div>
                    <button 
                      onClick={() => setShowSettingsModal(true)}
                      className="text-sm text-velcro-green hover:underline"
                    >
                      Edit Limits
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* Daily Limit */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Daily</span>
                        <span className="font-medium">
                          ${selectedCard.spendingLimits.daily.used} / ${selectedCard.spendingLimits.daily.limit}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-velcro-green rounded-full transition-all"
                          style={{ width: `${getSpendingProgress(selectedCard.spendingLimits.daily.used, selectedCard.spendingLimits.daily.limit)}%` }}
                        />
                      </div>
                    </div>
                    {/* Weekly Limit */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Weekly</span>
                        <span className="font-medium">
                          ${selectedCard.spendingLimits.weekly.used} / ${selectedCard.spendingLimits.weekly.limit}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-velcro-navy rounded-full transition-all"
                          style={{ width: `${getSpendingProgress(selectedCard.spendingLimits.weekly.used, selectedCard.spendingLimits.weekly.limit)}%` }}
                        />
                      </div>
                    </div>
                    {/* Monthly Limit */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Monthly</span>
                        <span className="font-medium">
                          ${selectedCard.spendingLimits.monthly.used} / ${selectedCard.spendingLimits.monthly.limit}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${getSpendingProgress(selectedCard.spendingLimits.monthly.used, selectedCard.spendingLimits.monthly.limit)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-display font-semibold text-gray-900">Card Activity</h2>
                    <button 
                      onClick={() => setShowAllTransactions(true)}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      View All <ExternalLink size={14} />
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {selectedCard.transactions.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CreditCard size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                        <p className="text-gray-500 text-sm">Use this card to see your transaction history</p>
                      </div>
                    ) : (
                      selectedCard.transactions.slice(0, 5).map((tx, index) => (
                        <button 
                          key={tx.id}
                          onClick={() => setSelectedTransaction(tx)}
                          className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left
                            ${index !== Math.min(selectedCard.transactions.length, 5) - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-11 h-11 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${getBrandColor(tx.merchant)}15` }}
                            >
                              <img 
                                src={tx.logo} 
                                alt={tx.merchant}
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{tx.merchant}</p>
                              <p className="text-gray-400 text-xs">{tx.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-gray-900">-${tx.amount.toFixed(2)}</p>
                            <p className="text-green-600 text-xs flex items-center gap-1 justify-end">
                              <Check size={10} /> {tx.status}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Physical Card Tab */}
      {activeTab === 'physical' && (
        <div className="space-y-6">
          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-br from-velcro-navy to-blue-900 rounded-2xl p-8 text-white text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-10 top-10 w-40 h-40 rounded-full bg-white/20" />
              <div className="absolute left-10 bottom-10 w-32 h-32 rounded-full bg-white/10" />
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <CreditCard size={36} />
              </div>
              <span className="inline-block px-4 py-1.5 bg-velcro-green text-velcro-navy text-sm font-semibold rounded-full mb-4">
                Coming Soon
              </span>
              <h2 className="text-2xl font-display font-bold mb-2">Physical Card</h2>
              <p className="text-white/70 max-w-md mx-auto mb-6">
                Get your Velcro physical card delivered to your doorstep. 
                Use it anywhere Mastercard is accepted worldwide.
              </p>
              
              {/* Features Preview */}
              <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                {[
                  { icon: Globe, label: 'Global Acceptance' },
                  { icon: Lock, label: 'Chip & PIN' },
                  { icon: Zap, label: 'Contactless' },
                ].map((feature, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <feature.icon size={20} className="mx-auto mb-2" />
                    <p className="text-sm">{feature.label}</p>
                  </div>
                ))}
              </div>
              
              <Button 
                className="bg-white text-velcro-navy hover:bg-gray-100 font-semibold h-12 px-8 rounded-xl"
                onClick={() => toast.info('You will be notified when physical cards are available!')}
              >
                <Sparkles size={18} className="mr-2" />
                Notify Me
              </Button>
            </div>
          </div>

          {/* Card Preview */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Card Preview</h3>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white shadow-2xl">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="font-bold">V</span>
                      </div>
                      <span className="font-semibold text-sm">Velcro</span>
                    </div>
                    <span className="text-xs text-white/60">Debit</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded" />
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    </div>
                  </div>
                  <p className="font-mono text-lg tracking-wider mb-3">**** **** **** ****</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/60">YOUR NAME</p>
                    <p className="text-xs text-white/60">**/**</p>
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-velcro-green text-velcro-navy text-xs font-semibold rounded-full">
                  Coming Q2 2026
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'No Monthly Fees', desc: 'Zero maintenance charges' },
              { title: 'ATM Withdrawals', desc: 'Access cash globally' },
              { title: 'Instant Notifications', desc: 'Real-time transaction alerts' },
              { title: 'Freeze Anytime', desc: 'Control your card instantly' },
            ].map((benefit, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                <Check size={18} className="text-velcro-green mb-2" />
                <p className="font-semibold text-sm text-gray-900">{benefit.title}</p>
                <p className="text-xs text-gray-500 mt-1">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-gray-900">Create Virtual Card</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateCard} className="p-5 space-y-5">
              {/* Card Nickname */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Card Nickname *</Label>
                <Input
                  placeholder="e.g., Netflix Card, Shopping Card"
                  value={newCardData.nickname}
                  onChange={(e) => setNewCardData({ ...newCardData, nickname: e.target.value })}
                  className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                />
              </div>

              {/* Card Type */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Card Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['visa', 'mastercard'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewCardData({ ...newCardData, type: type as any })}
                      className={`p-4 rounded-xl border-2 transition-all text-center
                        ${newCardData.type === type 
                          ? 'border-velcro-green bg-velcro-green/5' 
                          : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="w-16 h-10 mx-auto rounded-lg mb-2 overflow-hidden">
                        {type === 'visa' ? (
                          <div className="w-full h-full bg-[#1A1F71] flex items-center justify-center">
                            <span className="text-white font-bold text-sm italic tracking-tight">VISA</span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-[#F5F5F5] flex items-center justify-center relative">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-[#EB001B] rounded-full"></div>
                              <div className="w-4 h-4 bg-[#F79E1B] rounded-full -ml-2"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${newCardData.type === type ? 'text-gray-900' : 'text-gray-600'}`}>
                        {type === 'visa' ? 'Visa' : 'Mastercard'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Balance */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Initial Balance (USD)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newCardData.initialBalance}
                    onChange={(e) => setNewCardData({ ...newCardData, initialBalance: e.target.value })}
                    className="pl-10 py-5 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Source Wallet */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Fund Source</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewCardData({ ...newCardData, source: 'naira' })}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${newCardData.source === 'naira' 
                        ? 'border-velcro-green bg-velcro-green/5' 
                        : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img src="logos/ng.png" alt="NGN" className="w-6 h-6 object-contain" />
                      <span className={`font-medium ${newCardData.source === 'naira' ? 'text-gray-900' : 'text-gray-600'}`}>
                        Naira Wallet
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">₦2,450,000.50 available</p>
                    {newCardData.initialBalance && newCardData.source === 'naira' && (
                      <p className="text-xs text-velcro-green mt-1">
                        ≈ ₦{(Number(newCardData.initialBalance) * 1500).toLocaleString()}
                      </p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCardData({ ...newCardData, source: 'usdc' })}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${newCardData.source === 'usdc' 
                        ? 'border-velcro-green bg-velcro-green/5' 
                        : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img src="logos/usdc.png" alt="USDC" className="w-6 h-6 object-contain" />
                      <span className={`font-medium ${newCardData.source === 'usdc' ? 'text-gray-900' : 'text-gray-600'}`}>
                        USDC Wallet
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">$1,250.00 available</p>
                  </button>
                </div>
              </div>

              {/* Spending Limits */}
              <div className="space-y-3">
                <Label className="text-sm text-gray-600">Spending Limits (USD)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Daily</Label>
                    <Input
                      type="number"
                      value={newCardData.dailyLimit}
                      onChange={(e) => setNewCardData({ ...newCardData, dailyLimit: e.target.value })}
                      className="text-sm rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Weekly</Label>
                    <Input
                      type="number"
                      value={newCardData.weeklyLimit}
                      onChange={(e) => setNewCardData({ ...newCardData, weeklyLimit: e.target.value })}
                      className="text-sm rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Monthly</Label>
                    <Input
                      type="number"
                      value={newCardData.monthlyLimit}
                      onChange={(e) => setNewCardData({ ...newCardData, monthlyLimit: e.target.value })}
                      className="text-sm rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-2">
                <Shield size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Your virtual card will be ready instantly. You can top up and manage limits anytime.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Create Card
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {showTopUpModal && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowTopUpModal(false); setTopUpSource('naira'); }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-900">Top Up Card</h2>
                  <p className="text-sm text-gray-500">{selectedCard.nickname}</p>
                </div>
                <button
                  onClick={() => { setShowTopUpModal(false); setTopUpSource('naira'); }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="pl-10 py-5 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Fund Source */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Fund Source</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTopUpSource('naira')}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${topUpSource === 'naira' 
                        ? 'border-velcro-green bg-velcro-green/5' 
                        : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img src="logos/ng.png" alt="NGN" className="w-6 h-6 object-contain" />
                      <span className={`font-medium ${topUpSource === 'naira' ? 'text-gray-900' : 'text-gray-600'}`}>
                        Naira Wallet
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">₦2,450,000.50 available</p>
                    {topUpAmount && topUpSource === 'naira' && (
                      <p className="text-xs text-velcro-green mt-1">
                        ≈ ₦{(Number(topUpAmount) * 1500).toLocaleString()}
                      </p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTopUpSource('usdc')}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${topUpSource === 'usdc' 
                        ? 'border-velcro-green bg-velcro-green/5' 
                        : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img src="logos/usdc.png" alt="USDC" className="w-6 h-6 object-contain" />
                      <span className={`font-medium ${topUpSource === 'usdc' ? 'text-gray-900' : 'text-gray-600'}`}>
                        USDC Wallet
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">$1,250.00 available</p>
                  </button>
                </div>
              </div>
              
              {/* Quick Amounts */}
              <div className="flex gap-2">
                {[50, 100, 200, 500].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTopUpAmount(amount.toString())}
                    className="flex-1 py-2 border border-gray-200 rounded-xl text-sm hover:border-velcro-green hover:bg-velcro-green/5 transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Current Balance */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Current Balance</span>
                  <span className="font-medium text-gray-900">${selectedCard.balance.toFixed(2)}</span>
                </div>
                {topUpAmount && (
                  <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-gray-200">
                    <span className="text-gray-500">New Balance</span>
                    <span className="font-medium text-green-600">
                      ${(selectedCard.balance + Number(topUpAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100">
              <Button
                onClick={handleTopUpRequest}
                disabled={isLoading || !topUpAmount}
                className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-gray-900">Card Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-6">
              {/* Spending Limits */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-velcro-green" />
                  <h3 className="font-semibold text-gray-900">Spending Limits</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Daily Limit (USD)</Label>
                    <Input
                      type="number"
                      value={settingsData.dailyLimit}
                      onChange={(e) => setSettingsData({ ...settingsData, dailyLimit: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Weekly Limit (USD)</Label>
                    <Input
                      type="number"
                      value={settingsData.weeklyLimit}
                      onChange={(e) => setSettingsData({ ...settingsData, weeklyLimit: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Monthly Limit (USD)</Label>
                    <Input
                      type="number"
                      value={settingsData.monthlyLimit}
                      onChange={(e) => setSettingsData({ ...settingsData, monthlyLimit: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Security</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Change PIN Button */}
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowChangePinModal(true);
                    }}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <KeyRound size={20} className="text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-gray-900">Change PIN</p>
                        <p className="text-xs text-gray-500">Update your card PIN</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-gray-900">3D Secure</p>
                      <p className="text-xs text-gray-500">Require OTP for online transactions</p>
                    </div>
                    <Switch
                      checked={settingsData.require3DS}
                      onCheckedChange={(checked) => setSettingsData({ ...settingsData, require3DS: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-gray-900">Block International</p>
                      <p className="text-xs text-gray-500">Disable foreign transactions</p>
                    </div>
                    <Switch
                      checked={settingsData.blockInternational}
                      onCheckedChange={(checked) => setSettingsData({ ...settingsData, blockInternational: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-gray-900">Online Purchases</p>
                      <p className="text-xs text-gray-500">Disable online transactions</p>
                    </div>
                    <Switch
                      checked={settingsData.blockOnline}
                      onCheckedChange={(checked) => setSettingsData({ ...settingsData, blockOnline: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100">
              <Button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Card Modal */}
      {showDeleteModal && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h2 className="text-lg font-display font-bold text-gray-900 mb-2">Delete Card?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete <strong>{selectedCard.nickname}</strong>? 
                This action cannot be undone and any remaining balance will be returned to your wallet.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteCard}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Transactions Modal */}
      {showAllTransactions && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAllTransactions(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAllTransactions(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-500" />
                </button>
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-900">All Transactions</h2>
                  <p className="text-sm text-gray-500">{selectedCard.nickname}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Filter size={18} className="text-gray-500" />
                </button>
                <button 
                  onClick={() => toast.info('Export coming soon!')}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Download size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {selectedCard.transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-500 text-sm">Use this card to see your transaction history</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {selectedCard.transactions.map((tx) => (
                    <button 
                      key={tx.id}
                      onClick={() => {
                        setSelectedTransaction(tx);
                        setShowAllTransactions(false);
                      }}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${getBrandColor(tx.merchant)}15` }}
                        >
                          <img 
                            src={tx.logo} 
                            alt={tx.merchant}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{tx.merchant}</p>
                          <p className="text-gray-400 text-xs">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900">-${tx.amount.toFixed(2)}</p>
                        <p className="text-green-600 text-xs flex items-center gap-1 justify-end">
                          <Check size={10} /> {tx.status}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedTransaction(null)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
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
            
            <div className="p-5 space-y-6">
              {/* Merchant & Amount */}
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${getBrandColor(selectedTransaction.merchant)}15` }}
                >
                  <img 
                    src={selectedTransaction.logo} 
                    alt={selectedTransaction.merchant}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                  {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                </span>
                <p className="text-3xl font-display font-bold text-gray-900 mt-3">
                  -${selectedTransaction.amount.toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm mt-1">{selectedTransaction.merchant}</p>
              </div>
              
              {/* Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Hash size={14} />
                    <span>Transaction ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">#{selectedTransaction.id.toString().padStart(8, '0')}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTransaction.id.toString().padStart(8, '0'));
                        toast.success('Copied!');
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <CreditCardIcon size={14} />
                    <span>Card Used</span>
                  </div>
                  <span className="text-sm">**** {selectedTransaction.cardLast4}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={14} />
                    <span>Date</span>
                  </div>
                  <span className="text-sm">{selectedTransaction.date}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin size={14} />
                    <span>Location</span>
                  </div>
                  <span className="text-sm">{selectedTransaction.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Hash size={14} />
                    <span>Auth Code</span>
                  </div>
                  <span className="font-mono text-sm">{selectedTransaction.authCode}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Category</span>
                  <span className="text-sm font-medium">{selectedTransaction.category}</span>
                </div>
                
                {selectedTransaction.description && (
                  <div className="flex items-start justify-between">
                    <span className="text-gray-500 text-sm">Description</span>
                    <span className="text-sm text-right max-w-[60%]">{selectedTransaction.description}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-500 text-sm">Fee</span>
                  <span className="text-sm font-medium">$0.00</span>
                </div>
              </div>

              {/* Help & Support Section */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <HeadphonesIcon size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Need Help?</h3>
                </div>
                
                <div className="space-y-2">
                  {/* Email Support */}
                  <Button
                    variant="outline"
                    onClick={() => handleEmailSupport(selectedTransaction)}
                    className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300 h-12 rounded-xl justify-start"
                  >
                    <Mail size={18} className="mr-3 text-blue-600" />
                    <div className="text-left flex-1">
                      <span className="text-sm font-medium text-gray-900">Email Support</span>
                      <p className="text-xs text-gray-500">support@usevelcro.com</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-400" />
                  </Button>

                  {/* WhatsApp Support */}
                  <Button
                    variant="outline"
                    onClick={() => handleWhatsAppSupport(selectedTransaction)}
                    className="w-full border-green-200 hover:bg-green-50 hover:border-green-300 h-12 rounded-xl justify-start"
                  >
                    <img src="images/whatsapp-logo.png" alt="WhatsApp" className="w-5 h-5 mr-3" />
                    <div className="text-left flex-1">
                      <span className="text-sm font-medium text-gray-900">WhatsApp Support</span>
                      <p className="text-xs text-gray-500">+234 800 123 4567</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-400" />
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-700 text-center">
                    Include your Transaction ID and Auth Code when contacting support for faster assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={resetChangePinFlow}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <KeyRound size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">Change PIN</h2>
                    <p className="text-sm text-gray-500">
                      Step {changePinStep === 'bvn' ? '1' : changePinStep === 'otp' ? '2' : changePinStep === 'newpin' ? '3' : '4'} of 4
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetChangePinFlow}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Step 1: BVN Verification */}
            {changePinStep === 'bvn' && (
              <div className="p-5 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Fingerprint size={32} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Verify Your Identity</h3>
                  <p className="text-sm text-gray-500">Enter your BVN to continue</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Bank Verification Number (BVN)</Label>
                  <Input
                    type="text"
                    maxLength={11}
                    placeholder="Enter 11-digit BVN"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-lg tracking-widest focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl flex items-start gap-2">
                  <Shield size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Your BVN is securely encrypted and used only for identity verification.
                  </p>
                </div>

                <Button
                  onClick={handleChangePinSubmitBvn}
                  disabled={isLoading || bvn.length !== 11}
                  className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {changePinStep === 'otp' && (
              <div className="p-5 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enter OTP</h3>
                  <p className="text-sm text-gray-500">Enter the 6-digit code sent to your email</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">One-Time Password (OTP)</Label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-[0.5em] focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-500">Didn't receive code?</span>
                  <button 
                    onClick={() => toast.success('OTP resent!')}
                    className="text-velcro-green font-medium hover:underline"
                  >
                    Resend
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setChangePinStep('bvn')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleChangePinVerifyOtp}
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: New PIN */}
            {changePinStep === 'newpin' && (
              <div className="p-5 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-velcro-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={32} className="text-velcro-green" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Create New PIN</h3>
                  <p className="text-sm text-gray-500">Enter a new 4-digit PIN for your card</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">New PIN</Label>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="****"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-[0.5em] focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className={newPin.length === 4 ? 'text-green-500' : 'text-gray-300'} />
                    <span>4 digits required</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setChangePinStep('otp')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleChangePinSubmitNewPin}
                    disabled={newPin.length !== 4}
                    className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Confirm PIN */}
            {changePinStep === 'confirm' && (
              <div className="p-5 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-velcro-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} className="text-velcro-green" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Confirm PIN</h3>
                  <p className="text-sm text-gray-500">Re-enter your new PIN to confirm</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Confirm PIN</Label>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="****"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-[0.5em] focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>

                {confirmPin && newPin !== confirmPin && (
                  <div className="p-3 bg-red-50 rounded-xl flex items-center gap-2">
                    <XCircle size={16} className="text-red-600" />
                    <p className="text-sm text-red-600">PINs do not match</p>
                  </div>
                )}

                {confirmPin && newPin === confirmPin && (
                  <div className="p-3 bg-green-50 rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <p className="text-sm text-green-600">PINs match!</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setChangePinStep('newpin')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleChangePinComplete}
                    disabled={isLoading || newPin !== confirmPin || confirmPin.length !== 4}
                    className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                    ) : (
                      'Change PIN'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Up PIN Verification Modal */}
      {showTopUpPinModal && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowTopUpPinModal(false);
              setTopUpPin('');
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-velcro-green/20 rounded-xl flex items-center justify-center">
                    <Lock size={20} className="text-velcro-green" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">Enter PIN</h2>
                    <p className="text-sm text-gray-500">Verify to complete top up</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTopUpPinModal(false);
                    setTopUpPin('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-gray-900">${Number(topUpAmount).toFixed(2)}</p>
                <p className="text-gray-500 text-sm mt-1">{selectedCard.nickname}</p>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Card PIN</Label>
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="****"
                  value={topUpPin}
                  onChange={(e) => setTopUpPin(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-[0.5em] focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  autoFocus
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} className="text-velcro-green" />
                  <span>Secure PIN verification</span>
                </div>
              </div>
              
              <Button
                onClick={handleTopUpWithPin}
                disabled={isLoading || topUpPin.length !== 4}
                className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Top Up
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
