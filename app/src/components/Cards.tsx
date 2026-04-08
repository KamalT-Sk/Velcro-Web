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
  CreditCardIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Subscription brands data
const subscriptionBrands = [
  { name: 'Netflix', logo: '/brands/netflix.png', color: '#E50914' },
  { name: 'Spotify', logo: '/brands/spotify.png', color: '#1DB954' },
  { name: 'YouTube', logo: '/brands/youtube.png', color: '#FF0000' },
  { name: 'Apple Music', logo: '/brands/apple-music.png', color: '#FA243C' },
  { name: 'Amazon', logo: '/brands/amazon.png', color: '#FF9900' },
  { name: 'Disney+', logo: '/brands/disney.png', color: '#113CCF' },
];

// Virtual card transactions with more details
const cardTransactions = [
  { 
    id: 1, 
    merchant: 'Netflix', 
    amount: 15.99, 
    date: 'Today, 8:00 AM', 
    status: 'completed', 
    logo: '/brands/netflix.png',
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
    logo: '/brands/spotify.png',
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
    logo: '/brands/youtube.png',
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
    logo: '/brands/apple-music.png',
    cardLast4: '5678',
    category: 'Entertainment',
    location: 'Online',
    authCode: '127643',
    description: 'Individual plan'
  },
];

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

