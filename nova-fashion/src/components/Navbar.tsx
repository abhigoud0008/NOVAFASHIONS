import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Heart, User, Sparkles, Sliders, X, LogOut, LayoutGrid, Box } from 'lucide-react';
import { Product, CartItem, Order } from '../types';
import OrderHistoryModal from './OrderHistoryModal';

interface NavbarProps {
  cart: CartItem[];
  wishlist: string[];
  compareList: string[];
  allProducts: Product[];
  currentCurrency: 'INR' | 'USD' | 'EUR' | 'JPY';
  currentLanguage: 'EN' | 'FR' | 'JP';
  currentUser: { phone: string } | null;
  orders: Order[];
  onSetCurrency: (curr: 'INR' | 'USD' | 'EUR' | 'JPY') => void;
  onSetLanguage: (lang: 'EN' | 'FR' | 'JP') => void;
  onNavigate: (section: 'landing' | 'lookbook' | 'stylist' | 'admin' | 'all-products') => void;
  onToggleCart: () => void;
  onOpenProductDetails: (product: Product) => void;
  onRemoveFromWishlist: (pId: string) => void;
  onRemoveFromCompare: (pId: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSelectCategory?: (cat: string) => void;
  selectedCategory?: string;
}

export default function Navbar({
  cart,
  wishlist,
  compareList,
  allProducts,
  currentCurrency,
  currentLanguage,
  currentUser,
  orders,
  onSetCurrency,
  onSetLanguage,
  onNavigate,
  onToggleCart,
  onOpenProductDetails,
  onRemoveFromWishlist,
  onRemoveFromCompare,
  onOpenAuth,
  onLogout,
  onSelectCategory,
  selectedCategory = 'All'
}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrefDropdown, setShowPrefDropdown] = useState(false);
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Search filter
  const foundProducts = searchQuery.trim() === ''
    ? []
    : allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const formatPrice = (usdPrice: number) => {
    switch (currentCurrency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  const navCategories = [
    { name: 'All', icon: '🛍️' },
    { name: 'Outerwear', icon: '🧥' },
    { name: 'Tops', icon: '👕' },
    { name: 'Bottoms', icon: '👖' },
    { name: 'Footwear', icon: '👟' },
    { name: 'Accessories', icon: '🕶️' }
  ];

  const handleSelectCategory = (catName: string) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    onNavigate('all-products');
  };

  return (
    <div className="w-full sticky top-0 z-50 flex flex-col shadow-md">
      
      {/* 1. Flipkart Signature Brand Royal Blue Top Bar */}
      <nav className="bg-primary text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-blue-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Title (Flipkart-inspired layout with Plus subscript) */}
          <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start">
            <div className="cursor-pointer text-left" onClick={() => onNavigate('landing')}>
              <h1 className="text-xl sm:text-2xl font-extrabold italic tracking-wide leading-none select-none">
                NOVA<span className="text-secondary">FASHION</span>
              </h1>
              <p className="text-[9px] font-medium leading-none tracking-wider text-white italic mt-1 font-sans flex items-center gap-0.5">
                Explore <span className="text-secondary font-bold">Plus ✦</span>
              </p>
            </div>

            {/* Language & Currency Quick Menu (Compact and elegant) */}
            <div className="text-[10px] text-gray-200 flex items-center space-x-2 font-mono">
              <span className="bg-blue-800 px-2 py-1 rounded border border-blue-600 cursor-pointer" onClick={() => setShowPrefDropdown(!showPrefDropdown)}>
                {currentLanguage} | {currentCurrency}
              </span>
            </div>
          </div>

          {/* Centered Search Bar */}
          <div className="relative w-full md:max-w-xl flex-1 z-30">
            <div className="flex items-center bg-white text-gray-800 rounded-md shadow-sm overflow-hidden border border-gray-100 pr-3">
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full px-4 py-2 text-sm text-gray-900 focus:outline-none placeholder-gray-400 font-sans"
              />
              <Search className="w-4 h-4 text-primary cursor-pointer select-none" />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }} className="ml-2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown Popover */}
            <AnimatePresence>
              {searchOpen && searchQuery.trim() !== '' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 mt-1 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-80 overflow-y-auto z-50 text-left divide-y divide-gray-100"
                >
                  {foundProducts.length > 0 ? (
                    foundProducts.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          onOpenProductDetails(p);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-all"
                      >
                        <img src={p.images[0]} alt={p.name} className="w-9 h-9 object-cover rounded border border-gray-100" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 truncate uppercase">{p.name}</h4>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">{p.category}</p>
                        </div>
                        <span className="text-xs text-primary font-bold">{formatPrice(p.price)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400">
                      No matching products found.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Area Nav Links */}
          <div className="flex items-center space-x-5 lg:space-x-8 text-sm font-semibold select-none z-20">
            
            {/* 1. Quick access links */}
            <button onClick={() => onNavigate('lookbook')} className="text-white hover:text-secondary hidden lg:block tracking-wide">
              Lookbook
            </button>

            <button onClick={() => onNavigate('stylist')} className="text-secondary hover:text-white flex items-center space-x-1 tracking-wide">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Nova AI</span>
            </button>

            {currentUser?.phone === '9346507994' && (
              <button 
                onClick={() => onNavigate('admin')} 
                className="text-white hover:text-secondary flex items-center gap-1 bg-amber-600 hover:bg-amber-700 px-2.5 py-1 rounded text-xs font-bold tracking-wider"
              >
                Admin Panel
              </button>
            )}

            {/* 2. Wishlist heart toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowWishlistDropdown(!showWishlistDropdown)} 
                className="text-white hover:text-secondary flex items-center space-x-1 p-1 rounded transition-all cursor-pointer"
              >
                <Heart className="w-4.5 h-4.5" />
                <span className="hidden md:inline">Wishlist</span>
              </button>

              {/* Wishlist dropdown details */}
              <AnimatePresence>
                {showWishlistDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-72 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 p-4 z-50 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                      <p className="font-bold text-xs text-gray-700">Wishlist Items ({wishlist.length})</p>
                      <button onClick={() => setShowWishlistDropdown(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>

                    {wishlist.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">Your wishlist is empty.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {wishlist.map((id) => {
                          const item = allProducts.find(p => p.id === id);
                          if (!item) return null;
                          return (
                            <div key={id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { onOpenProductDetails(item); setShowWishlistDropdown(false); }}>
                                <img src={item.images[0]} alt={item.name} className="w-8 h-8 object-cover rounded border border-gray-150" referrerPolicy="no-referrer" />
                                <div>
                                  <h5 className="text-[11px] font-bold text-gray-800 truncate w-32 uppercase">{item.name}</h5>
                                  <p className="text-[10px] text-gray-400">{formatPrice(item.price)}</p>
                                </div>
                              </div>
                              <button onClick={() => onRemoveFromWishlist(id)} className="text-gray-400 hover:text-red-500 p-1 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. User Authentication Overlay */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-1.5 text-xs bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-md border border-blue-600 transition-all cursor-pointer font-bold text-white shadow-sm"
                  id="user-profile-widget"
                >
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full inline-block animate-pulse"></span>
                  <span className="truncate max-w-[80px]" title={currentUser.phone}>
                    {currentUser.phone}
                  </span>
                  <span className="text-[9px] text-blue-300">▼</span>
                </button>

                {/* Profile dropdown options */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 p-2.5 z-50 text-left space-y-1"
                    >
                      {/* Connection status indicator */}
                      <div className="px-2.5 py-2 border-b border-gray-100 mb-1.5 bg-gray-50/50 rounded-md">
                        <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide leading-none">CLIENT NODE</p>
                        <p className="text-xs font-bold text-gray-800 mt-1 truncate">{currentUser.phone}</p>
                        <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 font-bold mt-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                          Securely connected
                        </span>
                      </div>

                      {/* Option button 1: Order History */}
                      <button
                        onClick={() => {
                          setShowOrderHistoryModal(true);
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-2.5 text-xs font-bold text-gray-750 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md transition-all text-left cursor-pointer"
                      >
                        <Box className="w-4 h-4 text-primary" />
                        <span>Order History</span>
                      </button>

                      {/* Option button 2: Logout */}
                      <button
                        onClick={() => {
                          onLogout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-2.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-all text-left cursor-pointer border-t border-gray-50 mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4 text-red-650" />
                        <span>Logout Account</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-white text-primary hover:bg-gray-100 font-bold px-4 py-1 rounded shadow-sm hover:shadow transition-all cursor-pointer tracking-wider"
              >
                Login
              </button>
            )}

            {/* 4. Cart Link Button */}
            <button 
              onClick={onToggleCart}
              className="flex items-center space-x-1.5 hover:text-secondary transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white group-hover:text-secondary" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 rounded-full bg-accent text-white font-bold text-[9px] leading-tight shadow-md">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Cart</span>
            </button>

          </div>
        </div>
      </nav>

      {/* Preferences overlay drop-panel */}
      <AnimatePresence>
        {showPrefDropdown && (
          <div className="bg-white text-gray-800 p-4 border-b border-gray-200 flex flex-wrap justify-center gap-8 text-xs font-sans absolute top-full left-0 right-0 shadow-lg z-40 animate-slide-down">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-gray-500 uppercase">Currency Desk:</span>
              <div className="flex space-x-1">
                {(['INR', 'USD', 'EUR', 'JPY'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => { onSetCurrency(curr); setShowPrefDropdown(false); }}
                    className={`px-3 py-1 border rounded transition-all cursor-pointer font-bold ${
                      currentCurrency === curr 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="font-bold text-gray-500 uppercase">Language translation:</span>
              <div className="flex space-x-1">
                {(['EN', 'FR', 'JP'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { onSetLanguage(lang); setShowPrefDropdown(false); }}
                    className={`px-3 py-1 border rounded transition-all cursor-pointer font-bold ${
                      currentLanguage === lang 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Flipkart Sub-Navbar Categories row strip */}
      <div className="bg-white border-b border-gray-200 py-3 hidden sm:block overflow-x-auto select-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 sm:gap-12 md:gap-16">
          {navCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleSelectCategory(cat.name)}
              className={`flex flex-col items-center group cursor-pointer transition-all duration-200 text-left ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase() 
                  ? 'text-primary' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <span className="text-xl sm:text-2xl mb-1 filter drop-shadow group-hover:scale-115 transition-transform duration-200">{cat.icon}</span>
              <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
          
          <button
            onClick={() => onNavigate('stylist')}
            className="flex flex-col items-center group cursor-pointer text-left"
          >
            <span className="text-xl sm:text-2xl mb-1 animate-pulse">🤖</span>
            <span className="text-[11px] sm:text-xs text-orange-600 font-bold whitespace-nowrap">AI Personal Stylist</span>
          </button>
          
          <button
            onClick={() => onNavigate('lookbook')}
            className="flex flex-col items-center group cursor-pointer text-left"
          >
            <span className="text-xl sm:text-2xl mb-1">📖</span>
            <span className="text-[11px] sm:text-xs text-purple-600 font-bold whitespace-nowrap">Interactive Lookbook</span>
          </button>
        </div>
      </div>

      {/* Order History Modal tracker popover */}
      <AnimatePresence>
        {showOrderHistoryModal && (
          <OrderHistoryModal
            isOpen={showOrderHistoryModal}
            onClose={() => setShowOrderHistoryModal(false)}
            orders={orders}
            currentCurrency={currentCurrency}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
