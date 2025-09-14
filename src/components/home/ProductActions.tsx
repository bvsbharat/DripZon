import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShopping } from "../../contexts/ShoppingContext";
import {
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Clock,
  CheckCircle,
} from "lucide-react";

export const ProductActions: React.FC = () => {
  const {
    selectedProduct,
    quantity,
    setQuantity,
    addToCart,
    isProductDetailLoading,
    loading,
    storeMode,
  } = useShopping();

  // Debounced loading state to prevent flickering
  const [debouncedLoading, setDebouncedLoading] = useState(
    loading || isProductDetailLoading
  );
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const isLoading = loading || isProductDetailLoading || !selectedProduct;

    if (isLoading) {
      setDebouncedLoading(true);
      setShowContent(false);
    } else {
      // Add a small delay before showing content to ensure smooth transition
      const timer = setTimeout(() => {
        setDebouncedLoading(false);
        setShowContent(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [loading, isProductDetailLoading, selectedProduct]);

  // Show skeleton loader when loading or no product selected
  if (debouncedLoading) {
    return (
      <motion.div
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl max-w-sm w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Facebook-style skeleton loader matching ProductDisplay height */}
        <div className="h-[450px] flex flex-col justify-between">
          {/* Product name skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-white/8 rounded-lg w-3/4 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                }}
              />
            </div>

            {/* Price skeleton */}
            <div className="h-6 bg-white/6 rounded-lg w-1/2 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                  delay: 0.2,
                }}
              />
            </div>

            {/* Rating skeleton */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 bg-white/6 rounded-sm relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 0.5,
                        delay: 0.1 * index + 0.4,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="h-4 bg-white/6 rounded w-16 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                    delay: 0.9,
                  }}
                />
              </div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-white/6 rounded w-full relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                    delay: 1.1,
                  }}
                />
              </div>
              <div className="h-4 bg-white/6 rounded w-5/6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                    delay: 1.3,
                  }}
                />
              </div>
              <div className="h-4 bg-white/6 rounded w-3/4 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                    delay: 1.5,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Middle section - Quantity and controls */}
          <div className="space-y-6">
            {/* Quantity selector skeleton */}
            <div className="space-y-3">
              <div className="h-5 bg-white/6 rounded w-20 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                    delay: 1.7,
                  }}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/8 rounded-lg relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.5,
                      delay: 1.9,
                    }}
                  />
                </div>
                <div className="w-12 h-8 bg-white/6 rounded relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.5,
                      delay: 2.1,
                    }}
                  />
                </div>
                <div className="w-10 h-10 bg-white/8 rounded-lg relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.5,
                      delay: 2.3,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section - Delivery info and button */}
          <div className="space-y-4">
            {/* Delivery info skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-white/6 rounded w-32 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                    delay: 2.5,
                  }}
                />
              </div>
              <div className="h-4 bg-white/6 rounded w-40 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                    delay: 2.7,
                  }}
                />
              </div>
              <div className="h-4 bg-white/6 rounded w-36 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                    delay: 2.9,
                  }}
                />
              </div>
            </div>

            {/* Add to cart button skeleton */}
            <div className="h-12 bg-white/8 rounded-xl w-full relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                  delay: 3.1,
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showContent && selectedProduct && (
        <motion.div
          key={selectedProduct.id}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl h-[410px] max-w-sm w-full flex flex-col overflow-scroll"
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderColor: "rgba(255, 255, 255, 0.25)",
            scale: 1.01,
          }}
        >
          {/* Top section - Product info */}
          <div className="flex-shrink-0">
            <motion.div
              className="mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <motion.h2
                className="text-white text-lg lg:text-xl font-bold mb-2 leading-tight line-clamp-2 min-h-[3rem] lg:min-h-[3.5rem]"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                title={selectedProduct.name}
              >
                {selectedProduct.name}
              </motion.h2>

              <motion.div
                className="flex items-center justify-between mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < selectedProduct.rating
                            ? "text-yellow-400 fill-current"
                            : "text-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60 text-xs">
                    ({selectedProduct.rating})
                  </span>
                </div>
                <div className="text-white text-lg lg:text-xl font-bold">
                  ${selectedProduct.price}
                </div>
              </motion.div>

              {selectedProduct.description && (
                <motion.div
                  className="h-16 lg:h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 pr-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <p className="text-white/80 text-sm lg:text-base mb-3 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Middle section - Quantity controls */}
          <div className="flex-shrink-0">
            <motion.div
              className="mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <motion.div className="inline-flex bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-all duration-200 border border-white/10 shadow-sm"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255, 182, 193, 0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Minus className="w-2 h-2" />
                  </motion.button>

                  <motion.span
                    className="text-white text-xs font-bold px-1.5 min-w-[20px] text-center"
                    key={quantity}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {quantity}
                  </motion.span>

                  <motion.button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-all duration-200 border border-white/10 shadow-sm"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255, 182, 193, 0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-2 h-2" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom section - Delivery info and button */}
          <div className="flex-shrink-0 mt-auto">
            {/* Delivery Information */}
            <motion.div
              className="mb-4 space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
            >
              {storeMode === "food" ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="font-medium">Delivery in 10-30 min</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <CheckCircle className="w-3 h-3 text-white/60" />
                    <span>Fresh & hot guaranteed</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">
                      Free delivery in 2-3 days
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Shield className="w-3 h-3 text-white/60" />
                    <span>30-day return policy</span>
                  </div>
                </>
              )}
            </motion.div>

            <motion.button
              onClick={() => {
                addToCart(selectedProduct);
                setQuantity(1);
              }}
              className={`w-full backdrop-blur-xl rounded-full py-3 px-6 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl ${
                storeMode === "food"
                  ? "bg-green-500/30 hover:bg-green-500/40 border border-green-400/50 hover:border-green-400/70 shadow-green-500/20"
                  : "bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/50 hover:border-blue-400/70 shadow-blue-500/20"
              }`}
              style={{
                boxShadow:
                  storeMode === "fashion"
                    ? "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)"
                    : undefined,
              }}
              whileHover={{
                scale: 1.02,
                boxShadow:
                  storeMode === "fashion"
                    ? "0 0 25px rgba(59, 130, 246, 0.4), 0 0 50px rgba(59, 130, 246, 0.2)"
                    : undefined,
              }}
              whileTap={{ scale: 0.98 }}
            >
              {storeMode === "food" ? (
                <ShoppingCart className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
              ) : (
                <Truck className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
              )}
              {storeMode === "food" ? "Add to Order" : "Add to Cart"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductActions;
