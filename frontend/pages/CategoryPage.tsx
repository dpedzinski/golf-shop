import React from 'react';
import { ViewState } from '../types';
import { getProductsByCategory, PRODUCTS } from '../data';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';

interface CategoryPageProps {
  categoryName: string;
  setView: (view: ViewState) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categoryName, setView }) => {
  // Fallback to all products if category is empty or not found
  let products = getProductsByCategory(categoryName);
  if (products.length === 0) {
    products = PRODUCTS; // Show all for demo purposes if category is empty
  }

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav class="text-sm text-gray-500 mb-6">
        <span class="cursor-pointer hover:text-golf-700" onClick={() => setView({ page: 'home' })}>Home</span>
        <span class="mx-2">/</span>
        <span class="text-gray-900 font-medium">{categoryName}</span>
      </nav>

      <div class="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Mock UI) */}
        <aside class="w-full md:w-64 flex-shrink-0">
          <div class="flex items-center justify-between mb-4 md:hidden">
            <h2 class="font-bold text-lg">Filters</h2>
            <button class="p-2 bg-gray-100 rounded"><SlidersHorizontal size={20} /></button>
          </div>
          
          <div class="hidden md:block space-y-8">
            <div>
              <h3 class="font-bold text-gray-900 mb-3">Brand</h3>
              <div class="space-y-2">
                {['Apex Canyon Golf', 'NorthLake Forge', 'Meridian Tour Labs', 'Vantage Core Golf'].map(brand => (
                  <label key={brand} class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="rounded text-golf-600 focus:ring-golf-500" />
                    <span class="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 class="font-bold text-gray-900 mb-3">Player Profile</h3>
              <div class="space-y-2">
                {['Beginner / High Handicap', 'Mid Handicap', 'Low Handicap / Tour'].map(profile => (
                  <label key={profile} class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="rounded text-golf-600 focus:ring-golf-500" />
                    <span class="text-sm text-gray-700">{profile}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 class="font-bold text-gray-900 mb-3">Price</h3>
              <div class="space-y-2">
                {['Under $100', '$100 - $250', '$250 - $500', 'Over $500'].map(price => (
                  <label key={price} class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="rounded text-golf-600 focus:ring-golf-500" />
                    <span class="text-sm text-gray-700">{price}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div class="flex-grow">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">{categoryName}</h1>
            <span class="text-sm text-gray-500">{products.length} Results</span>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} setView={setView} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
