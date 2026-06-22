import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingBag, Heart, Sliders, Check, ShieldAlert, Package, Shuffle, RotateCcw, PlaySquare } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  allProducts: Product[];
  currentCurrency: 'INR' | 'USD' | 'EUR' | 'JPY';
  isWishlisted: boolean;
  isInCompare: boolean;
  onClose: () => void;
  onToggleWishlist: (pId: string) => void;
  onToggleCompare: (pId: string) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }) => void;
  onInstantBuy?: (product: Product, size: string, color: { name: string; hex: string }) => void;
}

export default function ProductDetailsModal({
  product,
  allProducts,
  currentCurrency,
  isWishlisted,
  isInCompare,
  onClose,
  onToggleWishlist,
  onToggleCompare,
  onAddToCart,
  onInstantBuy
}: ProductDetailsModalProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rotation360, setRotation360] = useState(50); // slider 0 to 100
  const [viewMode, setViewMode] = useState<'gallery' | '360' | 'video'>('gallery');
  const [cartFeedback, setCartFeedback] = useState(false);
  const [bundleFeedback, setBundleFeedback] = useState(false);

  // Currency helper
  const formatPrice = (usdPrice: number) => {
    switch (currentCurrency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  // Convert price symbol
  const getSymbol = () => {
    switch (currentCurrency) {
      case 'EUR': return '€';
      case 'JPY': return '¥';
      default: return '$';
    }
  };

  // Dynamic 360-degree index based on slider value
  const totalAngles = product.images.length;
  const get360Image = () => {
    // map slider (0-100) to index count
    const index = Math.min(
      totalAngles - 1,
      Math.floor((rotation360 / 100) * totalAngles)
    );
    return product.images[index];
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setCartFeedback(true);
    setTimeout(() => setCartFeedback(false), 2000);
  };

  // Setup a perfect "Frequently Bought Together" bundles pairing this with Accessories VISOR (id: nova-002) or BACKPACK (id: nova-008)
  const bundleAddon = allProducts.find(p => p.id === (product.id === 'nova-002' ? 'nova-001' : 'nova-002')) || allProducts[1];
  const combinedBundlePrice = Math.round((product.price + bundleAddon.price) * 0.85); // 15% discount for bundle

  const handleAddBundle = () => {
    // Add both items to cart
    onAddToCart(product, selectedSize, selectedColor);
    onAddToCart(bundleAddon, bundleAddon.sizes[0], bundleAddon.colors[0]);
    setBundleFeedback(true);
    setTimeout(() => setBundleFeedback(false), 2500);
  };

  // Isolate related products in category
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-6xl w-full bg-white rounded-2xl border border-gray-200 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[92vh] lg:max-h-[85vh]">
        
        {/* Absolute header and Close button */}
        <div className="absolute top-4 right-4 z-40">
          <button 
            id="modal-close"
            onClick={onClose} 
            className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all cursor-pointer border border-gray-200 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Column Left: Visualizer Modules (Cols-7) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 overflow-y-auto max-h-[50vh] lg:max-h-[85vh]">
          
          <div className="space-y-4">
            {/* View selectors */}
            <div className="flex border-b border-gray-200 pb-2.5 space-x-4 font-sans text-xs font-bold tracking-wider text-gray-500">
              <button 
                onClick={() => setViewMode('gallery')}
                className={`pb-1 px-1 transition-all focus:outline-none cursor-pointer ${viewMode === 'gallery' ? 'text-primary border-b-2 border-primary font-black' : 'hover:text-gray-900'}`}
              >
                MULTI-VIEW GALLERY
              </button>
              <button 
                onClick={() => setViewMode('360')}
                className={`pb-1 px-1 transition-all focus:outline-none cursor-pointer ${viewMode === '360' ? 'text-primary border-b-2 border-primary font-black' : 'hover:text-gray-900'}`}
              >
                INTERACTIVE 360° VIEW
              </button>
              <button 
                onClick={() => setViewMode('video')}
                className={`pb-1 px-1 transition-all focus:outline-none cursor-pointer ${viewMode === 'video' ? 'text-primary border-b-2 border-primary font-black' : 'hover:text-gray-900'}`}
              >
                SPEC SCAN FEED
              </button>
            </div>

            {/* Visual Screens router */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-white">
              
              {/* Screen index 1: Standard Multiangle Gallery with Zoom capability */}
              {viewMode === 'gallery' && (
                <div className="w-full h-full relative group/lens">
                  <img 
                    src={product.images[activeImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-all duration-700"
                    referrerPolicy="no-referrer"
                    style={{ objectPosition: 'center 30%' }}
                  />
                  {/* Subtle styling overlay */}
                  <div className="absolute inset-0 bg-radial from-transparent to-black/5 pointer-events-none" />
                </div>
              )}

              {/* Screen index 2: Interactive sliding 360-degree rotation view */}
              {viewMode === '360' && (
                <div className="w-full h-full flex flex-col justify-center items-center p-4 relative">
                  <img 
                    src={get360Image()} 
                    alt="360 view rotating" 
                    className="h-[80%] object-contain rounded-xl border border-gray-200 bg-white" 
                    referrerPolicy="no-referrer"
                  />
                  {/* Sliding controls */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-gray-200 space-y-1.5 flex flex-col shadow">
                    <p className="font-sans text-[10px] text-gray-600 text-center flex items-center justify-center gap-1 font-bold uppercase">
                      <RotateCcw className="w-3.5 h-3.5 text-primary animate-pulse" /> DRAG SLIDER TO SWIVEL ANGLE
                    </p>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={rotation360}
                      onChange={(e) => setRotation360(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer outline-none accent-primary"
                    />
                  </div>
                </div>
              )}

              {/* Screen index 3: Video simulation scan */}
              {viewMode === 'video' && (
                <div className="w-full h-full flex items-center justify-center relative p-6 bg-gray-50">
                  {/* Holographic scanning overlay */}
                  <div className="absolute inset-0 bg-radial from-primary/5 via-transparent to-black/5 pointer-events-none" />
                  <div className="text-center space-y-4 max-w-sm z-10">
                    <PlaySquare className="w-12 h-12 text-primary mx-auto animate-pulse" />
                    <div>
                      <h5 className="font-sans text-xs uppercase tracking-wider text-gray-900 font-black">BIOMETRIC SIGNAL STABLE</h5>
                      <p className="font-sans text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Establishing secure multi-frequency optical streaming... fibers match body thermodynamics is fully synced. Quality level is nominal.
                      </p>
                    </div>
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-gray-200 rounded font-sans text-[9px] text-green-600 uppercase tracking-widest font-bold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse animate-ping"></span>
                      <span>1080P CORE STREAM STABLE</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Thumbnail dots bottom bar for Multi-view */}
            {viewMode === 'gallery' && (
              <div className="flex space-x-2 pt-1 pb-3 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-14 sm:w-16 h-14 sm:h-16 rounded overflow-hidden border transition-all cursor-pointer ${
                      activeImageIndex === i ? 'border-primary scale-102 ring-2 ring-primary' : 'border-gray-200 opacity-70 hover:opacity-100 bg-white'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Related Products horizontal stack */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-sans font-extrabold text-[10px] tracking-wider text-gray-500 uppercase mb-3">RELATED PRODUCTS</h4>
            <div className="grid grid-cols-3 gap-3">
              {relatedProducts.length === 0 ? (
                <p className="text-[10px] text-gray-500 py-2">No concurrent compatible styles isolated.</p>
              ) : (
                relatedProducts.map((rel) => (
                  <div 
                    key={rel.id}
                    onClick={() => {
                      // Navigate within modal
                      setSelectedColor(rel.colors[0]);
                      setSelectedSize(rel.sizes[0]);
                      setActiveImageIndex(0);
                      setViewMode('gallery');
                      // set outer scope product
                      product.id = rel.id;
                      product.name = rel.name;
                      product.description = rel.description;
                      product.price = rel.price;
                      product.images = rel.images;
                      product.features = rel.features;
                      product.sizes = rel.sizes;
                      product.colors = rel.colors;
                      product.rating = rel.rating;
                      product.reviews = rel.reviews;
                      product.category = rel.category;
                    }}
                    className="flex space-x-2 bg-white p-2 rounded-lg border border-gray-200 hover:border-gray-350 transition-all cursor-pointer shadow-sm"
                  >
                    <img src={rel.images[0]} alt={rel.name} className="w-8 h-10 object-cover rounded border border-gray-200" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className="text-[9.5px] font-sans font-bold text-gray-900 truncate uppercase">{rel.name}</p>
                      <p className="text-[9px] font-mono font-bold text-primary mt-0.5">{formatPrice(rel.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Column Right: Purchase Form & Variant specs (Cols-5) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[42vh] lg:max-h-[85vh]">
          
          <div className="space-y-6 text-left">
            
            {/* Title category block */}
            <div className="space-y-1.5">
              <span className="font-sans text-primary text-[10px] uppercase tracking-wider font-bold">
                {product.category} ID: {product.id}
              </span>
              <h2 className="font-display font-black text-gray-900 text-xl sm:text-2xl tracking-tight uppercase leading-none">
                {product.name}
              </h2>

              <div className="flex items-center space-x-4 pt-1 font-sans text-xs text-gray-600">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-gray-900 ml-1">{product.rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 underline cursor-pointer">{product.reviews.length} reviews</span>
                <span className="text-gray-300">|</span>
                <span className={`font-bold ${product.inStock > 0 ? 'text-green-600' : 'text-accent'}`}>
                  {product.inStock > 0 ? `${product.inStock} Instock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price section converted dynamically */}
            <div className="py-3 border-y border-gray-200">
              <p className="text-[9.5px] font-sans text-gray-500 uppercase tracking-wider font-bold leading-none mb-1">Price</p>
              <h3 className="font-mono text-2xl sm:text-3xl font-extrabold text-[#212121]">
                {formatPrice(product.price)}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-650 leading-relaxed font-sans font-medium">
              {product.description}
            </p>

            {/* Techwear core specs bullet tags */}
            <div className="space-y-1.5">
              <p className="font-sans text-[10px] text-gray-500 uppercase tracking-wider font-bold">Product Specifications</p>
              <ul className="grid grid-cols-2 gap-1.5 text-[10px] font-sans text-gray-650">
                {product.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-1">
                    <span className="text-primary select-none font-bold">✓</span>
                    <span className="truncate">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Variant choices section */}
            <div className="grid grid-cols-2 gap-4 pb-1">
              <div>
                <label className="block text-[10px] font-sans text-gray-500 uppercase mb-2 font-bold">Colorway</label>
                <div className="flex items-center space-x-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                        selectedColor.name === c.name 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-white scale-108' 
                          : 'border-gray-200 opacity-80 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans text-gray-500 uppercase mb-2 font-bold font-bold">Size</label>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-2.5 py-1 rounded font-sans text-[10px] border font-bold transition-all cursor-pointer ${
                        selectedSize === sz 
                          ? 'bg-primary text-white border-primary font-black shadow-sm' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Buy & Wishlist buttons rows */}
            <div className="flex flex-col gap-2 pt-3">
              {/* Primary action buttons */}
              <div className="flex gap-2.5 w-full">
                {onInstantBuy && (
                  <button
                    onClick={() => {
                      onInstantBuy(product, selectedSize, selectedColor);
                      onClose();
                    }}
                    className="flex-1 font-sans font-black text-xs tracking-widest py-3.5 rounded-xl uppercase transition-all cursor-pointer flex items-center justify-center space-x-2 bg-[#fb641b] hover:bg-[#e65c19] text-white shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>BUY NOW</span>
                  </button>
                )}

                <button
                  onClick={handleAddToCart}
                  className={`flex-grow font-sans font-black text-xs tracking-widest py-3.5 rounded-xl uppercase transition-all cursor-pointer flex items-center justify-center space-x-2 border-none ${
                    cartFeedback 
                      ? 'bg-green-600 text-white shadow-sm' 
                      : 'bg-primary text-white hover:bg-blue-700'
                  }`}
                >
                  {cartFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ADDED TO CART</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>
              </div>

              {/* Utility buttons row */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`flex-grow py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center space-x-2 text-xs font-sans font-bold ${
                    isWishlisted 
                      ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' 
                      : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title="Stage in Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-600' : ''}`} />
                  <span>{isWishlisted ? 'WISHLISTED' : 'ADD TO WISHLIST'}</span>
                </button>

                <button
                  onClick={() => onToggleCompare(product.id)}
                  className={`flex-grow py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center space-x-2 text-xs font-sans font-bold ${
                    isInCompare 
                      ? 'bg-blue-50 border-blue-200 text-primary shadow-sm' 
                      : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title="Stage in Compare"
                >
                  <Sliders className="w-4 h-4 rotate-90" />
                  <span>{isInCompare ? 'COMPARING' : 'COMPARE SPECS'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Frequently Bought together Bundle Tray */}
          <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3.5 text-left">
            <div className="flex items-center justify-between">
              <p className="font-sans text-[10px] text-primary font-black uppercase tracking-wider flex items-center gap-1">
                <Shuffle className="w-3.5 h-3.5" /> FREQUENTLY BOUGHT TOGETHER
              </p>
              <span className="font-sans text-[9.5px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded">SAVE 15%</span>
            </div>

            <div className="flex items-center justify-between text-xs font-sans">
              <div className="flex items-center space-x-2 min-w-0">
                <img src={product.images[0]} alt="p1" className="w-8 h-10 object-cover rounded border border-gray-200" referrerPolicy="no-referrer" />
                <span className="text-gray-400 font-bold">+</span>
                <img src={bundleAddon.images[0]} alt="p2" className="w-8 h-10 object-cover rounded border border-gray-200" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-900 truncate font-bold uppercase">{bundleAddon.name}</p>
                  <p className="text-[8px] text-gray-500 uppercase font-bold">{bundleAddon.category}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400 line-through font-bold">{getSymbol()}{Math.round((product.price + bundleAddon.price) * (currentCurrency === 'EUR' ? 0.92 : currentCurrency === 'JPY' ? 155 : 1))}</p>
                <p className="text-primary font-black text-xs">{formatPrice(combinedBundlePrice)}</p>
              </div>
            </div>

            <button
              onClick={handleAddBundle}
              className={`w-full font-sans text-xs uppercase font-black py-2.5 rounded-lg border-none tracking-wide cursor-pointer transition-all ${
                bundleFeedback
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-primary text-white hover:bg-blue-700'
              }`}
            >
              {bundleFeedback ? 'BOTH ITEMS ADDED' : 'ADD BUNDLE TO CART'}
            </button>
          </div>

          {/* Review listings view */}
          <div className="mt-6 pt-5 border-t border-gray-200 space-y-3.5 text-left">
            <h4 className="font-sans font-extrabold text-[10px] tracking-wider text-gray-500 uppercase">FEEDBACK LOG</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                  <div className="flex justify-between items-center text-[10.5px] font-sans">
                    <span className="text-gray-900 font-bold">{rev.author}</span>
                    <span className="text-gray-500 font-semibold">{rev.date}</span>
                  </div>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: rev.rating }).map((_, rIdx) => (
                      <Star key={rIdx} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {rev.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
