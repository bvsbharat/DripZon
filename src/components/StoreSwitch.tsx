import React from 'react';
import { useShopping } from '../contexts/ShoppingContext';
import { restaurants } from '../data/restaurants';

const StoreSwitch: React.FC = () => {
  const { 
    storeMode, 
    setStoreMode, 
    currentRestaurant, 
    setCurrentRestaurant,
    setCurrentCategory,
    setSelectedProduct 
  } = useShopping();

  const handleStoreModeChange = (mode: 'fashion' | 'food') => {
    setStoreMode(mode);
    setSelectedProduct(null);
    
    if (mode === 'fashion') {
      setCurrentRestaurant(null);
      setCurrentCategory('Clothing');
    } else {
      // Default to first restaurant when switching to food mode
      if (!currentRestaurant) {
        setCurrentRestaurant(restaurants[0]);
      }
      setCurrentCategory('Appetizers');
    }
  };

  const handleRestaurantChange = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      setCurrentRestaurant(restaurant);
      setSelectedProduct(null);
      setCurrentCategory('Appetizers');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Store Mode Toggle */}
      <div className="flex items-center justify-center mb-4">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => handleStoreModeChange('fashion')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              storeMode === 'fashion'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👗 Fashion
          </button>
          <button
            onClick={() => handleStoreModeChange('food')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              storeMode === 'food'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🍽️ Food
          </button>
        </div>
      </div>

      {/* Restaurant Selector (only show in food mode) */}
      {storeMode === 'food' && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Select Restaurant</h3>
          <div className="grid grid-cols-1 gap-2">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => handleRestaurantChange(restaurant.id)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  currentRestaurant?.id === restaurant.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {restaurant.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {restaurant.cuisine}
                    </p>
                    <div className="flex items-center mt-2 space-x-3">
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-xs">⭐</span>
                        <span className="text-xs text-gray-600 ml-1">
                          {restaurant.rating}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 text-xs">🕒</span>
                        <span className="text-xs text-gray-600 ml-1">
                          {restaurant.deliveryTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-12 h-12 rounded-lg object-cover ml-3"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Mode Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Current Mode:</span>
          <span className="font-medium">
            {storeMode === 'fashion' ? '👗 Fashion Store' : `🍽️ ${currentRestaurant?.name || 'Food Delivery'}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoreSwitch;