import React from 'react';
import { ShieldCheck, Truck, CreditCard, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer class="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Section */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-12 border-b border-gray-800">
          <div class="flex flex-col items-center text-center">
            <ShieldCheck class="text-golf-500 mb-3" size={32} />
            <h4 class="font-semibold text-white mb-1">Secure Checkout</h4>
            <p class="text-sm text-gray-400">Your data is protected</p>
          </div>
          <div class="flex flex-col items-center text-center">
            <Truck class="text-golf-500 mb-3" size={32} />
            <h4 class="font-semibold text-white mb-1">Easy Returns</h4>
            <p class="text-sm text-gray-400">30-day return policy</p>
          </div>
          <div class="flex flex-col items-center text-center">
            <CreditCard class="text-golf-500 mb-3" size={32} />
            <h4 class="font-semibold text-white mb-1">Flexible Financing</h4>
            <p class="text-sm text-gray-400">Pay over time options</p>
          </div>
          <div class="flex flex-col items-center text-center">
            <Award class="text-golf-500 mb-3" size={32} />
            <h4 class="font-semibold text-white mb-1">Fairway Rewards</h4>
            <p class="text-sm text-gray-400">Earn points on every purchase</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span class="font-serif text-2xl font-bold tracking-tight text-white mb-4 block">
              Fairway<span class="text-golf-500">IQ</span>
            </span>
            <p class="text-sm text-gray-400 mb-4">
              Find golf gear that fits your swing, your budget, and your goals with help from Golf AI.
            </p>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Shop</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-golf-500 transition-colors">Clubs</a></li>
              <li><a href="#" class="hover:text-golf-500 transition-colors">Balls</a></li>
              <li><a href="#" class="hover:text-golf-500 transition-colors">Apparel & Shoes</a></li>
              <li><a href="#" class="hover:text-golf-500 transition-colors">Bags & Tech</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Support</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-golf-500 transition-colors">Contact Us</a></li>
              <li><a href="#" class="hover:text-golf-500 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" class="hover:text-golf-500 transition-colors">Financing Options</a></li>
              <li><a href="#" class="hover:text-golf-500 transition-colors">Ask Golf AI</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Fairway Rewards</h4>
            <p class="text-sm text-gray-400 mb-4">Join for free to earn points, get early access, and member-only promotions.</p>
            <button class="bg-golf-700 hover:bg-golf-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              Join Now
            </button>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t border-gray-800 text-sm text-gray-500 text-center">
          &copy; {new Date().getFullYear()} FairwayIQ Golf Shop. Fictional demo store.
        </div>
      </div>
    </footer>
  );
};
