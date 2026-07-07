export interface Review {
  rating: number;
  count: number;
  positiveSample?: string;
  negativeSample?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  msrp?: number;
  description: string;
  shortDescription: string;
  badges: string[];
  stockStatus: 'In Stock' | 'Low Stock' | 'Backordered' | 'Out of Stock';
  reviews: Review;
  targetPlayer: string;
  tradeoff: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string;
}

export type ViewState = 
  | { page: 'home' }
  | { page: 'category'; categoryName: string }
  | { page: 'product'; productId: string }
  | { page: 'cart' }
  | { page: 'quiz' };
