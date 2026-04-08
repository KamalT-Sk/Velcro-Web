import { useState } from 'react';
import { 
  Link2, 
  Copy, 
  Plus, 
  Image as ImageIcon, 
  Check,
  Trash2,
  Edit2,
  Eye,
  ExternalLink,
  Users,
  X,
  ChevronLeft,
  Download,
  Mail,
  Phone,
  MessageSquare,
  TrendingUp,
  Calendar,
  Heart,
  ShoppingBag,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Payment {
  id: string;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  amount: number;
  currency: string;
  message?: string;
  paidAt: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  isAnonymous: boolean;
}

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  slug: string;
  amount: number | null;
  amountType: 'fixed' | 'open';
  currencies: string[];
  collectMessage: boolean;
  collectPhone: boolean;
  collectEmail: boolean;
  allowAnonymous: boolean;
  linkType: 'product' | 'donation';
  image?: string;
  createdAt: string;
  status: 'active' | 'inactive';
  payments: Payment[];
  totalCollected: number;
  paymentCount: number;
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

const initialLinks: PaymentLink[] = [
  {
    id: '1',
    title: 'Web Design Services',
    description: 'Payment for professional web design and development services',
    slug: 'web-design-2024',
    amount: 150000,
    amountType: 'fixed',
    currencies: ['NGN', 'USDC'],
    collectMessage: true,
    collectPhone: true,
    collectEmail: true,
    allowAnonymous: false,
    linkType: 'product',
    createdAt: '2024-03-28',
    status: 'active',
    totalCollected: 450000,
    paymentCount: 3,
    payments: [
      {
        id: 'p1',
        payerName: 'John Doe',
        payerEmail: 'john.doe@email.com',
        payerPhone: '+234 801 234 5678',
        amount: 150000,
        currency: 'NGN',
        message: 'Looking forward to working with you!',
        paidAt: '2024-03-28T14:30:00',
        status: 'completed',
        reference: 'VEL-20240328-001',
        isAnonymous: false,
      },
      {
        id: 'p2',
        payerName: 'Sarah Johnson',
        payerEmail: 'sarah.j@company.com',
        payerPhone: '+234 802 345 6789',
        amount: 150000,
        currency: 'NGN',
        message: 'Website redesign project',
        paidAt: '2024-03-29T10:15:00',
        status: 'completed',
        reference: 'VEL-20240329-002',
        isAnonymous: false,
      },
      {
        id: 'p3',
        payerName: 'Michael Chen',
        payerEmail: 'mchen@business.io',
        payerPhone: '+234 803 456 7890',
        amount: 150000,
        currency: 'NGN',
        message: 'E-commerce site development',
        paidAt: '2024-03-30T16:45:00',
        status: 'completed',
        reference: 'VEL-20240330-003',
        isAnonymous: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Consultation Fee',
    description: 'Business consultation and advisory services',
    slug: 'consultation-fee',
    amount: null,
    amountType: 'open',
    currencies: ['NGN'],
    collectMessage: false,
    collectPhone: true,
    collectEmail: true,
    allowAnonymous: false,
    linkType: 'product',
    createdAt: '2024-03-25',
    status: 'active',
    totalCollected: 125000,
    paymentCount: 2,
    payments: [
      {
        id: 'p4',
        payerName: 'Amina Bello',
        payerEmail: 'amina.bello@startup.ng',
        payerPhone: '+234 804 567 8901',
        amount: 75000,
        currency: 'NGN',
        paidAt: '2024-03-26T09:00:00',
        status: 'completed',
        reference: 'VEL-20240326-004',
        isAnonymous: false,
      },
      {
        id: 'p5',
        payerName: 'David Okonkwo',
        payerEmail: 'd.okonkwo@gmail.com',
        payerPhone: '+234 805 678 9012',
        amount: 50000,
        currency: 'NGN',
        paidAt: '2024-03-27T14:20:00',
        status: 'completed',
        reference: 'VEL-20240327-005',
        isAnonymous: false,
      },
    ],
  },
  {
    id: '3',
    title: 'Support Our Cause',
    description: 'Help us build a community center for underprivileged children',
    slug: 'community-fund',
    amount: null,
    amountType: 'open',
    currencies: ['NGN', 'USD'],
    collectMessage: true,
    collectPhone: false,
    collectEmail: true,
    allowAnonymous: true,
    linkType: 'donation',
    createdAt: '2024-04-01',
    status: 'active',
    totalCollected: 2850000,
    paymentCount: 47,
    payments: [
      // Some public donors
      {
        id: 'd1',
        payerName: 'Fatima Hassan',
        payerEmail: 'fatima.h@email.com',
        payerPhone: '+234 806 789 0123',
        amount: 500000,
        currency: 'NGN',
        message: 'Happy to support this great cause!',
        paidAt: '2024-04-01T10:00:00',
        status: 'completed',
        reference: 'VEL-20240401-D001',
        isAnonymous: false,
      },
      {
        id: 'd2',
        payerName: 'Emmanuel Okafor',
        payerEmail: 'emma.o@business.ng',
        amount: 250000,
        currency: 'NGN',
        message: 'Keep up the good work!',
        paidAt: '2024-04-02T14:30:00',
        status: 'completed',
        reference: 'VEL-20240402-D002',
        isAnonymous: false,
      },
      // Anonymous donors
      {
        id: 'd3',
        payerName: 'Anonymous',
        payerEmail: 'anonymous@velcro.app',
        amount: 1000000,
        currency: 'NGN',
        message: 'God bless your work',
        paidAt: '2024-04-03T09:15:00',
        status: 'completed',
        reference: 'VEL-20240403-D003',
        isAnonymous: true,
      },
      {
        id: 'd4',
        payerName: 'Anonymous',
        payerEmail: 'anonymous@velcro.app',
        amount: 500000,
        currency: 'NGN',
        paidAt: '2024-04-04T16:45:00',
        status: 'completed',
        reference: 'VEL-20240404-D004',
        isAnonymous: true,
      },
      {
        id: 'd5',
        payerName: 'Blessing Adeyemi',
        payerEmail: 'blessing.a@email.com',
        amount: 150000,
        currency: 'NGN',
        message: 'Small contribution from my family',
        paidAt: '2024-04-05T11:20:00',
        status: 'completed',
        reference: 'VEL-20240405-D005',
        isAnonymous: false,
      },
      // More anonymous donations
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `da${i + 1}`,
        payerName: 'Anonymous',
        payerEmail: 'anonymous@velcro.app',
        amount: [50000, 25000, 100000, 75000, 150000][i % 5],
        currency: 'NGN' as const,
        message: i % 4 === 0 ? ['Stay blessed', 'Keep helping', 'Supporting your mission'][i % 3] : undefined,
        paidAt: new Date(Date.now() - (i + 5) * 86400000).toISOString(),
        status: 'completed' as const,
        reference: `VEL-2024040${i + 6}-DA${String(i + 1).padStart(3, '0')}`,
        isAnonymous: true,
      })),
      // Regular donors
      ...Array.from({ length: 30 }, (_, i) => ({
        id: `dr${i + 1}`,
        payerName: `Donor ${i + 1}`,
        payerEmail: `donor${i + 1}@email.com`,
        amount: [10000, 20000, 50000, 25000, 15000][i % 5],
        currency: 'NGN' as const,
        paidAt: new Date(Date.now() - (i + 15) * 86400000).toISOString(),
        status: 'completed' as const,
        reference: `VEL-202404${String(i + 10).padStart(2, '0')}-DR${String(i + 1).padStart(3, '0')}`,
        isAnonymous: false,
      })),
    ],
  },
];

