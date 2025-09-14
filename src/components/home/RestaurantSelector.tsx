import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, UtensilsCrossed, Check } from "lucide-react";
import { useShopping } from "../../contexts/ShoppingContext";
import { restaurants } from "../../data/restaurants";

const RestaurantSelector: React.FC = () => {
  const {
    storeMode,
    currentRestaurant,
    setCurrentRestaurant,
    setCurrentCategory,
    setSelectedProduct
  } = useShopping();
  
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  // Only show in food mode
  if (storeMode !== 'food') {
    return null;
  }

  const handleRestaurantSelect = (restaurant: typeof restaurants[0]) => {
    setCurrentRestaurant(restaurant);
    setSelectedProduct(undefined);
    setCurrentCategory('Appetizers'); // Default to first category
    setIsOpen(false);
  };

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)", scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        {/* Restaurant Logo and Name */}
        {currentRestaurant ? (
          <motion.div
            className="flex items-center gap-3"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
              <img 
                src={currentRestaurant.image} 
                alt={currentRestaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-white/90 text-base font-semibold">{currentRestaurant.name}</h3>
              <p className="text-white/60 text-xs">{currentRestaurant.cuisine}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-3"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <h3 className="text-white/70 text-base font-medium">Select Restaurant</h3>
              <p className="text-white/50 text-xs">Choose your dining option</p>
            </div>
          </motion.div>
        )}

        {/* Dropdown Button - Top Right Corner */}
        <motion.div
          ref={dropdownRef}
          className="relative"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <motion.button
            ref={buttonRef}
            onClick={(e) => {
              if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPosition({
                  top: rect.bottom,
                  right: window.innerWidth - rect.right,
                });
              }
              setIsOpen(!isOpen);
            }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-medium cursor-pointer hover:bg-white/15 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Select a restaurant"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-white/60" />
            </motion.div>
          </motion.button>

        {/* Portal Dropdown Menu */}
        {isOpen && createPortal(
          <AnimatePresence>
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-transparent z-[40]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <motion.div
                ref={dropdownRef}
                className="fixed w-80 bg-black/90 border border-white/20 rounded-xl shadow-2xl z-[50] max-h-48 overflow-y-auto"
                style={{
                  top: dropdownPosition.top + 8,
                  right: dropdownPosition.right,
                }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {restaurants.map((restaurant, index) => (
                  <motion.button
                    key={restaurant.id}
                    onClick={() => handleRestaurantSelect(restaurant)}
                    className="w-full px-3 py-2 text-left hover:bg-black/30 focus:bg-black/30 focus:outline-none transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium text-xs truncate">{restaurant.name}</h4>
                          {currentRestaurant?.id === restaurant.id && (
                            <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-white/70 text-xs">{restaurant.cuisine}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-white/80 text-xs">{restaurant.rating}</span>
                        </div>
                        <span className="text-white/60 text-xs whitespace-nowrap">{restaurant.distance}</span>
                        <span className="text-white/60 text-xs whitespace-nowrap">{restaurant.deliveryTime}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </>
          </AnimatePresence>,
          document.body
        )}
        </motion.div>
      </div>
      
      {/* Restaurant Details Section */}
      {currentRestaurant && (
        <motion.div
          className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs">{currentRestaurant.cuisine}</p>
              <p className="text-white/60 text-xs mt-1 leading-relaxed line-clamp-2">{currentRestaurant.description}</p>
              <p className="text-white/50 text-xs mt-1">{currentRestaurant.address}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-white/90 text-xs font-medium">{currentRestaurant.rating}</span>
              </div>
              <p className="text-white/70 text-xs whitespace-nowrap">{currentRestaurant.distance}</p>
              <p className="text-white/70 text-xs whitespace-nowrap">{currentRestaurant.deliveryTime}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RestaurantSelector;