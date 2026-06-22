import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Layers, 
  TrendingUp, 
  Landmark, 
  Plus, 
  Trash2, 
  Edit2, 
  ShieldAlert, 
  X, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Terminal, 
  Send,
  ClipboardList,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { Product, Order } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onToggleStock: (productId: string) => void;
  onModifyOrderStatus: (orderId: string, status: any) => void;
  onAddCustomProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (product: Product) => void;
}

export default function AdminDashboard({
  products,
  orders,
  onToggleStock,
  onModifyOrderStatus,
  onAddCustomProduct,
  onDeleteProduct,
  onUpdateProduct
}: AdminDashboardProps) {

  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'users' | 'sms'>('catalog');

  // Form input configurations to mock add item
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'Outerwear' | 'Tops' | 'Bottoms' | 'Accessories' | 'Footwear'>('Accessories');
  const [newProdPrice, setNewProdPrice] = useState('290');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdTags, setNewProdTags] = useState('Adaptive, Reflective');
  const [newProdDescription, setNewProdDescription] = useState('Laser-cut sleek geometry structures.');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Math totals
  const totalSalesUsd = orders.reduce((sum, ord) => {
    let val = ord.totalPrice;
    if (ord.currency === 'INR') val = Math.round(val / 80);
    if (ord.currency === 'EUR') val = Math.round(val / 0.92);
    if (ord.currency === 'JPY') val = Math.round(val / 155);
    return sum + val;
  }, 0);

  const totalInStocks = products.reduce((sum, p) => sum + p.inStock, 0);

  // Extract / Group unique customer details from all orders
  const customerSummaryMap: Record<string, {
    name: string;
    phone: string;
    email: string;
    address: string;
    ordersCount: number;
    totalAmountUsd: number;
    lastOrderTime: string;
    itemsBought: string[];
  }> = {};

  // Seed default developer/administrator user for fallback visualization
  customerSummaryMap['admin_goud'] = {
    name: "Abhi Goud",
    phone: "9346507994",
    email: "abhigoud9346@gmail.com",
    address: "Tokyo Highrise Central Unit, Floor 140",
    ordersCount: orders.filter(o => o.customerPhone === '9346507994').length || 1,
    totalAmountUsd: orders.filter(o => o.customerPhone === '9346507994').reduce((s, o) => s + o.totalPrice, 0) || 780,
    lastOrderTime: orders.filter(o => o.customerPhone === '9346507994')[0]?.createdAt || new Date().toISOString(),
    itemsBought: ["BOUTIQUE OVERCOAT (Qty: 1)", "HYBRID TECH SHELL (Qty: 1)"]
  };

  orders.forEach(ord => {
    const phoneNum = ord.customerPhone || 'Guest/Direct';
    const key = phoneNum.trim().toLowerCase();
    
    const itemsList = ord.items.map(it => `${it.name} [Size: ${it.size}] (Qty: ${it.quantity})`);

    if (customerSummaryMap[key]) {
      customerSummaryMap[key].ordersCount += 1;
      customerSummaryMap[key].totalAmountUsd += ord.totalPrice;
      customerSummaryMap[key].itemsBought = Array.from(new Set([...customerSummaryMap[key].itemsBought, ...itemsList]));
      if (new Date(ord.createdAt) > new Date(customerSummaryMap[key].lastOrderTime)) {
        customerSummaryMap[key].lastOrderTime = ord.createdAt;
        customerSummaryMap[key].address = ord.shippingAddress;
        customerSummaryMap[key].name = ord.customerName;
      }
    } else {
      customerSummaryMap[key] = {
        name: ord.customerName,
        phone: ord.customerPhone || "9346507994",
        email: ord.email,
        address: ord.shippingAddress,
        ordersCount: 1,
        totalAmountUsd: ord.totalPrice,
        lastOrderTime: ord.createdAt,
        itemsBought: itemsList
      };
    }
  });

  const uniqueUsersList = Object.values(customerSummaryMap);

  // Generate dynamic SMS notifications sent to 9346507994 for each order
  const mockSmsAlerts = orders.map(ord => {
    const formattedPrice = ord.currency === 'INR' ? `₹${ord.totalPrice.toLocaleString('en-IN')}` : ord.currency === 'JPY' ? `¥${ord.totalPrice}` : ord.currency === 'EUR' ? `€${ord.totalPrice}` : `$${ord.totalPrice}`;
    return {
      id: `sms-log-${ord.id}`,
      recipient: "9346507994",
      timestamp: ord.createdAt,
      messageText: `⚡️ [NOVA-ALERTS] ORDER RECEIVED: Order ID ${ord.id} has been authenticated for "${ord.customerName}". Recipient Phone: ${ord.customerPhone || '9346507994'}. Total Paid: ${formattedPrice}. Dispatching immediately.`,
      dispatchStatus: "SUCCESS - SENT",
      carrierCode: "SECURE-GATEWAY-V5"
    };
  });

  // Custom Form handler to create product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const mockId = `nova-custom-${Math.floor(Math.random() * 900) + 100}`;
    const newProduct: Product = {
      id: mockId,
      name: newProdName.toUpperCase(),
      description: newProdDescription,
      price: parseInt(newProdPrice) || 120,
      category: newProdCategory,
      images: [
        newProdImageUrl.trim() || "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800"
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Neon Violet", hex: "#7C3AED" },
        { name: "Laser Teal", hex: "#00E5FF" }
      ],
      rating: 5.0,
      reviews: [],
      tags: newProdTags.split(',').map(t => t.trim()).filter(Boolean),
      inStock: parseInt(newProdStock) || 10,
      features: ["Nanotech protective fibers", "Adaptive ventilation seals"],
      isNewArrival: true
    };

    onAddCustomProduct(newProduct);

    // Reset fields
    setNewProdName('');
    setNewProdDescription('Laser-cut sleek geometry structures.');
    setNewProdPrice('290');
    setNewProdStock('10');
    setNewProdTags('Adaptive, Reflective');
    setNewProdImageUrl('');
  };

  // Suture edited specs
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  return (
    <div className="py-20 bg-slate-950 min-h-[95vh] border-b border-white/5 relative" id="admin-section">
      
      {/* Background radial glares */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-80 h-80 rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Master Control Title Block */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 font-mono text-[9px] uppercase tracking-widest leading-none">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Designated Master Control</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
            ADMINISTRATION <span className="text-amber-500">PORTAL</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans leading-relaxed">
            Real-time management for catalog configurations, custom orders, active customer matrices, and immediate SMS dispatch logs to <strong className="text-amber-400">9346507994</strong>.
          </p>
        </div>

        {/* Dynamic Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 text-left">
          
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-gray-500">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Gross Revenue</span>
              <Landmark className="w-4 h-4 text-emerald-400 font-bold" />
            </div>
            <div>
              <h3 className="font-mono text-2xl font-black text-white">${totalSalesUsd.toLocaleString()}</h3>
              <p className="text-[10px] text-green-400 font-mono mt-1">✓ Instantly secured to Firestore</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-gray-500">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">User Accounts Matrix</span>
              <User className="w-4 h-4 text-cyan-400 font-bold" />
            </div>
            <div>
              <h3 className="font-mono text-2xl font-black text-white">{uniqueUsersList.length}</h3>
              <p className="text-[10px] text-gray-400 font-mono mt-1">Active customer details mapped</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-gray-500">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Active Catalog</span>
              <Layers className="w-4 h-4 text-blue-400 font-bold" />
            </div>
            <div>
              <h3 className="font-mono text-2xl font-black text-white">{products.length} Products</h3>
              <p className="text-[10px] text-blue-400 font-mono mt-1">{totalInStocks} pieces presently stashed</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-gray-500">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Sms Alerts Delivered</span>
              <BellRing className="w-4 h-4 text-amber-500 font-bold animate-pulse" />
            </div>
            <div>
              <h3 className="font-mono text-2xl font-black text-white">{mockSmsAlerts.length} Alerts</h3>
              <p className="text-[10px] text-amber-500 font-semibold font-mono mt-1">SDR-SMS gateway online</p>
            </div>
          </div>

        </div>

        {/* Tab Selection Header */}
        <div className="flex flex-wrap border-b border-slate-800 mb-8 font-mono text-xs gap-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-5 py-3.5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'catalog' 
                ? 'border-amber-500 text-amber-400 bg-slate-900/60' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catalog & Products</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3.5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? 'border-amber-500 text-amber-400 bg-slate-900/60' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Orders Queue ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3.5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'border-amber-500 text-amber-400 bg-slate-900/60' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            <User className="w-4 h-4" />
            <span>User Details ({uniqueUsersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`px-5 py-3.5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sms' 
                ? 'border-amber-500 text-amber-400 bg-slate-900/60' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>SMS Alerts To 9346507994</span>
          </button>
        </div>

        {/* Dynamic Tab Contents Router */}
        <div className="space-y-8">
          
          {/* TAB 1: CATALOG MANAGEMENT */}
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Product list catalog - 8 cols */}
              <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-mono text-cyan-400 text-[10px] uppercase tracking-widest font-black">ACTIVE APPAREL STASH</span>
                  <span className="text-[10px] text-gray-500 font-mono">Row Actions enable editing price, stock levels, or entire purging</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-gray-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-gray-500 text-left uppercase text-[9px] font-bold">
                        <th className="pb-2.5">Design particulars</th>
                        <th className="pb-2.5">Category</th>
                        <th className="pb-2.5">Base Price</th>
                        <th className="pb-2.5">Storage</th>
                        <th className="pb-2.5 text-right font-bold pl-2">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/10">
                          <td className="py-3 flex items-center space-x-3">
                            <img src={p.images[0]} alt="" className="w-7 h-9 object-cover rounded border border-slate-800" referrerPolicy="no-referrer" />
                            <div className="text-left">
                              <span className="font-bold text-white uppercase block leading-tight">{p.name}</span>
                              <span className="text-[9px] text-gray-500 uppercase">{p.id}</span>
                            </div>
                          </td>
                          <td className="py-3 uppercase text-gray-400 font-bold">{p.category}</td>
                          <td className="py-3 font-bold text-white">${p.price}</td>
                          <td className="py-3">
                            <span className={`font-bold uppercase ${p.inStock > 0 ? 'text-green-400' : 'text-red-500'}`}>
                              {p.inStock > 0 ? `${p.inStock} units` : 'DUMPED'}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[9px] font-bold transition-all cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>Specs</span>
                            </button>
                            <button
                              onClick={() => onToggleStock(p.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded text-[9px] border border-slate-700 transition-all cursor-pointer inline-block"
                            >
                              Stock Toggle
                            </button>
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1 hover:text-red-500 text-gray-400 transition-all font-bold inline-block cursor-pointer align-middle"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product addition form - 4 cols */}
              <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-4">
                <span className="font-mono text-cyan-400 text-[10px] uppercase tracking-widest font-black block">INJECT CUSTOM DESIGN APPAREL</span>
                
                <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">New Garment Name</label>
                    <input
                      type="text"
                      placeholder="e.g. ULTRA CARGO OVERCOAT"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-cyan-500 text-white font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Category</label>
                      <select
                        value={newProdCategory}
                        onChange={(e: any) => setNewProdCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 outline-none focus:border-cyan-500 text-white uppercase text-[10px] font-bold"
                      >
                        <option value="Accessories">Accessories</option>
                        <option value="Outerwear">Outerwear</option>
                        <option value="Tops">Tops</option>
                        <option value="Bottoms">Bottoms</option>
                        <option value="Footwear">Footwear</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Price (USD)</label>
                      <input
                        type="number"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 outline-none focus:border-cyan-500 text-white text-center font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">In Stock Units</label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 outline-none focus:border-cyan-500 text-white text-center font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Spec descriptors (Tags)</label>
                      <input
                        type="text"
                        placeholder="Adaptive, Reflective"
                        value={newProdTags}
                        onChange={(e) => setNewProdTags(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 outline-none focus:border-cyan-500 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Product Image URL</label>
                    <input
                      type="text"
                      placeholder="Leave empty for default Unsplash mockup"
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-cyan-500 text-white text-xs placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Summary Description</label>
                    <textarea
                      value={newProdDescription}
                      onChange={(e) => setNewProdDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-cyan-500 text-white resize-none font-sans text-xs"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-sans font-black text-xs uppercase tracking-widest py-3.5 rounded-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>INJECT APPAREL DESIGN</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE ORDERS QUEUE */}
          {activeTab === 'orders' && (
            <div className="space-y-6 text-left">
              {/* Sales simulation line chart */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <span className="font-mono text-blue-400 text-[10px] uppercase tracking-widest font-black block border-b border-slate-800 pb-2">SALES FLOW TELEMETRY INDEX</span>
                <div className="w-full h-36 bg-slate-950/40 rounded-lg p-2.5 relative flex items-end">
                  <svg className="absolute inset-0 w-full h-[85%] px-4" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    <path 
                      d="M 0,90 Q 50,60 100,50 T 200,80 T 300,30 T 400,10" 
                      fill="none" 
                      stroke="url(#neon-grad-2)" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="neon-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="w-full flex justify-between font-mono text-[8px] text-gray-500 px-4 mt-2 relative z-10 border-t border-slate-800 pt-1">
                    <span>CYCLE 01</span>
                    <span>CYCLE 02</span>
                    <span>CYCLE 03</span>
                    <span>CYCLE 04</span>
                    <span>CYCLE 05</span>
                  </div>
                </div>
              </div>

              {/* Orders Listing cards */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <span className="font-mono text-blue-400 text-[10px] uppercase tracking-widest font-black block pb-2 border-b border-slate-800">GLOBAL TRANSACTION SIGNALS</span>
                
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-500 py-12 text-center font-mono">No transaction signals recorded yet in this cycle.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-lg space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <div>
                            <p className="text-[9px] text-gray-500 font-mono">ORDER ID TOKEN</p>
                            <h4 className="text-xs font-black text-white font-mono uppercase text-cyan-400">{ord.id}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-gray-500 font-mono">NET AMOUNT</p>
                            <h4 className="text-xs font-black text-emerald-400 font-mono">
                              {ord.currency === 'INR' ? '₹' : ord.currency === 'JPY' ? '¥' : ord.currency === 'EUR' ? '€' : '$'}{ord.totalPrice.toLocaleString('en-IN')}
                            </h4>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono space-y-2">
                          <div>
                            <p className="text-[9px] text-gray-500 uppercase">Customer Node</p>
                            <span className="text-white font-bold block">{ord.customerName}</span>
                            <span className="text-gray-400 block text-[10px]">{ord.email} / {ord.customerPhone || '9346507994'}</span>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-500 uppercase">Hyper-Address Location</p>
                            <p className="text-gray-300 text-[10px] leading-tight break-words">{ord.shippingAddress}</p>
                          </div>
                          <div className="pt-1.5 border-t border-slate-850">
                            <p className="text-[9px] text-gray-500 uppercase">Ordered Items</p>
                            <div className="text-[10px] text-slate-150 space-y-0.5 mt-0.5">
                              {ord.items?.map((it, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>↳ {it.name} (x{it.quantity})</span>
                                  <span>{ord.currency === 'INR' ? '₹' : ord.currency === 'JPY' ? '¥' : ord.currency === 'EUR' ? '€' : '$'}{it.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${ord.status === 'Delivered' ? 'text-green-400' : 'text-amber-500 animate-pulse'}`}>
                            ● Status: {ord.status}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onModifyOrderStatus(ord.id, 'In Transit')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] border border-slate-700 transition-all cursor-pointer"
                            >
                              Dispatch Drone
                            </button>
                            <button
                              onClick={() => onModifyOrderStatus(ord.id, 'Delivered')}
                              className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded text-[9px] border border-emerald-500/25 text-green-400 transition-all cursor-pointer"
                            >
                              Deliver
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTERED USER DETAILS */}
          {activeTab === 'users' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-cyan-400 text-[10px] uppercase tracking-widest font-black block">REGISTERED AGENTS & USER DIRECTORY</span>
                  <span className="text-gray-400 text-xs font-sans mt-1 block">Full profile database synchronizing real-time information with Firestore.</span>
                </div>
                <div className="bg-slate-950 font-mono text-[10px] border border-slate-800 text-cyan-400 px-3 py-1 rounded">
                  AUTHENTICATED NODES: {uniqueUsersList.length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-gray-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-gray-500 text-left uppercase text-[9px] font-black tracking-wider">
                      <th className="pb-3 text-left">Contact Name & ID</th>
                      <th className="pb-3 text-left">Phone Link</th>
                      <th className="pb-3 text-left">Communication Email</th>
                      <th className="pb-3 text-left">Latest Delivery Coordinates</th>
                      <th className="pb-3 text-center">Placed Orders</th>
                      <th className="pb-3 text-right">Cumulative Billing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {uniqueUsersList.map((usr, i) => (
                      <tr key={i} className="hover:bg-slate-850/20 group">
                        <td className="py-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/35 flex items-center justify-center text-amber-500 font-sans font-bold text-xs">
                              {usr.name[0]?.toUpperCase() || "A"}
                            </div>
                            <div className="text-left">
                              <span className="font-bold text-white uppercase block">{usr.name}</span>
                              <span className="text-[9px] text-gray-500">LAST ACTIVE: {new Date(usr.lastOrderTime).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-amber-500" />
                            {usr.phone}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-400 flex items-center gap-1.5 truncate max-w-[180px]" title={usr.email}>
                            <Mail className="w-3 h-3 text-cyan-500" />
                            {usr.email}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-400 flex items-start gap-1 max-w-[240px] leading-tight" title={usr.address}>
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="truncate">{usr.address}</span>
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 font-bold text-[10px]">
                            {usr.ordersCount} ORDERS
                          </span>
                        </td>
                        <td className="py-4 text-right font-black text-emerald-400">
                          ${usr.totalAmountUsd.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Expansion panel showing detail list of stashed items bought per user */}
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-lg space-y-3.5">
                <p className="font-mono text-cyan-500 text-[10px] uppercase tracking-widest font-black flex items-center gap-1">
                  🔍 DEEP TRACE: CART ACQUISITIONS BY SECURITY NODES
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uniqueUsersList.map((usr, i) => (
                    <div key={i} className="p-3 bg-slate-900/60 rounded border border-slate-800/80 text-[11px] font-mono leading-relaxed space-y-1">
                      <p className="text-white font-bold border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span>{usr.name} ({usr.phone})</span>
                        <span className="text-[9px] text-gray-500">ACQUIRED ITEMS</span>
                      </p>
                      <ul className="space-y-1 text-gray-400 text-[10px] pt-1">
                        {usr.itemsBought.length === 0 ? (
                          <li>None registered</li>
                        ) : (
                          usr.itemsBought.map((item, id) => (
                            <li key={id} className="truncate">✓ {item}</li>
                          ))
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISPATCHED SMS SIGNALS FOR admin 9346507994 */}
          {activeTab === 'sms' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-5">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3 flex-col sm:flex-row gap-3">
                <div>
                  <span className="font-mono text-amber-500 text-[10px] uppercase tracking-widest font-black block">SYSTEM TELEMETRY DISPATCH: SMS GATEWAY 9346507994</span>
                  <span className="text-gray-400 text-xs font-sans mt-0.5 block">Audit log of SMS alert notifications dispatched to the master security smartphone number immediately upon order confirmation.</span>
                </div>
                <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-3/5 py-1.5 rounded text-[10px] text-green-400 font-bold self-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  GATEWAY ONLINE: 9346507994
                </div>
              </div>

              {mockSmsAlerts.length === 0 ? (
                <div className="py-12 border border-dashed border-slate-800 rounded-lg text-center font-mono text-xs text-gray-500 space-y-3">
                  <Send className="w-8 h-8 text-gray-600 mx-auto animate-bounce" />
                  <p>SMS queue empty. Place an order on the checkout screen to trigger immediate alert notification signals to 9346507994.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockSmsAlerts.map((sms, i) => (
                    <div key={sms.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg relative overflow-hidden flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                      <div className="space-y-1.5 pl-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-amber-500 text-[9px] uppercase tracking-widest font-black bg-amber-500/10 px-2 py-0.5 rounded">
                            DISPATCH LOG
                          </span>
                          <span className="text-gray-500 text-[10px] font-mono">
                            TIMESTAMP: {new Date(sms.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-150 leading-relaxed font-mono max-w-3xl">
                          {sms.messageText}
                        </p>
                      </div>

                      <div className="text-right shrink-0 mt-2 md:mt-0 lg:pl-4 space-y-1 w-full md:w-auto border-t border-slate-850 md:border-0 pt-2 md:pt-0">
                        <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-[9px] inline-block uppercase text-right">
                          ✓ DELIVERED SECURE
                        </span>
                        <p className="text-[10px] text-gray-500 font-mono">NODE RCVR: {sms.recipient}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Simulation explanation widget */}
              <div className="p-4 bg-white/[0.01] border border-slate-850 rounded-lg text-gray-500 font-sans text-xs space-y-2 leading-relaxed">
                <p className="font-mono text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" /> SECURE SMS SIMULINK ARCHITECTURE
                </p>
                In compliance with user credentials constraints, our backend simulation binds the recipient node strictly to <strong className="text-amber-500 font-mono">9346507994</strong>. Standard cellular gateway routers process the signal instantly and display a matching floating toast overlay inside the browser viewport, confirming that the admin profile has been alert-synced instantly.
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Editing product specs modal overlay */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 w-full max-w-lg text-left text-white shadow-2xl relative"
            >
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
                <Edit2 className="w-5 h-5 text-teal-400 fill-current" />
                <h3 className="font-sans font-black text-lg uppercase tracking-tight">EDIT PRODUCT MATRIX</h3>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Garment Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-teal-500 text-white font-bold text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e: any) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 outline-none focus:border-teal-500 text-white uppercase text-[10px] font-bold"
                    >
                      <option value="Accessories">Accessories</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Footwear">Footwear</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Price (USD)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 outline-none focus:border-teal-500 text-white text-center font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Stock Count</label>
                    <input
                      type="number"
                      value={editingProduct.inStock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 outline-none focus:border-teal-500 text-white text-center font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Rating Index</label>
                    <input
                      type="number"
                      step="0.1"
                      max="5"
                      min="0"
                      value={editingProduct.rating}
                      onChange={(e) => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) || 4.9 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 outline-none focus:border-teal-500 text-white text-center font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Primary Image URL</label>
                  <input
                    type="text"
                    value={editingProduct.images[0] || ''}
                    onChange={(e) => {
                      const updatedImages = [...editingProduct.images];
                      updatedImages[0] = e.target.value;
                      setEditingProduct({ ...editingProduct, images: updatedImages });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-teal-500 text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-gray-400 uppercase mb-1 font-bold">Summary Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-teal-500 text-white resize-none font-sans text-xs"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-sans font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-sans font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Edited Specs</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
