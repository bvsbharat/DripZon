import React from "react";
import { useShopping } from "../../contexts/ShoppingContext";
import {
  Shirt,
  ShoppingBag,
  Watch,
  Footprints,
  Gift,
  Gem,
  Laptop,
  Home,
  Heart,
  Zap,
  Tag,
  UtensilsCrossed,
  Pizza,
  Salad,
  IceCream,
  Coffee,
  ChefHat,
} from "lucide-react";

const CategoryNavigation: React.FC = () => {
  const { currentCategory, handleCategoryChange, categories, loading } = useShopping();

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      // Fashion categories
      "Clothing": Shirt,
      "Bags": ShoppingBag,
      "Watches": Watch,
      "Shoes": Footprints,
      "Gift": Gift,
      "Gifts": Gift,
      "Accessories": Gem,
      "Electronics": Laptop,
      "Home": Home,
      "Beauty": Heart,
      "Sports": Zap,
      // Food categories
      "Appetizers": UtensilsCrossed,
      "Entrees": ChefHat,
      "Side Dishes": Salad,
      "Side": Salad,
      "Desserts": IceCream,
      "Beverages": Coffee,
      "Pizza": Pizza,
    };
    return iconMap[category] || Tag;
  };

  const formatCategoryLabel = (category: string) => {
    // Format category names for display
    const labelMap: { [key: string]: string } = {
      "Clothing": "Clothing & Fashion",
      "Bags": "Bags & Handbags",
      "Shoes": "Shoes & Footwear"
    };
    return labelMap[category] || category;
  };

  // Remove loading check to keep category navigation interactive during product loading

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-6 h-20">
      <div className="flex items-center gap-3 px-4 py-2 h-full overflow-x-auto scrollbar-hide scroll-smooth">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 whitespace-nowrap min-w-fit ${
              currentCategory === category
                ? "bg-white/20 text-white border border-white/30"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
            role="button"
          >
            {React.createElement(getCategoryIcon(category), {
              className: "w-5 h-5"
            })}
            <span className="text-base font-large">
              {formatCategoryLabel(category).split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;
