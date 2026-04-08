import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PaymentLinks } from './components/PaymentLinks';
import { CryptoHub } from './components/CryptoHub';
import { Utilities } from './components/Utilities';
import { Settings } from './components/Settings';
import { Cards } from './components/Cards';
import { AuthFlow } from './components/AuthFlow';
import { KYCModal } from './components/KYCModal';
import { WhatsAppSyncModal } from './components/WhatsAppSyncModal';
import { ClaimPage } from './components/ClaimPage';
import { SupportButton } from './components/SupportButton';
import { Toaster } from '@/components/ui/sonner';

export type View = 'dashboard' | 'payment-links' | 'crypto' | 'utilities' | 'settings' | 'cards';
export type AuthState = 'signup' | 'login' | 'otp' | 'pin' | 'authenticated';

export interface UserKYC {
  tier: 'none' | 'tier0' | 'tier1' | 'tier2' | 'tier3';
  bvnVerified: boolean;
  bvn: string | null;
  dailyLimit: number;
  cryptoLimit: number;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [authState, setAuthState] = useState<AuthState>('signup');
  const [showKYC, setShowKYC] = useState(false);
  const [showWhatsAppSync, setShowWhatsAppSync] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState<string | null>('+2348001234567'); // Default for demo
  const [velcroTag, setVelcroTag] = useState<string>('');
  const [velcroPoints] = useState<number>(2450);
  const [userKYC, setUserKYC] = useState<UserKYC>({
    tier: 'none',
    bvnVerified: false,
    bvn: null,
    dailyLimit: 0,
    cryptoLimit: 100, // $100 crypto limit without KYC
  });

  // Check if we're on a claim page (claim.usevelcro.com or /claim/ path)
  const isClaimPage = typeof window !== 'undefined' && (
    window.location.hostname.startsWith('claim.') ||
    window.location.pathname.startsWith('/claim/')
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Render claim page for payment links
  if (isClaimPage) {
    return (
      <>
        <ClaimPage />
        <Toaster />
      </>
    );
  }

  const handleAuthComplete = () => {
    setAuthState('authenticated');
    setShowKYC(true);
  };

  const handleKYCComplete = (kycData: UserKYC) => {
    setUserKYC(kycData);
    // Generate VelcroTag after KYC approval
    if (kycData.tier !== 'none') {
      setVelcroTag('kamal123');
    }
    setShowKYC(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-velcro-green rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Loading Velcro...</p>
        </div>
      </div>
    );
  }

  if (authState !== 'authenticated') {
    return (
      <>
        <AuthFlow authState={authState} setAuthState={setAuthState} onComplete={handleAuthComplete} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userKYC={userKYC}
        whatsAppNumber={whatsAppNumber}
        velcroTag={velcroTag}
        velcroPoints={velcroPoints}
        onWhatsAppClick={() => setShowWhatsAppSync(true)}
        onKYCClick={() => setShowKYC(true)}
      />
      
      <main className="flex-1 ml-0 lg:ml-72 min-h-screen overflow-auto">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              userKYC={userKYC} 
              velcroTag={velcroTag}
              velcroPoints={velcroPoints}
            />
          )}
          {currentView === 'payment-links' && <PaymentLinks />}
          {currentView === 'crypto' && <CryptoHub userKYC={userKYC} onOpenKYC={() => setShowKYC(true)} />}
          {currentView === 'utilities' && <Utilities />}
          {currentView === 'settings' && <Settings />}
          {currentView === 'cards' && <Cards />}
        </div>
      </main>

      {showKYC && <KYCModal onClose={() => setShowKYC(false)} onComplete={handleKYCComplete} />}
      {showWhatsAppSync && (
        <WhatsAppSyncModal 
          onClose={() => setShowWhatsAppSync(false)} 
          onSync={(number) => {
            setWhatsAppNumber(number);
            setShowWhatsAppSync(false);
          }}
          currentNumber={whatsAppNumber}
          userEmail="user@example.com"
        />
      )}
      <SupportButton />
      <Toaster />
    </div>
  );
}

export default App;
