import React from "react";
import { motion } from "motion/react";
import { useShopping } from "../../contexts/ShoppingContext";
import ProductListCard from "../ProductListCard";
import { Loader, AlertCircle } from "lucide-react";

const ProductListSidebar: React.FC = () => {
  const {
    products,
    loading,
    error,
    currentCategory,
    selectedProduct,
    setSelectedProduct,
    storeMode,
    currentRestaurant,
  } = useShopping();

  const filteredProducts = products.filter(
    (product) =>
      currentCategory === "all" || product.category === currentCategory
  );

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 ${
        storeMode === "food" ? "h-[350px]" : "h-[550px]"
      } flex flex-col shadow-2xl`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)", scale: 1.01 }}
    >
      {storeMode !== 'food' && (
        <motion.h3
          className="text-white/80 text-lg font-semibold mb-4 flex-shrink-0"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          Products ({filteredProducts.length})
        </motion.h3>
      )}

      <motion.div
        className="space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 pr-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        {loading && (
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                className="h-16 bg-white/8 rounded-lg relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* Horizontal shimmer effect */}
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
                    delay: index * 0.2,
                  }}
                />

                {/* Content placeholders */}
                <div className="p-3 flex items-center space-x-3">
                  {/* Image placeholder */}
                  <div className="w-10 h-10 bg-white/6 rounded-lg flex-shrink-0 relative overflow-hidden">
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
                        delay: index * 0.2 + 0.1,
                      }}
                    />
                  </div>

                  {/* Text placeholders */}
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/6 rounded w-3/4 relative overflow-hidden">
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
                          delay: index * 0.2 + 0.2,
                        }}
                      />
                    </div>
                    <div className="h-2 bg-white/4 rounded w-1/2 relative overflow-hidden">
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
                          delay: index * 0.2 + 0.3,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price placeholder */}
                  <div className="w-12 h-4 bg-white/6 rounded relative overflow-hidden">
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
                        delay: index * 0.2 + 0.4,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="w-6 h-6 text-red-400 mr-2" />
            <span className="text-red-400">Error loading products</span>
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.6 + index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ProductListCard
                product={product}
                isSelected={selectedProduct?.id === product.id}
                onClick={() => setSelectedProduct(product)}
              />
            </motion.div>
          ))}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <span className="text-white/60">
              No products found in this category
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProductListSidebar;
