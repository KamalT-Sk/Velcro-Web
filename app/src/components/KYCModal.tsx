import { useState, useRef } from 'react';
import { 
  X, 
  Shield, 
  Check, 
  CheckCircle,
  Upload, 
  ChevronRight,
  Camera,
  FileText,
  AlertCircle,
  CreditCard,
  Lock,
  User,
  Calendar,
  MapPin,
  Users,
  Info,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Plus,
  Trash2,
  Building,
  ArrowLeft,
  UserCircle,
  TrendingUp,
  Fingerprint,
  IdCard,
  Home,
  Landmark,
  FileCheck,
  Sparkles,
  Award,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { UserKYC } from '@/App';

interface KYCModalProps {
  onClose: () => void;
  onComplete: (kyc: UserKYC) => void;
}

type KYCType = 'individual' | 'business' | null;
type KYCTier = 'tier0' | 'tier1' | 'tier2' | 'tier3';
type KYCStep = 
  | 'select-type'      // Choose Individual or Business
  | 'individual-tier'  // Individual: Choose Tier 1 or Tier 2
  | 'business-tier'    // Business: Direct to Tier 3
  | 'bvn-verify' 
  | 'personal-details' 
  | 'address-info' 
  | 'document-upload' 
  | 'selfie' 
  | 'review' 
  | 'success' 
  | 'business-basic' 
  | 'business-contact' 
  | 'business-officers'
  | 'business-documents';

interface Tier {
  id: KYCTier;
  name: string;
  dailyLimit: number;
  cryptoLimit: number;
  requirements: string[];
  color: string;
  description: string;
}

const tiers: Tier[] = [
  {
    id: 'tier1',
    name: 'Tier 1 - Basic',
    dailyLimit: 500000,
    cryptoLimit: 1000,
    requirements: ['BVN Verification', 'Legal Name', 'Date of Birth', 'Address'],
    color: 'bg-blue-500',
    description: 'Perfect for starters and freelancers',
  },
  {
    id: 'tier2',
    name: 'Tier 2 - Verified',
    dailyLimit: 10000000,
    cryptoLimit: 10000,
    requirements: ['Government ID', 'Proof of Address', 'Selfie Verification'],
    color: 'bg-velcro-green',
    description: 'Higher limits for active users',
  },
  {
    id: 'tier3',
    name: 'Tier 3 - Business',
    dailyLimit: 100000000,
    cryptoLimit: 100000,
    requirements: ['Business Registration (CAC)', 'Business Address', 'Director/Owner Details', 'Business Documents'],
    color: 'bg-velcro-navy',
    description: 'For registered business names, companies and NGOs',
  },
];

// Industries for business
const industries = [
  'Agriculture-AgriculturalCooperatives',
  'Technology-SoftwareDevelopment',
  'Finance-Banking',
  'Retail-Commerce',
  'Manufacturing',
  'Healthcare',
  'Education',
  'RealEstate',
  'Transportation-Logistics',
  'Entertainment-Media',
  'Food-Beverage',
  'Energy-Utilities',
  'Construction',
  'ProfessionalServices',
  'Other',
];

// Registration types
const registrationTypes = [
  'Private_Incorporated',
  'Public_Incorporated',
  'Business_Name',
  'Partnership',
  'Limited_Liability_Partnership',
  'Trust',
  'Cooperative',
  'Non_Profit',
];

// Officer roles
const officerRoles = ['DIRECTOR', 'OWNER', 'SECRETARY', 'TREASURER'];

interface BusinessOfficer {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  middleName: string;
  maidenName: string;
  nationality: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  bvn: string;
  title: string;
  percentageOwned: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function KYCModal({ onClose, onComplete }: KYCModalProps) {
  const [kycType, setKycType] = useState<KYCType>(null);
  const [currentStep, setCurrentStep] = useState<KYCStep>('select-type');
  const [selectedTier, setSelectedTier] = useState<KYCTier | null>(null);
  const [completedKYCData, setCompletedKYCData] = useState<UserKYC | null>(null);
  const hasCalledOnComplete = useRef(false);
  
  // BVN Form State
  const [bvn, setBvn] = useState('');
  const [bvnValidating, setBvnValidating] = useState(false);
  const [bvnValidated, setBvnValidated] = useState(false);
  
  // Personal Details State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    otherNames: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
  });
  
  // Address State
  const [addressInfo, setAddressInfo] = useState({
    city: '',
    address: '',
    postalCode: '',
    state: '',
  });
  
  const [uploadedDocs, setUploadedDocs] = useState({
    idFront: false,
    idBack: false,
    proofOfAddress: false,
  });

  // Business documents
  const [businessDocs, setBusinessDocs] = useState({
    cacCertificate: false,
    memart: false,
    taxClearance: false,
    boardResolution: false,
  });
  
  const [selfieTaken, setSelfieTaken] = useState(false);

  // Business KYC State
  const [businessBasic, setBusinessBasic] = useState({
    businessName: '',
    businessBvn: '',
    industry: '',
    registrationType: '',
    dateOfRegistration: '',
    description: '',
    website: '',
    country: 'NG',
    state: '',
  });

  const [businessContact, setBusinessContact] = useState({
    generalEmail: '',
    supportEmail: '',
    disputeEmail: '',
    phoneNumber: '',
    // Main address
    mainAddressLine1: '',
    mainAddressLine2: '',
    mainCity: '',
    mainState: '',
    mainPostalCode: '',
    mainCountry: 'NG',
    // Registered address
    regAddressLine1: '',
    regAddressLine2: '',
    regCity: '',
    regState: '',
    regPostalCode: '',
    regCountry: 'NG',
    sameAsMain: true,
  });

  const [officers, setOfficers] = useState<BusinessOfficer[]>([
    {
      id: '1',
      role: 'DIRECTOR',
      firstName: '',
      lastName: '',
      middleName: '',
      maidenName: '',
      nationality: 'NG',
      dateOfBirth: '',
      email: '',
      phoneNumber: '',
      bvn: '',
      title: '',
      percentageOwned: 0,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'NG',
    }
  ]);

  // Step 1: Select Individual or Business
  const handleSelectType = (type: KYCType) => {
    setKycType(type);
    if (type === 'individual') {
      setCurrentStep('individual-tier');
    } else {
      setCurrentStep('business-tier');
    }
  };

  // Individual: Select Tier
  const handleSelectIndividualTier = (tier: KYCTier) => {
    setSelectedTier(tier);
    setCurrentStep('bvn-verify');
  };

  // Business: Go to Tier 3
  const handleStartBusinessKYC = () => {
    setSelectedTier('tier3');
    setCurrentStep('business-basic');
  };

  const handleBvnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bvn.length !== 11) {
      toast.error('BVN must be 11 digits');
      return;
    }
    
    setBvnValidating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBvnValidating(false);
    setBvnValidated(true);
    
    setPersonalInfo({
      ...personalInfo,
      firstName: 'Shehu',
      lastName: 'Kamal',
      dateOfBirth: '1990-01-01',
    });
    
    toast.success('BVN verified successfully!');
    setCurrentStep('personal-details');
  };

  const handlePersonalDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('address-info');
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTier === 'tier1') {
      setCurrentStep('review');
    } else {
      setCurrentStep('document-upload');
    }
  };

  const handleDocumentUpload = (doc: keyof typeof uploadedDocs) => {
    setUploadedDocs({ ...uploadedDocs, [doc]: true });
    toast.success('Document uploaded successfully!');
  };

  const handleDocumentsComplete = () => {
    setCurrentStep('selfie');
  };

  const handleSelfieCapture = () => {
    setSelfieTaken(true);
    toast.success('Selfie captured!');
    setCurrentStep('review');
  };

  // Business KYC Handlers
  const handleBusinessBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessBasic.businessName || !businessBasic.businessBvn || !businessBasic.industry || 
        !businessBasic.registrationType || !businessBasic.dateOfRegistration || !businessBasic.state) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCurrentStep('business-contact');
  };

  const handleBusinessContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessContact.generalEmail || !businessContact.phoneNumber || 
        !businessContact.mainAddressLine1 || !businessContact.mainCity || !businessContact.mainState) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCurrentStep('business-officers');
  };

  const addOfficer = () => {
    setOfficers([...officers, {
      id: Date.now().toString(),
      role: 'DIRECTOR',
      firstName: '',
      lastName: '',
      middleName: '',
      maidenName: '',
      nationality: 'NG',
      dateOfBirth: '',
      email: '',
      phoneNumber: '',
      bvn: '',
      title: '',
      percentageOwned: 0,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'NG',
    }]);
  };

  const removeOfficer = (id: string) => {
    if (officers.length === 1) {
      toast.error('At least one officer is required');
      return;
    }
    setOfficers(officers.filter(o => o.id !== id));
  };

  const updateOfficer = (id: string, field: keyof BusinessOfficer, value: string | number) => {
    setOfficers(officers.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleOfficersSubmit = () => {
    for (const officer of officers) {
      if (!officer.firstName || !officer.lastName || !officer.bvn || !officer.email || 
          !officer.phoneNumber || !officer.dateOfBirth || !officer.title) {
        toast.error('Please fill in all officer details');
        return;
      }
      if (officer.bvn.length !== 11) {
        toast.error('Officer BVN must be 11 digits');
        return;
      }
    }
    setCurrentStep('business-documents');
  };

  const handleBusinessDocumentUpload = (doc: keyof typeof businessDocs) => {
    setBusinessDocs({ ...businessDocs, [doc]: true });
    toast.success('Document uploaded successfully!');
  };

  const handleBusinessDocsComplete = () => {
    setCurrentStep('review');
  };

  const handleSubmit = () => {
    const tier = selectedTier || 'tier1';
    const tierData = tiers.find(t => t.id === tier);
    
    const kycData: UserKYC = {
      tier: tier,
      bvnVerified: true,
      bvn: tier === 'tier3' ? businessBasic.businessBvn : bvn,
      dailyLimit: tierData?.dailyLimit || 500000,
      cryptoLimit: tierData?.cryptoLimit || 1000,
    };
    
    setCompletedKYCData(kycData);
    setCurrentStep('success');
    toast.success('KYC verification submitted!');
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      if (!hasCalledOnComplete.current) {
        hasCalledOnComplete.current = true;
        onComplete(kycData);
      }
    }, 3000);
  };

  // Render Step 1: Select Type (Individual vs Business)
  const renderSelectType = () => (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center pb-2">
        <div className="w-16 h-16 rounded-2xl bg-velcro-green/10 border border-velcro-green/20 flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-velcro-green" />
        </div>
        <h2 className="text-xl font-display font-bold text-gray-900">Verify Your Account</h2>
        <p className="text-gray-500 text-sm mt-1">Unlock higher limits and full features</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Individual Option */}
        <button
          onClick={() => handleSelectType('individual')}
          className="w-full p-5 bg-white border border-gray-200 hover:border-velcro-green/40 rounded-2xl hover:shadow-lg transition-all text-left group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-velcro-green/5 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <User size={28} className="text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Individual</h3>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-velcro-green transition-colors" />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Personal account for individuals</p>
            </div>
          </div>
          
          {/* Features */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Tier 1</span>
              <span className="text-gray-300">→</span>
              <span className="px-3 py-1 bg-velcro-green/10 text-velcro-green text-xs font-semibold rounded-full">Tier 2</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Check size={12} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">Up to ₦10M/day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Check size={12} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">BVN Required</span>
              </div>
            </div>
          </div>
        </button>

        {/* Business Option */}
        <button
          onClick={() => handleSelectType('business')}
          className="w-full p-5 bg-white border border-gray-200 hover:border-velcro-navy/40 rounded-2xl hover:shadow-lg transition-all text-left group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-velcro-navy/5 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Building2 size={28} className="text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Business</h3>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-velcro-navy transition-colors" />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">For companies & registered businesses</p>
            </div>
          </div>
          
          {/* Features */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-velcro-navy/10 text-velcro-navy text-xs font-semibold rounded-full">Tier 3 Direct</span>
              <span className="px-2 py-0.5 bg-velcro-green/10 text-velcro-green text-[10px] font-bold rounded-full">HIGH LIMIT</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Check size={12} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">Up to ₦100M/day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Check size={12} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">CAC Required</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Info size={16} className="text-gray-700" />
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">Start with basic access</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Use crypto features up to $100 without full verification. Upgrade anytime!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Step 2a: Individual Tier Selection
  const renderIndividualTierSelect = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('select-type')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Choose Your Tier</h2>
          <p className="text-gray-500 text-sm">Select the verification level you need</p>
        </div>
      </div>

      <div className="space-y-3">
        {tiers.filter(t => t.id !== 'tier3').map((tier) => (
          <button
            key={tier.id}
            onClick={() => handleSelectIndividualTier(tier.id)}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-soft transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className={`w-3 h-3 ${tier.color} rounded-full mt-1.5 flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mb-2">{tier.description}</p>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-velcro-green font-medium text-sm">₦{tier.dailyLimit.toLocaleString()}/day</p>
                  <span className="text-gray-300">|</span>
                  <p className="text-purple-600 font-medium text-sm">${tier.cryptoLimit.toLocaleString()} crypto</p>
                </div>
                <ul className="space-y-1">
                  {tier.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-500 text-xs">
                      <Check size={12} className="text-velcro-green" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-800 font-medium">Start with Tier 1</p>
            <p className="text-xs text-blue-600 mt-1">
              You can upgrade to Tier 2 anytime for higher limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Step 2b: Business Tier Info (goes directly to Tier 3)
  const renderBusinessTierInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('select-type')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Business Verification</h2>
          <p className="text-gray-500 text-sm">Complete Tier 3 verification</p>
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-gradient-to-br from-velcro-navy to-blue-900 rounded-2xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Building size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl">Tier 3 - Business</h3>
            <p className="text-white/70 text-sm">Maximum limits and features</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-2xl font-bold">₦100M</p>
            <p className="text-white/70 text-sm">Daily Limit</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-2xl font-bold">$100K</p>
            <p className="text-white/70 text-sm">Crypto Limit</p>
          </div>
        </div>

        <ul className="space-y-2">
          {tiers.find(t => t.id === 'tier3')?.requirements.map((req, idx) => (
            <li key={idx} className="flex items-center gap-2 text-white/80 text-sm">
              <Check size={14} />
              {req}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-amber-800 font-medium">What you'll need:</p>
            <ul className="text-xs text-amber-600 mt-1 space-y-1">
              <li>• CAC Registration Number</li>
              <li>• Business name and industry</li>
              <li>• Business address details</li>
              <li>• Director/Owner information with BVN</li>
              <li>• Required business documents</li>
            </ul>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleStartBusinessKYC}
        className="w-full bg-velcro-navy hover:bg-velcro-navy/90 text-white font-semibold h-12 rounded-xl"
      >
        Start Business Verification
        <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  );

  // Individual KYC Steps
  const renderBvnVerify = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button 
          onClick={() => setCurrentStep('individual-tier')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-display font-bold text-gray-900">BVN Verification</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Your 11-digit Bank Verification Number</p>
        </div>
      </div>

      <div className="text-center py-2 sm:py-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-velcro-green/20 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-velcro-green/20">
          <CheckCircle size={32} className="text-velcro-green" />
        </div>
        <h3 className="font-display font-semibold text-gray-900 mb-1">Verify your BVN</h3>
        <p className="text-gray-500 text-xs sm:text-sm">Your BVN helps us verify your identity securely</p>
      </div>

      <form onSubmit={handleBvnSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-2 block flex items-center gap-2">
            <Lock size={14} />
            Bank Verification Number (BVN)
          </label>
          <Input
            type="text"
            placeholder="Enter 11-digit BVN"
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
            maxLength={11}
            disabled={bvnValidated}
            className="text-center text-xl tracking-widest py-6 focus:border-velcro-green focus:ring-velcro-green/20 disabled:bg-gray-50 rounded-xl"
          />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Your BVN is encrypted and secure
          </p>
        </div>

        {!bvnValidated && (
          <Button 
            type="submit"
            disabled={bvnValidating || bvn.length !== 11}
            className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
          >
            {bvnValidating ? (
              <>
                <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin mr-2" />
                Verifying BVN...
              </>
            ) : (
              'Verify BVN'
            )}
          </Button>
        )}
      </form>

      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 text-center">
          By verifying your BVN, you agree to our{' '}
          <a href="#" className="text-velcro-green hover:underline">Terms of Service</a> and{' '}
          <a href="#" className="text-velcro-green hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('bvn-verify')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Personal Details</h2>
          <p className="text-gray-500 text-sm">Verify your legal name and details</p>
        </div>
      </div>

      <div className="p-3 bg-green-50 rounded-xl border border-green-100 mb-4">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-green-600" />
          <span className="text-sm text-green-700">BVN verified successfully</span>
        </div>
      </div>

      <form onSubmit={handlePersonalDetailsSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">First Name</label>
            <Input
              value={personalInfo.firstName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
              className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl py-3"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Last Name</label>
            <Input
              value={personalInfo.lastName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
              className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl py-3"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Other Names (Optional)</label>
          <Input
            value={personalInfo.otherNames}
            onChange={(e) => setPersonalInfo({ ...personalInfo, otherNames: e.target.value })}
            className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl py-3"
            placeholder="Middle name or other names"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Date of Birth</label>
          <Input
            type="date"
            value={personalInfo.dateOfBirth}
            onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
            className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl py-3"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Gender</label>
          <div className="grid grid-cols-3 gap-3">
            {['male', 'female', 'other'].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setPersonalInfo({ ...personalInfo, gender: gender as 'male' | 'female' | 'other' })}
                className={`p-3 rounded-xl border-2 transition-all capitalize
                  ${personalInfo.gender === gender 
                    ? 'border-velcro-green bg-velcro-green/5' 
                    : 'border-gray-100 hover:border-gray-200'}`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        <Button 
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl"
        >
          Continue
          <ChevronRight size={18} className="ml-2" />
        </Button>
      </form>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('personal-details')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Address Information</h2>
          <p className="text-gray-500 text-sm">Your residential address</p>
        </div>
      </div>

      <form onSubmit={handleAddressSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">City</label>
          <Input
            value={addressInfo.city}
            onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
            placeholder="e.g., Lagos"
            className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl py-3"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Street Address</label>
          <Input
            value={addressInfo.address}
            onChange={(e) => setAddressInfo({ ...addressInfo, address: e.target.value })}
            placeholder="e.g., 123 Main Street, Ikeja"
            className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl py-3"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">State/Region</label>
            <Input
              value={addressInfo.state}
              onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
              placeholder="e.g., Lagos State"
              className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl py-3"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Postal Code</label>
            <Input
              value={addressInfo.postalCode}
              onChange={(e) => setAddressInfo({ ...addressInfo, postalCode: e.target.value })}
              placeholder="e.g., 100001"
              className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl py-3"
              required
            />
          </div>
        </div>

        <Button 
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl"
        >
          Continue
          <ChevronRight size={18} className="ml-2" />
        </Button>
      </form>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('address-info')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Upload Documents</h2>
          <p className="text-gray-500 text-sm">Required for {selectedTier === 'tier2' ? 'Tier 2' : 'Tier 1'}</p>
        </div>
      </div>

      <div className="space-y-3">
        {selectedTier === 'tier2' && [
          { key: 'idFront', label: 'ID Card (Front)', desc: 'International Passport, Driver\'s License, or NIN', required: true },
          { key: 'idBack', label: 'ID Card (Back)', desc: 'Back side of your ID document', required: true },
          { key: 'proofOfAddress', label: 'Proof of Address', desc: 'Utility bill or bank statement (last 3 months)', required: true },
        ].map((doc) => (
          <div 
            key={doc.key}
            className={`p-4 border-2 border-dashed rounded-xl transition-colors ${
              uploadedDocs[doc.key as keyof typeof uploadedDocs] 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                uploadedDocs[doc.key as keyof typeof uploadedDocs] ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {uploadedDocs[doc.key as keyof typeof uploadedDocs] 
                  ? <Check size={24} className="text-green-600" /> 
                  : <FileText size={24} className="text-gray-400" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{doc.label}</p>
                  {doc.required && <span className="text-xs text-red-500">*Required</span>}
                </div>
                <p className="text-gray-500 text-sm">{doc.desc}</p>
              </div>
              {!uploadedDocs[doc.key as keyof typeof uploadedDocs] && (
                <button 
                  onClick={() => handleDocumentUpload(doc.key as keyof typeof uploadedDocs)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Upload size={16} className="inline mr-1.5" />
                  Upload
                </button>
              )}
            </div>
          </div>
        ))}
        
        {selectedTier === 'tier1' && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              <Info size={16} className="inline mr-2" />
              No additional documents required for Tier 1. BVN verification is sufficient.
            </p>
          </div>
        )}
      </div>

      <Button 
        onClick={selectedTier === 'tier1' ? () => setCurrentStep('review') : handleDocumentsComplete}
        disabled={selectedTier === 'tier2' && (!uploadedDocs.idFront || !uploadedDocs.idBack)}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl disabled:opacity-50"
      >
        Continue
        <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  );

  const renderSelfie = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('document-upload')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Selfie Verification</h2>
          <p className="text-gray-500 text-sm">Take a clear photo of your face</p>
        </div>
      </div>

      <div className="text-center">
        <div className="w-48 h-48 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center relative overflow-hidden">
          {selfieTaken ? (
            <div className="w-full h-full bg-green-100 flex items-center justify-center">
              <Check size={64} className="text-green-600" />
            </div>
          ) : (
            <Camera size={64} className="text-gray-300" />
          )}
          {!selfieTaken && (
            <div className="absolute inset-0 border-4 border-gray-900 rounded-full animate-pulse" />
          )}
        </div>

        <div className="space-y-2 mb-6">
          <p className="font-medium text-gray-900">Position your face in the frame</p>
          <ul className="text-gray-500 text-sm space-y-1">
            <li>Ensure good lighting</li>
            <li>Remove glasses if possible</li>
            <li>Look directly at the camera</li>
          </ul>
        </div>

        <Button 
          onClick={handleSelfieCapture}
          disabled={selfieTaken}
          className="bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl disabled:opacity-50"
        >
          {selfieTaken ? (
            <>
              <Check size={18} className="mr-2" />
              Selfie Captured
            </>
          ) : (
            <>
              <Camera size={18} className="mr-2" />
              Take Selfie
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Business KYC Steps
  const renderBusinessBasic = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('business-tier')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Business Information</h2>
          <p className="text-gray-500 text-sm">Tell us about your company</p>
        </div>
      </div>

      <form onSubmit={handleBusinessBasicSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Business Name *</label>
          <div className="relative">
            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={businessBasic.businessName}
              onChange={(e) => setBusinessBasic({ ...businessBasic, businessName: e.target.value })}
              placeholder="e.g., Acme Corporation Ltd"
              className="pl-11 py-3 rounded-xl"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">CAC Registration Number *</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={businessBasic.businessBvn}
              onChange={(e) => setBusinessBasic({ ...businessBasic, businessBvn: e.target.value.replace(/\D/g, '') })}
              placeholder="Enter CAC registration number"
              className="pl-11 py-3 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Industry *</label>
            <select
              value={businessBasic.industry}
              onChange={(e) => setBusinessBasic({ ...businessBasic, industry: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none"
              required
            >
              <option value="">Select Industry</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind.replace(/-/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Registration Type *</label>
            <select
              value={businessBasic.registrationType}
              onChange={(e) => setBusinessBasic({ ...businessBasic, registrationType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none"
              required
            >
              <option value="">Select Type</option>
              {registrationTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Date of Registration *</label>
          <Input
            type="date"
            value={businessBasic.dateOfRegistration}
            onChange={(e) => setBusinessBasic({ ...businessBasic, dateOfRegistration: e.target.value })}
            className="py-3 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Business Description *</label>
          <textarea
            value={businessBasic.description}
            onChange={(e) => setBusinessBasic({ ...businessBasic, description: e.target.value })}
            placeholder="Briefly describe what your business does..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none resize-none"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Website (Optional)</label>
          <div className="relative">
            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="url"
              value={businessBasic.website}
              onChange={(e) => setBusinessBasic({ ...businessBasic, website: e.target.value })}
              placeholder="https://www.example.com"
              className="pl-11 py-3 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Business State/Region *</label>
          <Input
            value={businessBasic.state}
            onChange={(e) => setBusinessBasic({ ...businessBasic, state: e.target.value })}
            placeholder="e.g., Lagos"
            className="py-3 rounded-xl"
            required
          />
        </div>

        <Button 
          type="submit"
          className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
        >
          Continue
          <ChevronRight size={18} className="ml-2" />
        </Button>
      </form>
    </div>
  );

  const renderBusinessContact = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('business-basic')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Contact Information</h2>
          <p className="text-gray-500 text-sm">Business contact and address details</p>
        </div>
      </div>

      <form onSubmit={handleBusinessContactSubmit} className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Mail size={16} />
            Email Addresses
          </h3>
          
          <div>
            <label className="text-xs text-gray-500 mb-1 block">General Email *</label>
            <Input
              type="email"
              value={businessContact.generalEmail}
              onChange={(e) => setBusinessContact({ ...businessContact, generalEmail: e.target.value })}
              placeholder="info@company.com"
              className="rounded-xl"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Support Email</label>
              <Input
                type="email"
                value={businessContact.supportEmail}
                onChange={(e) => setBusinessContact({ ...businessContact, supportEmail: e.target.value })}
                placeholder="support@company.com"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Dispute Email</label>
              <Input
                type="email"
                value={businessContact.disputeEmail}
                onChange={(e) => setBusinessContact({ ...businessContact, disputeEmail: e.target.value })}
                placeholder="disputes@company.com"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">Business Phone Number *</label>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={businessContact.phoneNumber}
              onChange={(e) => setBusinessContact({ ...businessContact, phoneNumber: e.target.value })}
              placeholder="07012345678"
              className="pl-11 py-3 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" />
            Main Business Address
          </h3>
          
          <Input
            value={businessContact.mainAddressLine1}
            onChange={(e) => setBusinessContact({ ...businessContact, mainAddressLine1: e.target.value })}
            placeholder="Address Line 1 *"
            className="rounded-xl"
            required
          />
          <Input
            value={businessContact.mainAddressLine2}
            onChange={(e) => setBusinessContact({ ...businessContact, mainAddressLine2: e.target.value })}
            placeholder="Address Line 2"
            className="rounded-xl"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={businessContact.mainCity}
              onChange={(e) => setBusinessContact({ ...businessContact, mainCity: e.target.value })}
              placeholder="City *"
              className="rounded-xl"
              required
            />
            <Input
              value={businessContact.mainState}
              onChange={(e) => setBusinessContact({ ...businessContact, mainState: e.target.value })}
              placeholder="State *"
              className="rounded-xl"
              required
            />
          </div>
          <Input
            value={businessContact.mainPostalCode}
            onChange={(e) => setBusinessContact({ ...businessContact, mainPostalCode: e.target.value })}
            placeholder="Postal Code"
            className="rounded-xl"
          />
        </div>

        <div className="p-4 bg-amber-50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Building size={16} className="text-amber-600" />
              Registered Address
            </h3>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={businessContact.sameAsMain}
                onChange={(e) => setBusinessContact({ ...businessContact, sameAsMain: e.target.checked })}
                className="rounded border-gray-300"
              />
              Same as main
            </label>
          </div>
          
          {!businessContact.sameAsMain && (
            <>
              <Input
                value={businessContact.regAddressLine1}
                onChange={(e) => setBusinessContact({ ...businessContact, regAddressLine1: e.target.value })}
                placeholder="Address Line 1"
                className="rounded-xl"
              />
              <Input
                value={businessContact.regAddressLine2}
                onChange={(e) => setBusinessContact({ ...businessContact, regAddressLine2: e.target.value })}
                placeholder="Address Line 2"
                className="rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={businessContact.regCity}
                  onChange={(e) => setBusinessContact({ ...businessContact, regCity: e.target.value })}
                  placeholder="City"
                  className="rounded-xl"
                />
                <Input
                  value={businessContact.regState}
                  onChange={(e) => setBusinessContact({ ...businessContact, regState: e.target.value })}
                  placeholder="State"
                  className="rounded-xl"
                />
              </div>
              <Input
                value={businessContact.regPostalCode}
                onChange={(e) => setBusinessContact({ ...businessContact, regPostalCode: e.target.value })}
                placeholder="Postal Code"
                className="rounded-xl"
              />
            </>
          )}
        </div>

        <Button 
          type="submit"
          className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
        >
          Continue
          <ChevronRight size={18} className="ml-2" />
        </Button>
      </form>
    </div>
  );

  const renderBusinessOfficers = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('business-contact')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Business Officers</h2>
          <p className="text-gray-500 text-sm">Directors, Owners, and Key Personnel</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {officers.map((officer, index) => (
          <div key={officer.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <User size={16} />
                Officer {index + 1}
              </h3>
              <button
                onClick={() => removeOfficer(officer.id)}
                className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={officer.role}
                onChange={(e) => updateOfficer(officer.id, 'role', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              >
                {officerRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <Input
                value={officer.title}
                onChange={(e) => updateOfficer(officer.id, 'title', e.target.value)}
                placeholder="Title (e.g., CEO) *"
                className="rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                value={officer.firstName}
                onChange={(e) => updateOfficer(officer.id, 'firstName', e.target.value)}
                placeholder="First Name *"
                className="rounded-xl text-sm"
              />
              <Input
                value={officer.lastName}
                onChange={(e) => updateOfficer(officer.id, 'lastName', e.target.value)}
                placeholder="Last Name *"
                className="rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                value={officer.middleName}
                onChange={(e) => updateOfficer(officer.id, 'middleName', e.target.value)}
                placeholder="Middle Name"
                className="rounded-xl text-sm"
              />
              <Input
                value={officer.maidenName}
                onChange={(e) => updateOfficer(officer.id, 'maidenName', e.target.value)}
                placeholder="Maiden Name"
                className="rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={officer.dateOfBirth}
                onChange={(e) => updateOfficer(officer.id, 'dateOfBirth', e.target.value)}
                placeholder="Date of Birth *"
                className="rounded-xl text-sm"
              />
              <Input
                type="number"
                value={officer.percentageOwned}
                onChange={(e) => updateOfficer(officer.id, 'percentageOwned', parseInt(e.target.value) || 0)}
                placeholder="% Owned"
                className="rounded-xl text-sm"
              />
            </div>

            <Input
              value={officer.bvn}
              onChange={(e) => updateOfficer(officer.id, 'bvn', e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="BVN (11 digits) *"
              maxLength={11}
              className="rounded-xl text-sm"
            />

            <Input
              type="email"
              value={officer.email}
              onChange={(e) => updateOfficer(officer.id, 'email', e.target.value)}
              placeholder="Email Address *"
              className="rounded-xl text-sm"
            />

            <Input
              value={officer.phoneNumber}
              onChange={(e) => updateOfficer(officer.id, 'phoneNumber', e.target.value)}
              placeholder="Phone Number *"
              className="rounded-xl text-sm"
            />

            <Input
              value={officer.addressLine1}
              onChange={(e) => updateOfficer(officer.id, 'addressLine1', e.target.value)}
              placeholder="Residential Address *"
              className="rounded-xl text-sm"
            />

            <div className="grid grid-cols-3 gap-2">
              <Input
                value={officer.city}
                onChange={(e) => updateOfficer(officer.id, 'city', e.target.value)}
                placeholder="City *"
                className="rounded-xl text-sm"
              />
              <Input
                value={officer.state}
                onChange={(e) => updateOfficer(officer.id, 'state', e.target.value)}
                placeholder="State *"
                className="rounded-xl text-sm"
              />
              <Input
                value={officer.postalCode}
                onChange={(e) => updateOfficer(officer.id, 'postalCode', e.target.value)}
                placeholder="Postal Code"
                className="rounded-xl text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addOfficer}
        className="w-full border-dashed border-2 h-12 rounded-xl"
      >
        <Plus size={18} className="mr-2" />
        Add Another Officer
      </Button>

      <Button 
        onClick={handleOfficersSubmit}
        className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
      >
        Continue
        <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  );

  const renderBusinessDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('business-officers')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Business Documents</h2>
          <p className="text-gray-500 text-sm">Upload required legal documents</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileCheck size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-800 font-medium">Required Documents</p>
            <p className="text-xs text-blue-600 mt-1">
              These documents are required by our banking partner to verify your business and comply with CBN regulations.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { key: 'cacCertificate', label: 'CAC Registration Certificate', desc: 'Certificate of Incorporation from Corporate Affairs Commission', required: true },
          { key: 'memart', label: 'MEMART / Operating Agreement', desc: 'Memorandum and Articles of Association or Partnership Agreement', required: true },
          { key: 'taxClearance', label: 'Tax Clearance Certificate', desc: 'Recent tax clearance certificate (optional but recommended)', required: false },
          { key: 'boardResolution', label: 'Board Resolution', desc: 'Resolution authorizing account opening (for corporations)', required: false },
        ].map((doc) => (
          <div 
            key={doc.key}
            className={`p-4 border-2 border-dashed rounded-xl transition-colors ${
              businessDocs[doc.key as keyof typeof businessDocs] 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                businessDocs[doc.key as keyof typeof businessDocs] ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {businessDocs[doc.key as keyof typeof businessDocs] 
                  ? <Check size={24} className="text-green-600" /> 
                  : <FileText size={24} className="text-gray-400" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{doc.label}</p>
                  {doc.required && <span className="text-xs text-red-500">*Required</span>}
                </div>
                <p className="text-gray-500 text-sm">{doc.desc}</p>
              </div>
              {!businessDocs[doc.key as keyof typeof businessDocs] && (
                <button 
                  onClick={() => handleBusinessDocumentUpload(doc.key as keyof typeof businessDocs)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Upload size={16} className="inline mr-1.5" />
                  Upload
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-amber-800 font-medium">Document Tips</p>
            <ul className="text-xs text-amber-600 mt-1 space-y-1">
              <li>• Ensure all documents are clear and legible</li>
              <li>• Upload PDF or high-quality images (JPG/PNG)</li>
              <li>• File size should not exceed 5MB per document</li>
              <li>• Documents must not be expired</li>
            </ul>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleBusinessDocsComplete}
        disabled={!businessDocs.cacCertificate || !businessDocs.memart}
        className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl disabled:opacity-50"
      >
        Continue to Review
        <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  );

  const renderReview = () => {
    const isBusiness = kycType === 'business';
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <Search size={28} className="text-gray-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-gray-900 mb-2">Review Your Information</h2>
          <p className="text-gray-500 text-sm">Please verify all details before submitting</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3 max-h-[300px] overflow-y-auto">
          {isBusiness ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Business Name</span>
                <span className="font-medium text-gray-900">{businessBasic.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CAC Number</span>
                <span className="font-medium text-gray-900">{businessBasic.businessBvn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Industry</span>
                <span className="font-medium text-gray-900">{businessBasic.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact Email</span>
                <span className="font-medium text-gray-900">{businessContact.generalEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Officers</span>
                <span className="font-medium text-gray-900">{officers.length} officer(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Documents</span>
                <span className="font-medium text-gray-900">
                  {Object.values(businessDocs).filter(Boolean).length}/4 uploaded
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">BVN</span>
                <span className="font-medium text-gray-900">{bvn.slice(0, 4)}****{bvn.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900">{personalInfo.firstName} {personalInfo.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date of Birth</span>
                <span className="font-medium text-gray-900">{personalInfo.dateOfBirth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium text-gray-900 capitalize">{personalInfo.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="font-medium text-gray-900 text-right max-w-[50%]">{addressInfo.address}, {addressInfo.city}</span>
              </div>
            </>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-500">Tier</span>
            <span className="font-medium text-velcro-green">{selectedTier?.replace('tier', 'Tier ')}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(isBusiness ? 'business-basic' : 'personal-details')}
            className="flex-1 h-12 rounded-xl"
          >
            Edit
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
          >
            Submit for Review
          </Button>
        </div>
      </div>
    );
  };

  const renderSuccess = () => {
    // Safety fallback - if somehow success is shown without data, just close
    if (!completedKYCData) {
      return (
        <div className="text-center py-6 sm:py-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <Check size={32} className="text-gray-700" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-500 mb-6">Your verification has been submitted.</p>
          <Button onClick={onClose} className="bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 px-8 rounded-xl">
            Go to Dashboard
          </Button>
        </div>
      );
    }

    return (
      <div className="text-center py-6 sm:py-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 border border-green-200">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
          Verification Submitted!
        </h2>
        <p className="text-gray-500 mb-6">
          {kycType === 'business'
            ? 'Your business verification is under review. We\'ll notify you within 2-3 business days.'
            : 'Your documents are under review. We\'ll notify you within 24 hours.'}
        </p>
        <Button 
          onClick={() => {
            if (!hasCalledOnComplete.current && completedKYCData) {
              hasCalledOnComplete.current = true;
              onComplete(completedKYCData);
            } else {
              onClose();
            }
          }}
          className="bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 px-8 rounded-xl"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-3 sm:p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-velcro-green/20 to-velcro-green/5 rounded-xl flex items-center justify-center">
              <CheckCircle size={18} className="text-velcro-green" />
            </div>
            <h2 className="font-display font-bold text-gray-900 text-sm sm:text-base">KYC Verification</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          {currentStep === 'select-type' && renderSelectType()}
          {currentStep === 'individual-tier' && renderIndividualTierSelect()}
          {currentStep === 'business-tier' && renderBusinessTierInfo()}
          {currentStep === 'business-basic' && renderBusinessBasic()}
          {currentStep === 'business-contact' && renderBusinessContact()}
          {currentStep === 'business-officers' && renderBusinessOfficers()}
          {currentStep === 'business-documents' && renderBusinessDocuments()}
          {currentStep === 'bvn-verify' && renderBvnVerify()}
          {currentStep === 'personal-details' && renderPersonalDetails()}
          {currentStep === 'address-info' && renderAddressInfo()}
          {currentStep === 'document-upload' && renderDocumentUpload()}
          {currentStep === 'selfie' && renderSelfie()}
          {currentStep === 'review' && renderReview()}
          {currentStep === 'success' && renderSuccess()}
          {/* Fallback for invalid step */}
          {!['select-type', 'individual-tier', 'business-tier', 'business-basic', 'business-contact', 'business-officers', 'business-documents', 'bvn-verify', 'personal-details', 'address-info', 'document-upload', 'selfie', 'review', 'success'].includes(currentStep) && (
            <div className="text-center py-8">
              <p className="text-gray-500">Something went wrong. Please try again.</p>
              <Button onClick={() => setCurrentStep('select-type')} className="mt-4">
                Start Over
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
