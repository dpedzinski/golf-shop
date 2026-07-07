import React from 'react';
import { Star } from 'lucide-react';
import { Product, ViewState } from '../types';

interface ProductCardProps {
  product: Product;
  setView: (view: ViewState) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, setView }) => {
  const pointsEstimate = Math.floor(product.price);

  return (
    <div 
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
      onClick={() => setView({ page: 'product', productId: product.id })}
    >
      <div class="relative aspect-square bg-gray-100">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          class="w-full h-full object-cover mix-blend-multiply p-4"
        />
        <div class="absolute top-2 left-2 flex flex-col gap-1">
          {product.badges.map(badge => (
            <span key={badge} class="bg-golf-900 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              {badge}
            </span>
          ))}
          {product.stockStatus === 'Low Stock' && (
            <span class="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              Low Stock
            </span>
          )}
        </div>
      </div>
      
      <div class="p-4 flex flex-col flex-grow">
        <div class="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{product.brand}</div>
        <h3 class="text-gray-900 font-semibold leading-tight mb-2 line-clamp-2">{product.name}</h3>
        
        <div class="flex items-center mb-3">
          <div class="flex text-yellow-400">
            <Star size={14} fill="currentColor" />
          </div>
          <span class="text-xs text-gray-600 ml-1 font-medium">{product.reviews.rating}</span>
          <span class="text-xs text-gray-400 ml-1">({product.reviews.count})</span>
        </div>

        <div class="mt-auto">
          <div class="flex items-baseline gap-2 mb-1">
            <span class="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.msrp && product.msrp > product.price && (
              <span class="text-sm text-gray-500 line-through">${product.msrp.toFixed(2)}</span>
            )}
          </div>
          <div class="text-xs text-golf-700 font-medium">
            Earn ~{pointsEstimate} pts
          </div>
        </div>
      </div>
    </div>
  );
};
