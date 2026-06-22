import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, ShoppingCart, Tag, Compass } from 'lucide-react';
import { Product } from '../types';
import { lookbookLooks } from '../data/catalog';

interface LookbookProps {
  allProducts: Product[];
  currentCurrency: 'INR' | 'USD' | 'EUR' | 'JPY';
  onOpenProductDetails: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }) => void;
  onInstantBuy?: (product: Product, size: string, color: { name: string; hex: string }) => void;
}

// Hotspots placement on stock model coordinates to simulate true interactive hot-tag overlays
const lookHotspots: Record<string, { top: string; left: string; productId: string; name: string }[]> = {
  "look-01": [
    { top: "18%", left: "48%", productId: "nova-001", name: "HOLO-GATEWAY PARKA" },
    { top: "45%", left: "62%", productId: "nova-003", name: "VOID-WEAVE DECONSTRUCTED COAT" },
    { top: "78%", left: "41%", productId: "nova-004", name: "KINETIC CARGO STRAP TROUSERS" }
  ],
  "look-02": [
    { top: "12%", left: "55%", productId: "nova-002", name: "CYBER-LUME VISOR" },
    { top: "86%", left: "50%", productId: "nova-005", name: "AERO-CHRONO SHOES" },
    { top: "40%", left: "28%", productId: "nova-008", name: "ECLIPSE BACKPACK" }
  ]
};

