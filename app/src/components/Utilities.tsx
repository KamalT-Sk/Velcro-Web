import { useState } from 'react';
import { 
  Zap, 
  Smartphone, 
  Tv, 
  Wifi, 
  Droplets, 
  Plane, 
  Gamepad2,
  Landmark,
  ArrowLeft,
  Calendar,
  Users,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UtilityCategory {
  id: string;
  name: string;
  icon: React.ElementType;
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
    providers: [
      { id: 'spectranet', name: 'Spectranet', logo: '/utilities/spectranet.png', category: 'internet' },
      { id: 'smile', name: 'Smile Nigeria', logo: '/utilities/smile.png', category: 'internet' },
    ],
  },
  {
    id: 'electricity',
    name: 'Electricity',
    icon: Zap,
    providers: [
      { id: 'ikedc', name: 'IKEDC (Ikeja)', logo: '/utilities/ikedc.png', category: 'electricity' },
      { id: 'ekedc', name: 'EKEDC (Eko)', logo: '/utilities/ekedc.png', category: 'electricity' },
    ],
  },
  {
    id: 'cable',
    name: 'Cable TV',
    icon: Tv,
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
    providers: [
      { id: 'lwc', name: 'Lagos Water Corporation', logo: '/utilities/ekedc.png', category: 'water' },
    ],
  },
  {
    id: 'betting',
    name: 'Betting & Gaming',
    icon: Gamepad2,
    providers: [
      { id: 'bet9ja', name: 'Bet9ja', logo: '/utilities/startimes.png', category: 'betting' },
      { id: 'sportybet', name: 'SportyBet', logo: '/utilities/spectranet.png', category: 'betting' },
    ],
  },
  {
    id: 'government',
    name: 'Government & Taxes',
    icon: Landmark,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Bills & Utilities</h1>
        <p className="text-gray-500">Pay for airtime, data, electricity, cable TV, flights, and more</p>
      </div>

      {/* Flight Booking Card */}
      <div 
        onClick={() => setShowFlightBooking(true)}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all group"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Plane size={24} className="text-white" />
              <span className="text-white/80 text-sm font-medium">Book Flights</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Fly anywhere in Nigeria</h3>
            <p className="text-white/70 text-sm">Book domestic flights with top airlines</p>
          </div>
          <div className="flex -space-x-3">
            <img src="/utilities/airpeace.png" alt="Air Peace" className="w-12 h-12 rounded-full border-2 border-white bg-white object-cover" />
            <img src="/utilities/arikair.png" alt="Arik Air" className="w-12 h-12 rounded-full border-2 border-white bg-white object-cover" />
            <img src="/utilities/danaair.png" alt="Dana Air" className="w-12 h-12 rounded-full border-2 border-white bg-white object-cover" />
          </div>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {utilityCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-velcro-green hover:shadow-soft transition-all text-left group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-velcro-green/10 transition-colors">
                <Icon size={24} className="text-gray-600 group-hover:text-velcro-green transition-colors" />
              </div>
              <p className="font-semibold text-gray-900">{category.name}</p>
              <p className="text-gray-400 text-sm">{category.providers.length} providers</p>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-velcro-navy to-blue-900 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => setSelectedCategory(utilityCategories[0])}
            className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
          >
            <Smartphone size={24} className="mx-auto mb-2" />
            <span className="text-sm">Buy Airtime</span>
          </button>
          <button 
            onClick={() => setSelectedCategory(utilityCategories[2])}
            className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
          >
            <Zap size={24} className="mx-auto mb-2" />
            <span className="text-sm">Pay Electricity</span>
          </button>
          <button 
            onClick={() => setSelectedCategory(utilityCategories[3])}
            className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
          >
            <Tv size={24} className="mx-auto mb-2" />
            <span className="text-sm">Cable TV</span>
          </button>
          <button 
            onClick={() => setSelectedCategory(utilityCategories[1])}
            className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
          >
            <Wifi size={24} className="mx-auto mb-2" />
            <span className="text-sm">Internet</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderFlightBooking = () => (
    <div className="space-y-6">
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
          <h2 className="text-xl font-display font-bold text-gray-900">Book a Flight</h2>
          <p className="text-gray-500 text-sm">Search and book domestic flights</p>
        </div>
      </div>

      {!selectedAirline ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
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
                <span className={`font-medium ${tripType === 'one-way' ? 'text-gray-900' : 'text-gray-600'}`}>
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
                <span className={`font-medium ${tripType === 'round-trip' ? 'text-gray-900' : 'text-gray-600'}`}>
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
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-velcro-green/20"
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
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-velcro-green/20"
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
                className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                -
              </button>
              <span className="text-lg font-semibold w-8 text-center">{passengers}</span>
              <button
                onClick={() => setPassengers(Math.min(9, passengers + 1))}
                className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
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
              <button
                onClick={() => setSelectedAirline(airlines[0] as AirlineData)}
                className={`p-4 bg-white border-2 rounded-xl transition-all text-center ${
                  (selectedAirline as AirlineData | null)?.id === 'airpeace' ? 'border-velcro-green bg-velcro-green/5' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <img src="/utilities/airpeace.png" alt="Air Peace" className="w-12 h-12 mx-auto mb-2 object-contain" />
                <p className="text-sm font-medium text-gray-900">Air Peace</p>
              </button>
              <button
                onClick={() => setSelectedAirline(airlines[1] as AirlineData)}
                className={`p-4 bg-white border-2 rounded-xl transition-all text-center ${
                  (selectedAirline as AirlineData | null)?.id === 'arikair' ? 'border-velcro-green bg-velcro-green/5' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <img src="/utilities/arikair.png" alt="Arik Air" className="w-12 h-12 mx-auto mb-2 object-contain" />
                <p className="text-sm font-medium text-gray-900">Arik Air</p>
              </button>
              <button
                onClick={() => setSelectedAirline(airlines[2] as AirlineData)}
                className={`p-4 bg-white border-2 rounded-xl transition-all text-center ${
                  (selectedAirline as AirlineData | null)?.id === 'danaair' ? 'border-velcro-green bg-velcro-green/5' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <img src="/utilities/danaair.png" alt="Dana Air" className="w-12 h-12 mx-auto mb-2 object-contain" />
                <p className="text-sm font-medium text-gray-900">Dana Air</p>
              </button>
              <button
                onClick={() => setSelectedAirline(airlines[3] as AirlineData)}
                className={`p-4 bg-white border-2 rounded-xl transition-all text-center ${
                  (selectedAirline as AirlineData | null)?.id === 'greenafrica' ? 'border-velcro-green bg-velcro-green/5' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <img src="/utilities/greenafrica.png" alt="Green Africa" className="w-12 h-12 mx-auto mb-2 object-contain" />
                <p className="text-sm font-medium text-gray-900">Green Africa</p>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <img src={selectedAirline.logo} alt={selectedAirline.name} className="w-16 h-16 object-contain" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedAirline.name}</h3>
              <p className="text-gray-500">{fromAirport.split(' - ')[0]} → {toAirport.split(' - ')[0]}</p>
            </div>
          </div>

          {/* Flight Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Departure</span>
              <span className="font-medium">{departureDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Passengers</span>
              <span className="font-medium">{passengers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trip Type</span>
              <span className="font-medium capitalize">{tripType.replace('-', ' ')}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="text-gray-700 font-medium">Total</span>
              <span className="font-bold text-gray-900">₦{(45000 * passengers).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Source */}
          <div>
            <Label className="text-sm text-gray-600 mb-3 block">Pay From</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentSources.map((source) => (
                <button
                  key={source.type}
                  onClick={() => setPaymentSource(source.type)}
                  className={`p-4 rounded-xl border-2 transition-all text-left
                    ${paymentSource === source.type 
                      ? 'border-velcro-green bg-velcro-green/5' 
                      : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {source.type === 'ngn' ? (
                      <img src="/logos/ng.png" alt="NGN" className="w-6 h-6" />
                    ) : (
                      <img src="/logos/usdc.png" alt="USDC" className="w-6 h-6" />
                    )}
                    <span className={`font-medium ${paymentSource === source.type ? 'text-gray-900' : 'text-gray-600'}`}>
                      {source.type === 'ngn' ? 'NGN Wallet' : 'USDC Wallet'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Balance: {source.symbol}{source.balance.toLocaleString()}
                  </p>
                </button>
              ))}
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

  const renderProviders = () => {
    if (!selectedCategory) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">{selectedCategory.name}</h2>
            <p className="text-gray-500 text-sm">Select a provider</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedCategory.providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-velcro-green hover:shadow-soft transition-all text-center group"
            >
              <img 
                src={provider.logo} 
                alt={provider.name} 
                className="w-16 h-16 mx-auto mb-3 object-contain"
              />
              <p className="font-semibold text-gray-900 text-sm">{provider.name}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (!selectedProvider) return null;

    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => setSelectedProvider(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <img 
              src={selectedProvider.logo} 
              alt={selectedProvider.name} 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-lg font-display font-bold text-gray-900">{selectedProvider.name}</h2>
              <p className="text-gray-500 text-sm">Enter payment details</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Payment Source Selection */}
          <div>
            <Label className="text-sm text-gray-600 mb-3 block">Pay From</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentSources.map((source) => (
                <button
                  key={source.type}
                  onClick={() => setPaymentSource(source.type)}
                  className={`p-4 rounded-xl border-2 transition-all text-left
                    ${paymentSource === source.type 
                      ? 'border-velcro-green bg-velcro-green/5' 
                      : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {source.type === 'ngn' ? (
                      <img src="/logos/ng.png" alt="NGN" className="w-6 h-6" />
                    ) : (
                      <img src="/logos/usdc.png" alt="USDC" className="w-6 h-6" />
                    )}
                    <span className={`font-medium ${paymentSource === source.type ? 'text-gray-900' : 'text-gray-600'}`}>
                      {source.type === 'ngn' ? 'NGN Wallet' : 'USDC Wallet'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Balance: {source.symbol}{source.balance.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">
              {selectedProvider.category === 'airtime' ? 'Phone Number' : 
               selectedProvider.category === 'electricity' ? 'Meter Number' :
               selectedProvider.category === 'cable' ? 'Smart Card Number' : 'Account Number'}
            </Label>
            <Input
              type="text"
              placeholder={selectedProvider.category === 'airtime' ? 'e.g., 08012345678' : 'Enter account number'}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
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
                className="pl-10 py-5 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Pay Button */}
          <Button 
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
            ) : (
              <>
                Pay {paymentSources.find(s => s.type === paymentSource)?.symbol}{amount || '0'}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showFlightBooking && renderFlightBooking()}
      {!showFlightBooking && !selectedCategory && renderCategories()}
      {!showFlightBooking && selectedCategory && !selectedProvider && renderProviders()}
      {!showFlightBooking && selectedProvider && renderPaymentForm()}
    </div>
  );
}
