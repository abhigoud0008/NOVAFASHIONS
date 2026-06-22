import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Bot, User, RefreshCw, ShoppingCart, Eye, Tag, AlertCircle } from 'lucide-react';
import { Product, ChatMessage } from '../types';

interface AiStylistChatProps {
  allProducts: Product[];
  currentCurrency: 'INR' | 'USD' | 'EUR' | 'JPY';
  onOpenProductDetails: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }) => void;
}

export default function AiStylistChat({
  allProducts,
  currentCurrency,
  onOpenProductDetails,
  onAddToCart
}: AiStylistChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Salutations, I am NOVA AI. I am tuned to synthesize the ultimate luxury futuristic silhouettes matching your bio-energy signature. Describe your preferred mood, the environment, or the occasion you wish to populate.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Input states
  const [userInput, setUserInput] = useState('');
  const [mood, setMood] = useState('Cyberpunk Minimalist');
  const [occasion, setOccasion] = useState('Urban Techwear Deployment');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new entries
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatPrice = (usdPrice: number) => {
    switch (currentCurrency) {
      case 'INR': return `₹${Math.round(usdPrice * 80).toLocaleString('en-IN')}`;
      case 'EUR': return `€${Math.round(usdPrice * 0.92)}`;
      case 'JPY': return `¥${Math.round(usdPrice * 155)}`;
      default: return `$${usdPrice}`;
    }
  };

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() && !mood && !occasion) return;

    const queryText = userInput.trim() || `Design coordinates for: ${mood} / Occasion: ${occasion}`;
    
    // Add User message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setLoading(true);
    setErrorStatus('');

    try {
      const response = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: mood,
          occasion: occasion + ` (user input: ${queryText})`,
          preferredCategory: 'Outerwear/Mix',
          currency: currentCurrency
        })
      });

      if (!response.ok) {
        throw new Error('Failed to synchronize with NOVA AI quantum nodes.');
      }

      const data = await response.json();
      
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.advice || "Advice was encrypted. Recommended styles detailed below.",
        suggestedProducts: data.recommendedProductIds || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReply]);

    } catch (err: any) {
      console.error(err);
      setErrorStatus("Hologram signal dropped. Retrying sub-mesh...");
      
      // Add secure mock safety reply
      const errorReply: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        text: "My apologies. Solar winds caused grid fluctuations. I’ve fallback-loaded a premium security styling recommendation combo for you: combine the robust HOLO-GATEWAY PARKA with our sound-reactive COGNITIVE SHIELD VISOR for supreme grid protection.",
        suggestedProducts: ["nova-001", "nova-002"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  // Preset button chips to trigger fast advice
  const presets = [
    { label: "⚡ Sleek Cyberpunk", mood: "Aggressive Techwear Minimalist", occasion: "Heavy Rain Urban Exploration" },
    { label: "🌃 Neo-Tokyo Night", mood: "Liquid Silver Reflective", occasion: "Vaporwave Night Club Deploy" },
    { label: "🪐 Orbital Elite", mood: "Asymmetrical Fine Linen Drape", occasion: "High-Altitude Space Summit" }
  ];

  const handleApplyPreset = (pre: typeof presets[0]) => {
    setMood(pre.mood);
    setOccasion(pre.occasion);
    setUserInput(`Coordinate an apparel list for a ${pre.mood} aesthetic suitable for a ${pre.occasion}.`);
  };

  return (
    <div className="py-20 bg-[#050505] min-h-[90vh] border-b border-white/5 relative overflow-hidden" id="ai-stylist-section">
      
      {/* Background neon elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Titles */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-secondary font-mono text-[9px] uppercase tracking-widest leading-none">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI COGNITIVE CONSULTANT</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
            NOVA <span className="text-gradient">VIRTUAL STYLIST</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-sans leading-relaxed">
            Unleash our real-time neural network powered stylist. Express your aesthetic desires or select core parameters, and receive personalized outfit suggestions.
          </p>
        </div>

        {/* Unified Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Left panel: parameters configurations (Cols-4) */}
          <div className="lg:col-span-4 p-5 rounded-xl glass border border-white/5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <span className="font-mono text-secondary text-[10px] uppercase tracking-widest font-bold">HYPER SETTINGS</span>
              
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-gray-500 uppercase">Interactive Vibe Preset</label>
                <div className="flex flex-col gap-1.5">
                  {presets.map((pre) => (
                    <button
                      key={pre.label}
                      onClick={() => handleApplyPreset(pre)}
                      className="text-left w-full p-2 rounded bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 text-[10px] font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                    >
                      {pre.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-gray-500 uppercase">Mood Matrix</label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded p-2 text-xs text-white outline-none focus:border-secondary"
                  placeholder="e.g. Asymmetric tactical drape"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-gray-500 uppercase">Occasion Grid</label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded p-2 text-xs text-white outline-none focus:border-secondary"
                  placeholder="e.g. Desert flight telemetry"
                />
              </div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-[9px] font-mono text-gray-400 space-y-1">
              <p className="font-bold text-white uppercase flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-secondary" /> CORE SPEC LOG
              </p>
              <p>Model: Gemini 3.5 Flash</p>
              <p>Synthesizer: Active 16Hz Vectors</p>
              <p>Log state: Secure REST API tunnels</p>
            </div>
          </div>

          {/* Right panel: Chat dialogue overlay (Cols-8) */}
          <div className="lg:col-span-8 rounded-xl glass border border-white/5 overflow-hidden flex flex-col justify-between aspect-square lg:aspect-auto lg:h-[600px]">
            
            {/* Upper static holographic header */}
            <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-ping"></div>
                <p className="font-display font-bold text-xs tracking-widest text-white uppercase">SYSTEM_CONNECT: NOVA_STYLING_AI</p>
              </div>
              <button 
                onClick={() => setMessages([
                  {
                    id: 'welcome',
                    role: 'model',
                    text: "Greetings, I am NOVA AI. Tuning sub-frequency fibers to your core bio-energy matrix... What silhouette desires shall we blueprint today?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ])}
                className="p-1 rounded text-gray-500 hover:text-white transition-all cursor-pointer"
                title="Refresh Matrix"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Body panel scrolling */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px] lg:max-h-none">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex space-x-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-primary/25 border-primary/40 text-white' : 'bg-secondary/15 border-secondary/40 text-secondary'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 animate-pulse" />}
                  </div>

                  {/* Bubble content */}
                  <div className="space-y-3">
                    <div className={`p-3.5 rounded-xl border relative text-left text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary/5 border-primary/20 text-white rounded-tr-none' 
                        : 'bg-white/[0.02] border-white/5 text-gray-300 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <span className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-500">{msg.timestamp}</span>
                    </div>

                    {/* Integrated product cards overlay inside chat bubble */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {msg.suggestedProducts.map((pId) => {
                          const item = allProducts.find(p => p.id === pId);
                          if (!item) return null;
                          return (
                            <div 
                              key={pId}
                              className="flex items-center p-2 bg-black/60 rounded-lg border border-white/5 hover:border-secondary/30 transition-all text-left"
                            >
                              <img src={item.images[0]} alt={item.name} className="w-10 h-10 object-cover rounded border border-white/10" referrerPolicy="no-referrer" />
                              <div className="flex-grow min-w-0 mx-2.5">
                                <h4 className="text-[10px] font-bold font-display uppercase truncate text-white leading-tight">{item.name}</h4>
                                <span className="font-mono text-[9px] text-secondary font-black">{formatPrice(item.price)}</span>
                              </div>
                              <div className="flex flex-col gap-1 flex-shrink-0">
                                <button
                                  onClick={() => onOpenProductDetails(item)}
                                  className="p-1 rounded bg-white/5 border border-white/10 hover:text-secondary text-gray-400 cursor-pointer"
                                  title="Inspect specifications"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onAddToCart(item, item.sizes[0], item.colors[0])}
                                  className="p-1 rounded bg-secondary text-black hover:bg-white cursor-pointer"
                                  title="Deploy to Shipment Drawer"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-xl border bg-white/[0.01] border-white/5 text-gray-500 rounded-tl-none text-xs font-mono tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                    <span>NOVA AI THINKING...</span>
                  </div>
                </div>
              )}

              {errorStatus && (
                <div className="flex items-center space-x-2 text-accent bg-accent/5 border border-accent/20 px-3 py-2 rounded-lg text-xs font-mono max-w-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorStatus}</span>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Input typing panel */}
            <form onSubmit={handleSendPrompt} className="p-3 border-t border-white/5 bg-black/40 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={loading}
                placeholder="Ask NOVA AI for tactical color drops, modular overcoats, sneakers..."
                className="flex-grow bg-black/60 border border-white/5 rounded-lg px-3 py-2.5 outline-none focus:border-secondary text-xs text-white"
              />
              <button
                type="submit"
                disabled={loading || (!userInput.trim() && !mood)}
                className="px-4 py-2 bg-secondary text-black hover:bg-white disabled:opacity-40 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
