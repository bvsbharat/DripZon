import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShopping } from "../contexts/ShoppingContext";
import { recommendationService } from "../services/recommendationService";
import { Product } from "../contexts/products";
import { Sparkles, TrendingUp, Loader2, RefreshCw } from "lucide-react";

interface RecommendationSectionProps {
  className?: string;
  storeMode?: "fashion" | "food"; // Allow prop override to avoid context dependency issues
}

interface RecommendationData {
  recommendations?: Product[];
  reasoning: string;
  confidence: number;
  source?: string;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  className = "",
  storeMode: propStoreMode,
}) => {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    cart,
    wishlist,
    currentCategory,
    storeMode: contextStoreMode,
    currentRestaurant,
  } = useShopping();

  // Use prop storeMode if provided, otherwise use context storeMode
  const effectiveStoreMode = propStoreMode || contextStoreMode;

  // Create refs to avoid stale closure issues
  const storeModeRef = useRef(effectiveStoreMode);
  const productsRef = useRef(products);
  const currentRestaurantRef = useRef(currentRestaurant);
  const currentCategoryRef = useRef(currentCategory);

  const [recommendations, setRecommendations] =
    useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getUserId = () => {
    // Use the same user ID logic as in RiyaInteractionHub
    return "nanu";
  };

  const generateFallbackRecommendations = useCallback(() => {
    // Use refs to get current values and avoid stale closures
    const currentStoreMode = storeModeRef.current;
    const currentProducts = productsRef.current;

    // Filter products based on current store mode
    let filteredProducts =
      currentStoreMode === "fashion"
        ? currentProducts.filter((p) =>
            ["Clothing", "Shoes", "Accessories"].includes(p.category)
          )
        : currentProducts.filter((p) =>
            ["Appetizers", "Main Course", "Desserts", "Beverages"].includes(
              p.category
            )
          );

    // If we don't have enough products in the filtered categories, use all products
    if (filteredProducts.length < 8) {
      filteredProducts = currentProducts;
    }

    // Get top 8 highest rated products
    const topProducts = filteredProducts
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);

    // Create fallback response structure
    return {
      recommendations: topProducts,
      reasoning: `Curated selection of popular ${currentStoreMode} items`,
      confidence: 0.7,
      source: "fallback",
    };
  }, []);

  const fetchRecommendations = useCallback(async (forceRefresh = false) => {
    if (
      loading ||
      (!forceRefresh &&
        recommendations &&
        lastUpdated &&
        Date.now() - lastUpdated.getTime() < 300000)
    ) {
      // Don't fetch if already loading or if we have recent recommendations (5 minutes)
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use refs to get current values and avoid stale closures
      const currentStoreMode = storeModeRef.current;
      const currentProducts = productsRef.current;
      const currentRestaurantValue = currentRestaurantRef.current;
      const currentCategoryValue = currentCategoryRef.current;

      const userId = getUserId();
      const result = await recommendationService.getPersonalizedRecommendations(
        {
          userId,
          storeMode: currentStoreMode,
          products: currentProducts,
          restaurants:
            currentStoreMode === "food" && currentRestaurantValue
              ? [currentRestaurantValue]
              : undefined,
          currentContext: {
            selectedProduct,
            cartItems: cart,
            wishlistItems: wishlist,
            currentCategory: currentCategoryValue,
            recentSearches: [],
          },
        }
      );

      // Check if we have valid recommendations
      const hasValidRecommendations =
        result && result.recommendations && result.recommendations.length > 0;

      if (!hasValidRecommendations) {
        // Generate fallback recommendations with up to 8 items
        const fallbackRecommendations = generateFallbackRecommendations();
        setRecommendations(fallbackRecommendations);
      } else {
        setRecommendations(result);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      // Generate fallback recommendations on error
      const fallbackRecommendations = generateFallbackRecommendations();
      setRecommendations(fallbackRecommendations);
      setError("Using fallback recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update refs when state changes to avoid stale closures
  useEffect(() => {
    storeModeRef.current = effectiveStoreMode;
  }, [effectiveStoreMode]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    currentRestaurantRef.current = currentRestaurant;
  }, [currentRestaurant]);

  useEffect(() => {
    currentCategoryRef.current = currentCategory;
  }, [currentCategory]);

  // Clear recommendations when storeMode changes
  useEffect(() => {
    setRecommendations(null);
    setLastUpdated(null);
    setError(null);
  }, [effectiveStoreMode]);

  // Fetch recommendations when component mounts or key dependencies change
  useEffect(() => {
    if (products.length > 0) {
      fetchRecommendations(true); // Force refresh when dependencies change
    }
  }, [
    products.length,
    effectiveStoreMode,
    currentCategory,
    currentRestaurant?.id,
  ]);

  // Track recommendation interactions
  const handleRecommendationClick = useCallback(
    async (product: Product) => {
      setSelectedProduct(product);

      // Track the interaction
      try {
        await recommendationService.saveRecommendationInteraction(
          getUserId(),
          product.id,
          "click"
        );
      } catch (error) {
        console.error("Error tracking recommendation interaction:", error);
      }
    },
    [setSelectedProduct]
  );

  const handleRefresh = useCallback(() => {
    fetchRecommendations(true);
  }, []);

  if (!products.length) {
    return null;
  }

  return (
    <motion.div
      className={`relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl h-[175px] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white text-lg font-semibold drop-shadow-lg">
            Recommendations
          </h3>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 backdrop-blur-sm shadow-lg"
          title="Refresh recommendations"
        >
          <RefreshCw
            className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 pt-8">
        {loading && !recommendations && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-white/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating personalized recommendations...</span>
            </div>
          </div>
        )}

        {error && !recommendations && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchRecommendations(true)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {recommendations && (
          <AnimatePresence mode="wait">
            <motion.div
              key={lastUpdated?.getTime()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Recommendations Grid */}
              <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 pr-2">
                {recommendations.recommendations
                  ?.slice(0, 8)
                  .map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="aspect-square cursor-pointer"
                      onClick={() => handleRecommendationClick(product)}
                    >
                      <div
                        className={`relative w-full h-full rounded-xl overflow-hidden transition-all duration-300 ${
                          selectedProduct?.id === product.id
                            ? "ring-2 ring-white/40 shadow-lg"
                            : "hover:ring-1 hover:ring-white/20 hover:shadow-md"
                        }`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

                        {/* Product Name Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs font-medium truncate drop-shadow-lg">
                            {product.name}
                          </p>
                        </div>

                        {/* Selection Indicator */}
                        {selectedProduct?.id === product.id && (
                          <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full shadow-lg" />
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default RecommendationSection;
