import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, Sliders, ChevronRight, Sparkles, Filter, ShieldCheck, Mail, Info, Flame, Eye, Compass, LayoutList, ClipboardCheck, Star, Trash2 } from 'lucide-react';
import { Product, CartItem, Order } from './types';
import { products as initialProducts } from './data/catalog';

// Firebase imports
import {
  testConnection,
  seedProductsIfEmpty,
  fetchOrdersFromFirebase,
  addOrderToFirebase,
  updateOrderStatusInFirebase,
  addProductToFirebase,
  deleteProductFromFirebase,
  updateProductStockInFirebase,
  PhoneUser
} from './lib/firebase';

// Component imports
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Lookbook from './components/Lookbook';
import CartDrawer from './components/CartDrawer';
import CheckoutFlow from './components/CheckoutFlow';
import ProductDetailsModal from './components/ProductDetailsModal';
import AiStylistChat from './components/AiStylistChat';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeSection, setActiveSection] = useState<'landing' | 'lookbook' | 'stylist' | 'admin' | 'all-products'>('landing');

  // Authentication & session variables
  const [currentUser, setCurrentUser] = useState<PhoneUser | null>(() => {
    const cached = localStorage.getItem('nova_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [firebaseConnecting, setFirebaseConnecting] = useState(true);

  // React states
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const cached = localStorage.getItem('nova_cart');
    return cached ? JSON.parse(cached) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const cached = localStorage.getItem('nova_wishlist');
    return cached ? JSON.parse(cached) : [];
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    const cached = localStorage.getItem('nova_compare');
    return cached ? JSON.parse(cached) : [];
  });

  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'JPY'>('INR');
  const [language, setLanguage] = useState<'EN' | 'FR' | 'JP'>('EN');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter states
  const [shopCategory, setShopCategory] = useState<string>('All');
  const [shopSort, setShopSort] = useState<string>('default');

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Admin orders queue
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminAlert, setAdminAlert] = useState<{ id: string; name: string; phone: string; total: string; show: boolean } | null>(null);

  // State caching effects
  useEffect(() => {
    localStorage.setItem('nova_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nova_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('nova_compare', JSON.stringify(compareList));
  }, [compareList]);

  // Dynamic cloud database initialization
  useEffect(() => {
    async function initAndFetchDatabase() {
      try {
        setFirebaseConnecting(true);
        await testConnection();
        // Seed the product catalog dynamically if collection has no items
        const syncedProducts = await seedProductsIfEmpty(initialProducts);
        setProducts(syncedProducts);

        // Pull active orders from Firestore
        const cachedUserAndNode = localStorage.getItem('nova_user');
        if (cachedUserAndNode) {
          const matchedUser = JSON.parse(cachedUserAndNode);
          setCurrentUser(matchedUser);
          const customOrders = (matchedUser.phone === '9346507994')
            ? await fetchOrdersFromFirebase()
            : await fetchOrdersFromFirebase(matchedUser.phone);
          setOrders(customOrders);
        } else {
          const generalOrders = await fetchOrdersFromFirebase();
          if (generalOrders.length > 0) {
            setOrders(generalOrders);
          }
        }
      } catch (err) {
        console.error("Firestore cloud sync failed:", err);
      } finally {
        setFirebaseConnecting(false);
      }
    }
    initAndFetchDatabase();
  }, []);

  const handleAuthSuccess = async (user: PhoneUser) => {
    setCurrentUser(user);
    localStorage.setItem('nova_user', JSON.stringify(user));
    try {
      const userOrders = (user.phone === '9346507994')
        ? await fetchOrdersFromFirebase()
        : await fetchOrdersFromFirebase(user.phone);
      setOrders(userOrders);
    } catch (err) {
      console.error("Firestore user orders fetch failure:", err);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('nova_user');
    setActiveSection('landing');
    try {
      const allOrders = await fetchOrdersFromFirebase();
      setOrders(allOrders);
    } catch (err) {
      console.error("Firestore general orders fetch failure during logout:", err);
    }
  };

  // Pricing helper
  const formatPrice = (usdPrice: number) => {
    switch (currency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  const currentYear = new Date().getFullYear();

  // State modifiers
  const handleAddToCart = (product: Product, size: string, color: { name: string; hex: string }) => {
    const cartItemId = `${product.id}-${size}-${color.name}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: cartItemId,
        product,
        quantity: 1,
        selectedSize: size,
        selectedColor: color
      }];
    });
  };

  const handleInstantBuy = (product: Product, size: string, color: { name: string; hex: string }) => {
    const cartItemId = `${product.id}-${size}-${color.name}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev;
      }
      return [...prev, {
        id: cartItemId,
        product,
        quantity: 1,
        selectedSize: size,
        selectedColor: color
      }];
    });
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleToggleCompare = (productId: string) => {
    setCompareList(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleAddCustomProduct = async (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    try {
      await addProductToFirebase(newProduct);
    } catch (err) {
      console.error("Firestore product addition failure:", err);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    try {
      await addProductToFirebase(updatedProduct);
    } catch (err) {
      console.error("Firestore product update failure:", err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCompareList(prev => prev.filter(id => id !== productId));
    setWishlist(prev => prev.filter(id => id !== productId));
    try {
      await deleteProductFromFirebase(productId);
    } catch (err) {
      console.error("Firestore product purge failure:", err);
    }
  };

  const handleToggleStock = async (productId: string) => {
    let targetStock = 0;
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        targetStock = p.inStock === 0 ? 10 : 0;
        return { ...p, inStock: targetStock };
      }
      return p;
    }));
    try {
      await updateProductStockInFirebase(productId, targetStock);
    } catch (err) {
      console.error("Firestore stock sync failed:", err);
    }
  };

  const handleModifyOrderStatus = async (orderId: string, status: any) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status } : ord));
    try {
      await updateOrderStatusInFirebase(orderId, status);
    } catch (err) {
      console.error("Firestore order tracking status sync failure:", err);
    }
  };

  const handleSaveMockOrder = async (o: Order) => {
    setOrders(prev => [o, ...prev]);
    
    // Dispatch persistent alert and telemetry notification to 9346507994
    setAdminAlert({
      id: o.id,
      name: o.customerName,
      phone: o.customerPhone || "Guest Account",
      total: `${o.currency === 'JPY' ? '¥' : o.currency === 'EUR' ? '€' : '$'}${o.totalPrice}`,
      show: true
    });

    // Auto-dismiss notification after 8 seconds
    setTimeout(() => {
      setAdminAlert(prev => prev && prev.id === o.id ? { ...prev, show: false } : prev);
    }, 8000);

    try {
      await addOrderToFirebase(o);
    } catch (err) {
      console.error("Firestore secure order transaction catalog failure:", err);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim().includes('@')) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 3000);
    }
  };

  // Filter & sort logic for shop category
  const filteredProducts = products.filter(p => {
    if (shopCategory === 'All') return true;
    return p.category.toLowerCase() === shopCategory.toLowerCase();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (shopSort === 'price-low') return a.price - b.price;
    if (shopSort === 'price-high') return b.price - a.price;
    if (shopSort === 'rating') return b.rating - a.rating;
    return 0; // default order
  });

  // Featured segment references
  const featuredProduct = products.find(p => p.id === 'nova-001') || products[0];
  const featuredSlides = products.filter(p => p.isFeatured);
  const trendingGrid = products.filter(p => p.isTrending);
  const newArrivals = products.filter(p => p.isNewArrival);

  return (
    <div className="bg-[#f1f3f6] text-gray-800 min-h-screen font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-white">
      
      {/* Dynamic Navigation */}
      <Navbar
        cart={cart}
        wishlist={wishlist}
        compareList={compareList}
        allProducts={products}
        currentCurrency={currency}
        currentLanguage={language}
        currentUser={currentUser}
        orders={orders}
        onSetCurrency={setCurrency}
        onSetLanguage={setLanguage}
        onNavigate={(section) => {
          setActiveSection(section);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleCart={() => setIsCartOpen(!isCartOpen)}
        onOpenProductDetails={setSelectedProduct}
        onRemoveFromWishlist={handleToggleWishlist}
        onRemoveFromCompare={handleToggleCompare}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onSelectCategory={setShopCategory}
        selectedCategory={shopCategory}
      />

      {/* Primary Section router */}
      <main className="min-h-[80vh]">
        <AnimatePresence mode="wait">
          
          {/* View index 1: LANDING INTERFACES (Default homepage) */}
          {activeSection === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-0"
            >
              {/* Section 1: Fullscreen Hero Banner */}
              <Hero
                featuredProduct={featuredProduct}
                onExploreProducts={() => setActiveSection('all-products')}
                onConsultStylist={() => setActiveSection('stylist')}
                onOpenProductDetails={setSelectedProduct}
              />

              {/* Section 2: People also viewed segment with yellow accents */}
              <section className="py-6 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Yellow bordered Flipkart wrapper */}
                  <div className="bg-[#fffbeb] border border-yellow-300 rounded-lg p-2 pb-5 shadow-sm">
                    <div className="bg-[#ffe11b] text-primary p-3 rounded-t-md font-sans font-extrabold flex justify-between items-center text-sm uppercase tracking-wide mb-4">
                      <span>People also viewed - Special Deals</span>
                      <button 
                        onClick={() => setActiveSection('all-products')}
                        className="text-xs font-bold text-primary hover:underline flex items-center cursor-pointer"
                      >
                        VIEW ALL <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                      {featuredSlides.slice(0, 4).map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          currentCurrency={currency}
                          isWishlisted={wishlist.includes(p.id)}
                          isInCompare={compareList.includes(p.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onToggleCompare={handleToggleCompare}
                          onOpenQuickView={(prod) => setSelectedProduct(prod)}
                          onAddToCart={handleAddToCart}
                          onInstantBuy={handleInstantBuy}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Trending Gadgets & Appliances with Blue themed header */}
              <section className="py-6 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Royal Blue header */}
                    <div className="bg-primary text-white py-3 px-4 flex justify-between items-center text-sm font-black uppercase tracking-tight">
                      <span className="flex items-center gap-1.5 leading-none font-sans">
                        <Flame className="w-4.5 h-4.5 text-secondary animate-pulse" /> Trending Gadgets & Appliances
                      </span>
                      <button 
                        onClick={() => setActiveSection('all-products')}
                        className="text-xs font-bold text-white hover:underline flex items-center bg-blue-700 px-3 py-1 rounded"
                      >
                        Explore <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {trendingGrid.slice(0, 3).map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          currentCurrency={currency}
                          isWishlisted={wishlist.includes(p.id)}
                          isInCompare={compareList.includes(p.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onToggleCompare={handleToggleCompare}
                          onOpenQuickView={(prod) => setSelectedProduct(prod)}
                          onAddToCart={handleAddToCart}
                          onInstantBuy={handleInstantBuy}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Brands in Spotlight (Splitted showcase with AD style overlays) */}
              <section className="py-6 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-sans font-black text-gray-800 text-sm sm:text-base uppercase tracking-wider">Brands in Spotlight</h2>
                      <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded">SPONSORED ASSISTANCE</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {products.slice(0, 3).map((best, idx) => {
                        const mockAds = [
                          { title: "Men's Deodorants", promo: "Up to 50% Off", pill: "Hot grid alert" },
                          { title: "Makeup Organizers", promo: "From ₹188", pill: "Makeup organizer" },
                          { title: "Biggest Price Drop", promo: "Lowest price drop", pill: "Hot deal" }
                        ];
                        const adDetails = mockAds[idx] || mockAds[0];
                        return (
                          <div 
                            key={best.id}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-150 flex flex-col justify-between items-stretch hover:shadow-md transition-all text-left group cursor-pointer relative"
                            onClick={() => setSelectedProduct(best)}
                          >
                            <span className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded z-10 font-sans">AD</span>
                            
                            <div className="space-y-3 font-sans">
                              <div className="flex justify-between items-center pt-2">
                                <span className="font-sans text-[11px] text-primary font-black uppercase">{best.category}</span>
                                <span className="text-xs text-yellow-600 font-bold flex items-center"><Star className="w-3.5 h-3.5 fill-current mr-0.5" /> {best.rating}</span>
                              </div>
                              
                              <div className="aspect-[16/10] overflow-hidden rounded bg-white border border-gray-100 relative">
                                <img src={best.images[0]} alt="" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                                <div className="absolute bottom-2 left-2 right-2 bg-primary/95 text-white py-1 px-2 rounded text-center text-[10px] font-bold shadow-sm">
                                  {adDetails.promo}
                                </div>
                              </div>

                              <h3 className="font-sans font-extrabold text-[#212121] text-sm truncate uppercase">{best.name}</h3>
                              <p className="text-[11px] text-gray-500 leading-relaxed font-sans line-clamp-1">{best.description}</p>
                            </div>

                            <div className="pt-3 border-t border-gray-200 mt-3 flex items-center justify-between">
                              <span className="font-sans text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{adDetails.pill}</span>
                              <button 
                                onClick={() => setSelectedProduct(best)}
                                className="text-[10px] font-sans font-black tracking-wider uppercase py-1.5 px-3 rounded bg-primary text-white hover:bg-blue-700 cursor-pointer"
                              >
                                View Specs
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: Father's Day Celebrations & Home Fashion */}
              <section className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    
                    <div className="bg-primary text-white py-3 px-4 flex justify-between items-center text-sm font-black uppercase tracking-tight">
                      <span className="flex items-center gap-1 font-sans">
                        Father's Day Celebrations & Home Furnishing
                      </span>
                      <button 
                        onClick={() => {
                          setShopCategory('All');
                          setActiveSection('all-products');
                        }}
                        className="text-xs font-bold text-white hover:underline cursor-pointer"
                      >
                        BROWSE ALL
                      </button>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {newArrivals.slice(0, 4).map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          currentCurrency={currency}
                          isWishlisted={wishlist.includes(p.id)}
                          isInCompare={compareList.includes(p.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onToggleCompare={handleToggleCompare}
                          onOpenQuickView={(prod) => setSelectedProduct(prod)}
                          onAddToCart={handleAddToCart}
                          onInstantBuy={handleInstantBuy}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6: Widest Collection Grid */}
              <section className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white border border-gray-200 p-5 rounded-lg text-center shadow-sm">
                    <h2 className="font-sans font-black text-[#212121] text-sm sm:text-base uppercase tracking-wider mb-5 text-left border-b border-gray-100 pb-3">Widest Collection Shopping Hub</h2>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                      {(['Outerwear', 'Tops', 'Bottoms', 'Footwear', 'Accessories'] as const).map((cat) => {
                        const sampleIcons = {
                          Outerwear: '🧥',
                          Tops: '👕',
                          Bottoms: '👖',
                          Footwear: '👟',
                          Accessories: '🕶️'
                        };
                        return (
                          <div
                            key={cat}
                            onClick={() => {
                              setShopCategory(cat);
                              setActiveSection('all-products');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-gray-50 hover:bg-blue-50 border border-gray-150 rounded-lg p-5 hover:border-primary/50 hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-center items-center space-y-2"
                          >
                            <span className="text-3xl select-none">{sampleIcons[cat]}</span>
                            <span className="font-sans font-bold text-xs text-gray-700 uppercase">{cat}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7: Customer Reviews list */}
              <section className="py-6 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-5">
                  <div className="bg-white border border-gray-200 p-6 rounded-lg text-left shadow-sm">
                    <h2 className="font-sans font-black text-gray-800 text-sm sm:text-base uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">Customer Feedback & Trust Scores</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-150 space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span className="text-gray-700 font-bold font-sans">Kaius Vance</span>
                          <span>Verified Flipkart-user</span>
                        </div>
                        <div className="flex text-yellow-500"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                        <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
                          &ldquo;Incredible purchase experience. Fast delivery and the product catalog quality matches international boutique design standards!&rdquo;
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-150 space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span className="text-gray-700 font-bold font-sans">Elena Rostova</span>
                          <span>Registered Member</span>
                        </div>
                        <div className="flex text-yellow-500"><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /></div>
                        <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
                          &ldquo;High precision build. Sizing guidelines are accurate and the support is super friendly. Would 10/10 order again.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 8: Lookbook teaser layout */}
              <Lookbook
                allProducts={products}
                currentCurrency={currency}
                onOpenProductDetails={setSelectedProduct}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
              />

              {/* Section 9: Brand Story and values */}
              <section className="py-24 bg-white border-b border-gray-200 relative">
                <div className="absolute top-1/2 left-10 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
                    <div className="space-y-6">
                      <span className="font-mono text-primary text-[11px] uppercase tracking-widest font-black leading-none">THE CORE BLUEPRINT</span>
                      <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 uppercase tracking-tight">BRAND CORE & METRICS</h2>
                      <p className="font-sans text-gray-600 text-sm leading-relaxed font-medium">
                        NOVA FASHION was forged at the epicenter of cybernetic innovation. We believe luxury shouldn&apos;t just be felt; it must react, adapt, and protect.
                      </p>
                      <p className="font-sans text-gray-600 text-sm leading-relaxed font-medium">
                        Our clothing formulas utilize heavy raw organic materials integrated with adaptive intelligent color-changing nanomaterials. Our goal is to achieve true ocular distinctiveness while minimizing global thermodynamic waste.
                      </p>
                      <div className="pt-4 border-t border-gray-200 flex gap-8 font-mono text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-600" /> SECURE CAPSULES</span>
                        <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-accent" /> HYPER INTELLIGENT DETS</span>
                      </div>
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-200 p-2.5">
                      <img 
                        src="https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=800" 
                        alt="High design detail" 
                        className="w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 10: Newsletter Subscription with cyber validated response */}
              <section className="py-20 relative bg-gray-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
                  <div className="inline-flex p-3 rounded-full bg-blue-50 border border-blue-200 text-primary mx-auto">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-gray-905 uppercase">SUBSCRIBE TO OUR NEWSLETTER</h3>
                    <p className="text-gray-600 text-xs sm:text-sm max-w-sm mx-auto mt-2 font-sans font-medium">
                      Enter your email address to receive instant updates, exclusive flash sales notification, and coupon discount code.
                    </p>
                  </div>

                  <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@example.com"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-3 text-xs outline-none focus:border-primary text-gray-900 font-sans font-medium"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-white font-sans font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer transition-all hover:bg-blue-700"
                    >
                      SUBSCRIBE
                    </button>
                  </form>
                  {newsletterSubscribed && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-600 font-mono font-bold"
                    >
                      ✓ Welcome! Connection established successfully. Check your email inbox.
                    </motion.p>
                  )}
                </div>
              </section>

            </motion.div>
          )}

          {/* View index 2: LOOKBOOK SECTION */}
          {activeSection === 'lookbook' && (
            <motion.div
              key="lookbook-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Lookbook
                allProducts={products}
                currentCurrency={currency}
                onOpenProductDetails={setSelectedProduct}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
              />
            </motion.div>
          )}

          {/* View index 3: SHOP / ALL PRODUCTS CATALOG GRID */}
          {activeSection === 'all-products' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5 }}
              className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-12"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-6">
                <div>
                  <span className="font-sans text-primary text-xs uppercase tracking-widest font-black">THE NOVA CATALOG</span>
                  <h2 className="font-sans font-black text-2xl sm:text-3xl text-gray-800 uppercase mt-0.5">Explore Boutique Boards</h2>
                </div>

                {/* Categories filtering & sorting dropdowns */}
                <div className="flex flex-wrap gap-2.5 mt-4 sm:mt-0 font-sans">
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md px-3.5 py-2 text-xs font-semibold text-gray-700 cursor-pointer focus:border-primary outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>

                  <select
                    value={shopSort}
                    onChange={(e) => setShopSort(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md px-3.5 py-2 text-xs font-semibold text-gray-700 cursor-pointer focus:border-primary outline-none"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating: High Reviews</option>
                  </select>
                </div>
              </div>

              {/* Grid lists */}
              {sortedProducts.length === 0 ? (
                <div className="text-center py-24 space-y-2">
                  <p className="text-gray-400 font-mono text-sm uppercase">Catalog frequency silent</p>
                  <p className="text-xs text-gray-500 font-sans">No apparel signals matches filter bounds. Reset selections.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sortedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currentCurrency={currency}
                      isWishlisted={wishlist.includes(p.id)}
                      isInCompare={compareList.includes(p.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onToggleCompare={handleToggleCompare}
                      onOpenQuickView={(prod) => setSelectedProduct(prod)}
                      onAddToCart={handleAddToCart}
                      onInstantBuy={handleInstantBuy}
                    />
                  ))}
                </div>
              )}

              {/* Spec Comparison section (Drawn at page bottom) */}
              {compareList.length > 0 && (
                <div className="pt-16 border-t border-white/5 space-y-6">
                  <div className="flex items-center space-x-2 text-white">
                    <Sliders className="w-5 h-5 text-secondary rotate-90" />
                    <h3 className="font-display font-black text-lg tracking-wider uppercase">SPEC COMPARISON MATRIX</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-xs text-gray-300 min-w-[600px] border border-white/5 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-white/5 text-left text-gray-400 font-bold uppercase text-[10px]">
                          <th className="p-4 border-r border-white/5">Specs</th>
                          {compareList.map((id) => {
                            const prod = products.find(p => p.id === id);
                            if (!prod) return null;
                            return (
                              <th key={id} className="p-4 border-r border-white/5 text-center min-w-[150px]">
                                <div className="flex flex-col items-center space-y-1.5">
                                  <img src={prod.images[0]} alt="" className="w-8 h-10 object-cover rounded" />
                                  <p className="text-[10px] text-white uppercase font-black truncate max-w-[100px]">{prod.name}</p>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr>
                          <td className="p-4 font-bold bg-white/[0.01] border-r border-white/5 uppercase text-[9px] text-gray-400">Class Type</td>
                          {compareList.map((id) => {
                            const prod = products.find(p => p.id === id);
                            return <td key={id} className="p-4 text-center border-r border-white/5 uppercase font-semibold text-secondary">{prod?.category || '-'}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="p-4 font-bold bg-white/[0.01] border-r border-white/5 uppercase text-[9px] text-gray-400">Price Module</td>
                          {compareList.map((id) => {
                            const prod = products.find(p => p.id === id);
                            return <td key={id} className="p-4 text-center border-r border-white/5 font-bold text-white">{prod ? formatPrice(prod.price) : '-'}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="p-4 font-bold bg-white/[0.01] border-r border-white/5 uppercase text-[9px] text-gray-400">Spec details</td>
                          {compareList.map((id) => {
                            const prod = products.find(p => p.id === id);
                            return (
                              <td key={id} className="p-4 text-center border-r border-white/5">
                                <ul className="text-[10px] space-y-0.5 text-gray-400">
                                  {prod?.features.map((feat) => <li key={feat}>✓ {feat}</li>)}
                                </ul>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="p-4 font-bold bg-white/[0.01] border-r border-white/5 uppercase text-[9px] text-gray-400">Rating index</td>
                          {compareList.map((id) => {
                            const prod = products.find(p => p.id === id);
                            return <td key={id} className="p-4 text-center border-r border-white/5 text-yellow-500 font-bold font-mono">★ {prod?.rating || '-'}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="p-4 font-bold bg-white/[0.01] border-r border-white/5 uppercase text-[9px] text-gray-400">Action row</td>
                          {compareList.map((id) => {
                            const prod = products.find(p => p.id === id);
                            return (
                              <td key={id} className="p-4 text-center border-r border-white/5">
                                <button
                                  onClick={() => handleToggleCompare(id)}
                                  className="text-[9px] font-bold text-accent hover:underline uppercase cursor-pointer"
                                >
                                  Dismantle matrix row
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* View index 4: AI STYLIST CHAT BOT */}
          {activeSection === 'stylist' && (
            <motion.div
              key="stylist-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AiStylistChat
                allProducts={products}
                currentCurrency={currency}
                onOpenProductDetails={setSelectedProduct}
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          )}

          {/* View index 5: ADMIN / METRICS MANAGEMENT */}
          {activeSection === 'admin' && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AdminDashboard
                products={products}
                orders={orders}
                onToggleStock={handleToggleStock}
                onModifyOrderStatus={handleModifyOrderStatus}
                onAddCustomProduct={handleAddCustomProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateProduct={handleUpdateProduct}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Global Shopping cart slide-in drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        currentCurrency={currency}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onStartCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onApplyDiscount={(pct, cd) => setAppliedDiscount({ code: cd, percent: pct })}
        appliedDiscount={appliedDiscount}
      />

      {/* Checkout Wizard flow overlay */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutFlow
            cart={cart}
            currentCurrency={currency}
            appliedDiscount={appliedDiscount}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onClose={() => setIsCheckoutOpen(false)}
            onClearCart={() => setCart([])}
            onSaveMockOrder={handleSaveMockOrder}
          />
        )}
      </AnimatePresence>

      {/* Detailed specs quick view modal overlay dialog */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            allProducts={products}
            currentCurrency={currency}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            isInCompare={compareList.includes(selectedProduct.id)}
            onClose={() => setSelectedProduct(null)}
            onToggleWishlist={handleToggleWishlist}
            onToggleCompare={handleToggleCompare}
            onAddToCart={handleAddToCart}
            onInstantBuy={handleInstantBuy}
          />
        )}
      </AnimatePresence>

      {/* Cyber Phone Authentication Overlay */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>

      {/* Real-time SMS notification simulator popup for 9346507994 */}
      <AnimatePresence>
        {adminAlert && adminAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
            className="fixed top-24 right-4 z-[999] bg-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.25)] max-w-sm text-left shadow-2xl relative overflow-hidden backdrop-blur-md"
            id="admin-sms-toast-overlay"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 animate-pulse" />
            <div className="pl-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-500 text-[10px] uppercase font-black tracking-widest animate-pulse flex items-center gap-1 leading-none">
                  ⚡ ADMIN SECURITY SMS (9346507994)
                </span>
                <button 
                  onClick={() => setAdminAlert({ ...adminAlert, show: false })}
                  className="text-gray-500 hover:text-white font-mono text-[9px] cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>
              <p className="font-sans text-xs text-slate-150 leading-relaxed">
                <span className="font-bold text-amber-400">NOTIFICATION SIMULINK DISPATCHED!</span><br />
                Order <span className="font-mono font-bold text-cyan-400">{adminAlert.id}</span> has been processed for <span className="font-sans font-bold text-white">{adminAlert.name}</span> ({adminAlert.phone}). Net sum charge: <span className="font-mono text-emerald-400 font-bold">{adminAlert.total}</span>.
              </p>
              <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 pt-1">
                <span>Alert Status: DELIVERED</span>
                <span>Just Now</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static Footer */}
      <footer className="bg-white py-12 border-t border-gray-200 font-sans text-xs text-gray-600 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-left pb-8 border-b border-gray-200">
          
          <div className="space-y-4">
            <h4 className="font-display font-black text-xs text-gray-900 tracking-wider">NOVA FASHION</h4>
            <p className="leading-relaxed">
              Premium apparel intersecting with high-quality, comfortable everyday styling.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-bold text-gray-900 uppercase tracking-wider">RECORDS</h5>
            <ul className="space-y-1.5 uppercase hover:text-gray-900 transition-all">
              <li><button onClick={() => { setActiveSection('all-products'); window.scrollTo({ top:0, behavior: 'smooth' }); }} className="hover:text-primary cursor-pointer select-none">Boutique grid</button></li>
              <li><button onClick={() => { setActiveSection('lookbook'); window.scrollTo({ top:0, behavior: 'smooth' }); }} className="hover:text-primary cursor-pointer select-none">Interactive Lookbook</button></li>
              <li><button onClick={() => { setActiveSection('stylist'); window.scrollTo({ top:0, behavior: 'smooth' }); }} className="hover:text-primary cursor-pointer select-none">NOVA AI Stylist</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-bold text-gray-900 uppercase tracking-wider">Security protocols</h5>
            <ul className="space-y-1.5 uppercase leading-loose">
              <li>Verified by NOVA-SHIELD</li>
              <li>Encrypted checkout</li>
              <li>Instant delivery standard</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-bold text-gray-900 uppercase tracking-wider font-bold">Secure Headquarters</h5>
            <div className="space-y-2 leading-relaxed text-gray-600">
              <p>Terminal: Delhi Central City Highrise</p>
              <p>Secure line: support@novafashion.net</p>
              <div className="pt-1.5 text-left">
                <a 
                  href="https://wa.me/919346507994" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm cursor-pointer hover:shadow-md"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 01-2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500">
          <p>© {currentYear} NOVA FASHION INC. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-4">
            <span className="hover:text-gray-900 cursor-pointer">Terms of Service</span>
            <span>|</span>
            <span className="hover:text-gray-900 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>

      {/* Floating Interactive WhatsApp Chat Trigger (9346507994) */}
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end">
        <a
          href="https://wa.me/919346507994"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 shadow-lg hover:shadow-2xl transition-all duration-300 relative justify-center border border-emerald-500/10 cursor-pointer"
          title="Chat with us on WhatsApp"
        >
          {/* Pulsing ring indicator */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping opacity-75 group-hover:opacity-0 transition-opacity" />
          
          <div className="flex items-center space-x-2 relative z-10 max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
            <span className="text-[10px] font-black tracking-wider pl-1.5 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              CHAT WITH US
            </span>
            <span className="text-[9px] bg-emerald-800 text-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold invisible group-hover:visible mr-1">
              9346507994
            </span>
          </div>

          <div className="bg-emerald-500 p-1.5 rounded-full relative z-10">
            <svg className="w-5 h-5 fill-current shrink-0 text-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </a>
      </div>

    </div>
  );
}
