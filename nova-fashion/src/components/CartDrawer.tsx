import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, CreditCard, Percent, Truck, Info, TicketCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  currentCurrency: 'INR' | 'USD' | 'EUR' | 'JPY';
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onStartCheckout: () => void;
  onApplyDiscount: (percent: number, code: string) => void;
  appliedDiscount: { code: string; percent: number } | null;
}

export default function CartDrawer({
  isOpen,
  cart,
  currentCurrency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onStartCheckout,
  onApplyDiscount,
  appliedDiscount
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Aero' | 'Orbital'>('Standard');

  // Currency Converter formatting
  const formatPrice = (usdPrice: number) => {
    switch (currentCurrency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  const getShippingCost = () => {
    let cost = 0;
    if (shippingMethod === 'Aero') cost = 35;
    if (shippingMethod === 'Orbital') cost = 85;
    
    // adjust by currency
    switch (currentCurrency) {
      case 'INR': return Math.round(cost * 80);
      case 'EUR': return Math.round(cost * 0.92);
      case 'JPY': return Math.round(cost * 155);
      default: return cost;
    }
  };

  const getShippingLabelSymbol = () => {
    switch (currentCurrency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'JPY': return '¥';
      default: return '$';
    }
  };

  // Calculations
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

  const total = Math.max(0, convertedSubtotal - discountAmount + getShippingCost());

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'NOVA20') {
      onApplyDiscount(20, 'NOVA20');
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('Invalid quantum signal hash.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Translucent Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Core Sliding Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[460px] glass p-6 border-l border-white/10 shadow-2xl z-50 flex flex-col justify-between text-white"
          >
            {/* Header section with Close */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <p className="font-display font-black text-sm tracking-[0.2em] text-white">SHOPPING COURIER</p>
                </div>
                <button 
                  id="cart-close"
                  onClick={onClose} 
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Flow Steps Indicator */}
              <div className="py-4 flex items-center justify-between px-2 font-mono text-[9px] text-gray-400 border-b border-white/5 mb-4">
                <div className="flex items-center space-x-1 font-bold text-secondary">
                  <span className="w-4 h-4 rounded-full bg-secondary text-black flex items-center justify-center font-black">1</span>
                  <span>Review (Current)</span>
                </div>
                <div className="h-[1px] flex-1 bg-white/10 mx-2"></div>
                <div className="flex items-center space-x-1">
                  <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">2</span>
                  <span>Delivery Sync</span>
                </div>
                <div className="h-[1px] flex-1 bg-white/10 mx-2"></div>
                <div className="flex items-center space-x-1">
                  <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">3</span>
                  <span>Confirmation</span>
                </div>
              </div>
            </div>

            {/* Middle Product List area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 animate-bounce">
                    👜
                  </span>
                  <div>
                    <h4 className="font-display text-gray-300 font-bold text-sm">NO ITEMS STAGED</h4>
                    <p className="text-xs text-gray-500 font-sans max-w-[240px] mt-1 pr-1.5 leading-relaxed">
                      Select tech-luxury models from our catalog to load your shipment array.
                    </p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`cart-item-${item.id}`}
                    className="flex justify-between p-3 rounded-lg border border-white/5 bg-black/25 relative"
                  >
                    <div className="flex space-x-4">
                      {/* Miniature display */}
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="w-16 h-20 object-cover rounded border border-white/10" 
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="space-y-1">
                        <h4 className="font-display font-medium text-xs truncate max-w-[150px] uppercase text-white hover:text-secondary cursor-pointer">
                          {item.product.name}
                        </h4>
                        
                        {/* Variant Swatches list */}
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono">
                          <span className="bg-white/10 px-1.5 py-0.5 rounded capitalize">{item.selectedSize}</span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/10" style={{ backgroundColor: item.selectedColor.hex }} />
                            <span>{item.selectedColor.name}</span>
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 pt-1 border-none bg-none">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs px-2 font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-gray-500 hover:text-accent transition-all cursor-pointer"
                        title="Dismantle row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-xs font-semibold text-gray-300">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Bottom calculation checkout tray */}
            <div className="border-t border-white/5 pt-4 space-y-4">
              
              {/* Shipping Logistics selector */}
              {cart.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Dispatch Logistics</span>
                    <span>Method</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1 py-1 bg-black/50 border border-white/5 rounded-lg text-[10px] font-mono">
                    <button
                      onClick={() => setShippingMethod('Standard')}
                      className={`py-1.5 rounded transition-all truncate text-center cursor-pointer ${shippingMethod === 'Standard' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                      Orbital Standard <br /> (Free)
                    </button>
                    <button
                      onClick={() => setShippingMethod('Aero')}
                      className={`py-1.5 rounded transition-all truncate text-center cursor-pointer ${shippingMethod === 'Aero' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                      Aero Drone <br /> (+{getShippingLabelSymbol() === '¥' ? '¥5400' : getShippingLabelSymbol() === '€' ? '€32' : '$35'})
                    </button>
                    <button
                      onClick={() => setShippingMethod('Orbital')}
                      className={`py-1.5 rounded transition-all truncate text-center cursor-pointer ${shippingMethod === 'Orbital' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                      Teleport Instant <br /> (+{getShippingLabelSymbol() === '¥' ? '¥13200' : getShippingLabelSymbol() === '€' ? '€78' : '$85'})
                    </button>
                  </div>
                </div>
              )}

              {/* Promo code drawer form */}
              {cart.length > 0 && (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Enter 'NOVA20' for 20% off"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedDiscount}
                      className="w-full bg-black/40 border border-white/5 text-xs font-mono rounded-lg px-3 py-2.5 outline-none focus:border-primary text-white disabled:opacity-40"
                    />
                    {appliedDiscount && (
                      <span className="absolute right-2.5 top-2.5 flex items-center text-green-400 text-[9px] font-mono uppercase bg-green-500/10 px-1.5 py-0.5 rounded tracking-widest font-black">
                        <TicketCheck className="w-3 h-3 mr-1" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!!appliedDiscount || !couponCode}
                    className="px-4 bg-primary hover:bg-primary/80 disabled:opacity-40 select-none text-black font-mono font-bold text-[10px] uppercase rounded-lg cursor-pointer"
                  >
                    DEPLOY
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-accent font-mono pl-1">{couponError}</p>}

              {/* Price Calculation details summary */}
              <div className="space-y-2 text-xs font-mono text-gray-400 pt-1">
                <div className="flex justify-between">
                  <span>Gross Matrix Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center gap-1 font-bold">
                      <Percent className="w-3 h-3" /> VOUCHER CODE ({appliedDiscount.code})
                    </span>
                    <span>-{getShippingLabelSymbol()}{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Aero Logistics Transport</span>
                  <span className="text-white">
                    {getShippingCost() === 0 ? 'FREE SIGNAL' : `${getShippingLabelSymbol()}${getShippingCost()}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5 text-sm font-display font-extrabold text-white uppercase tracking-wider">
                  <span>Net Charged Total</span>
                  <span className="text-secondary tracking-normal font-mono font-black">{total === 0 ? '$0' : `${getShippingLabelSymbol()}${total}`}</span>
                </div>
              </div>

              {/* Checkout Trigger routing button */}
              <button
                onClick={onStartCheckout}
                disabled={cart.length === 0}
                className="w-full bg-secondary hover:bg-white text-black font-display font-bold text-xs tracking-[0.2em] py-4 rounded-xl uppercase transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>ENGAGE SECURE SIGN-OFF</span>
              </button>

              <div className="flex items-center justify-center space-x-1.5 py-1 text-[9px] font-mono text-gray-500 uppercase tracking-widest text-center">
                <Info className="w-3.5 h-3.5 text-gray-600" />
                <span>Encrypted secure channel by NOVA SECURE</span>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
