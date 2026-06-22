export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // base price in USD
  category: 'Outerwear' | 'Tops' | 'Bottoms' | 'Footwear' | 'Accessories';
  images: string[]; // multi-angle shots
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  reviews: Review[];
  videoUrl?: string;
  tags: string[];
  inStock: number;
  features: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
}

export interface CartItem {
  id: string; // unique cart item ID (product.id + size + color)
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  suggestedProducts?: string[]; // list of product IDs
  timestamp: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  email: string;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
  }[];
  totalPrice: number;
  currency: string;
  status: 'Processing' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
}

export interface ProjectState {
  cart: CartItem[];
  wishlist: string[]; // product IDs
  compareList: string[]; // product IDs
  currency: 'INR' | 'USD' | 'EUR' | 'JPY';
  language: 'EN' | 'FR' | 'JP';
}
