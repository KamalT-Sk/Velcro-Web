import { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
];

export function Settings() {
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
    darkMode: false,
    currency: 'NGN',
    language: 'en',
  });

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
          { icon: Lock, title: 'Change Transaction PIN', desc: 'Update your 4-digit PIN' },
          { icon: Shield, title: 'Two-Factor Authentication', desc: 'Add an extra layer of security' },
          { icon: User, title: 'Biometric Login', desc: 'Use fingerprint or face ID' },
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={() => toast.info(`${item.title} coming soon!`)}
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
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Moon size={18} className="text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Dark Mode</p>
            <p className="text-gray-500 text-sm">Switch between light and dark theme</p>
          </div>
        </div>
        <Switch
          checked={preferences.darkMode}
          onCheckedChange={(checked) => 
            setPreferences({ ...preferences, darkMode: checked })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Default Currency</label>
        <select 
          value={preferences.currency}
          onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none"
        >
          <option value="NGN">Nigerian Naira (₦)</option>
          <option value="USD">US Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
          <option value="GBP">British Pound (£)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Language</label>
        <select 
          value={preferences.language}
          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none"
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="pt">Portuguese</option>
        </select>
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
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account preferences</p>
      </div>

      {activeSection ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => setActiveSection(null)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight size={20} className="rotate-180 text-gray-500" />
            </button>
            <h2 className="text-lg font-display font-semibold text-gray-900">
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
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-soft transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{section.title}</p>
                    <p className="text-gray-500 text-sm">{section.description}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
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
    </div>
  );
}
