import { useState } from 'react';
import { MessageCircle, X, Mail, ExternalLink, HeadphonesIcon } from 'lucide-react';
import { toast } from 'sonner';

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@usevelcro.com';
    toast.success('Opening email client...');
    setIsOpen(false);
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/2348001234567', '_blank');
    toast.success('Opening WhatsApp...');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-900 text-white rotate-90' 
            : 'bg-velcro-green text-velcro-navy hover:scale-110'
        }`}
      >
        {isOpen ? <X size={24} /> : <HeadphonesIcon size={24} />}
      </button>

      {/* Support Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Card */}
          <div className="fixed bottom-24 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <HeadphonesIcon size={18} />
                Need Help?
              </h3>
              <p className="text-white/70 text-sm mt-1">Choose how you'd like to reach us</p>
            </div>
            
            <div className="p-3 space-y-2">
              {/* Email Option */}
              <button
                onClick={handleEmailClick}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Email Us</p>
                  <p className="text-xs text-gray-500">support@usevelcro.com</p>
                </div>
                <ExternalLink size={16} className="text-gray-400" />
              </button>

              {/* WhatsApp Option */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <img src="/images/whatsapp-logo.png" alt="WhatsApp" className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">WhatsApp</p>
                  <p className="text-xs text-gray-500">+234 800 123 4567</p>
                </div>
                <ExternalLink size={16} className="text-gray-400" />
              </button>

              {/* Divider */}
              <div className="h-px bg-gray-100 my-2" />

              {/* Quick Help */}
              <div className="px-2 py-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Quick Help</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => { toast.info('Check Settings > Help & Support for FAQs'); setIsOpen(false); }}
                    className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                  >
                    • How do I verify my account?
                  </button>
                  <button 
                    onClick={() => { toast.info('Check Settings > Help & Support for FAQs'); setIsOpen(false); }}
                    className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                  >
                    • Transaction fees explained
                  </button>
                  <button 
                    onClick={() => { toast.info('Check Settings > Help & Support for FAQs'); setIsOpen(false); }}
                    className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                  >
                    • How to send money
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
