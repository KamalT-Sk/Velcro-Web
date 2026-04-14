import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
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
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Check, Sparkles, X } from 'lucide-react';

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
  const [whatsAppNumber, setWhatsAppNumber] = useState<string | null>('+2347035428475'); // Default for demo
  const [velcroTag, setVelcroTag] = useState<string>('');
  const [velcroPoints] = useState<number>(2450);
  const [userKYC, setUserKYC] = useState<UserKYC>({
    tier: 'none',
    bvnVerified: false,
    bvn: null,
    dailyLimit: 0,
    cryptoLimit: 100, // $100 crypto limit without KYC
  });

  // Wallet state - new users start without a wallet
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showGenerateWalletModal, setShowGenerateWalletModal] = useState(false);

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
    // Only show KYC for users who haven't completed it yet
    if (userKYC.tier === 'none') {
      setShowKYC(true);
    }
  };

  const handleKYCComplete = (kycData: UserKYC) => {
    setUserKYC(kycData);
    // Generate VelcroTag after KYC approval
    if (kycData.tier !== 'none') {
      setVelcroTag('kamal123');
    }
    setShowKYC(false);
  };

  const handleSignOut = () => {
    setAuthState('login');
    setCurrentView('dashboard');
    toast.success('Signed out successfully');
  };

  if (isLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          {/* Velcro Logo - Favicon */}
          <div className="relative mb-6">
            <img 
              src="./favicon.png" 
              alt="Velcro" 
              className="w-20 h-20 object-contain animate-pulse-soft"
            />
          </div>
          
          {/* Loading Text */}
          <p className="text-muted-foreground text-sm">Loading your experience...</p>
          
          {/* Progress Bar */}
          <div className="mt-6 w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-velcro-green rounded-full animate-loading-bar" />
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (authState !== 'authenticated') {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthFlow authState={authState} setAuthState={setAuthState} onComplete={handleAuthComplete} />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background flex">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          userKYC={userKYC}
          whatsAppNumber={whatsAppNumber}
          velcroTag={velcroTag}
          velcroPoints={velcroPoints}
          onWhatsAppClick={() => setShowWhatsAppSync(true)}
          onKYCClick={() => setShowKYC(true)}
          onSignOut={handleSignOut}
        />
        
        <main className="flex-1 ml-0 lg:ml-72 min-h-screen overflow-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <Dashboard 
                userKYC={userKYC} 
                velcroTag={velcroTag}
                velcroPoints={velcroPoints}
                hasWallet={hasWallet}
                onGenerateWallet={() => setShowGenerateWalletModal(true)}
              />
            )}
            {currentView === 'payment-links' && <PaymentLinks />}
            {currentView === 'crypto' && (
              <CryptoHub 
                userKYC={userKYC} 
                onOpenKYC={() => setShowKYC(true)}
                hasWallet={hasWallet}
                walletAddress={walletAddress}
                onGenerateWallet={() => setShowGenerateWalletModal(true)}
              />
            )}
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
        
        {/* Generate Wallet Modal */}
        {showGenerateWalletModal && (
          <GenerateWalletModal
            onClose={() => setShowGenerateWalletModal(false)}
            onComplete={(address) => {
              setHasWallet(true);
              setWalletAddress(address);
              setShowGenerateWalletModal(false);
              toast.success('Your crypto wallet has been created successfully!');
            }}
          />
        )}
        
        <SupportButton />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

// Generate Wallet Modal Component
interface GenerateWalletModalProps {
  onClose: () => void;
  onComplete: (address: string) => void;
}

function GenerateWalletModal({ onClose, onComplete }: GenerateWalletModalProps) {
  const [step, setStep] = useState<'intro' | 'creating' | 'complete'>('intro');
  const [walletAddress, setWalletAddress] = useState('');

  const generateWallet = async () => {
    setStep('creating');
    
    // Simulate wallet creation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock wallet address (managed by Velcro)
    const address = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
    setWalletAddress(address);
    
    // Skip seed phrase - wallet is managed by Velcro
    setStep('complete');
    setTimeout(() => {
      onComplete(address);
    }, 1500);
  };

  const completeSetup = () => {
    onComplete(walletAddress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step !== 'creating' ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-gray-900">
              {step === 'intro' && 'Create Crypto Wallet'}
              {step === 'creating' && 'Creating Wallet...'}
              {step === 'complete' && 'Wallet Ready!'}
            </h2>
            {step !== 'creating' && step !== 'complete' && (
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {step === 'intro' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wallet size={40} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your USDC Wallet</h3>
                <p className="text-sm text-gray-600">
                  Create a secure Solana wallet to store, send, and receive USDC.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">No KYC Required</p>
                    <p className="text-xs text-gray-500">Start with a $100 limit. Upgrade anytime.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Secure Storage</p>
                    <p className="text-xs text-gray-500">Your wallet is secured by Velcro. No keys to manage.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Instant Setup</p>
                    <p className="text-xs text-gray-500">Your wallet will be ready in seconds.</p>
                  </div>
                </div>
              </div>

              <Button onClick={generateWallet} className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700">
                <Sparkles size={18} className="mr-2" />
                Generate Wallet
              </Button>
            </div>
          )}

          {step === 'creating' && (
            <div className="text-center py-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wallet size={32} className="text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Wallet</h3>
              <p className="text-sm text-gray-500">Setting up your secure USDC wallet...</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <Check size={40} className="text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Created!</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your Solana wallet is ready for USDC transactions.
              </p>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Your Wallet Address</p>
                <code className="text-xs font-mono text-gray-700 break-all">{walletAddress}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
