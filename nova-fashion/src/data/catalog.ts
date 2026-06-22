import { Product } from '../types';

export const products: Product[] = [
  {
    id: "nova-001",
    name: "HOLO-GATEWAY PARKA",
    description: "Ultra-lightweight windproof shell forged from high-density intelligent nanotech fibers. Features dynamic responsive electro-chromic threading that shifts under user biomechanics, combined with an integrated augmented-ready thermal lining.",
    price: 890,
    category: "Outerwear",
    images: [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=800", // front
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800", // back
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800"  // detail
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Neon Violet", hex: "#7C3AED" },
      { name: "Cyber Teal", hex: "#00E5FF" },
      { name: "Matte Void", hex: "#0B0B0C" }
    ],
    rating: 4.9,
    reviews: [
      { id: "rev-1", author: "Kaelen V.", rating: 5, text: "The adaptive fiber glows under low light exactly as described. The thermal flow is incredible.", date: "2026-05-12" },
      { id: "rev-2", author: "Airi T.", rating: 4, text: "Extremely futuristic feel. Received multiple compliments in Neo-Tokyo.", date: "2026-06-01" }
    ],
    tags: ["Adaptive", "Reflective", "Techwear", "Waterproof"],
    inStock: 14,
    features: [
      "Photothermal active color shifts",
      "Dynamic adaptive ventilation system",
      "Liquid-repellent hydrophobic outer shield",
      "Magnetic quick-snap utility straps"
    ],
    isFeatured: true,
    isTrending: true
  },
  {
    id: "nova-002",
    name: "CYBER-LUME SHIELD VISOR",
    description: "Futuristic dual-band polarization eyewear engineered for ocular comfort. Equipped with high-contrast glare resistance, subtle glassmorphism nose bridge, and lightweight titanium temples. Glow accents react to surrounding sound frequencies.",
    price: 320,
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["One Size"],
    colors: [
      { name: "Supernova Pink", hex: "#FF3CAC" },
      { name: "Quantum Cyan", hex: "#00E5FF" },
      { name: "Luminous Citron", hex: "#ADFF2F" }
    ],
    rating: 4.8,
    reviews: [
      { id: "rev-3", author: "Devon C.", rating: 5, text: "Crisp optical density. It acts as an absolute statement piece globally.", date: "2026-04-30" }
    ],
    tags: ["Optics", "Sound-reactive", "Glow", "Bespoke"],
    inStock: 25,
    features: [
      "100% Anti-radiation ocular shield",
      "Liquid crystal glare dispersion technology",
      "Self-calibrating temple flexibility",
      "Integrated audio-wave visual indicators"
    ],
    isFeatured: true,
    isNewArrival: true
  },
  {
    id: "nova-003",
    name: "VOID-WEAVE DECONSTRUCTED COAT",
    description: "Symmetrical drapes meet industrial structure. Modeled after structural architecture panels, this long coat delivers an unforgettable urban silhouette with heavy raw linen and carbon-fiber hybrid weave.",
    price: 1250,
    category: "Outerwear",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Carbon Obsidian", hex: "#111113" },
      { name: "Vapor Metallic", hex: "#A0A5B5" }
    ],
    rating: 5.0,
    reviews: [
      { id: "rev-4", author: "Zayn M.", rating: 5, text: "Top-tier craftsmanship. Heavyweight yet flows beautifully when walking.", date: "2026-05-20" }
    ],
    tags: ["Luxury", "Industrial", "Asymmetrical", "Modular"],
    inStock: 8,
    features: [
      "Modular sleeve configuration tabs",
      "Hidden thermal containment pocketing",
      "Laser-welded architectural seam outlines",
      "Premium breathable mesh venting underarms"
    ],
    isTrending: true
  },
  {
    id: "nova-004",
    name: "KINETIC CARGO STRAP TROUSERS",
    description: "Engineered with reinforced knee armor plating structure and geometric compression straps. Tailored for unrestricted speed, agility, and heavy storage capacity. High tensile strength fabric resisting heavy abrasions.",
    price: 490,
    category: "Bottoms",
    images: [
      "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Matte Void", hex: "#0B0B0C" },
      { name: "Stardust Gray", hex: "#4B5563" },
      { name: "Off-Grid Olive", hex: "#3B4232" }
    ],
    rating: 4.7,
    reviews: [
      { id: "rev-5", author: "Hiro S.", rating: 4, text: "Excellent fit, pockets are strategically layout-ed perfectly. Purity in action.", date: "2026-03-15" }
    ],
    tags: ["Agility", "Reinforced", "Techwear", "Multi-pocket"],
    inStock: 18,
    features: [
      "Double reinforced anti-grip fabric weaves",
      "8-point magnetic snap cargo hold systems",
      "Quick-release aluminum strap buckles",
      "Inner temperature control dynamic lining"
    ],
    isFeatured: false,
    isNewArrival: true
  },
  {
    id: "nova-005",
    name: "AERO-CHRONO CHUNKY RUNNERS",
    description: "Gravity-dispersion footwear built with segmented responsive air soles. Constructed of bio-engineered silicon fibers with synthetic leather panel details. Provides unparalleled heel rebound energy.",
    price: 650,
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
    colors: [
      { name: "Zero Gravity White", hex: "#F3F4F6" },
      { name: "Electric Purple", hex: "#7C3AED" },
      { name: "Carbon Cyber", hex: "#1E1E24" }
    ],
    rating: 4.9,
    reviews: [
      { id: "rev-6", author: "Luna E.", rating: 5, text: "Literally feels like bouncing on pillows. Highly recommend the Electric Purple accent.", date: "2026-06-11" }
    ],
    tags: ["Footwear", "Reactive Sole", "Chunky", "Comfort"],
    inStock: 12,
    features: [
      "Segmented gravity dissipation chambers",
      "Bio-based mesh panels for optimal airflow",
      "High traction cybernetic grip tread pattern",
      "Lightweight self-adjusting fit closure"
    ],
    isFeatured: true,
    isTrending: true,
    isNewArrival: true
  },
  {
    id: "nova-006",
    name: "VERTEX WAVE COMPRESSION SLEEVE",
    description: "Smart sensory base layer top that acts as a second skin. Regulates core body temp using active moisture dispersion and compression zones, decorated with elegant holographic visual waves along chest line.",
    price: 240,
    category: "Tops",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Cyber Teal", hex: "#00E5FF" },
      { name: "Static Grey", hex: "#E5E7EB" },
      { name: "Supernova Pink", hex: "#FF3CAC" }
    ],
    rating: 4.6,
    reviews: [
      { id: "rev-7", author: "Sora K.", rating: 5, text: "Excellent fit, super stretchy. The lines look phenomenal in photographs.", date: "2026-04-18" }
    ],
    tags: ["Second Skin", "Holographic", "Compression", "Sporty"],
    inStock: 30,
    features: [
      "Intense muscle-support compression zones",
      "Full spectrum light-sensitive vector lines",
      "Fast moisture vapor transport system",
      "Anti-bacterial silver fiber technology"
    ],
    isNewArrival: true
  },
  {
    id: "nova-007",
    name: "CYBER-SHELL ARMOR HOODIE",
    description: "Premium oversized protective hoodie featuring removable tech hood panels and asymmetric utility pockets. Forged with thick fire-resistant neoprene blend with double knit outer coating.",
    price: 580,
    category: "Tops",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Carbon Obsidian", hex: "#111113" },
      { name: "Off-Grid Olive", hex: "#3B4232" }
    ],
    rating: 4.8,
    reviews: [
      { id: "rev-8", author: "Marc R.", rating: 5, text: "Heavy neoprene with perfect structural drapes. Looks incredibly futuristic.", date: "2026-05-28" }
    ],
    tags: ["Neoprene", "Heavyweight", "Oversized", "Modular"],
    inStock: 15,
    features: [
      "3-layer thick protective neoprene knit",
      "Detachable zipper storm-hood configuration",
      "Reinforced heavy-load thumb cuffs",
      "Contrast electric stitching lines"
    ],
    isFeatured: false,
    isTrending: true
  },
  {
    id: "nova-008",
    name: "ECLIPSE MULTI-UTILITY BACKPACK",
    description: "A secure geometric utility pack featuring custom carbon fiber hard-shell protection. Expandable compartment system with waterproof laser zippers, glow security light rings, and magnetic latch locks.",
    price: 390,
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["One Size"],
    colors: [
      { name: "Matte Void", hex: "#0B0B0C" },
      { name: "Vapor Metallic", hex: "#A0A5B5" }
    ],
    rating: 4.9,
    reviews: [
      { id: "rev-9", author: "Risa G.", rating: 5, text: "Amazing storage features. Fits my holographic tablet and smart-glasses flawlessly.", date: "2026-06-03" }
    ],
    tags: ["Pack", "Carbon hard-shell", "Waterproof", "Locking"],
    inStock: 10,
    features: [
      "Rigid carbon fiber deflection exterior shells",
      "Acoustic feedback safety locking system",
      "Multi-point ergonomic weight distributor straps",
      "Hidden quick-pull storage security pouch"
    ],
    isFeatured: true
  }
];

export const lookbookLooks = [
  {
    id: "look-01",
    name: "CYBERPUNK NOMAD",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    quote: "A balance of aggressive raw linen drapes and sleek responsive high-density synthetic fiber wear.",
    items: ["nova-001", "nova-003", "nova-004"]
  },
  {
    id: "look-02",
    name: "NEO-CITY RUNNER",
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800",
    quote: "Engineered specifically for hyper-mobility across dense vertical megastructures.",
    items: ["nova-002", "nova-005", "nova-006", "nova-008"]
  }
];
