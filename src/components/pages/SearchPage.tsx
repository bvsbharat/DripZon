import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard';
import { useShopping } from '../../contexts/ShoppingContext';
import { Search, Filter, Loader } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { products, loading, error, categories, searchProducts } = useShopping();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // Handle search with debouncing
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        searchProducts(searchQuery);
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, searchProducts]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const allCategories = ['all', ...categories];

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Search Products</h2>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full h-12 px-4 pr-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader className="w-4 h-4 text-white/60 animate-spin" />
              </div>
            )}
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {allCategories.map(category => (
              <option key={category} value={category} className="bg-slate-800">
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="name" className="bg-slate-800">Sort by Name</option>
            <option value="price" className="bg-slate-800">Sort by Price</option>
            <option value="rating" className="bg-slate-800">Sort by Rating</option>
          </select>
        </div>

        {error && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-red-400 mb-2">Error loading products</p>
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 text-white/30 mx-auto mb-4 animate-spin" />
            <p className="text-white/60">Loading products...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">No products found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;