import React, { useState } from "react";
import { motion } from "motion/react";
import { useShopping } from "../../contexts/ShoppingContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  ShoppingCart,
  User,
  LogIn,
  LogOut,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import CartModal from "../CartModal";
import AuthModal from "../auth/AuthModal";
import Logo from "../Logo";
import { restaurants } from "../../data/restaurants";

const TopNavigationBar: React.FC = () => {
  const {
    cart,
    isCartModalOpen,
    openCartModal,
    closeCartModal,
    cartModalRef,
    storeMode,
    setStoreMode,
    currentRestaurant,
    setCurrentRestaurant,
    setCurrentCategory,
    setSelectedProduct,
  } = useShopping();
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleCartClick = () => {
    openCartModal();
  };

  const handleCloseCartModal = () => {
    closeCartModal();
  };

  const handleDirectLogout = () => {
    logout();
  };

  const handleStoreModeSelect = (mode: "fashion" | "food") => {
    if (mode === storeMode) return; // Don't switch if already in that mode

    setStoreMode(mode);
    setSelectedProduct(null);

    if (mode === "fashion") {
      setCurrentRestaurant(null);
      setCurrentCategory("Clothing");
    } else {
      // Default to first restaurant when switching to food mode
      if (!currentRestaurant) {
        setCurrentRestaurant(restaurants[0]);
      }
      setCurrentCategory("Appetizers");
    }
  };

  return (
    <motion.div
      className="flex items-center justify-between mb-8 bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 relative shadow-2xl"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex items-center gap-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.div
          className="pl-4"
          whileHover={{
            scale: 1.05,
          }}
          transition={{ duration: 0.2 }}
        >
          <Logo size="sm" />
        </motion.div>

        {/* Store Mode Menu Items */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl rounded-xl p-1 border border-white/20">
          {/* Fashion Menu Item */}
          <motion.button
            onClick={() => handleStoreModeSelect("fashion")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 ${
              storeMode === "fashion"
                ? "bg-white/20 border border-white/30 shadow-lg"
                : "hover:bg-white/10"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            title="Fashion Store"
          >
            <motion.div
              animate={{
                scale: storeMode === "fashion" ? 1.1 : 1,
                rotate: storeMode === "fashion" ? [0, 10, -10, 0] : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <Store
                className={`w-4 h-4 ${
                  storeMode === "fashion" ? "text-white" : "text-white/70"
                }`}
              />
            </motion.div>
            <div className="flex flex-col items-start">
              <span
                className={`text-xs font-medium ${
                  storeMode === "fashion" ? "text-white" : "text-white/70"
                }`}
              >
                Fashion
              </span>
              <span
                className={`text-xs ${
                  storeMode === "fashion" ? "text-white/80" : "text-white/50"
                }`}
              >
                Store
              </span>
            </div>
          </motion.button>

          {/* Food Menu Item */}
          <motion.button
            onClick={() => handleStoreModeSelect("food")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 ${
              storeMode === "food"
                ? "bg-white/20 border border-white/30 shadow-lg"
                : "hover:bg-white/10"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            title="Food Delivery"
          >
            <motion.div
              animate={{
                scale: storeMode === "food" ? 1.1 : 1,
                rotate: storeMode === "food" ? [0, 10, -10, 0] : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <UtensilsCrossed
                className={`w-4 h-4 ${
                  storeMode === "food" ? "text-white" : "text-white/70"
                }`}
              />
            </motion.div>
            <div className="flex flex-col items-start">
              <span
                className={`text-xs font-medium ${
                  storeMode === "food" ? "text-white" : "text-white/70"
                }`}
              >
                Food
              </span>
              <span
                className={`text-xs ${
                  storeMode === "food" ? "text-white/80" : "text-white/50"
                }`}
              >
                {storeMode === "food" && currentRestaurant
                  ? currentRestaurant.name
                  : "Delivery"}
              </span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        className="flex items-center gap-4"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Sign Off (Logout) Icon */}
        {isAuthenticated && (
          <motion.button
            onClick={handleDirectLogout}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            title="Sign Out"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <LogOut className="w-4 h-4 text-white" />
            </motion.div>
          </motion.button>
        )}

        {/* Login Button for non-authenticated users */}
        {!isAuthenticated && (
          <motion.button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer  transition-all duration-300"
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <LogIn className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Sign In</span>
          </motion.button>
        )}

        <motion.button
          onClick={handleCartClick}
          className="relative flex items-center gap-3  px-4 py-2.5 transition-all duration-300"
          whileHover={{
            scale: 1.02,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-white-600/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            {cartCount > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 bg-gradient-to-r from-white-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg border-2 border-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </motion.div>
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-white text-sm font-medium">Cart</span>
            <span className="text-white/60 text-xs">
              {cartCount === 0
                ? "Empty"
                : `${cartCount} item${cartCount > 1 ? "s" : ""}`}
            </span>
          </div>
        </motion.button>
      </motion.div>

      {/* Cart Modal */}
      <CartModal
        ref={cartModalRef}
        isOpen={isCartModalOpen}
        onClose={handleCloseCartModal}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </motion.div>
  );
};

export default TopNavigationBar;
