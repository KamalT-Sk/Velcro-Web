  const renderPaymentForm = () => {
    if (!selectedProvider) return null;

    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedProvider(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <img src={selectedProvider.logo} alt={selectedProvider.name} className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-gray-900">{selectedProvider.name}</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Enter payment details</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5">
          {/* Account Number / Meter Number */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">
              {selectedProvider.category === 'electricity' ? 'Meter Number' : 
               selectedProvider.category === 'cable' ? 'Smart Card Number' : 
               selectedProvider.category === 'internet' ? 'Account Number' : 'Phone Number'}
            </Label>
            <Input
              type="text"
              placeholder={`Enter ${selectedProvider.category === 'electricity' ? 'meter' : 'account'} number`}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="py-3 sm:py-4 focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
            />
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-gray-600">Amount</Label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAmount(getAmountLimits().min.toString())}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"
                >
                  Min
                </button>
                <button
                  onClick={() => {
                    const source = paymentSources.find(s => s.type === paymentSource);
                    const { max } = getAmountLimits();
                    if (source) {
                      const maxAmount = Math.min(source.balance, max);
                      setAmount(maxAmount.toString());
                    }
                  }}
                  className="text-xs px-2 py-1 bg-velcro-green/10 hover:bg-velcro-green/20 rounded-md text-velcro-green font-medium transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                {paymentSources.find(s => s.type === paymentSource)?.symbol}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                min={getAmountLimits().min}
                max={getAmountLimits().max}
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 9) {
                    setAmount(val);
                  }
                }}
                className="pl-10 py-3 sm:py-4 text-lg focus:border-velcro-green focus:ring-velcro-green/20 rounded-xl"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Min: {paymentSources.find(s => s.type === paymentSource)?.symbol}{getAmountLimits().min.toLocaleString()} • 
              Max: {paymentSources.find(s => s.type === paymentSource)?.symbol}{getAmountLimits().max.toLocaleString()}
            </p>
          </div>

          {/* Payment Source */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">Pay With</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentSources.map((source) => (
                <button
                  key={source.type}
                  onClick={() => setPaymentSource(source.type)}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3
                    ${paymentSource === source.type 
                      ? 'border-velcro-green bg-velcro-green/5' 
                      : 'border-gray-100 hover:border-gray-200'}`}
                >
                  {source.type === 'ngn' ? (
                    <img src="/logos/ng.png" alt="NGN" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <img src="/logos/usdc.png" alt="USDC" className="w-8 h-8 rounded-full object-cover" />
                  )}
                  <div>
                    <p className={`font-medium text-sm ${paymentSource === source.type ? 'text-gray-900' : 'text-gray-600'}`}>
                      {source.type === 'ngn' ? 'Naira Wallet' : 'USDC Wallet'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {source.symbol}{source.balance.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handlePayClick}
            disabled={isProcessing}
            className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
          >
            <CheckCircle size={18} className="mr-2" />
            Continue
          </Button>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-velcro-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt size={28} className="text-velcro-green" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Payment</h3>
                <p className="text-gray-500 text-sm mt-1">Review your payment details</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Provider</span>
                  <span className="font-medium text-gray-900">{selectedProvider?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Account</span>
                  <span className="font-medium text-gray-900">{accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Amount</span>
                  <span className="font-bold text-gray-900">
                    {paymentSources.find(s => s.type === paymentSource)?.symbol}{parseFloat(amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Fee</span>
                  <span className="font-medium text-gray-900">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="font-bold text-lg text-gray-900">
                      {paymentSources.find(s => s.type === paymentSource)?.symbol}{parseFloat(amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPay}
                  className="flex-1 bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isProcessing && setShowPinModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Enter PIN</h3>
                <p className="text-gray-500 text-sm mt-1">Enter your 4-digit PIN to confirm payment</p>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    disabled={isProcessing}
                  />
                ))}
              </div>

              <Button
                onClick={handlePinSubmit}
                disabled={isProcessing}
                className="w-full bg-velcro-green hover:bg-velcro-green-dark text-velcro-navy font-semibold h-12 rounded-xl"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-velcro-navy/30 border-t-velcro-navy rounded-full animate-spin" />
                ) : (
                  'Pay Now'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