export default function Lookbook({
  allProducts,
  currentCurrency,
  onOpenProductDetails,
  onAddToCart,
  onInstantBuy
}: LookbookProps) {
  const [selectedLookId, setSelectedLookId] = useState(lookbookLooks[0].id);
  const [activeHotspotProduct, setActiveHotspotProduct] = useState<Product | null>(null);

  const selectedLook = lookbookLooks.find(l => l.id === selectedLookId) || lookbookLooks[0];
  const hotspots = lookHotspots[selectedLook.id] || [];

  const formatPrice = (usdPrice: number) => {
    switch (currentCurrency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  const handleHotspotClick = (productId: string) => {
    const p = allProducts.find(prod => prod.id === productId);
    if (p) {
      setActiveHotspotProduct(p);
    }
  };

  const handleQuickAdd = (product: Product) => {
    if (onInstantBuy) {
      onInstantBuy(product, product.sizes[0], product.colors[0]);
    } else {
      onAddToCart(product, product.sizes[0], product.colors[0]);
    }
    setActiveHotspotProduct(null);
  };

  return (
    <div className="py-20 bg-white min-h-[80vh] border-b border-gray-200 relative">
      
      {/* Background flare glows */}
      <div className="absolute top-1/4 right-5 w-96 h-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-primary font-sans text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Lookbook Matrix</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-gray-900 tracking-tight uppercase">
            STAGING <span className="text-gradient">THE SPECTRUM</span>
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto font-sans leading-relaxed">
            Interact with the active nodes on the catalog model frames below to isolate specific garments, examine attributes, or instantly purchase individual components.
          </p>
        </div>

        {/* Dynamic selector bar */}
        <div className="flex justify-center mb-12 space-x-4">
          {lookbookLooks.map((look) => (
            <button
              key={look.id}
              onClick={() => {
                setSelectedLookId(look.id);
                setActiveHotspotProduct(null);
              }}
              className={`px-6 py-3 rounded-lg font-display text-xs tracking-widest font-bold border transition-all cursor-pointer ${
                selectedLookId === look.id
                  ? 'bg-primary border-none text-white shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-350 hover:bg-gray-50'
              }`}
            >
              {look.name}
            </button>
          ))}
        </div>

        {/* Look Display Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Detailed Description Side Cover */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-6 text-left order-2 lg:order-1">
            <span className="font-mono text-primary text-[11px] uppercase tracking-widest font-black">
              ACTIVE VIBE CONFIG
            </span>
            <h3 className="font-display font-black text-gray-950 text-2xl sm:text-3xl leading-tight uppercase">
              {selectedLook.name}
            </h3>
            
            {/* Elegant Quotation block */}
            <div className="pl-4 border-l-2 border-primary font-sans italic text-gray-600 text-sm leading-relaxed">
              &ldquo;{selectedLook.quote}&rdquo;
            </div>

            {/* List of active items in this Look */}
            <div className="space-y-4 pt-4">
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider font-bold">Outfit Formula</p>
              <div className="space-y-3">
                {selectedLook.items.map((itemId) => {
                  const prod = allProducts.find(p => p.id === itemId);
                  if (!prod) return null;
                  return (
                    <div 
                      key={itemId}
                      onClick={() => onOpenProductDetails(prod)}
                      className="flex items-center space-x-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer transition-all"
                    >
                      <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded border border-gray-200" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate font-display">{prod.name}</p>
                        <p className="text-[10px] text-primary font-bold font-sans">{formatPrice(prod.price)}</p>
                      </div>
                      <Tag className="w-4 h-4 text-gray-400 hover:text-primary h-fit self-center pr-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Model Frame with Interactive Hotspots overlay */}
          <div className="lg:col-span-8 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-2xl">
              
              {/* Massive Fashion Photograph */}
              <img 
                src={selectedLook.image} 
                alt={selectedLook.name} 
                className="w-full h-full object-cover transition-all duration-1000"
                referrerPolicy="no-referrer"
                style={{ objectPosition: 'center 20%' }}
              />

              {/* Bright overlay gradient background */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {/* Hotspot anchor overlay items */}
              {hotspots.map((spot) => (
                <div
                  key={spot.productId}
                  className="absolute"
                  style={{ top: spot.top, left: spot.left }}
                >
                  <button
                    onClick={() => handleHotspotClick(spot.productId)}
                    className="relative flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white shadow-md cursor-pointer hover:scale-110 active:scale-90 transition-all group z-30"
                  >
                    <Tag className="w-3.5 h-3.5 font-bold" />
                    
                    {/* Ring Pulse Radar animation */}
                    <span className="absolute inset-0 rounded-full border border-primary animate-ping scale-150 opacity-40"></span>
                    
                    {/* Tooltip Label bubble popping up on button hover */}
                    <span className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-white text-gray-900 font-sans text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-300 shadow-xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all whitespace-nowrap pointer-events-none">
                      {spot.name}
                    </span>
                  </button>
                </div>
              ))}

              {/* Hotspot detail overlay panel pop-up inside image frame */}
              <AnimatePresence>
                {activeHotspotProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    className="absolute inset-x-4 bottom-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xl z-40 text-left flex items-center space-x-4 space-y-0"
                  >
                    <img 
                      src={activeHotspotProduct.images[0]} 
                      alt={activeHotspotProduct.name} 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-mono text-primary uppercase font-bold tracking-widest">Selected Item</p>
                      <h4 className="text-xs font-display font-black text-gray-900 truncate uppercase">{activeHotspotProduct.name}</h4>
                      <p className="font-sans text-sm text-gray-900 font-bold mt-0.5">{formatPrice(activeHotspotProduct.price)}</p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <button
                        onClick={() => handleQuickAdd(activeHotspotProduct)}
                        className="bg-primary text-white font-sans font-black text-[10px] px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1 hover:bg-blue-700 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Instant Buy</span>
                      </button>
                      <button
                        onClick={() => { onOpenProductDetails(activeHotspotProduct); setActiveHotspotProduct(null); }}
                        className="border border-gray-300 hover:border-gray-400 text-gray-750 font-sans text-[10px] px-3 py-1 rounded uppercase tracking-wider cursor-pointer text-center font-bold"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => setActiveHotspotProduct(null)}
                        className="text-[10px] text-gray-500 hover:text-gray-900 uppercase font-sans font-bold text-center pt-0.5 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
