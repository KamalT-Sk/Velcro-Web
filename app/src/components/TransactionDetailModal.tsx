import { X, Copy, MessageCircle, ArrowDownLeft, ArrowUpRight, Repeat, Landmark, Send, CircleDollarSign, HeadphonesIcon, Mail, ExternalLink, FileQuestion, Clock, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  type: 'receive' | 'send' | 'convert' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  from?: string;
  to?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receive':
        return <ArrowDownLeft size={24} className="text-green-600" />;
      case 'send':
        return <ArrowUpRight size={24} className="text-red-600" />;
      case 'convert':
        return <Repeat size={24} className="text-blue-600" />;
      case 'deposit':
        return <Landmark size={24} className="text-purple-600" />;
      case 'withdrawal':
        return <Send size={24} className="text-orange-600" />;
      default:
        return <CircleDollarSign size={24} className="text-gray-600" />;
    }
  };

  const getTransactionBg = (type: string) => {
    switch (type) {
      case 'receive':
        return 'bg-green-100';
      case 'send':
        return 'bg-red-100';
      case 'convert':
        return 'bg-blue-100';
      case 'deposit':
        return 'bg-purple-100';
      case 'withdrawal':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getTransactionTitle = (tx: Transaction) => {
    switch (tx.type) {
      case 'receive':
        return `Received ${tx.currency}`;
      case 'send':
        return `Sent ${tx.currency}`;
      case 'convert':
        return 'Currency Conversion';
      case 'deposit':
        return `Deposited ${tx.currency}`;
      case 'withdrawal':
        return `Withdrew ${tx.currency}`;
      default:
        return 'Transaction';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'receive':
      case 'deposit':
        return '+';
      case 'send':
      case 'withdrawal':
        return '-';
      default:
        return '';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'receive':
      case 'deposit':
        return 'text-green-600';
      case 'send':
      case 'withdrawal':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const handleEmailSupport = () => {
    const subject = `Support Request - Transaction #${transaction.id.toString().padStart(8, '0')}`;
    const body = `Hello Velcro Support,%0D%0A%0D%AI need help with the following transaction:%0D%0A%0D%0A- Transaction ID: ${transaction.id.toString().padStart(8, '0')}%0D%0A- Type: ${transaction.type}%0D%0A- Amount: ${transaction.currency === 'NGN' ? '₦' : '$'}${transaction.amount.toLocaleString()}%0D%0A- Date: ${transaction.date}%0D%0A- Status: ${transaction.status}%0D%0A%0D%0APlease describe your issue here...`;
    window.open(`mailto:support@usevelcro.com?subject=${encodeURIComponent(subject)}&body=${body}`);
    toast.success('Opening email client...');
  };

  const handleWhatsAppSupport = () => {
    const message = `Hello Velcro Support, I need help with Transaction #${transaction.id.toString().padStart(8, '0')} - ${transaction.type} of ${transaction.currency === 'NGN' ? '₦' : '$'}${transaction.amount.toLocaleString()} on ${transaction.date}`;
    window.open(`https://wa.me/2348001234567?text=${encodeURIComponent(message)}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleReportIssue = () => {
    toast.info('Report feature coming soon!');
  };

  // Parse date to show more details
  const txDate = new Date(transaction.date);
  const formattedDate = txDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = txDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-gray-900">Transaction Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-5 space-y-6">
          {/* Status and Icon */}
          <div className="text-center">
            <div className={`w-16 h-16 ${getTransactionBg(transaction.type)} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              {getTransactionIcon(transaction.type)}
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
              ${transaction.status === 'completed' ? 'bg-green-100 text-green-600' : 
                transaction.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                'bg-red-100 text-red-600'}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>
          
          {/* Amount */}
          <div className="text-center">
            <p className={`text-3xl font-display font-bold ${getAmountColor(transaction.type)}`}>
              {getAmountPrefix(transaction.type)}{transaction.currency === 'NGN' ? '₦' : '$'}{transaction.amount.toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm mt-1">{getTransactionTitle(transaction)}</p>
          </div>
          
          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Hash size={14} />
                <span>Transaction ID</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">#{transaction.id.toString().padStart(8, '0')}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(transaction.id.toString().padStart(8, '0'));
                    toast.success('Copied!');
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar size={14} />
                <span>Date</span>
              </div>
              <span className="text-sm">{formattedDate}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock size={14} />
                <span>Time</span>
              </div>
              <span className="text-sm">{formattedTime}</span>
            </div>
            
            {transaction.from && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">From</span>
                <span className="text-sm font-medium">{transaction.from}</span>
              </div>
            )}
            
            {transaction.to && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">To</span>
                <span className="text-sm font-medium">{transaction.to}</span>
              </div>
            )}
            
            {transaction.description && (
              <div className="flex items-start justify-between">
                <span className="text-gray-500 text-sm">Description</span>
                <span className="text-sm text-right max-w-[60%]">{transaction.description}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-sm">Fee</span>
              <span className="text-sm font-medium">₦0.00</span>
            </div>
          </div>

          {/* Help & Support Section */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <HeadphonesIcon size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
            </div>
            
            <div className="space-y-2">
              {/* Email Support */}
              <Button
                variant="outline"
                onClick={handleEmailSupport}
                className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300 h-12 rounded-xl justify-start"
              >
                <Mail size={18} className="mr-3 text-blue-600" />
                <div className="text-left flex-1">
                  <span className="text-sm font-medium text-gray-900">Email Support</span>
                  <p className="text-xs text-gray-500">support@usevelcro.com</p>
                </div>
                <ExternalLink size={14} className="text-gray-400" />
              </Button>

              {/* WhatsApp Support */}
              <Button
                variant="outline"
                onClick={handleWhatsAppSupport}
                className="w-full border-green-200 hover:bg-green-50 hover:border-green-300 h-12 rounded-xl justify-start"
              >
                <img src="/images/whatsapp-logo.png" alt="WhatsApp" className="w-5 h-5 mr-3" />
                <div className="text-left flex-1">
                  <span className="text-sm font-medium text-gray-900">WhatsApp Support</span>
                  <p className="text-xs text-gray-500">+234 800 123 4567</p>
                </div>
                <ExternalLink size={14} className="text-gray-400" />
              </Button>

              {/* Report Issue */}
              <Button
                variant="outline"
                onClick={handleReportIssue}
                className="w-full border-red-200 hover:bg-red-50 hover:border-red-300 h-12 rounded-xl justify-start"
              >
                <FileQuestion size={18} className="mr-3 text-red-600" />
                <div className="text-left flex-1">
                  <span className="text-sm font-medium text-gray-900">Report an Issue</span>
                  <p className="text-xs text-gray-500">Something wrong with this transaction?</p>
                </div>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700 text-center">
                <MessageCircle size={12} className="inline mr-1" />
                Include your Transaction ID when contacting support for faster assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
