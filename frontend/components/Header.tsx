import React from 'react';
import { ShoppingCart, Menu, Search, User } from 'lucide-react';
import { ViewState } from '../types';
import { CATEGORIES } from '../data';

interface HeaderProps {
  cartCount: number;
  setView: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, setView }) => {
  return (
    <header class="bg-golf-900 text-white sticky top-0 z-40 shadow-md">
      {/* Top Bar */}
      <div class="bg-golf-800 text-xs text-center py-1.5 font-medium tracking-wide">
        Free shipping on orders over $150 | Join Fairway Rewards today
      </div>
      
      {/* Main Header */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            class="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => setView({ page: 'home' })}
          >
            <span class="font-serif text-2xl font-bold tracking-tight text-white">
              Fairway<span class="text-golf-500">IQ</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav class="hidden md:flex space-x-8">
            {['Drivers', 'Iron Sets', 'Golf Balls', 'Apparel'].map((cat) => (
              <button
                key={cat}
                onClick={() => setView({ page: 'category', categoryName: cat })}
                class="text-gray-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setView({ page: 'quiz' })}
              class="text-golf-500 hover:text-golf-400 px-3 py-2 text-sm font-bold transition-colors"
            >
              Find My Fit
            </button>
          </nav>

          {/* Icons */}
          <div class="flex items-center space-x-4">
            <button class="text-gray-200 hover:text-white p-2">
              <Search size={20} />
            </button>
            <button class="text-gray-200 hover:text-white p-2 hidden sm:block">
              <User size={20} />
            </button>
            <button 
              class="text-gray-200 hover:text-white p-2 relative"
              onClick={() => setView({ page: 'cart' })}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-golf-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button class="md:hidden text-gray-200 hover:text-white p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