export function Cards() {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isCardPaused, setIsCardPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'virtual' | 'physical'>('virtual');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpMethod, setTopUpMethod] = useState<'naira' | 'usdc'>('naira');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CardTransaction | null>(null);

  const copyCardNumber = () => {
    navigator.clipboard.writeText('4532 8847 1234 5678');
    toast.success('Card number copied!');
  };

  const toggleCardStatus = () => {
    setIsCardPaused(!isCardPaused);
    toast.success(isCardPaused ? 'Card activated' : 'Card paused');
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    const methodName = topUpMethod === 'naira' ? 'Naira wallet' : 'USDC wallet';
    toast.success(`Card topped up with $${amount.toFixed(2)} from ${methodName}!`);
    setShowTopUpModal(false);
    setTopUpAmount('');
  };

  const handleEmailSupport = (tx: CardTransaction) => {
    const subject = `Support Request - Card Transaction #${tx.id.toString().padStart(8, '0')}`;
    const body = `Hello Velcro Support,%0D%0A%0D%AI need help with the following card transaction:%0D%0A%0D%0A- Transaction ID: ${tx.id.toString().padStart(8, '0')}%0D%0A- Merchant: ${tx.merchant}%0D%0A- Amount: $${tx.amount.toFixed(2)}%0D%0A- Date: ${tx.date}%0D%0A- Status: ${tx.status}%0D%0A- Auth Code: ${tx.authCode}%0D%0A%0D%0APlease describe your issue here...`;
    window.open(`mailto:support@usevelcro.com?subject=${encodeURIComponent(subject)}&body=${body}`);
    toast.success('Opening email client...');
  };

  const handleWhatsAppSupport = (tx: CardTransaction) => {
    const message = `Hello Velcro Support, I need help with Card Transaction #${tx.id.toString().padStart(8, '0')} - $${tx.amount.toFixed(2)} at ${tx.merchant} on ${tx.date}`;
    window.open(`https://wa.me/2348001234567?text=${encodeURIComponent(message)}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Cards</h1>
          <p className="text-gray-500 text-sm">Manage your virtual and physical cards</p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-velcro-green" />
          <span className="text-sm text-gray-600">Powered by Mastercard</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { id: 'virtual', label: 'Virtual Card' },
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

      {/* Virtual Card Tab */}
      {activeTab === 'virtual' && (
        <div className="space-y-6">
          {/* Virtual Card Display */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Card Visual */}
            <div className="relative">
              <div className="virtual-card rounded-2xl p-6 text-white relative overflow-hidden h-56">
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
                      <span className="font-semibold">Velcro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCardPaused && (
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
                      {showCardDetails ? '4532 8847 1234 5678' : '**** **** **** 5678'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-white/60 text-xs">Expiry</p>
                          <p className="font-mono text-sm">{showCardDetails ? '12/27' : '**/**'}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs">CVV</p>
                          <p className="font-mono text-sm">{showCardDetails ? '847' : '***'}</p>
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

              {/* Card Actions */}
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
                  onClick={copyCardNumber}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Copy size={16} />
                  <span className="text-sm font-medium">Copy</span>
                </button>
                <button
                  onClick={toggleCardStatus}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors
                    ${isCardPaused ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'}`}
                >
                  {isCardPaused ? <Play size={16} /> : <Pause size={16} />}
                  <span className="text-sm font-medium">
                    {isCardPaused ? 'Activate' : 'Pause'}
                  </span>
                </button>
              </div>
            </div>

            {/* Card Details & Limits */}
            <div className="space-y-4">
              {/* Balance */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">Card Balance</p>
                <p className="text-3xl font-display font-bold text-gray-900">$500.00</p>
                <p className="text-gray-400 text-sm mt-1">≈ ₦750,000 NGN</p>
              </div>

              {/* Limits */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-900">Card Limits</p>
                  <span className="text-xs text-gray-500">Monthly</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium">$150 / $5,000</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[3%] bg-velcro-green rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Transactions</span>
                      <span className="font-medium">12 / 100</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[12%] bg-velcro-navy rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl"
                  onClick={() => setShowTopUpModal(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Top Up
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-200 h-12 rounded-xl"
                  onClick={() => toast.info('Card settings coming soon!')}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Change PIN
                </Button>
              </div>
            </div>
          </div>

          {/* Top Up Modal */}
          {showTopUpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowTopUpModal(false)}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Plus size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-display font-bold text-gray-900">Top Up Card</h2>
                        <p className="text-sm text-gray-500">Add funds to your virtual card</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTopUpModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-5 space-y-5">
                  {/* Source Selection */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Source</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setTopUpMethod('naira')}
                        className={`p-4 rounded-xl border-2 transition-all text-left
                          ${topUpMethod === 'naira' 
                            ? 'border-velcro-green bg-velcro-green/5' 
                            : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <img src="/logos/ng.png" alt="NGN" className="w-6 h-6 object-contain" />
                          <span className={`font-medium ${topUpMethod === 'naira' ? 'text-gray-900' : 'text-gray-600'}`}>
                            Naira Wallet
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">₦2,450,000.50 available</p>
                      </button>
                      <button
                        onClick={() => setTopUpMethod('usdc')}
                        className={`p-4 rounded-xl border-2 transition-all text-left
                          ${topUpMethod === 'usdc' 
                            ? 'border-velcro-green bg-velcro-green/5' 
                            : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <img src="/logos/usdc.png" alt="USDC" className="w-6 h-6 object-contain" />
                          <span className={`font-medium ${topUpMethod === 'usdc' ? 'text-gray-900' : 'text-gray-600'}`}>
                            USDC Wallet
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">$1,250.00 available</p>
                      </button>
                    </div>
                  </div>
                  
                  {/* Amount */}
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
                    {topUpMethod === 'naira' && topUpAmount && (
                      <p className="text-gray-500 text-sm mt-2">
                        ≈ ₦{(Number(topUpAmount) * 1500).toLocaleString()} NGN
                      </p>
                    )}
                  </div>
                  
                  {/* Exchange Rate Info */}
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Exchange Rate</span>
                      <span className="font-medium text-gray-900">1 USD = ₦1,500</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-500">Fee</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 border-t border-gray-100">
                  <Button
                    onClick={handleTopUp}
                    disabled={isLoading}
                    className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                    ) : (
                      <>
                        Top Up Card
                        <ArrowRight size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Supported Subscriptions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-gray-900">Works With</h2>
              <span className="text-sm text-gray-500">Popular subscriptions</span>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {subscriptionBrands.map((brand) => (
                <div
                  key={brand.name}
                  className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-soft transition-all cursor-pointer text-center"
                >
                  <div 
                    className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${brand.color}15` }}
                  >
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{brand.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Card Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-gray-900">Card Activity</h2>
              <button 
                onClick={() => toast.info('Full transaction history coming soon!')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                View All <ExternalLink size={14} />
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {cardTransactions.map((tx, index) => (
                <button 
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left
                    ${index !== cardTransactions.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
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
                  Coming Q2 2024
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

      {/* Card Transaction Detail Modal */}
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
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gray-100">
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
                    <img src="/images/whatsapp-logo.png" alt="WhatsApp" className="w-5 h-5 mr-3" />
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
    </div>
  );
}
