import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Flame, RotateCcw, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface HeroProps {
  featuredProduct: Product;
  onExploreProducts: () => void;
  onConsultStylist: () => void;
  onOpenProductDetails: (product: Product) => void;
}

export default function Hero({
  featuredProduct,
  onExploreProducts,
  onConsultStylist,
  onOpenProductDetails
}: HeroProps) {
  return (
    <div className="w-full bg-[#f1f3f6] py-4 px-4 sm:px-6 lg:px-8 space-y-4">
      
      {/* 1. Flipkart Signature Yellow Coupon Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto rounded-lg overflow-hidden bg-[#fffbeb] border border-yellow-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 md:py-6"
      >
        <div className="md:col-span-8 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          {/* Yellow Badge */}
          <div className="bg-[#ffe11b] text-primary font-black py-2.5 px-6 rounded-md text-base sm:text-lg tracking-wider border-2 border-dashed border-primary shadow-sm uppercase font-sans animate-bounce">
            Flat 10% Off
          </div>
          
          <div>
            <h2 className="text-[#212121] text-lg sm:text-2xl font-black font-sans flex items-center justify-center md:justify-start gap-2">
              Exclusive coupon for you! <span className="text-primary">✦ Up to ₹100</span>
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1 font-sans">
              Sale on high prestige clothing, electronics and more starts active today!
            </p>
          </div>
        </div>

        <div className="md:col-span-4 flex items-center justify-center md:justify-end gap-3">
          <span className="bg-green-150 text-green-700 bg-green-100 font-bold px-3 py-1.5 rounded-full text-xs font-sans">
            Already applied
          </span>
          <button 
            onClick={onExploreProducts}
            className="bg-primary hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-md shadow-sm flex items-center gap-1 cursor-pointer"
          >
            Shop Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>


      {/* 2. Three-column Promo grid (Vibe 5G, Cooker, Raincoat) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Banner 1: Vibe 5G (Dual Mockups) */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="rounded-lg bg-gradient-to-br from-[#0c0d12] to-[#2c1d3d] text-white p-5 flex items-center justify-between relative overflow-hidden shadow-sm h-48 cursor-pointer group"
          onClick={onExploreProducts}
        >
          <div className="space-y-1.5 z-10 text-left">
            <span className="bg-red-500/80 text-[8px] tracking-widest font-extrabold px-1.5 py-0.5 rounded uppercase font-sans">
              JUNE SALE
            </span>
            <h3 className="text-lg font-black tracking-tight leading-tight uppercase font-sans">
              Vibe 5G | 6000 mAh
            </h3>
            <p className="text-secondary text-sm font-bold">
              From ₹12,999*
            </p>
            <p className="text-[9px] text-gray-400">
              Sale starts from 16th June
            </p>
          </div>

          {/* Micro Phone Design Renderings */}
          <div className="relative w-32 h-36 flex items-center justify-end">
            <div className="absolute right-2 w-16 h-32 rounded-lg bg-indigo-500 border border-indigo-400 overflow-hidden shadow-lg transform rotate-6 translate-y-3 group-hover:scale-105 transition-transform">
              <div className="w-full h-8 bg-black/20 flex justify-center items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              </div>
            </div>
            <div className="absolute right-8 w-16 h-32 rounded-lg bg-pink-500 border border-pink-400 overflow-hidden shadow-lg transform -rotate-12 translate-y-1 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-8 bg-black/20 flex justify-center items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              </div>
            </div>
          </div>
          <span className="absolute bottom-2 left-5 bg-white/10 text-white/50 text-[8px] font-sans px-1 rounded">
            AD
          </span>
        </motion.div>


        {/* Banner 2: Cooker June Epic Sale */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="rounded-lg bg-gradient-to-br from-[#ffe07a] to-[#ffab41] text-[#212121] p-5 flex items-center justify-between relative overflow-hidden shadow-sm h-48 cursor-pointer group"
          onClick={onExploreProducts}
        >
          <div className="space-y-1 z-10 text-left">
            <span className="bg-[#fb641b] text-white text-[8px] tracking-widest font-extrabold px-1.5 py-0.5 rounded uppercase font-sans">
              EPIC SALE
            </span>
            <h3 className="text-lg font-black tracking-tight leading-tight text-gray-900 uppercase font-sans">
              Pressure Cookers
            </h3>
            <p className="text-primary font-black text-sm">
              Pressure cooker From ₹549
            </p>
            <p className="text-[10px] text-gray-700 font-semibold font-sans">
              Pigeon, Hawkins & more
            </p>
          </div>

          {/* Micro illustration indicator icon or cooker placeholder */}
          <div className="w-24 h-24 rounded-full bg-white/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <span className="text-4xl">🍳</span>
          </div>
          <span className="absolute bottom-2 left-5 bg-black/10 text-gray-700 text-[8px] font-sans px-1 rounded">
            AD
          </span>
        </motion.div>


        {/* Banner 3: Citizen Raincoat */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="rounded-lg bg-gradient-to-br from-[#c6ebd4] to-[#7fcd91] text-[#212121] p-5 flex items-center justify-between relative overflow-hidden shadow-sm h-48 cursor-pointer group"
          onClick={onExploreProducts}
        >
          <div className="space-y-1.5 z-10 text-left">
            <span className="bg-[#1b8b24] text-white text-[8px] tracking-widest font-extrabold px-1.5 py-0.5 rounded uppercase font-sans">
              CITIZEN
            </span>
            <h3 className="text-lg font-black tracking-tight leading-tight text-emerald-950 uppercase font-sans">
              Raincoat with Bag
            </h3>
            <p className="text-emerald-950 font-bold text-sm">
              Waterproof protection
            </p>
            <p className="text-[10px] text-emerald-800 font-semibold font-sans">
              Shop now: Stylish Choice
            </p>
          </div>

          <div className="w-24 h-24 rounded-full bg-white/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <span className="text-4xl">🧥</span>
          </div>
          <span className="absolute bottom-2 left-5 bg-black/5 text-gray-700 text-[8px] font-sans px-1 rounded">
            AD
          </span>
        </motion.div>

      </div>

    </div>
  );
}
