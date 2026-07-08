import React from 'react';
import { ViewState } from '../types';
import { CATEGORIES, PRODUCTS } from '../data';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Target, Shield, Zap } from 'lucide-react';

interface HomeProps {
  setView: (view: ViewState) => void;
}

export const Home: React.FC<HomeProps> = ({ setView }) => {
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div class="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section class="relative bg-golf-900 text-white overflow-hidden">
        <div class="absolute inset-0 opacity-20">
          <img src="https://picsum.photos/seed/golfcourse/1920/1080" alt="Golf Course" class="w-full h-full object-cover" />
        </div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div class="max-w-2xl">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6">
              Find golf gear that fits your swing, your budget, and your goals.
            </h1>
            <p class="text-lg md:text-xl text-gray-300 mb-8">
              Shop clubs, balls, apparel, shoes, bags, tech, and training aids with help from Golf AI.
            </p>
            <div class="flex flex-wrap gap-4">
              <button 
                onClick={() => setView({ page: 'category', categoryName: 'Drivers' })}
                class="bg-golf-500 hover:bg-golf-400 text-white px-8 py-3 rounded-md font-semibold transition-colors"
              >
                Shop Equipment
              </button>
              <button 
                onClick={() => setView({ page: 'quiz' })}
                class="bg-white text-golf-900 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold transition-colors"
              >
                Find My Fit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Goal */}
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Shop by Goal</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-golf-500 transition-colors cursor-pointer" onClick={() => setView({ page: 'category', categoryName: 'Drivers' })}>
              <div class="bg-white p-4 rounded-full shadow-sm mb-4 text-golf-600">
                <Zap size={32} />
              </div>
              <h3 class="font-bold text-lg mb-2">More Distance</h3>
              <p class="text-gray-600 text-sm">Maximize ball speed and carry with optimized drivers and distance irons.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-golf-500 transition-colors cursor-pointer" onClick={() => setView({ page: 'category', categoryName: 'Iron Sets' })}>
              <div class="bg-white p-4 rounded-full shadow-sm mb-4 text-golf-600">
                <Shield size={32} />
              </div>
              <h3 class="font-bold text-lg mb-2">More Forgiveness</h3>
              <p class="text-gray-600 text-sm">Keep mishits in play with high-MOI designs and game-improvement tech.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-golf-500 transition-colors cursor-pointer" onClick={() => setView({ page: 'category', categoryName: 'Wedges' })}>
              <div class="bg-white p-4 rounded-full shadow-sm mb-4 text-golf-600">
                <Target size={32} />
              </div>
              <h3 class="font-bold text-lg mb-2">Better Greenside Control</h3>
              <p class="text-gray-600 text-sm">Dial in your short game with precision wedges and urethane golf balls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Featured Equipment</h2>
              <p class="text-gray-600 mt-1">Top picks based on performance and value.</p>
            </div>
            <button 
              onClick={() => setView({ page: 'category', categoryName: 'Drivers' })}
              class="text-golf-700 font-semibold hover:text-golf-800 flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} setView={setView} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.slice(0, 6).map(cat => (
              <div 
                key={cat}
                onClick={() => setView({ page: 'category', categoryName: cat })}
                class="bg-gray-100 aspect-square rounded-lg flex items-center justify-center p-4 text-center cursor-pointer hover:bg-golf-50 hover:text-golf-700 transition-colors border border-transparent hover:border-golf-200"
              >
                <span class="font-semibold">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
