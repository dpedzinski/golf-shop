import React, { useState } from 'react';
import { ViewState, CartItem } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Quiz } from './pages/Quiz';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>({ page: 'home' });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderView = () => {
    switch (view.page) {
      case 'home':
        return <Home setView={setView} />;
      case 'category':
        return <CategoryPage categoryName={view.categoryName} setView={setView} />;
      case 'product':
        return <ProductDetail productId={view.productId} setView={setView} addToCart={(item) => setCartItems(prev => [...prev, item])} />;
      case 'cart':
        return <Cart cartItems={cartItems} setCartItems={setCartItems} setView={setView} />;
      case 'quiz':
        return <Quiz setView={setView} />;
      default:
        return <Home setView={setView} />;
    }
  };

  return (
    <div class="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header cartCount={cartCount} setView={setView} />
      
      <main class="flex-grow">
        {renderView()}
      </main>

      <Footer />
    </div>
  );
};

export default App;
