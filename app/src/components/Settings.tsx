import { useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  User, 
  Bell, 
  Shield, 
  Wallet, 
  Lock, 
  Globe, 
  Moon,
  ChevronRight,
  Camera,
  Check,
  AlertTriangle,
  Plus,
  HeadphonesIcon,
  Mail,
  MessageCircle,
  ExternalLink,
  KeyRound,
  Fingerprint,
  FileText,
  Calendar,
  Download,
  ShieldCheck,
  X,
  ArrowRight,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

const settingSections: SettingSection[] = [
  { id: 'profile', title: 'Profile', icon: User, description: 'Manage your personal information' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Control how you receive alerts' },
  { id: 'security', title: 'Security', icon: Shield, description: 'Password, PIN, and 2FA settings' },
  { id: 'payment', title: 'Payment Methods', icon: Wallet, description: 'Manage your bank accounts and cards' },
  { id: 'preferences', title: 'Preferences', icon: Globe, description: 'Language, currency, and theme' },
  { id: 'support', title: 'Help & Support', icon: HeadphonesIcon, description: 'Get help via email or WhatsApp' },
];

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234 800 000 0000',
    avatar: null as string | null,
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    transactions: true,
    promotions: false,
  });
  const [preferences, setPreferences] = useState({
    currency: 'NGN',
    language: 'en',
  });

  // Change PIN modal state
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [changePinStep, setChangePinStep] = useState<'bvn' | 'otp' | 'newpin' | 'confirm'>('bvn');
  const [bvn, setBvn] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Statement request modal state
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementDuration, setStatementDuration] = useState<'7days' | '30days' | '3months' | '6months' | '1year' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [statementEmail, setStatementEmail] = useState(profileData.email);

  // Change PIN flow handlers
  const handleChangePinSubmitBvn = async () => {
    if (bvn.length !== 11) {
      toast.error('Please enter a valid 11-digit BVN');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
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
    
    toast.success('Transaction PIN changed successfully!');
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

  // Statement request handler
  const handleRequestStatement = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowStatementModal(false);
    toast.success('Statement requested! You will receive it via email shortly.');
    // Reset form
    setStatementDuration('30days');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const getDurationLabel = () => {
    switch (statementDuration) {
      case '7days': return 'Last 7 days';
      case '30days': return 'Last 30 days';
      case '3months': return 'Last 3 months';
      case '6months': return 'Last 6 months';
      case '1year': return 'Last 1 year';
      case 'custom': return 'Custom range';
      default: return 'Last 30 days';
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              profileData.fullName.split(' ').map(n => n[0]).join('')
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-velcro-green rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Camera size={16} className="text-velcro-navy" />
          </button>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Profile Photo</h3>
          <p className="text-gray-500 text-sm">Upload a new profile picture</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Full Name</label>
          <Input
            value={profileData.fullName}
            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
            className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Email Address</label>
          <Input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Phone Number</label>
          <Input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
          />
        </div>
      </div>

      {/* Account Statement Section */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Account Statement</h3>
            <p className="text-gray-500 text-sm mt-0.5">Download your transaction history</p>
            <button
              onClick={() => setShowStatementModal(true)}
              className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
            >
              Request Statement
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => toast.success('Profile updated successfully!')}
        className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
      >
        Save Changes
      </Button>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {[
        { id: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
        { id: 'push', label: 'Push Notifications', description: 'Receive push notifications on your device' },
        { id: 'sms', label: 'SMS Notifications', description: 'Receive text messages for important updates' },
        { id: 'transactions', label: 'Transaction Alerts', description: 'Get notified for all transactions' },
        { id: 'promotions', label: 'Promotional Offers', description: 'Receive offers and promotions' },
      ].map((item) => (
        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">{item.label}</p>
            <p className="text-gray-500 text-sm">{item.description}</p>
          </div>
          <Switch
            checked={notifications[item.id as keyof typeof notifications]}
            onCheckedChange={(checked) => 
              setNotifications({ ...notifications, [item.id]: checked })
            }
          />
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Check size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Your account is secure</p>
            <p className="text-green-600 text-sm">Last security check: Today</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { icon: Lock, title: 'Change Transaction PIN', desc: 'Update your 4-digit PIN', action: () => setShowChangePinModal(true) },
          { icon: Shield, title: 'Two-Factor Authentication', desc: 'Add an extra layer of security', action: () => toast.info('2FA coming soon!') },
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-soft transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <item.icon size={18} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Bank Accounts</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold">
                FB
              </div>
              <div>
                <p className="font-medium text-gray-900">First Bank of Nigeria</p>
                <p className="text-gray-500 text-sm">**** **** 4521</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Default
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="mt-3 w-full rounded-xl"
          onClick={() => toast.info('Add bank account coming soon!')}
        >
          <Plus size={18} className="mr-2" />
          Add Bank Account
        </Button>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Cards</h3>
        <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
          <p className="text-gray-500 text-sm">No cards added yet</p>
          <Button 
            variant="outline" 
            className="mt-3 rounded-xl"
            onClick={() => toast.info('Add card coming soon!')}
          >
            <Plus size={18} className="mr-2" />
            Add Card
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreferenceSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Moon size={18} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Dark Mode</p>
            <p className="text-muted-foreground text-sm">Switch between light and dark theme</p>
          </div>
        </div>
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Default Currency</label>
        <select 
          value={preferences.currency}
          onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
          className="w-full px-4 py-3 border border-border rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none bg-background text-foreground"
        >
          <option value="NGN">Nigerian Naira (₦)</option>
          <option value="USD">US Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
          <option value="GBP">British Pound (£)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Language</label>
        <select 
          value={preferences.language}
          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
          className="w-full px-4 py-3 border border-border rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none bg-background text-foreground"
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="pt">Portuguese</option>
        </select>
      </div>
    </div>
  );

  const renderSupportSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <HeadphonesIcon size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-blue-800">We're here to help</p>
            <p className="text-blue-600 text-sm">Choose your preferred support channel</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Email Support */}
        <a 
          href="mailto:support@usevelcro.com"
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-soft hover:bg-blue-50/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Email Support</p>
              <p className="text-gray-500 text-sm">support@usevelcro.com</p>
              <p className="text-xs text-gray-400 mt-1">Response within 24 hours</p>
            </div>
          </div>
          <ExternalLink size={18} className="text-gray-400" />
        </a>

        {/* WhatsApp Support */}
        <a 
          href="https://wa.me/2347035428475"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 hover:shadow-soft hover:bg-green-50/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <img src="images/whatsapp-logo.png" alt="WhatsApp" className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">WhatsApp Support</p>
              <p className="text-gray-500 text-sm">+234 703 542 8475</p>
              <p className="text-xs text-gray-400 mt-1">Usually responds in minutes</p>
            </div>
          </div>
          <ExternalLink size={18} className="text-gray-400" />
        </a>

        {/* FAQ Section */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {[
              { q: 'How do I upgrade my KYC tier?', a: 'Go to Settings and click "Verify Now" to start your KYC process.' },
              { q: 'What are the transaction fees?', a: 'Fiat transfers: 0.5% (max ₦5,000). Crypto: 0.5% (no cap).' },
              { q: 'How long do transfers take?', a: 'Internal transfers are instant. Bank transfers take 1-24 hours.' },
            ].map((faq, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 text-sm">{faq.q}</p>
                <p className="text-gray-500 text-sm mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'payment': return renderPaymentSettings();
      case 'preferences': return renderPreferenceSettings();
      case 'support': return renderSupportSettings();
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pl-14 lg:pl-0">
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account preferences</p>
      </div>

      {activeSection ? (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => setActiveSection(null)}
              className="p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <ChevronRight size={20} className="rotate-180 text-muted-foreground" />
            </button>
            <h2 className="text-lg font-display font-semibold text-foreground">
              {settingSections.find(s => s.id === activeSection)?.title}
            </h2>
          </div>
          {renderContent()}
        </div>
      ) : (
        <div className="space-y-3">
          {settingSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-border hover:shadow-soft transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{section.title}</p>
                    <p className="text-muted-foreground text-sm">{section.description}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            );
          })}

          {/* Danger Zone */}
          <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-red-600" />
              <h3 className="font-semibold text-red-800">Danger Zone</h3>
            </div>
            <button 
              onClick={() => toast.info('Account deletion coming soon!')}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
              Delete Account
            </button>
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
                    <h2 className="text-lg font-display font-bold text-gray-900">Change Transaction PIN</h2>
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
                  <p className="text-sm text-gray-500">Enter a new 4-digit PIN for your account</p>
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

      {/* Statement Request Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowStatementModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">Request Statement</h2>
                    <p className="text-sm text-gray-500">Download your account history</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatementModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Duration Selection */}
              <div>
                <Label className="text-sm text-gray-600 mb-3 block">Select Duration</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '7days', label: 'Last 7 days' },
                    { id: '30days', label: 'Last 30 days' },
                    { id: '3months', label: 'Last 3 months' },
                    { id: '6months', label: 'Last 6 months' },
                    { id: '1year', label: 'Last 1 year' },
                    { id: 'custom', label: 'Custom range' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setStatementDuration(option.id as any)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        statementDuration === option.id
                          ? 'border-velcro-green bg-velcro-green/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        statementDuration === option.id ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              {statementDuration === 'custom' && (
                <div className="space-y-3">
                  <Label className="text-sm text-gray-600">Custom Date Range</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Send To</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="email"
                    value={statementEmail}
                    onChange={(e) => setStatementEmail(e.target.value)}
                    className="pl-11 rounded-xl"
                    placeholder="Enter email address"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your statement will be sent to this email address as a PDF attachment.
                </p>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-amber-50 rounded-xl flex items-start gap-2">
                <Calendar size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Statements are typically processed within 5 minutes. Large date ranges may take longer.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100">
              <Button
                onClick={handleRequestStatement}
                disabled={isLoading || !statementEmail || (statementDuration === 'custom' && (!customStartDate || !customEndDate))}
                className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                ) : (
                  <>
                    <Download size={18} className="mr-2" />
                    Request Statement
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
