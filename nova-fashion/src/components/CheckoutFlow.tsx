import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, CreditCard, ChevronRight, CheckCircle2, Ticket, Sparkles, MapPin, ClipboardList, Wallet } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutFlowProps {
  cart: CartItem[];
  currentCurrency: 'INR' | 'USD' | 'EUR' | 'JPY';
  appliedDiscount: { code: string; percent: number } | null;
  currentUser: { phone: string } | null;
  onOpenAuth: () => void;
  onClose: () => void;
  onClearCart: () => void;
  onSaveMockOrder: (order: any) => void;
}

export default function CheckoutFlow({
  cart,
  currentCurrency,
  appliedDiscount,
  currentUser,
  onOpenAuth,
  onClose,
  onClearCart,
  onSaveMockOrder
}: CheckoutFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [formData, setFormData] = useState({
    name: 'Abhi Goud',
    email: 'abhigoud9346@gmail.com',
    address: 'Hitech City, Jubilee Hills Sector 2',
    city: 'Hyderabad',
    zipCode: '500081',
    paymentMethod: 'cod'
  });

  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState('');

  // Currency helper
  const formatPrice = (usdPrice: number) => {
    switch (currentCurrency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  const getPriceSymbol = () => {
    switch (currentCurrency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'JPY': return '¥';
      default: return '$';
    }
  };

  // Pricing math
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const convertedSubtotal = currentCurrency === 'INR'
    ? Math.round(subtotal * 80)
    : currentCurrency === 'EUR' 
      ? Math.round(subtotal * 0.92) 
      : currentCurrency === 'JPY' 
        ? Math.round(subtotal * 155) 
        : subtotal;

  const discountAmount = appliedDiscount 
    ? Math.round(convertedSubtotal * (appliedDiscount.percent / 100)) 
    : 0;

  const total = Math.max(0, convertedSubtotal - discountAmount);

  // Simple validation router
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Contact registry is required.';
    if (!formData.email.includes('@')) errors.email = 'Secure communication hash missing @.';
    if (!formData.address.trim()) errors.address = 'Destination coordinates are required.';
    if (!formData.city.trim()) errors.city = 'Sovereign city is required.';
    if (!formData.zipCode.trim()) errors.zipCode = 'Matrix grid index zip required.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Proceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCompleteOrder = () => {
    const generatedId = `NOVA-${Math.floor(Math.random() * 90000) + 10000}-X`;
    setOrderId(generatedId);
    
    // Save to global admin report mock list
    onSaveMockOrder({
      id: generatedId,
      customerName: formData.name,
      customerPhone: currentUser?.phone || "",
      email: formData.email,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
      paymentMethod: formData.paymentMethod.replace('_', ' ').toUpperCase(),
      items: cart.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        size: i.selectedSize,
        color: i.selectedColor.name,
        price: i.product.price
      })),
      totalPrice: total,
      currency: currentCurrency,
      status: 'Processing',
      createdAt: new Date().toISOString()
    });

    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Dynamic Background vector flairs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-100/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-100/15 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 md:max-h-[85vh]">
        
        {/* Left Form column (Cols-7) */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
          
          {/* Header Progress Flow */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-black text-xs tracking-widest text-primary">SECURE CHECKOUT DESK</span>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-900 font-mono text-xs cursor-pointer">[CANCEL]</button>
            </div>

            <div className="flex items-center space-x-6 mb-8 text-xs font-mono">
              <span className={`p-1 border-b-2 font-bold ${step === 1 ? 'border-primary text-gray-900' : 'border-transparent text-gray-450'}`}>01 SHIPPING</span>
              <span className={`p-1 border-b-2 font-bold ${step === 2 ? 'border-primary text-gray-900' : 'border-transparent text-gray-450'}`}>02 PAYMENT TYPE</span>
              <span className={`p-1 border-b-2 font-bold ${step === 3 ? 'border-primary text-gray-900' : 'border-transparent text-gray-450'}`}>03 COMPLETED</span>
            </div>
          </div>

          {/* Form Router details */}
          <div className="flex-1">
            
            {/* Step 1: Destination info */}
            {step === 1 && (
              <form onSubmit={handleStep1Proceed} className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-900 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider">Shipping Destination Address</h3>
                </div>

                {currentUser ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-mono flex items-center justify-between">
                    <span>✓ Verified Customer: <strong className="text-gray-900">{currentUser.phone}</strong></span>
                    <span className="text-[9px] text-gray-500 uppercase font-black">Linked Session</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span>⚠️ Guest Checkout. Save order logs by completing admin or user registration!</span>
                    <button 
                      type="button"
                      onClick={onOpenAuth}
                      className="px-3 py-1.5 bg-[#fb641b] hover:bg-[#e65c19] text-white font-bold uppercase rounded text-[10px] tracking-wider transition-all shrink-0 cursor-pointer"
                    >
                      LOGIN / REGISTER
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Customer / Consignee Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs outline-none text-gray-900 focus:border-primary focus:bg-white transition-all font-semibold"
                    />
                    {formErrors.name && <p className="text-[10px] text-accent font-mono mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Email Node Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs outline-none text-gray-900 focus:border-primary focus:bg-white transition-all font-semibold"
                    />
                    {formErrors.email && <p className="text-[10px] text-accent font-mono mt-1">{formErrors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Full Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="E.g. House No, Floor, Building, Block"
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs outline-none text-gray-900 focus:border-primary focus:bg-white transition-all font-semibold"
                  />
                  {formErrors.address && <p className="text-[10px] text-accent font-mono mt-1">{formErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs outline-none text-gray-900 focus:border-primary focus:bg-white transition-all font-semibold"
                    />
                    {formErrors.city && <p className="text-[10px] text-accent font-mono mt-1">{formErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Zip Code / PIN</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs outline-none text-gray-900 focus:border-primary focus:bg-white transition-all font-semibold"
                    />
                    {formErrors.zipCode && <p className="text-[10px] text-accent font-mono mt-1">{formErrors.zipCode}</p>}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-primary text-white font-display font-bold text-xs tracking-widest py-3 rounded-lg hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>PROCEED TO PAYMENT SELECT</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment Gateway choosing */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-gray-900">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider">Select payment method</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className={`p-4 rounded border text-left flex flex-col justify-between aspect-video cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod'
                        ? 'border-primary bg-blue-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] font-sans font-bold text-gray-900 uppercase">Cash on Delivery</p>
                      <p className="text-[9px] text-gray-500 font-sans">Pay with cash when delivered</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                    className={`p-4 rounded border text-left flex flex-col justify-between aspect-video cursor-pointer transition-all ${
                      formData.paymentMethod === 'upi'
                        ? 'border-primary bg-blue-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-1.5 items-center">
                      <Wallet className="w-5 h-5 text-accent" />
                      <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold">BHIM / UPI</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-sans font-bold text-gray-900 uppercase">UPI Pay</p>
                      <p className="text-[9px] text-gray-500 font-sans">Pay via PhonePe, GPay, Paytm</p>
                    </div>
                  </button>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  {formData.paymentMethod === 'cod' && (
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-semibold text-gray-800">No online payment required</p>
                      <p className="text-[11px] text-gray-500 font-sans leading-relaxed mt-1">
                        Choosing Cash on Delivery means you can pay in cash or card to our delivery executive when your order reaches your address. Please keep <strong className="text-gray-900 font-bold">{getPriceSymbol()}{total}</strong> ready on delivery.
                      </p>
                    </div>
                  )}

                  {formData.paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white border border-gray-150 rounded-lg text-left space-y-3">
                        <p className="text-xs font-semibold text-gray-800">Scan UPI QR or enter UPI ID</p>
                        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {/* Mock UPI QR code */}
                          <div className="w-20 h-20 bg-white border border-gray-200 flex flex-col items-center justify-center p-1 rounded relative select-none shrink-0">
                            <span className="text-2xl">📱</span>
                            <span className="text-[7px] font-mono text-gray-500 font-bold uppercase mt-1">UPI QR CODE</span>
                            <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                              <div className="w-16 h-16 border border-dashed border-gray-400 opacity-20" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-[10px] text-gray-500 font-sans leading-normal">
                              Scan the simulated QR code to secure instant payment, or submit your virtual payment address to pay directly.
                            </p>
                            <p className="text-xs font-bold text-primary">Merchant VPA: pay-nova@okaxis</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] uppercase text-gray-500 font-bold">Enter UPI ID (e.g. user@upi)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="abhigoud9346@ybl"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setUpiVerified(false);
                              }}
                              className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-xs outline-none text-gray-900 focus:border-primary font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (upiId.includes('@')) {
                                  setUpiVerified(true);
                                } else {
                                  alert('Please enter a valid UPI ID (containing @)');
                                }
                              }}
                              className={`px-4 py-2 text-xs font-bold font-sans uppercase rounded cursor-pointer transition-all ${
                                upiVerified 
                                  ? 'bg-green-600 text-white shadow-sm' 
                                  : 'bg-primary hover:bg-blue-700 text-white'
                              }`}
                            >
                              {upiVerified ? '✓ Verified' : 'Verify'}
                            </button>
                          </div>
                          {upiVerified && (
                            <p className="text-[9.5px] text-green-600 font-bold">✓ UPI ID is verified & connected with bank servers.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 border border-gray-300 hover:border-gray-400 text-gray-700 font-display font-bold text-xs tracking-widest py-3 rounded-lg cursor-pointer"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleCompleteOrder}
                    className="w-2/3 bg-primary hover:bg-blue-700 text-white font-display font-bold text-xs tracking-widest py-3 rounded-lg cursor-pointer flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <span>PLACE ORDER NOW</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: COMPLETION success status */}
            {step === 3 && (
              <div className="text-center py-6 space-y-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500 flex items-center justify-center text-green-650 mb-4 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tight">ORDER SUCCESSFULLY PLACED</h3>
                  <p className="font-mono text-xs text-primary mt-1 font-bold">{orderId}</p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-left text-xs font-mono space-y-3">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Node Customer</span>
                    <span className="text-gray-900 font-bold">{formData.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Shipping destination</span>
                    <span className="text-gray-900 font-bold truncate max-w-[200px]">{formData.address}, {formData.city}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Payment Option</span>
                    <span className="text-gray-900 font-bold uppercase">{formData.paymentMethod.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-green-600 font-bold animate-pulse">● TO BE DISPATCHED</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      onClearCart();
                      onClose();
                    }}
                    className="w-full bg-primary text-white font-display font-bold text-xs tracking-widest py-3.5 rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Info list review column (Cols-5) */}
        <div className="md:col-span-5 bg-gray-50 border-l border-gray-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[35vh] md:max-h-[85vh]">
          
          <div>
            <div className="flex items-center space-x-2 text-gray-900 mb-6">
              <ClipboardList className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-xs uppercase tracking-widest">ORDER SUMMARY</h3>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto divide-y divide-gray-150 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex space-x-3 pt-3 first:pt-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-12 object-cover rounded border border-gray-200" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-semibold text-gray-900 truncate font-display mb-0.5">{item.product.name}</h4>
                    <p className="text-[9px] font-mono text-gray-500 uppercase">Size: {item.selectedSize} / {item.selectedColor.name}</p>
                    <p className="text-[9px] font-mono text-primary mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-xs text-gray-900 self-center font-bold font-mono">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-xs font-mono text-gray-500">
              <span>Gross cart total</span>
              <span className="text-gray-900 font-bold">{formatPrice(subtotal)}</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-xs font-mono text-green-650">
                <span className="flex items-center gap-1 font-bold">
                  <Ticket className="w-3 h-3" /> VOUCHER DISCOUNT
                </span>
                <span>-{getPriceSymbol()}{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-mono text-gray-550">
              <span>Delivery charge</span>
              <span className="text-green-600 font-bold">FREE DELIVERY</span>
            </div>
            <div className="flex justify-between border-t border-gray-250 pt-3 mt-1 text-sm font-display font-extrabold text-gray-900 uppercase tracking-wider">
              <span>NET TOTAL</span>
              <span className="text-primary font-mono font-black tracking-normal pr-1">{getPriceSymbol()}{total}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
