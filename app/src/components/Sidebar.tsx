import { useState } from 'react';
import { 
  LayoutDashboard, 
  Link2, 
  Wallet, 
  Receipt, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
  CreditCard,
  AtSign,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { View, UserKYC } from '@/App';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  userKYC: UserKYC;
  whatsAppNumber: string | null;
  velcroTag: string;
  velcroPoints: number;
  onWhatsAppClick: () => void;
  onKYCClick: () => void;
  onSignOut: () => void;
}

const menuItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cards', label: 'Cards', icon: CreditCard },
  { id: 'payment-links', label: 'Payment Links', icon: Link2 },
  { id: 'crypto', label: 'Stable Coin', icon: Wallet },
  { id: 'utilities', label: 'Utilities', icon: Receipt },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentView, onViewChange, userKYC, whatsAppNumber, velcroTag, velcroPoints, onWhatsAppClick, onKYCClick, onSignOut }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const kycProgress = userKYC.tier === 'none' ? 0 : userKYC.tier === 'tier0' ? 10 : userKYC.tier === 'tier1' ? 33 : userKYC.tier === 'tier2' ? 66 : 100;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center bg-white shadow-md rounded-lg border border-gray-100"
      >
        {isMobileOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 transition-all duration-300 z-40
          ${isCollapsed ? 'w-20' : 'w-72'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className="p-5 pl-14 lg:pl-5 border-b border-gray-100">
          <div className="flex items-center">
            <div className="h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="logos/velcro.png" alt="Velcro" className="h-full w-auto object-contain" />
            </div>
          </div>
        </div>

        {/* VelcroTag & Points - Small display */}
        {!isCollapsed && userKYC.tier !== 'none' && (
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AtSign size={14} className="text-velcro-navy" />
                <span className="text-sm font-medium text-gray-900">{velcroTag}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                <RotateCcw size={12} className="text-amber-600" />
                <span className="text-xs font-medium text-amber-900">{velcroPoints.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Your referral code</p>
          </div>
        )}

        {/* WhatsApp Sync */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-100">
            <button 
              onClick={onWhatsAppClick}
              className={`flex items-center gap-3 w-full p-2 rounded-xl transition-colors ${
                whatsAppNumber 
                  ? 'bg-green-50 hover:bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <div className="relative">
                <img src="images/whatsapp-logo.png" alt="WhatsApp" className="w-8 h-8" />
                {whatsAppNumber && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="text-left">
                <span className="text-sm font-medium">
                  {whatsAppNumber ? 'WhatsApp Connected' : 'Sync WhatsApp'}
                </span>
                {whatsAppNumber && (
                  <p className="text-xs text-green-600">
                    {whatsAppNumber.slice(0, 7)}****{whatsAppNumber.slice(-3)}
                  </p>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <p className={`px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider ${isCollapsed ? 'hidden' : ''}`}>
            Menu
          </p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gray-900 text-white shadow-soft' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon size={18} className={isActive ? 'text-velcro-green' : ''} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* KYC Status */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className={userKYC.tier !== 'none' ? 'text-velcro-green' : 'text-amber-500'} />
                <span className={`text-xs font-medium ${userKYC.tier !== 'none' ? 'text-velcro-green' : 'text-amber-600'}`}>
                  {userKYC.tier === 'none' ? 'KYC Required' : `KYC ${userKYC.tier.replace('tier', 'Tier ')}`}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 bg-gray-200 rounded-full mb-3 overflow-hidden">
                <div 
                  className="h-full bg-velcro-green rounded-full transition-all duration-500"
                  style={{ width: `${kycProgress}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-500 mb-3">
                {userKYC.tier === 'none' 
                  ? 'Complete verification to unlock all features' 
                  : `Daily limit: ₦${userKYC.dailyLimit.toLocaleString()}`}
              </p>
              
              <Button 
                size="sm" 
                variant="outline"
                className="w-full text-xs h-8 border-gray-200 hover:bg-gray-100"
                onClick={onKYCClick}
              >
                {userKYC.tier === 'none' ? 'Verify Now' : 'Upgrade Tier'}
              </Button>
            </div>
          </div>
        )}

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-soft hover:shadow-md transition-all"
        >
          {isCollapsed ? <ChevronRight size={14} className="text-gray-500" /> : <ChevronLeft size={14} className="text-gray-500" />}
        </button>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button 
            onClick={onSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
