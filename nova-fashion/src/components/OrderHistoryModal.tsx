import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ClipboardCheck, Check, Calendar, Truck, Box, CheckCircle2, RotateCcw, Shield, ShoppingBag, MapPin, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentCurrency: 'INR' | 'USD' | 'EUR' | 'JPY';
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  orders,
  currentCurrency
}: OrderHistoryModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatPrice = (usdPrice: number) => {
    switch (currentCurrency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Stepper state matcher
  const getStatusStepObj = (status: Order['status']) => {
    const steps = [
      { key: 'Processing', label: 'Processing', desc: 'Secure packaging stashed' },
      { key: 'In Transit', label: 'In Transit', desc: 'Out of local warehouse' },
      { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Arrived at delivery hub' },
      { key: 'Delivered', label: 'Delivered', desc: 'Successfully handed over' }
    ];

    const currentIndex = steps.findIndex(s => s.key === status);
    return {
      steps,
      currentIndex: currentIndex !== -1 ? currentIndex : 0
    };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="max-w-4xl w-full bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header bar */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50 bg-radial from-transparent to-gray-100/30">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Box className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Order History & Tracking</h3>
              <p className="text-[11px] text-gray-500 font-sans">Track past purchases, transaction receipt stashes and status updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/80 text-gray-400 hover:text-gray-900 transition-all cursor-pointer border border-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {orders.length === 0 ? (
            <div className="py-16 px-4 text-center max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-sans font-black text-[#212121] text-sm uppercase">No Past Purchases Found</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Your order history database is empty. Explore our catalog page and put together your first high-contrast outfit today!
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-sans font-black text-[11px] uppercase tracking-widest rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Start Shop Exploration
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              {orders.map((ord) => {
                const isExpanded = !!expandedOrders[ord.id];
                const { steps, currentIndex } = getStatusStepObj(ord.status);

                return (
                  <div
                    key={ord.id}
                    className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-gray-350 transition-all flex flex-col space-y-4"
                  >
                    {/* Compact row summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans pb-3 border-b border-gray-100">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-mono text-[10px] bg-slate-100 font-bold text-gray-700 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                            Order {ord.id.substring(0, 10)}...
                          </span>
                          <button
                            onClick={() => handleCopyId(ord.id)}
                            className="p-1 rounded text-primary hover:bg-blue-50 transition-all cursor-pointer"
                            title="Copy full Order ID"
                          >
                            {copiedId === ord.id ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <ClipboardCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1.5 font-semibold">
                          <Calendar className="w-3.5 h-3.5" /> Checked out: {formatDate(ord.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 self-start sm:self-center">
                        <div className="text-right">
                          <p className="text-[9.5px] text-gray-400 font-bold uppercase leading-none">Grand Total</p>
                          <p className="font-mono text-sm font-bold text-primary mt-0.5">{formatPrice(ord.totalPrice)}</p>
                        </div>

                        <span className={`text-[10px] font-sans font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          ord.status === 'Delivered' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : ord.status === 'Out for Delivery'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : ord.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress checkpoints bar container */}
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 text-center relative">
                        {/* Connecting background tracking line */}
                        <div className="absolute top-[11px] left-[12.5%] right-[12.5%] h-1 bg-gray-100 z-0">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(currentIndex / 3) * 100}%` }}
                          />
                        </div>

                        {steps.map((st, sIdx) => {
                          const isActive = sIdx <= currentIndex;
                          const isCurrent = sIdx === currentIndex;

                          return (
                            <div key={st.key} className="flex flex-col items-center space-y-1.5 z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-black text-[9px] transition-all border ${
                                isCurrent 
                                  ? 'bg-primary text-white border-primary ring-4 ring-blue-50 scale-110' 
                                  : isActive
                                  ? 'bg-blue-500 text-white border-blue-500' 
                                  : 'bg-white text-gray-400 border-gray-200'
                              }`}>
                                {isActive ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : sIdx + 1}
                              </div>
                              <div className="hidden sm:block">
                                <p className={`text-[10px] font-bold uppercase ${
                                  isCurrent ? 'text-primary font-black' : isActive ? 'text-gray-800' : 'text-gray-400'
                                }`}>
                                  {st.label}
                                </p>
                                <p className="text-[9px] text-gray-400 leading-none truncate max-w-[120px] mx-auto mt-0.5">
                                  {st.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Fallback label for mobile view */}
                      <p className="block sm:hidden text-[10px] text-center font-sans font-semibold text-primary uppercase tracking-wide mt-2">
                        Tracking Status: <span className="font-black">{ord.status} &ndash; {steps[currentIndex].desc}</span>
                      </p>
                    </div>

                    {/* Dropdown toggle for Items review */}
                    <div>
                      <button
                        onClick={() => toggleExpand(ord.id)}
                        className="w-full flex items-center justify-between text-[11px] font-sans font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100/80 p-2.5 rounded-lg border border-gray-150 transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          📋 {isExpanded ? 'Collapse itemized list' : `View ${ord.items.reduce((s,i) => s + i.quantity, 0)} purchased items`}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden bg-white border-x border-b border-gray-150 rounded-b-lg p-3 space-y-3"
                          >
                            <div className="divide-y divide-gray-100">
                              {ord.items.map((item, iIdx) => (
                                <div key={iIdx} className="flex items-center justify-between py-2 text-xs font-sans first:pt-0 last:pb-0">
                                  <div className="space-y-0.5 text-left min-w-0 pr-4">
                                    <h5 className="font-bold text-gray-900 truncate uppercase text-xs">{item.name}</h5>
                                    <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-semibold uppercase">
                                      <span>Size: {item.size}</span>
                                      <span>|</span>
                                      <span className="flex items-center gap-1">
                                        Color: {item.color}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-gray-900 text-xs">
                                      {item.quantity} &times; {formatPrice(item.price)}
                                    </p>
                                    <p className="text-[10px] text-primary font-mono font-bold mt-0.5">
                                      {formatPrice(item.quantity * item.price)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Additional Delivery Details */}
                            <div className="pt-2.5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-sans text-gray-600">
                              <div className="space-y-1 bg-yellow-50/50 p-2 rounded border border-yellow-200 text-left">
                                <p className="font-bold text-[#b45309] uppercase flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" /> Shipping Destination Address
                                </p>
                                <p className="line-clamp-2 leading-relaxed text-gray-700">{ord.shippingAddress || 'No custom shipping coordinates specified.'}</p>
                              </div>

                              <div className="space-y-1 bg-blue-50/50 p-2 rounded border border-blue-200 text-left">
                                <p className="font-bold text-primary uppercase flex items-center gap-1">
                                  <CreditCard className="w-3.5 h-3.5" /> Telemetry Payment Gateway
                                </p>
                                <p className="leading-relaxed text-gray-700">Method: {ord.paymentMethod || 'Credit & Debit Cellular Gateway'}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info lock badge */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center flex items-center justify-center gap-1.5 text-[10px] font-sans text-gray-500">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Nova Shield fully authenticates all past telemetry transactions. Client database synced.</span>
        </div>
      </motion.div>
    </div>
  );
}
