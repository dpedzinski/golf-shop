import React from 'react';
import { ViewState, CartItem } from '../types';
import { Trash2, ShieldCheck, CreditCard } from 'lucide-react';

interface CartProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setView: (view: ViewState) => void;
}

export const Cart: React.FC<CartProps> = ({ cartItems, setCartItems, setView }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const estimatedPoints = Math.floor(subtotal);

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  if (cartItems.length === 0) {
    return (
      <div class="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p class="text-gray-600 mb-8">Looks like you haven't added any gear yet.</p>
        <button 
          onClick={() => setView({ page: 'home' })}
          class="bg-golf-600 hover:bg-golf-700 text-white px-8 py-3 rounded-md font-semibold transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div class="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div class="w-full lg:w-2/3">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <ul class="divide-y divide-gray-200">
              {cartItems.map(item => (
                <li key={item.id} class="p-6 flex flex-col sm:flex-row gap-6">
                  <div class="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 border border-gray-200">
                    <img src={item.imageUrl} alt={item.name} class="w-full h-full object-cover mix-blend-multiply p-2" />
                  </div>
                  <div class="flex-grow flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                      <div>
                        <div class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{item.brand}</div>
                        <h3 class="text-lg font-bold text-gray-900 cursor-pointer hover:text-golf-600" onClick={() => setView({ page: 'product', productId: item.id })}>
                          {item.name}
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div class="text-right">
                        <div class="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                      <button 
                        onClick={() => removeItem(item.id)}
                        class="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div class="w-full lg:w-1/3">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div class="space-y-4 mb-6 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Shipping</span>
                <span class="font-medium text-gray-900">Calculated at checkout</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Estimated Tax</span>
                <span class="font-medium text-gray-900">Calculated at checkout</span>
              </div>
              <div class="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span class="font-bold text-gray-900 text-lg">Estimated Total</span>
                <span class="font-bold text-gray-900 text-xl">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button class="w-full bg-golf-600 hover:bg-golf-700 text-white py-4 rounded-lg font-bold text-lg transition-colors mb-4 shadow-sm">
              Proceed to Checkout
            </button>

            <div class="space-y-4 mt-6">
              <div class="flex items-start gap-3 text-sm">
                <Award class="text-golf-600 flex-shrink-0 mt-0.5" size={18} />
                <p class="text-gray-700">You will earn approximately <span class="font-bold">{estimatedPoints} Fairway Rewards points</span> on this order.</p>
              </div>
              <div class="flex items-start gap-3 text-sm">
                <CreditCard class="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                <p class="text-gray-600">Financing options may be available at checkout, subject to approval and final terms.</p>
              </div>
              <div class="flex items-start gap-3 text-sm">
                <ShieldCheck class="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                <p class="text-gray-600">Secure checkout. 30-day return policy on unused items.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
