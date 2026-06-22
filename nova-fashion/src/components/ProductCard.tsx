import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sliders, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: React.Key | string;
  product: Product;
  currentCurrency: 'INR' | 'USD' | 'EUR' | 'JPY';
  isWishlisted: boolean;
  isInCompare: boolean;
  onToggleWishlist: (pId: string) => void;
  onToggleCompare: (pId: string) => void;
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }) => void;
  onInstantBuy?: (product: Product, size: string, color: { name: string; hex: string }) => void;
}

export default function ProductCard({
  product,
  currentCurrency,
  isWishlisted,
  isInCompare,
  onToggleWishlist,
  onToggleCompare,
  onOpenQuickView,
  onAddToCart,
  onInstantBuy
}: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  // Price conversion
  const formatPrice = (usdPrice: number) => {
    switch (currentCurrency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  // Price helper for original slashed prices to emulate discounts
  const originalPrice = Math.round(product.price * 1.5);
  const discountPercent = 33; // Mock attractive discount rate

  const handleInstantAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInstantBuy) {
      onInstantBuy(product, selectedSize, selectedColor);
    } else {
      onAddToCart(product, selectedSize, selectedColor);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="group relative rounded-lg bg-white border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all cursor-pointer text-left"
    >
      
      {/* Upper Imagery Area */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden" onClick={() => onOpenQuickView(product)}>
        
        {/* Main Product Image */}
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          style={{ objectPosition: 'center 20%' }}
        />

        {/* Dynamic decorative tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isNewArrival && (
            <span className="text-[9px] font-sans font-extrabold uppercase bg-primary text-white px-1.5 py-0.5 rounded-sm shadow-sm">
              NEW
            </span>
          )}
          {product.isTrending && (
            <span className="text-[9px] font-sans font-extrabold uppercase bg-accent text-white px-1.5 py-0.5 rounded-sm shadow-sm">
              TRENDING
            </span>
          )}
        </div>

        {/* Action button bar */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
            className={`p-2 rounded-full shadow border transition-all cursor-pointer ${
              isWishlisted 
                ? 'bg-red-550 border-red-100 text-white bg-red-500' 
                : 'bg-white border-gray-200 text-gray-400 hover:text-red-500'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(product.id); }}
            className={`p-2 rounded-full shadow border transition-all cursor-pointer ${
              isInCompare 
                ? 'bg-primary border-primary text-white' 
                : 'bg-white border-gray-200 text-gray-400 hover:text-primary'
            }`}
            title="Compare Specs"
          >
            <Sliders className="w-3.5 h-3.5 rotate-90" />
          </button>
        </div>
      </div>

      {/* Info Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white text-left">
        
        <div className="space-y-1">
          {/* Category & Ratings Block */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{product.category}</span>
            <div className="bg-green-600 text-white rounded px-1 py-0.5 text-[10px] font-bold flex items-center space-x-0.5">
              <span>{product.rating}</span>
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>
          </div>

          {/* Product Name Title */}
          <h3 
            onClick={() => onOpenQuickView(product)}
            className="font-sans font-bold text-gray-800 text-sm tracking-tight cursor-pointer hover:text-primary truncate transition-all mt-1"
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-gray-500 line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Selections Area */}
        <div className="my-2 space-y-1.5 pt-2 border-t border-gray-100">
          {/* Color Selection swatches */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400 font-medium">Color</span>
            <div className="flex items-center space-x-1">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={(e) => { e.stopPropagation(); setSelectedColor(c); }}
                  style={{ backgroundColor: c.hex }}
                  className={`w-3 h-3 rounded-full border transition-all cursor-pointer ${
                    selectedColor.name === c.name 
                      ? 'ring-1 ring-primary ring-offset-1 ring-offset-white scale-110' 
                      : 'border-gray-200 opacity-75 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Size selection layout */}
          {product.sizes[0] !== 'One Size' && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400 font-medium">Size</span>
              <div className="flex items-center space-x-0.5">
                {product.sizes.slice(0, 3).map((sz) => (
                  <button
                    key={sz}
                    onClick={(e) => { e.stopPropagation(); setSelectedSize(sz); }}
                    className={`px-1 rounded font-sans text-[9px] font-bold border transition-all cursor-pointer ${
                      selectedSize === sz 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing tag & Cart Deployment Button */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 mt-1">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-extrabold text-gray-900 leading-none">
                {formatPrice(product.price)}
              </span>
              <span className="text-[10px] text-gray-400 line-through leading-none">
                {formatPrice(originalPrice)}
              </span>
            </div>
            <span className="text-[10px] text-green-600 font-bold leading-tight">
              {discountPercent}% off
            </span>
          </div>

          <motion.button
            onClick={handleInstantAddToCart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-2.5 py-1.5 rounded text-[10px] font-bold tracking-wider flex items-center space-x-1 border cursor-pointer transition-all ${
              added 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-primary text-white border-primary hover:bg-blue-700'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3" />
                <span>ADDED</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                <span>BUY NOW</span>
              </>
            )}
          </motion.button>
        </div>

      </div>

    </motion.div>
  );
}
