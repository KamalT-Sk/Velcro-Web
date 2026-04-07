import { useState } from 'react';
import { 
  Link2, 
  Copy, 
  Plus, 
  Check,
  Trash2,
  Clock,
  Lock,
  RefreshCw,
  X,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { PaymentSendLink } from './SendMoneyLinkModal';

interface SendMoneyLinksManagerProps {
  links: PaymentSendLink[];
  onCreateNew: () => void;
  onCancelLink: (id: string) => void;
}

const currencySymbols: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  KES: 'KSh',
  EGP: 'E£',
  ZAR: 'R',
  USDC: '$',
};

export function SendMoneyLinksManager({ links, onCreateNew, onCancelLink }: SendMoneyLinksManagerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const copyLink = (link: PaymentSendLink) => {
    navigator.clipboard.writeText(link.claimUrl);
    setCopiedId(link.id);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    await new Promise(resolve => setTimeout(resolve, 500));
    onCancelLink(id);
    setCancellingId(null);
    toast.success('Payment link cancelled and funds returned');
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    return `${hours}h remaining`;
  };

  const activeLinks = links.filter(l => l.status === 'active');
  const claimedLinks = links.filter(l => l.status === 'claimed');
  const expiredLinks = links.filter(l => l.status === 'expired');

  const LinkCard = ({ link }: { link: PaymentSendLink }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
              ${link.status === 'active' ? 'bg-velcro-green/20' : 
                link.status === 'claimed' ? 'bg-green-100' : 'bg-gray-100'}`}>
              {link.status === 'active' ? (
                <Link2 size={20} className="text-velcro-navy" />
              ) : link.status === 'claimed' ? (
                <Check size={20} className="text-green-600" />
              ) : (
                <Clock size={20} className="text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {currencySymbols[link.currency]}{link.amount.toLocaleString()} {link.currency}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${link.status === 'active' ? 'bg-amber-100 text-amber-700' : 
                  link.status === 'claimed' ? 'bg-green-100 text-green-700' : 
                  'bg-gray-100 text-gray-600'}`}>
                {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
              </span>
            </div>
          </div>
          
          {link.note && (
            <p className="text-gray-500 text-sm mb-3 italic">"{link.note}"</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              <Clock size={14} />
              <span>{getTimeRemaining(link.expiresAt)}</span>
            </div>
            {link.pincode && (
              <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                <Lock size={14} />
                <span className="font-mono">PIN: {link.pincode}</span>
              </div>
            )}
            <span className="text-gray-400">
              Created {new Date(link.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {link.status === 'active' && (
            <>
              <button 
                onClick={() => copyLink(link)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                title="Copy link"
              >
                {copiedId === link.id ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
              <a
                href={link.claimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                title="Open link"
              >
                <ExternalLink size={18} className="text-gray-500" />
              </a>
              <button 
                onClick={() => handleCancel(link.id)}
                disabled={cancellingId === link.id}
                className="p-2.5 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                title="Cancel link"
              >
                {cancellingId === link.id ? (
                  <RefreshCw size={18} className="animate-spin text-gray-500" />
                ) : (
                  <Trash2 size={18} className="text-red-500" />
                )}
              </button>
            </>
          )}
          {link.status === 'claimed' && link.claimedBy && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Claimed by</p>
              <p className="text-sm font-medium text-gray-900">{link.claimedBy}</p>
              {link.claimedAt && (
                <p className="text-xs text-gray-400">
                  {new Date(link.claimedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900">Send Money Links</h2>
          <p className="text-gray-500 text-sm">Manage your active payment links</p>
        </div>
        <Button 
          onClick={onCreateNew}
          className="bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold rounded-xl"
        >
          <Plus size={18} className="mr-2" />
          Create New Link
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-700">{activeLinks.length}</p>
          <p className="text-sm text-amber-600">Active</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{claimedLinks.length}</p>
          <p className="text-sm text-green-600">Claimed</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-700">{expiredLinks.length}</p>
          <p className="text-sm text-gray-600">Expired</p>
        </div>
      </div>

      {/* Active Links */}
      {activeLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Active Links</h3>
          {activeLinks.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}

      {/* Claimed Links */}
      {claimedLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Claimed</h3>
          {claimedLinks.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}

      {/* Expired Links */}
      {expiredLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Expired</h3>
          {expiredLinks.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {links.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-soft">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Link2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment links yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Create a payment link to send money to anyone, even if they don't have a Velcro account
          </p>
          <Button 
            onClick={onCreateNew}
            className="bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold rounded-xl"
          >
            <Plus size={18} className="mr-2" />
            Create Your First Link
          </Button>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
        <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-700 font-medium">How it works</p>
          <p className="text-xs text-blue-600 mt-1">
            Create a link with any amount. Share it via any messaging app. Recipients click the link and claim the money to their Velcro wallet or bank account. Unclaimed links expire and funds are returned to you.
          </p>
        </div>
      </div>
    </div>
  );
}
