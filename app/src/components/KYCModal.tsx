import { useState } from 'react';
import { 
  X, 
  Shield, 
  Check, 
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
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { UserKYC } from '@/App';

interface KYCModalProps {
  onClose: () => void;
  onComplete: (kyc: UserKYC) => void;
}

type KYCTier = 'tier0' | 'tier1' | 'tier2' | 'tier3';
type KYCStep = 'select-tier' | 'bvn-info' | 'bvn-verify' | 'personal-details' | 'address-info' | 'document-upload' | 'selfie' | 'review' | 'success';

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
    id: 'tier0',
    name: 'Tier 0 - Onboarded',
    dailyLimit: 0,
    cryptoLimit: 100,
    requirements: ['Email verified', 'Phone verified', 'PIN set'],
    color: 'bg-gray-500',
    description: 'Basic access, crypto only',
  },
  {
    id: 'tier1',
    name: 'Tier 1 - Basic',
    dailyLimit: 500000,
    cryptoLimit: 1000,
    requirements: ['BVN Verification', 'Legal Name', 'Date of Birth', 'Address'],
    color: 'bg-blue-500',
    description: '₦500K daily limit',
  },
  {
    id: 'tier2',
    name: 'Tier 2 - Verified',
    dailyLimit: 10000000,
    cryptoLimit: 10000,
    requirements: ['Government ID', 'Proof of Address', 'Selfie Verification'],
    color: 'bg-velcro-green',
    description: '₦10M daily limit',
  },
  {
    id: 'tier3',
    name: 'Tier 3 - Business',
    dailyLimit: 100000000,
    cryptoLimit: 100000,
    requirements: ['CAC Registration', 'Business Documents', 'Director Verification'],
    color: 'bg-velcro-navy',
    description: '₦100M daily limit',
  },
];

