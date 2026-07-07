import React, { useState } from 'react';
import { ViewState, Product, CartItem } from '../types';
import { getProductById } from '../data';
import { Star, ShieldCheck, CreditCard, Award, Info, Check } from 'lucide-react';

interface ProductDetailProps {
  productId: string;
  setView: (view: ViewState) => void;
  addToCart: (item: CartItem) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, setView, addToCart }) => {
  const product = getProductById(productId);
  const [added, setAdded] = useState(false);

  if (!product) {
    return <div class="p-8 text-center">Product not found.</div>;
  }

  const pointsEstimate = Math.floor(product.price);
  const monthlyEstimate = (product.price / 12).toFixed(2);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav class="text-sm text-gray-500 mb-6">
        <span class="cursor-pointer hover:text-golf-700" onClick={() => setView({ page: 'home' })}>Home</span>
        <span class="mx-2">/</span>
        <span class="cursor-pointer hover:text-golf-700" onClick={() => setView({ page: 'category', categoryName: product.category })}>{product.category}</span>
        <span class="mx-2">/</span>
        <span class="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div class="flex flex-col lg:flex-row gap-12">
        {/* Image Gallery */}
        <div class="w-full lg:w-1/2">
          <div class="bg-gray-100 rounded-xl aspect-square relative overflow-hidden border border-gray-200">
            <img src={product.imageUrl} alt={product.name} class="w-full h-full object-cover mix-blend-multiply p-8" />
            <div class="absolute top-4 left-4 flex flex-col gap-2">
              {product.badges.map(badge => (
                <span key={badge} class="bg-golf-900 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div class="w-full lg:w-1/2 flex flex-col">
          <div class="mb-2 text-sm font-bold text-gray-500 uppercase tracking-widest">{product.brand}</div>
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div class="flex items-center gap-4 mb-6">
            <div class="flex items-center">
              <div class="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.floor(product.reviews.rating) ? "currentColor" : "none"} class={i >= Math.floor(product.reviews.rating) ? "text-gray-300" : ""} />
                ))}
              </div>
              <span class="text-sm font-medium text-gray-900 ml-2">{product.reviews.rating}</span>
              <span class="text-sm text-gray-500 ml-1">({product.reviews.count} reviews)</span>
            </div>
            <span class="text-gray-300">|</span>
            <span class={`text-sm font-medium ${product.stockStatus === 'In Stock' ? 'text-green-600' : 'text-amber-600'}`}>
              {product.stockStatus}
            </span>
          </div>

          <div class="mb-6">
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.msrp && product.msrp > product.price && (
                <span class="text-lg text-gray-500 line-through">${product.msrp.toFixed(2)}</span>
              )}
            </div>
          </div>

          <p class="text-gray-700 mb-8 text-lg leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Add to Cart */}
          <div class="mb-8">
            <button 
              onClick={handleAddToCart}
              class={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                added ? 'bg-green-600 text-white' : 'bg-golf-600 hover:bg-golf-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {added ? <><Check size={24} /> Added to Cart</> : 'Add to Cart'}
            </button>
          </div>

          {/* Financing & Loyalty Modules */}
          <div class="space-y-4 mb-8">
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-4">
              <CreditCard class="text-golf-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <h4 class="font-bold text-gray-900">Flexible Golf Financing</h4>
                <p class="text-sm text-gray-600 mt-1">
                  Financing may be available for this purchase through the FairwayIQ Store Card or installment options at checkout. Estimated from <span class="font-semibold">${monthlyEstimate}/mo</span>.
                </p>
                <p class="text-xs text-gray-500 mt-2 italic">
                  Approval, APR, and terms depend on final credit offer. Paying in full avoids interest.
                </p>
              </div>
            </div>

            <div class="bg-golf-50 border border-golf-100 rounded-lg p-4 flex items-start gap-4">
              <Award class="text-golf-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <h4 class="font-bold text-golf-900">Fairway Rewards</h4>
                <p class="text-sm text-golf-800 mt-1">
                  With Fairway Rewards, this item may earn approximately <span class="font-bold">{pointsEstimate} points</span> before tax and shipping.
                </p>
              </div>
            </div>
          </div>

          {/* Fit & Tradeoffs */}
          <div class="border-t border-gray-200 pt-8 mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Is this right for you?</h3>
            <div class="space-y-4">
              <div>
                <span class="font-semibold text-gray-900 block mb-1">Best For:</span>
                <p class="text-gray-700">{product.targetPlayer}</p>
              </div>
              <div>
                <span class="font-semibold text-gray-900 block mb-1">Tradeoff to Consider:</span>
                <p class="text-gray-700">{product.tradeoff}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Reviews Tabs */}
      <div class="mt-16 border-t border-gray-200 pt-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
            <p class="text-gray-700 leading-relaxed mb-6">{product.description}</p>
            <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck size={20} class="text-golf-600" />
                Authorized Retailer
              </h4>
              <p class="text-sm text-gray-600">
                FairwayIQ is an authorized retailer for {product.brand}. All products include standard manufacturer warranties where applicable.
              </p>
            </div>
          </div>

          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              Customer Feedback
              <span class="text-xs font-normal bg-gray-200 text-gray-700 px-2 py-1 rounded uppercase tracking-wide">Synthetic Demo Data</span>
            </h2>
            
            <div class="space-y-6">
              {product.reviews.positiveSample && (
                <div class="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="flex text-yellow-400"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                    <span class="text-sm font-bold text-gray-900">Helpful Positive Review</span>
                  </div>
                  <p class="text-gray-700 italic">"{product.reviews.positiveSample}"</p>
                </div>
              )}
              
              {product.reviews.negativeSample && (
                <div class="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="flex text-yellow-400"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} class="text-gray-300" /><Star size={16} class="text-gray-300" /></div>
                    <span class="text-sm font-bold text-gray-900">Helpful Critical Review</span>
                  </div>
                  <p class="text-gray-700 italic">"{product.reviews.negativeSample}"</p>
                </div>
              )}

              <div class="flex items-start gap-2 text-sm text-gray-500 mt-4">
                <Info size={16} class="flex-shrink-0 mt-0.5" />
                <p>These are synthetic demo reviews provided for evaluation purposes and do not represent real verified customer purchases.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
