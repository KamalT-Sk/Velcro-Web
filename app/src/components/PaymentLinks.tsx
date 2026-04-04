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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  slug: string;
  amount: number | null;
  amountType: 'fixed' | 'open';
  currencies: string[];
  collectMessage: boolean;
  image?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

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
    createdAt: '2024-03-28',
    status: 'active',
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
    createdAt: '2024-03-25',
    status: 'active',
  },
];

const availableCurrencies = ['NGN', 'USD', 'EUR', 'GBP', 'USDC'];

export function PaymentLinks() {
  const [links, setLinks] = useState<PaymentLink[]>(initialLinks);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    slug: string;
    amount: string;
    amountType: 'fixed' | 'open';
    currencies: string[];
    collectMessage: boolean;
  }>({
    title: '',
    description: '',
    slug: '',
    amount: '',
    amountType: 'fixed',
    currencies: ['NGN'],
    collectMessage: false,
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
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
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
    });
    toast.success('Payment link created successfully!');
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://pay.usevelcro.com/${slug}`);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Payment Links</h1>
          <p className="text-gray-500 text-sm">Create and manage payment links for your business</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
        >
          {showCreateForm ? (
            <>
              <Link2 size={18} className="mr-2" />
              View Links
            </>
          ) : (
            <>
              <Plus size={18} className="mr-2" />
              Create Link
            </>
          )}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft animate-slide-down">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-6">Create Payment Link</h2>
          
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
                <div className="flex">
                  <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium flex items-center">
                    pay.usevelcro.com/
                  </span>
                  <Input
                    placeholder="your-link"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                    className="rounded-l-none focus:border-velcro-green focus:ring-velcro-green/20 rounded-r-xl"
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
                  <span className="text-sm text-gray-700">Open Amount</span>
                </label>
              </div>

              {formData.amountType === 'fixed' && (
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {formData.currencies[0] === 'NGN' ? '₦' : 
                         formData.currencies[0] === 'USD' ? '$' :
                         formData.currencies[0] === 'EUR' ? '€' :
                         formData.currencies[0] === 'GBP' ? '£' : '$'}
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

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-sm text-gray-900">Collect Customer Message</p>
                <p className="text-gray-500 text-xs">Allow customers to add a note</p>
              </div>
              <Switch
                checked={formData.collectMessage}
                onCheckedChange={(checked) => setFormData({ ...formData, collectMessage: checked })}
              />
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
      )}

      {/* Links List */}
      {!showCreateForm && (
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
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{link.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${link.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {link.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{link.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                        <ExternalLink size={14} />
                        <span className="font-medium">pay.usevelcro.com/{link.slug}</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">
                        {link.amountType === 'fixed' && link.amount !== null
                          ? `₦${link.amount.toLocaleString()}` 
                          : 'Open amount'}
                      </span>
                      <span className="text-gray-300">|</span>
                      <div className="flex gap-1">
                        {link.currencies.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
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
                      onClick={() => toast.info('Preview coming soon!')}
                    >
                      <Eye size={18} className="text-gray-500" />
                    </button>
                    <button 
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                      title="Edit"
                      onClick={() => toast.info('Edit coming soon!')}
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
      )}
    </div>
  );
}
