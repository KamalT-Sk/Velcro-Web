import { useState, useEffect } from 'react';
import { X, Send, AtSign, Phone, Wallet, Check, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SendUSDCModalProps {
  isOpen: boolean;
  onClose: () => void;
  usdcBalance: number;
  velcroTag?: string;
  onSend: (details: { amount: number; fee: number; method: 'velcro' | 'phone' | 'external'; recipient: string }) => void;
}

export function SendUSDCModal({ isOpen, onClose, usdcBalance, onSend }: SendUSDCModalProps) {
  const [amount, setAmount] = useState('');
  const [sendMethod, setSendMethod] = useState<'velcro' | 'phone' | 'external'>('velcro');
  const [recipientTag, setRecipientTag] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isVerifyingTag, setIsVerifyingTag] = useState(false);
  const [tagVerified, setTagVerified] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [externalAddress, setExternalAddress] = useState('');
  const [view, setView] = useState<'form' | 'confirm' | 'pin' | 'success'>('form');
  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sendMethod === 'velcro' && recipientTag.length >= 3) {
      const timeout = setTimeout(() => {
        verifyVelcroTag();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [recipientTag]);

  const verifyVelcroTag = async () => {
    setIsVerifyingTag(true);
    setTagVerified(false);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (recipientTag.toLowerCase() === 'kamal123') {
      setRecipientName('Shehu Kamal');
      setTagVerified(true);
    } else if (recipientTag.length >= 3) {
      setRecipientName('John Doe');
      setTagVerified(true);
    }
    setIsVerifyingTag(false);
  };

  if (!isOpen) return null;

  const amountNum = Number(amount) || 0;
  const fee = sendMethod === 'external' ? 1 : 0;
  const total = amountNum + fee;

  const getRecipientLabel = () => {
    if (sendMethod === 'velcro') return `@${recipientTag} (${recipientName})`;
    if (sendMethod === 'phone') return recipientPhone;
    return externalAddress;
  };

  const handleInitiate = () => {
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (total > usdcBalance) {
      toast.error('Insufficient USDC balance');
      return;
    }
    if (sendMethod === 'velcro') {
      if (!recipientTag || !tagVerified) {
        toast.error('Please enter a valid VelcroTag');
        return;
      }
    } else if (sendMethod === 'phone') {
      if (!recipientPhone || recipientPhone.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
    } else if (sendMethod === 'external') {
      if (!externalAddress || externalAddress.length < 20) {
        toast.error('Please enter a valid Solana address');
        return;
      }
    }
    setView('confirm');
  };

  const handleConfirm = () => {
    setView('pin');
    setPin(['', '', '', '']);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      const nextInput = document.getElementById(`sendusdc-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`sendusdc-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSend = async () => {
    if (pin.some(digit => !digit)) {
      toast.error('Please enter your 4-digit PIN');
      return;
    }
    if (!amountNum || amountNum <= 0 || total > usdcBalance) {
      toast.error('Invalid amount or insufficient balance');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    onSend({
      amount: amountNum,
      fee,
      method: sendMethod,
      recipient: getRecipientLabel(),
    });

    setView('success');
    setPin(['', '', '', '']);
  };

  const resetForm = () => {
    setAmount('');
    setSendMethod('velcro');
    setRecipientTag('');
    setRecipientName('');
    setTagVerified(false);
    setRecipientPhone('');
    setExternalAddress('');
    setView('form');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        {view === 'form' && (
          <>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Send size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">Send USDC</h2>
                    <p className="text-sm text-gray-500">Send to Velcro users or external wallets</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Balance */}
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="text-sm text-gray-500">Available Balance</span>
                <span className="font-semibold text-gray-900">${usdcBalance.toLocaleString()}</span>
              </div>

              {/* Amount */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Amount (USDC)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 py-5 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Method Selection */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Send Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSendMethod('velcro')}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                      ${sendMethod === 'velcro' ? 'border-velcro-green bg-velcro-green/5' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <AtSign size={18} className={sendMethod === 'velcro' ? 'text-velcro-green' : 'text-gray-400'} />
                    <span className={`text-xs font-medium ${sendMethod === 'velcro' ? 'text-gray-900' : 'text-gray-600'}`}>VelcroTag</span>
                    <span className="text-[10px] text-gray-400">Free</span>
                  </button>
                  <button
                    onClick={() => setSendMethod('phone')}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                      ${sendMethod === 'phone' ? 'border-velcro-green bg-velcro-green/5' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <Phone size={18} className={sendMethod === 'phone' ? 'text-velcro-green' : 'text-gray-400'} />
                    <span className={`text-xs font-medium ${sendMethod === 'phone' ? 'text-gray-900' : 'text-gray-600'}`}>Phone</span>
                    <span className="text-[10px] text-gray-400">Free</span>
                  </button>
                  <button
                    onClick={() => setSendMethod('external')}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                      ${sendMethod === 'external' ? 'border-velcro-green bg-velcro-green/5' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <Wallet size={18} className={sendMethod === 'external' ? 'text-velcro-green' : 'text-gray-400'} />
                    <span className={`text-xs font-medium ${sendMethod === 'external' ? 'text-gray-900' : 'text-gray-600'}`}>External</span>
                    <span className="text-[10px] text-gray-400">$1 fee</span>
                  </button>
                </div>
              </div>

              {/* VelcroTag Input */}
              {sendMethod === 'velcro' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Recipient VelcroTag</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">@</span>
                      <Input
                        type="text"
                        placeholder="username"
                        value={recipientTag}
                        onChange={(e) => {
                          setRecipientTag(e.target.value.replace('@', ''));
                          setTagVerified(false);
                          setRecipientName('');
                        }}
                        className="pl-10 py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl pr-10"
                      />
                      {recipientTag.length >= 3 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isVerifyingTag ? (
                            <RefreshCw size={18} className="text-gray-400 animate-spin" />
                          ) : tagVerified ? (
                            <Check size={18} className="text-green-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Enter the recipient's VelcroTag (e.g., kamal123)</p>
                  </div>

                  {tagVerified && recipientName && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <Check size={20} className="text-gray-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Recipient Name</p>
                          <p className="font-semibold text-gray-900">{recipientName}</p>
                        </div>
                        <Check size={18} className="text-green-500 ml-auto" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Phone Input */}
              {sendMethod === 'phone' && (
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Recipient Phone Number</Label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input
                      type="tel"
                      placeholder="080 0000 0000"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      maxLength={11}
                      className="pl-11 py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter full number starting with 0.</p>
                </div>
              )}

              {/* External Address Input */}
              {sendMethod === 'external' && (
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Solana Address</Label>
                  <Input
                    type="text"
                    placeholder="Enter Solana USDC address"
                    value={externalAddress}
                    onChange={(e) => setExternalAddress(e.target.value)}
                    className="py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2">Double-check the address. Transfers to wrong addresses cannot be reversed.</p>
                </div>
              )}

              {/* Fee Breakdown */}
              {amountNum > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">${amountNum.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Fee</span>
                    <span className="font-medium">${fee.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="font-bold text-gray-900">${total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100">
              <Button
                onClick={handleInitiate}
                disabled={
                  isLoading ||
                  !amountNum ||
                  total > usdcBalance ||
                  (sendMethod === 'velcro' && !tagVerified) ||
                  (sendMethod === 'phone' && recipientPhone.length < 10) ||
                  (sendMethod === 'external' && externalAddress.length < 20)
                }
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl disabled:opacity-50"
              >
                Send USDC
              </Button>
            </div>
          </>
        )}

        {view === 'confirm' && (
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Confirm Send</h3>
              <button onClick={() => setView('form')} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">${amountNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium">${fee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Total</span>
                  <span className="font-bold text-lg">${total.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  {sendMethod === 'velcro' && <>Send to Velcro user: <strong>{getRecipientLabel()}</strong></>}
                  {sendMethod === 'phone' && <>Send to phone: <strong>{recipientPhone}</strong></>}
                  {sendMethod === 'external' && <>Send to Solana address:<br /><strong className="break-all">{externalAddress}</strong></>}
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <Button variant="outline" onClick={() => setView('form')} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirm} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl">Confirm</Button>
            </div>
          </div>
        )}

        {view === 'pin' && (
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Enter PIN</h3>
              <button onClick={() => setView('form')} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                <Lock size={28} className="text-gray-700" />
              </div>
              <p className="text-gray-500 text-sm mb-6">Enter your 4-digit PIN to confirm</p>
              <div className="flex gap-3 mb-6">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`sendusdc-pin-${index}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <Button onClick={handleSend} disabled={isLoading} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
                Confirm Send
              </Button>
            </div>
          </div>
        )}

        {view === 'success' && (
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">Send Successful</h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
                <Check size={40} className="text-gray-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">Transfer Complete!</p>
              <p className="text-gray-500 text-center mb-6">
                You sent ${amountNum.toLocaleString()} {sendMethod === 'external' ? 'to external wallet' : 'to Velcro user'}.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 w-full max-w-xs">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">${amountNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <Button onClick={handleClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-12 rounded-xl">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