export function KYCModal({ onClose, onComplete }: KYCModalProps) {
  const [currentStep, setCurrentStep] = useState<KYCStep>('select-tier');
  const [selectedTier, setSelectedTier] = useState<KYCTier | null>(null);
  
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
  const [selfieTaken, setSelfieTaken] = useState(false);

  const handleTierSelect = (tier: KYCTier) => {
    setSelectedTier(tier);
    if (tier === 'tier0') {
      // Tier 0 doesn't require BVN
      handleSubmitTier0();
    } else {
      setCurrentStep('bvn-info');
    }
  };

  const handleSubmitTier0 = () => {
    const kycData: UserKYC = {
      tier: 'tier0',
      bvnVerified: false,
      bvn: null,
      dailyLimit: 0,
      cryptoLimit: 100,
    };
    onComplete(kycData);
    setCurrentStep('success');
    toast.success('Tier 0 activated!');
  };

  const handleBvnInfoContinue = () => {
    setCurrentStep('bvn-verify');
  };

  const handleBvnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bvn.length !== 11) {
      toast.error('BVN must be 11 digits');
      return;
    }
    
    setBvnValidating(true);
    // Simulate BVN validation API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBvnValidating(false);
    setBvnValidated(true);
    
    // Auto-fill some data from "BVN lookup"
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

  const handleSubmit = () => {
    const tier = selectedTier || 'tier1';
    const tierData = tiers.find(t => t.id === tier);
    
    const kycData: UserKYC = {
      tier: tier,
      bvnVerified: true,
      bvn: bvn,
      dailyLimit: tierData?.dailyLimit || 500000,
      cryptoLimit: tierData?.cryptoLimit || 1000,
    };
    
    onComplete(kycData);
    setCurrentStep('success');
    toast.success('KYC verification submitted!');
  };

  const renderSelectTier = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-gray-700" />
        </div>
        <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Complete Your Verification</h2>
        <p className="text-gray-500 text-sm">Choose a tier to unlock higher transaction limits</p>
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => handleTierSelect(tier.id)}
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

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">No KYC Required for Basic Crypto</p>
            <p className="text-xs text-amber-600 mt-1">
              You can buy, sell, and swap up to $100 in crypto without completing KYC
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBvnInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('select-tier')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronRight size={20} className="rotate-180 text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">BVN Verification</h2>
          <p className="text-gray-500 text-sm">Verify your identity with BVN</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Why do we need your BVN?</p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1">
              <li>• To verify your legal name and date of birth</li>
              <li>• To comply with CBN regulations</li>
              <li>• To protect against fraud</li>
              <li>• Your BVN is encrypted and secure</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">What you'll need:</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <User size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">Legal Name (First, Last, Other)</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">Date of Birth</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <MapPin size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">City, Address, Postal Code</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Users size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">Gender</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleBvnInfoContinue}
        className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
      >
        Continue
        <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  );

  const renderBvnVerify = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setCurrentStep('bvn-info')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronRight size={20} className="rotate-180 text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Enter BVN</h2>
          <p className="text-gray-500 text-sm">Your 11-digit Bank Verification Number</p>
        </div>
      </div>

      <div className="text-center py-4">
        <div className="w-20 h-20 bg-velcro-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard size={36} className="text-velcro-green" />
        </div>
        <h3 className="font-display font-semibold text-gray-900 mb-1">Verify your BVN</h3>
        <p className="text-gray-500 text-sm">Your BVN helps us verify your identity securely</p>
      </div>

      <form onSubmit={handleBvnSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
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
          <ChevronRight size={20} className="rotate-180 text-gray-500" />
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
          <ChevronRight size={20} className="rotate-180 text-gray-500" />
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
          <ChevronRight size={20} className="rotate-180 text-gray-500" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Upload Documents</h2>
          <p className="text-gray-500 text-sm">Upload clear photos of your documents</p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { key: 'idFront', label: 'ID Card (Front)', desc: 'International Passport, Driver\'s License, or NIN' },
          { key: 'idBack', label: 'ID Card (Back)', desc: 'Back side of your ID document' },
          { key: 'proofOfAddress', label: 'Proof of Address', desc: 'Utility bill or bank statement (last 3 months)' },
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
                <p className="font-medium text-gray-900">{doc.label}</p>
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
      </div>

      <Button 
        onClick={handleDocumentsComplete}
        disabled={!uploadedDocs.idFront || !uploadedDocs.idBack}
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
          <ChevronRight size={20} className="rotate-180 text-gray-500" />
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

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-gray-700" />
        </div>
        <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Review Your Information</h2>
        <p className="text-gray-500 text-sm">Please verify all details before submitting</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
        <div className="flex justify-between">
          <span className="text-gray-500">Tier</span>
          <span className="font-medium text-velcro-green">{selectedTier?.replace('tier', 'Tier ')}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline"
          onClick={() => setCurrentStep('personal-details')}
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

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
        {selectedTier === 'tier0' ? 'Tier 0 Activated!' : 'Verification Submitted!'}
      </h2>
      <p className="text-gray-500 mb-6">
        {selectedTier === 'tier0' 
          ? 'You can now access basic crypto features.' 
          : 'Your documents are under review. We\'ll notify you within 24 hours.'}
      </p>
      <Button 
        onClick={onClose}
        className="bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 px-8 rounded-xl"
      >
        Go to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-velcro-green/10 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-velcro-green" />
            </div>
            <h2 className="font-display font-bold text-gray-900">KYC Verification</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          {currentStep === 'select-tier' && renderSelectTier()}
          {currentStep === 'bvn-info' && renderBvnInfo()}
          {currentStep === 'bvn-verify' && renderBvnVerify()}
          {currentStep === 'personal-details' && renderPersonalDetails()}
          {currentStep === 'address-info' && renderAddressInfo()}
          {currentStep === 'document-upload' && renderDocumentUpload()}
          {currentStep === 'selfie' && renderSelfie()}
          {currentStep === 'review' && renderReview()}
          {currentStep === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
}
