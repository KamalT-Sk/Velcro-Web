import { useState } from 'react';
import { 
  Zap, 
  Smartphone, 
  Tv, 
  Wifi, 
  Droplets, 
  Plane, 
  Ticket,
  Landmark,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Search,
  CreditCard,
  Radio,
  Monitor,
  Flame,
  Receipt,
  Shield,
  Check,
  CheckCircle,
  Gamepad2,
  FileText,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UtilityCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  providers: UtilityProvider[];
}

interface UtilityProvider {
  id: string;
  name: string;
  logo: string;
  category: string;
}

const utilityCategories: UtilityCategory[] = [
  {
    id: 'airtime',
    name: 'Airtime & Data',
    icon: Smartphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    providers: [
      { id: 'mtn', name: 'MTN Nigeria', logo: '/utilities/mtn.png', category: 'airtime' },
      { id: 'airtel', name: 'Airtel Nigeria', logo: '/utilities/airtel.png', category: 'airtime' },
      { id: 'glo', name: 'Glo Mobile', logo: '/utilities/glo.png', category: 'airtime' },
      { id: '9mobile', name: '9mobile', logo: '/utilities/9mobile.png', category: 'airtime' },
    ],
  },
  {
    id: 'internet',
    name: 'Internet & Broadband',
    icon: Wifi,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    providers: [
      { id: 'spectranet', name: 'Spectranet', logo: '/utilities/spectranet.png', category: 'internet' },
      { id: 'smile', name: 'Smile Nigeria', logo: '/utilities/smile.png', category: 'internet' },
    ],
  },
  {
    id: 'electricity',
    name: 'Electricity',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    providers: [
      { id: 'ikedc', name: 'IKEDC (Ikeja)', logo: '/utilities/ikedc.png', category: 'electricity' },
      { id: 'ekedc', name: 'EKEDC (Eko)', logo: '/utilities/ekedc.png', category: 'electricity' },
    ],
  },
  {
    id: 'cable',
    name: 'Cable TV',
    icon: Monitor,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
    providers: [
      { id: 'dstv', name: 'DStv', logo: '/utilities/dstv.png', category: 'cable' },
      { id: 'gotv', name: 'GOtv', logo: '/utilities/gotv.png', category: 'cable' },
      { id: 'startimes', name: 'StarTimes', logo: '/utilities/startimes.png', category: 'cable' },
    ],
  },
  {
    id: 'water',
    name: 'Water',
    icon: Droplets,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-100',
    providers: [
      { id: 'lwc', name: 'Lagos Water Corporation', logo: '/utilities/ekedc.png', category: 'water' },
    ],
  },
  {
    id: 'betting',
    name: 'Betting & Gaming',
    icon: Ticket,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    providers: [
      { id: 'bet9ja', name: 'Bet9ja', logo: '/utilities/startimes.png', category: 'betting' },
      { id: 'sportybet', name: 'SportyBet', logo: '/utilities/spectranet.png', category: 'betting' },
    ],
  },
  {
    id: 'government',
    name: 'Government & Taxes',
    icon: Landmark,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-100',
    providers: [
      { id: 'lasra', name: 'LASRA (Lagos)', logo: '/utilities/ikedc.png', category: 'government' },
    ],
  },
];

// Flight booking data
interface AirlineData {
  id: string;
  name: string;
  logo: string;
}

const nigerianAirports = [
  'Lagos (LOS) - Murtala Muhammed',
  'Abuja (ABV) - Nnamdi Azikiwe',
  'Port Harcourt (PHC) - Port Harcourt Intl',
  'Kano (KAN) - Mallam Aminu Kano',
  'Enugu (ENU) - Akanu Ibiam',
  'Owerri (QOW) - Sam Mbakwe',
  'Benin (BNI) - Benin City',
  'Ibadan (IBA) - Ibadan Airport',
  'Calabar (CBQ) - Margaret Ekpo',
  'Asaba (ABB) - Asaba Airport',
];

interface PaymentSource {
  type: 'ngn' | 'usdc';
  balance: number;
  symbol: string;
}