const availableCurrencies = ['NGN', 'USD', 'EUR', 'GBP', 'USDC'];

export function PaymentLinks() {
  const [links, setLinks] = useState<PaymentLink[]>(initialLinks);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingLink, setEditingLink] = useState<PaymentLink | null>(null);
  const [previewLink, setPreviewLink] = useState<PaymentLink | null>(null);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    slug: string;
    amount: string;
    amountType: 'fixed' | 'open';
    currencies: string[];
    collectMessage: boolean;
    collectPhone: boolean;
    collectEmail: boolean;
    allowAnonymous: boolean;
    linkType: 'product' | 'donation';
  }>({
    title: '',
    description: '',
    slug: '',
    amount: '',
    amountType: 'fixed',
    currencies: ['NGN'],
    collectMessage: false,
    collectPhone: true,
    collectEmail: true,
    allowAnonymous: false,
    linkType: 'product',
  });

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error('Please fill in required fields');
      return;
    }

    const newLink: PaymentLink = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      slug: formData.slug,
      amount: formData.amountType === 'fixed' ? Number(formData.amount) || 0 : null,
      amountType: formData.amountType,
      currencies: formData.currencies,
      collectMessage: formData.collectMessage,
      collectPhone: formData.collectPhone,
      collectEmail: formData.collectEmail,
      allowAnonymous: formData.allowAnonymous,
      linkType: formData.linkType,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      payments: [],
      totalCollected: 0,
      paymentCount: 0,
    };

    setLinks([newLink, ...links]);
    setShowCreateForm(false);
    setFormData({
      title: '',
      description: '',
      slug: '',
      amount: '',
      amountType: 'fixed',
      currencies: ['NGN'],
      collectMessage: false,
      collectPhone: true,
      collectEmail: true,
      allowAnonymous: false,
      linkType: 'product',
    });
    toast.success('Payment link created successfully!');
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://usevelcro.com/${slug}`);
    toast.success('Link copied to clipboard!');
  };

  const toggleCurrency = (currency: string) => {
    const current = formData.currencies;
    if (current.includes(currency)) {
      setFormData({ ...formData, currencies: current.filter(c => c !== currency) });
    } else {
      setFormData({ ...formData, currencies: [...current, currency] });
    }
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    toast.success('Payment link deleted!');
  };

  const handleEditLink = (link: PaymentLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      description: link.description,
      slug: link.slug,
      amount: link.amount?.toString() || '',
      amountType: link.amountType,
      currencies: link.currencies,
      collectMessage: link.collectMessage,
      collectPhone: link.collectPhone,
      collectEmail: link.collectEmail,
      allowAnonymous: link.allowAnonymous,
      linkType: link.linkType,
    });
    setShowEditForm(true);
  };

  const handleUpdateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    const updatedLinks = links.map(link => {
      if (link.id === editingLink.id) {
        return {
          ...link,
          title: formData.title,
          description: formData.description,
          slug: formData.slug,
          amount: formData.amountType === 'fixed' ? Number(formData.amount) || 0 : null,
          amountType: formData.amountType,
          currencies: formData.currencies,
          collectMessage: formData.collectMessage,
          collectPhone: formData.collectPhone,
          collectEmail: formData.collectEmail,
          allowAnonymous: formData.allowAnonymous,
          linkType: formData.linkType,
        };
      }
      return link;
    });

    setLinks(updatedLinks);
    setShowEditForm(false);
    setEditingLink(null);
    toast.success('Payment link updated successfully!');
  };

  const handlePreview = (link: PaymentLink) => {
    setPreviewLink(link);
    setShowPreview(true);
  };

  const exportPayments = (link: PaymentLink) => {
    const csvContent = [
      ['Date', 'Name', 'Email', 'Phone', 'Amount', 'Currency', 'Message', 'Reference'].join(','),
      ...link.payments.map(p => [
        new Date(p.paidAt).toLocaleString(),
        `"${p.payerName}"`,
        p.payerEmail,
        p.payerPhone || '',
        p.amount,
        p.currency,
        `"${p.message || ''}"`,
        p.reference,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${link.slug}-payments.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Payments exported to CSV');
  };

  // Payment Detail View
  if (selectedLink) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedLink(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">{selectedLink.title}</h1>
            <p className="text-gray-500 text-sm">Payment details and history</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <span className="text-gray-500 text-sm">Total Collected</span>
            </div>
            <p className="text-2xl font-display font-bold text-gray-900">
              {currencySymbols[selectedLink.currencies[0]]}{selectedLink.totalCollected.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">{selectedLink.currencies[0]}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm">Total Payments</span>
            </div>
            <p className="text-2xl font-display font-bold text-gray-900">{selectedLink.paymentCount}</p>
            <p className="text-xs text-gray-400 mt-1">
              {selectedLink.paymentCount === 1 ? 'payment' : 'payments'} received
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">Created</span>
            </div>
            <p className="text-2xl font-display font-bold text-gray-900">
              {new Date(selectedLink.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-gray-400 mt-1">{selectedLink.status}</p>
          </div>
        </div>

        {/* Link Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Link</p>
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-medium">usevelcro.com/{selectedLink.slug}</span>
                <button
                  onClick={() => copyLink(selectedLink.slug)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => exportPayments(selectedLink)}
                className="rounded-xl"
              >
                <Download size={18} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900">Payment History</h2>
            <span className="text-sm text-gray-500">{selectedLink.payments.length} records</span>
          </div>

          {/* Anonymous Payments Summary */}
          {selectedLink.allowAnonymous && (
            <div className="bg-amber-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <EyeOff size={16} />
                <span className="font-medium text-sm">Anonymous Payments Enabled</span>
              </div>
              <p className="text-xs text-amber-600">
                {selectedLink.payments.filter(p => p.isAnonymous).length} of {selectedLink.payments.length} payments were made anonymously
              </p>
            </div>
          )}

          {selectedLink.payments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
              <p className="text-gray-500 text-sm">Share your link to start receiving payments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedLink.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Payer Info */}
                    <div className="flex items-start gap-4">
                      {payment.isAnonymous ? (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <EyeOff size={20} className="text-gray-500" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-velcro-green to-velcro-navy rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {payment.payerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {payment.isAnonymous ? 'Anonymous' : payment.payerName}
                          </h3>
                          {payment.isAnonymous && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Hidden
                            </span>
                          )}
                        </div>
                        {!payment.isAnonymous && (
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {payment.payerEmail}
                            </span>
                            {payment.payerPhone && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1">
                                  <Phone size={14} />
                                  {payment.payerPhone}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        {payment.message && (
                          <div className="flex items-start gap-1.5 mt-2 text-sm">
                            <MessageSquare size={14} className="text-gray-400 mt-0.5" />
                            <span className="text-gray-600 italic">"{payment.message}"</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="flex items-center gap-6 lg:text-right">
                      <div>
                        <p className="text-lg font-display font-bold text-gray-900">
                          {currencySymbols[payment.currency]}{payment.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{payment.currency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(payment.paidAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(payment.paidAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Reference */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Reference: {payment.reference}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create Form
  if (showCreateForm) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft animate-slide-down">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowCreateForm(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-display font-semibold text-gray-900">Create Payment Link</h2>
        </div>
        
        <form onSubmit={handleCreateLink} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Link Title <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., Web Design Services"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Custom Slug <span className="text-red-500">*</span></Label>
              <div className="flex items-stretch">
                <span className="px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium flex items-center whitespace-nowrap">
                  usevelcro.com/
                </span>
                <Input
                  placeholder="your-link"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                  className="rounded-l-none rounded-r-xl h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              placeholder="Describe what this payment is for..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none resize-none h-24"
            />
          </div>

          {/* Link Type Selection */}
          <div className="space-y-4">
            <Label>Link Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, linkType: 'product' })}
                className={`p-4 rounded-xl border-2 text-left transition-all
                  ${formData.linkType === 'product'
                    ? 'border-velcro-green bg-velcro-green/5'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${formData.linkType === 'product' ? 'bg-velcro-green text-velcro-navy' : 'bg-gray-100 text-gray-500'}`}>
                    <ShoppingBag size={20} />
                  </div>
                  <span className={`font-semibold ${formData.linkType === 'product' ? 'text-gray-900' : 'text-gray-600'}`}>
                    Product / Service
                  </span>
                </div>
                <p className="text-xs text-gray-500">Sell products or services</p>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, linkType: 'donation' })}
                className={`p-4 rounded-xl border-2 text-left transition-all
                  ${formData.linkType === 'donation'
                    ? 'border-velcro-green bg-velcro-green/5'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${formData.linkType === 'donation' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Heart size={20} />
                  </div>
                  <span className={`font-semibold ${formData.linkType === 'donation' ? 'text-gray-900' : 'text-gray-600'}`}>
                    Donation / Cause
                  </span>
                </div>
                <p className="text-xs text-gray-500">Collect donations or support</p>
              </button>
            </div>
          </div>

          {/* Anonymous Payment Option (only for donations) */}
          {formData.linkType === 'donation' && (
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <EyeOff size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Allow Anonymous Payments</p>
                    <p className="text-xs text-gray-500">Let supporters hide their identity</p>
                  </div>
                </div>
                <Switch
                  checked={formData.allowAnonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowAnonymous: checked })}
                />
              </div>
              {formData.allowAnonymous && (
                <p className="text-xs text-amber-600 mt-3 pt-3 border-t border-amber-200">
                  Donors can choose to hide their name and contact information. You'll still receive the payment.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors cursor-pointer">
              <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Amount Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="amountType"
                  checked={formData.amountType === 'fixed'}
                  onChange={() => setFormData({ ...formData, amountType: 'fixed' })}
                  className="w-4 h-4 text-gray-900 focus:ring-velcro-green"
                />
                <span className="text-sm text-gray-700">Fixed Amount</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="amountType"
                  checked={formData.amountType === 'open'}
                  onChange={() => setFormData({ ...formData, amountType: 'open' })}
                  className="w-4 h-4 text-gray-900 focus:ring-velcro-green"
                />
                <span className="text-sm text-gray-700">Open Amount (Customer decides)</span>
              </label>
            </div>

            {formData.amountType === 'fixed' && (
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {currencySymbols[formData.currencies[0]]}
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="pl-10 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                    />
                  </div>
                  <select
                    value={formData.currencies[0] || 'NGN'}
                    onChange={(e) => {
                      const newCurrency = e.target.value;
                      setFormData({ 
                        ...formData, 
                        currencies: [newCurrency, ...formData.currencies.filter(c => c !== newCurrency)]
                      });
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none"
                  >
                    {availableCurrencies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Accepted Currencies</Label>
            <div className="flex flex-wrap gap-2">
              {availableCurrencies.map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => toggleCurrency(currency)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${formData.currencies.includes(currency)
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {formData.currencies.includes(currency) && (
                    <Check size={14} className="inline mr-1" />
                  )}
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info Collection */}
          <div className="space-y-3">
            <Label>Collect Customer Information</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">Email Address</p>
                  <p className="text-gray-500 text-xs">Required for sending receipt</p>
                </div>
                <Switch
                  checked={formData.collectEmail}
                  onCheckedChange={(checked) => setFormData({ ...formData, collectEmail: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">Phone Number</p>
                  <p className="text-gray-500 text-xs">For contact purposes</p>
                </div>
                <Switch
                  checked={formData.collectPhone}
                  onCheckedChange={(checked) => setFormData({ ...formData, collectPhone: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">Customer Message</p>
                  <p className="text-gray-500 text-xs">Allow customers to add a note</p>
                </div>
                <Switch
                  checked={formData.collectMessage}
                  onCheckedChange={(checked) => setFormData({ ...formData, collectMessage: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold rounded-xl"
            >
              Create Link
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Links List View
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-12 lg:pl-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Payment Links</h1>
          <p className="text-gray-500 text-sm">Create and manage payment links for your business</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
        >
          <Plus size={18} className="mr-2" />
          Create Link
        </Button>
      </div>

      {/* Links List */}
      <div className="space-y-4">
        {links.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-soft">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Link2 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment links yet</h3>
            <p className="text-gray-500 text-sm mb-4">Create your first payment link to start receiving payments</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
            >
              <Plus size={18} className="mr-2" />
              Create Link
            </Button>
          </div>
        ) : (
          links.map((link) => (
            <div 
              key={link.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{link.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${link.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {link.status}
                    </span>
                    {link.linkType === 'donation' && (
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Heart size={12} />
                        Donation
                      </span>
                    )}
                    {link.allowAnonymous && (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <EyeOff size={12} />
                        Anonymous OK
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{link.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                      <ExternalLink size={14} />
                      <span className="font-medium">usevelcro.com/{link.slug}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600">
                      {link.amountType === 'fixed' && link.amount !== null
                        ? `${currencySymbols[link.currencies[0]]}${link.amount.toLocaleString()}` 
                        : 'Open amount'}
                    </span>
                    <span className="text-gray-300">|</span>
                    <div className="flex gap-1">
                      {link.currencies.map(c => (
                        <span key={c} className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs font-medium">{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* Payment Stats */}
                  {link.paymentCount > 0 && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-blue-600" />
                        <span className="text-gray-600">{link.paymentCount} payments</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp size={16} className="text-green-600" />
                        <span className="font-medium text-gray-900">
                          {currencySymbols[link.currencies[0]]}{link.totalCollected.toLocaleString()} collected
                        </span>
                      </div>
                      {link.allowAnonymous && (
                        <div className="flex items-center gap-2 text-sm">
                          <EyeOff size={16} className="text-amber-600" />
                          <span className="text-gray-600">
                            {link.payments.filter(p => p.isAnonymous).length} anonymous
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedLink(link)}
                        className="text-sm text-velcro-navy font-medium hover:underline"
                      >
                        View details →
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => copyLink(link.slug)}
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Copy link"
                  >
                    <Copy size={18} className="text-gray-500" />
                  </button>
                  <button 
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Preview"
                    onClick={() => handlePreview(link)}
                  >
                    <Eye size={18} className="text-gray-500" />
                  </button>
                  <button 
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Edit"
                    onClick={() => handleEditLink(link)}
                  >
                    <Edit2 size={18} className="text-gray-500" />
                  </button>
                  <button 
                    onClick={() => deleteLink(link.id)}
                    className="p-2.5 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Form Modal */}
      {showEditForm && editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-semibold text-gray-900">Edit Payment Link</h2>
                <button
                  onClick={() => { setShowEditForm(false); setEditingLink(null); }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateLink} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Link Title <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="e.g., Web Design Services"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custom Slug <span className="text-red-500">*</span></Label>
                  <div className="flex items-stretch">
                    <span className="px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium flex items-center whitespace-nowrap">
                      usevelcro.com/
                    </span>
                    <Input
                      placeholder="your-link"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                      className="rounded-l-none rounded-r-xl h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  placeholder="Describe what this payment is for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-velcro-green focus:ring-2 focus:ring-velcro-green/20 outline-none resize-none h-24"
                />
              </div>

              {/* Amount Type */}
              <div className="space-y-4">
                <Label>Amount Type</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amountType: 'fixed' })}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all
                      ${formData.amountType === 'fixed'
                        ? 'border-velcro-green bg-velcro-green/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <p className={`font-semibold ${formData.amountType === 'fixed' ? 'text-gray-900' : 'text-gray-600'}`}>
                      Fixed Amount
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Set a specific price</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amountType: 'open', amount: '' })}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all
                      ${formData.amountType === 'open'
                        ? 'border-velcro-green bg-velcro-green/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <p className={`font-semibold ${formData.amountType === 'open' ? 'text-gray-900' : 'text-gray-600'}`}>
                      Open Amount
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Customer decides</p>
                  </button>
                </div>

                {formData.amountType === 'fixed' && (
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          {currencySymbols[formData.currencies[0]]}
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="pl-10 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Accepted Currencies</Label>
                <div className="flex flex-wrap gap-2">
                  {availableCurrencies.map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => toggleCurrency(currency)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                        ${formData.currencies.includes(currency)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {formData.currencies.includes(currency) && (
                        <Check size={14} className="inline mr-1" />
                      )}
                      {currency}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowEditForm(false); setEditingLink(null); }}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold rounded-xl"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Link Preview</h3>
              <button
                onClick={() => { setShowPreview(false); setPreviewLink(null); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-velcro-navy to-blue-900 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {previewLink.linkType === 'donation' ? (
                    <Heart size={24} className="text-red-400" />
                  ) : (
                    <ShoppingBag size={24} className="text-velcro-green" />
                  )}
                  <span className="text-sm text-white/70 capitalize">{previewLink.linkType}</span>
                </div>
                
                <h2 className="text-xl font-bold mb-2">{previewLink.title}</h2>
                <p className="text-white/70 text-sm mb-4">{previewLink.description || 'No description'}</p>
                
                {previewLink.amountType === 'fixed' && previewLink.amount ? (
                  <div className="text-3xl font-bold">
                    {currencySymbols[previewLink.currencies[0]]}{previewLink.amount.toLocaleString()}
                  </div>
                ) : (
                  <div className="text-lg text-white/70">Enter any amount</div>
                )}
              </div>

              {/* Customer Form Preview */}
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-2">Customer will see:</p>
                
                {previewLink.collectEmail && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Label className="text-xs text-gray-500">Email Address</Label>
                    <Input disabled placeholder="customer@example.com" className="mt-1 bg-white" />
                  </div>
                )}
                
                {previewLink.collectPhone && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Label className="text-xs text-gray-500">Phone Number</Label>
                    <Input disabled placeholder="+234 801 234 5678" className="mt-1 bg-white" />
                  </div>
                )}
                
                {previewLink.collectMessage && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Label className="text-xs text-gray-500">Message (Optional)</Label>
                    <textarea disabled placeholder="Add a note..." className="w-full mt-1 p-2 bg-white border rounded-lg text-sm" />
                  </div>
                )}

                <Button className="w-full bg-velcro-green text-velcro-navy font-semibold rounded-xl mt-4">
                  Pay Now
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-xs text-gray-400">usevelcro.com/{previewLink.slug}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