export function Utilities() {
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<UtilityProvider | null>(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [paymentSource, setPaymentSource] = useState<'ngn' | 'usdc'>('ngn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Flight booking state
  const [showFlightBooking, setShowFlightBooking] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState<AirlineData | null>(null);
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');

  const paymentSources: PaymentSource[] = [
    { type: 'ngn', balance: 2450000.50, symbol: '₦' },
    { type: 'usdc', balance: 1250.00, symbol: '$' },
  ];

  const airlines: AirlineData[] = [
    { id: 'airpeace', name: 'Air Peace', logo: '/utilities/airpeace.png' },
    { id: 'arikair', name: 'Arik Air', logo: '/utilities/arikair.png' },
    { id: 'danaair', name: 'Dana Air', logo: '/utilities/danaair.png' },
    { id: 'greenafrica', name: 'Green Africa', logo: '/utilities/greenafrica.png' },
  ];

  const filteredCategories = utilityCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePay = async () => {
    if (!amount || !accountNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);

    const source = paymentSources.find(s => s.type === paymentSource);
    toast.success(`Payment of ${source?.symbol}${amount} to ${selectedProvider?.name} successful!`);
    
    setAmount('');
    setAccountNumber('');
    setSelectedProvider(null);
    setSelectedCategory(null);
  };

  const handleFlightSearch = () => {
    if (!fromAirport || !toAirport || !departureDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (fromAirport === toAirport) {
      toast.error('Origin and destination cannot be the same');
      return;
    }
    toast.info('Searching for flights...');
  };

  const handleFlightBook = async () => {
    if (!selectedAirline) {
      toast.error('Please select an airline');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);

    toast.success(`Flight booked with ${selectedAirline.name}! Check your email for confirmation.`);
    setShowFlightBooking(false);
    setSelectedAirline(null);
    setFromAirport('');
    setToAirport('');
    setDepartureDate('');
    setReturnDate('');
    setPassengers(1);
  };

  const renderCategories = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-1">Bills & Utilities</h1>
          <p className="text-gray-500 text-sm">Pay for airtime, data, electricity, and more</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search utilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none"
          />
        </div>
      </div>

      {/* Flight Booking Card */}
      <div 
        onClick={() => setShowFlightBooking(true)}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full mb-3">
              <Plane size={16} className="text-white" />
              <span className="text-white/90 text-xs font-medium">Book Flights</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Fly anywhere in Nigeria</h3>
            <p className="text-white/70 text-sm">Book domestic flights with top airlines</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {airlines.slice(0, 3).map((airline) => (
                <div key={airline.id} className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-white bg-white overflow-hidden">
                  <img src={airline.logo} alt={airline.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowRight size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="group p-3 sm:p-4 bg-white border border-gray-100 rounded-2xl hover:border-velcro-green hover:shadow-soft transition-all text-left"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${category.bgColor} ${category.borderColor} border rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={category.color} />
                </div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{category.name}</p>
                <p className="text-gray-400 text-xs mt-1">{category.providers.length} providers</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-velcro-navy via-blue-900 to-indigo-900 rounded-2xl p-4 sm:p-6 text-white">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Smartphone, label: 'Buy Airtime', action: () => setSelectedCategory(utilityCategories[0]), color: 'bg-blue-500/20' },
            { icon: Zap, label: 'Pay Electricity', action: () => setSelectedCategory(utilityCategories[2]), color: 'bg-amber-500/20' },
            { icon: Monitor, label: 'Cable TV', action: () => setSelectedCategory(utilityCategories[3]), color: 'bg-rose-500/20' },
            { icon: Wifi, label: 'Internet', action: () => setSelectedCategory(utilityCategories[1]), color: 'bg-purple-500/20' },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={item.action}
              className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center group"
            >
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <item.icon size={20} className="text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFlightBooking = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            setShowFlightBooking(false);
            setSelectedAirline(null);
          }}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-gray-900">Book a Flight</h2>
          <p className="text-gray-500 text-sm">Search and book domestic flights</p>
        </div>
      </div>

      {!selectedAirline ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Trip Type */}
          <div>
            <Label className="text-sm text-gray-600 mb-3 block">Trip Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTripType('one-way')}
                className={`p-3 rounded-xl border-2 transition-all
                  ${tripType === 'one-way' 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                <span className={`font-medium text-sm ${tripType === 'one-way' ? 'text-gray-900' : 'text-gray-600'}`}>
                  One Way
                </span>
              </button>
              <button
                onClick={() => setTripType('round-trip')}
                className={`p-3 rounded-xl border-2 transition-all
                  ${tripType === 'round-trip' 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                <span className={`font-medium text-sm ${tripType === 'round-trip' ? 'text-gray-900' : 'text-gray-600'}`}>
                  Round Trip
                </span>
              </button>
            </div>
          </div>

          {/* From/To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
                <MapPin size={14} />
                From
              </Label>
              <select
                value={fromAirport}
                onChange={(e) => setFromAirport(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-velcro-green/20 text-sm bg-white"
              >
                <option value="">Select airport</option>
                {nigerianAirports.map((airport) => (
                  <option key={airport} value={airport}>{airport}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
                <MapPin size={14} />
                To
              </Label>
              <select
                value={toAirport}
                onChange={(e) => setToAirport(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-velcro-green/20 text-sm bg-white"
              >
                <option value="">Select airport</option>
                {nigerianAirports.map((airport) => (
                  <option key={airport} value={airport}>{airport}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
                <Calendar size={14} />
                Departure Date
              </Label>
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="py-3 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
              />
            </div>
            {tripType === 'round-trip' && (
              <div>
                <Label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
                  <Calendar size={14} />
                  Return Date
                </Label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="py-3 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Passengers */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
              <Users size={14} />
              Passengers
            </Label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center text-lg font-medium"
              >
                -
              </button>
              <span className="text-lg font-semibold w-8 text-center">{passengers}</span>
              <button
                onClick={() => setPassengers(Math.min(9, passengers + 1))}
                className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center text-lg font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleFlightSearch}
            className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
          >
            <Plane size={18} className="mr-2" />
            Search Flights
          </Button>

          {/* Airlines */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">Partner Airlines</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {airlines.map((airline) => (
                <button
                  key={airline.id}
                  onClick={() => setSelectedAirline(airline)}
                  className="p-3 sm:p-4 border border-gray-100 rounded-xl hover:border-velcro-green hover:bg-velcro-green/5 transition-all text-center"
                >
                  <img src={airline.logo} alt={airline.name} className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full object-cover" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{airline.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div className="text-center">
            <img src={selectedAirline.logo} alt={selectedAirline.name} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full object-cover" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{selectedAirline.name}</h3>
            <p className="text-gray-500 text-sm">Confirm your booking details</p>
          </div>

          <div className="p-3 sm:p-4 bg-gray-50 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">From</span>
              <span className="font-medium">{fromAirport.split(' - ')[0]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">To</span>
              <span className="font-medium">{toAirport.split(' - ')[0]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{departureDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Passengers</span>
              <span className="font-medium">{passengers}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setSelectedAirline(null)}
              className="flex-1 h-12 rounded-xl"
            >
              Back
            </Button>
            <Button 
              onClick={handleFlightBook}
              disabled={isProcessing}
              className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderProviderSelection = () => {
    if (!selectedCategory) return null;
    const Icon = selectedCategory.icon;

    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${selectedCategory.bgColor} rounded-xl flex items-center justify-center`}>
              <Icon size={20} className={selectedCategory.color} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-gray-900">{selectedCategory.name}</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Select a provider</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {selectedCategory.providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className="flex items-center gap-4 p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:border-velcro-green hover:shadow-soft transition-all"
            >
              <img src={provider.logo} alt={provider.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" />
              <span className="font-medium text-gray-900 text-sm sm:text-base">{provider.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (!selectedProvider) return null;

    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedProvider(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <img src={selectedProvider.logo} alt={selectedProvider.name} className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-gray-900">{selectedProvider.name}</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Enter payment details</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5">
          {/* Account Number / Meter Number */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">
              {selectedProvider.category === 'electricity' ? 'Meter Number' : 
               selectedProvider.category === 'cable' ? 'Smart Card Number' : 
               selectedProvider.category === 'internet' ? 'Account Number' : 'Phone Number'}
            </Label>
            <Input
              type="text"
              placeholder={`Enter ${selectedProvider.category === 'electricity' ? 'meter' : 'account'} number`}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="py-3 sm:py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
            />
          </div>

          {/* Amount */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                {paymentSources.find(s => s.type === paymentSource)?.symbol}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 py-3 sm:py-4 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
              />
            </div>
          </div>

          {/* Payment Source */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">Pay With</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentSources.map((source) => (
                <button
                  key={source.type}
                  onClick={() => setPaymentSource(source.type)}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left
                    ${paymentSource === source.type 
                      ? 'border-velcro-green bg-velcro-green/5' 
                      : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <p className={`font-medium text-sm ${paymentSource === source.type ? 'text-gray-900' : 'text-gray-600'}`}>
                    {source.type === 'ngn' ? 'Naira Wallet' : 'USDC Wallet'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {source.symbol}{source.balance.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Pay Now
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  if (showFlightBooking) {
    return renderFlightBooking();
  }

  if (selectedProvider) {
    return renderPaymentForm();
  }

  if (selectedCategory) {
    return renderProviderSelection();
  }

  return renderCategories();
}
