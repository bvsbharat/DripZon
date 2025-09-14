import React, { useState, useCallback, useEffect, useRef } from "react";
import { Video, Phone } from "lucide-react";
import { useConversation } from "@elevenlabs/react";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import TavusVideoAgent from "./TavusVideoAgent";
import { useShopping } from "../contexts/ShoppingContext";
import { restaurants, getAllRestaurantCategories } from "../data/restaurants";
import { memoryService, MemoryMessage } from "../services/memoryService";

type InteractionMode = "choice" | "voice" | "video";

const RiyaInteractionHub: React.FC = () => {
  const [mode, setMode] = useState<InteractionMode>("choice");

  // Helper function to get or create a consistent user ID for memory operations
  const getUserId = useCallback(() => {
    return "nanu";
  }, []);

  // Fetch initial memory about the user for personalized introduction
  const fetchInitialMemory = useCallback(async () => {
    try {
      const userId = getUserId();
      const searchQuery = "user preferences shopping history food fashion";

      const memories = await memoryService.searchMemories(searchQuery, userId);

      if (memories && memories.length > 0) {
        // Extract user preferences and context from memories
        const userContext = {
          hasHistory: true,
          preferences: memories,
          memoryCount: memories.length,
        };

        console.log("Initial user memory context:", userContext);
        return userContext;
      }

      return {
        hasHistory: false,
        preferences: "",
        lastInteraction: null,
        memoryCount: 0,
      };
    } catch (error) {
      console.error("Error fetching initial memory:", error);
      return {
        hasHistory: false,
        preferences: "",
        lastInteraction: null,
        memoryCount: 0,
      };
    }
  }, [getUserId]);

  // Effect to fetch initial memory when component mounts
  useEffect(() => {
    fetchInitialMemory();
    console.log("intial memory");
  }, []);
  const {
    products,
    setSelectedProduct,
    addToCart,
    selectedProduct,
    setCurrentCategory,
    cart,
    clearCart,
    openCartModal,
    closeCartModal,
    cartModalRef,
    handleTryOnMe,
    selectedModelId,
    openPhotoModal,
    getCurrentCartState,
    storeMode,
    setStoreMode,
    currentRestaurant,
    setCurrentRestaurant,
    categories,
  } = useShopping();

  // Debug: Log selectedModelId on every render
  console.log("RiyaInteractionHub: Current selectedModelId:", selectedModelId);
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

  // Create refs to avoid stale closure issues
  const storeModeRef = useRef(storeMode);
  const currentRestaurantRef = useRef(currentRestaurant);
  const productsRef = useRef(products);

  // Update refs when state changes
  useEffect(() => {
    storeModeRef.current = storeMode;
  }, [storeMode]);

  useEffect(() => {
    currentRestaurantRef.current = currentRestaurant;
  }, [currentRestaurant]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Create clientTools with useCallback to avoid stale closures
  const clientTools = useCallback(
    () => ({
      search_products: async (query: { type: { productID: string } }) => {
        // Use refs to get latest state values
        const currentStoreMode = storeModeRef.current;
        const currentProducts = productsRef.current;
        const currentRestaurantValue = currentRestaurantRef.current;

        // Log the raw query to avoid console display issues with object mutation
        console.log("from search_products:", JSON.stringify(query, null, 2));
        console.log("Current store mode (from ref):", currentStoreMode);
        console.log("Available products count:", currentProducts.length);
        console.log(
          "Available product IDs:",
          currentProducts.map((p) => p.id)
        );

        const productID = query?.type?.productID;
        console.log(
          `Extracted productID: ${productID} (type: ${typeof productID})`
        );

        // Check if productID is null or undefined, which is safer than !productID
        if (productID == null) {
          const itemType =
            currentStoreMode === "food" ? "menu items" : "products";
          return `I'm sorry, I couldn't find any ${itemType} matching "".`;
        }

        // Ensure we are comparing strings, as product.id is a string
        const productIDString = String(productID);
        console.log("Looking for product with ID:", productIDString);

        // Check if this is a food product ID and auto-switch to food mode if needed
        const foodProductPrefixes = ["des-", "app-", "main-", "bev-", "drink-"];
        const isFoodProduct = foodProductPrefixes.some((prefix) =>
          productIDString.toLowerCase().startsWith(prefix)
        );

        console.log("Is food product:", isFoodProduct);
        console.log("Current store mode (from ref):", currentStoreMode);

        // Auto-switch to food mode if searching for food product while in fashion mode
        if (isFoodProduct && currentStoreMode === "fashion") {
          console.log("Auto-switching to food mode for food product search");
          setStoreMode("food");
          if (!currentRestaurantValue) {
            setCurrentRestaurant(restaurants[0]);
          }
        }

        const foundProduct = currentProducts.find(
          (product) => product.id.toString() === productIDString
        );
        console.log("Found product:", foundProduct);

        if (foundProduct) {
          setSelectedProduct(foundProduct);
          setCurrentCategory(foundProduct.category);
          const itemType =
            currentStoreMode === "food" || isFoodProduct
              ? "menu item"
              : "product";
          return `I found the ${foundProduct.name}. I've put this ${itemType} on the screen for you.`;
        } else {
          const itemType =
            currentStoreMode === "food" || isFoodProduct
              ? "menu item"
              : "product";
          const availableIds = currentProducts.map((p) => p.id).join(", ");
          return `I'm sorry, I couldn't find any ${itemType} matching "${productIDString}". Available IDs: ${
            availableIds || "none"
          }.`;
        }
      },
      add_to_cart: async (query: {
        productId?: string;
        type?: { ProductID: string };
      }) => {
        // Use refs to get latest state values
        const currentStoreMode = storeModeRef.current;
        const currentProducts = productsRef.current;
        const currentRestaurantValue = currentRestaurantRef.current;

        console.log("from add_to_cart:", JSON.stringify(query, null, 2));
        console.log("Current store mode (from ref):", currentStoreMode);
        console.log("Available products count:", currentProducts.length);
        console.log(
          "Available product IDs:",
          currentProducts.map((p) => p.id)
        );

        // Handle both productId and type.ProductID formats
        const productId = query.productId || query.type?.ProductID;
        console.log("Extracted productId:", productId);

        const addProducttomem = (product: any) => {
          const mem: MemoryMessage[] = [
            {
              content: `user added a product to cart ${product.name}`,
              role: "assistant",
            },
          ];

          memoryService.addMemory(mem, "nanu");
        };

        if (productId) {
          // Find product by ID
          // Convert productId to string since our product IDs are strings
          const productIdString = String(productId);
          console.log("Looking for product with ID:", productIdString);

          // Check if this is a food product ID and auto-switch to food mode if needed
          const foodProductPrefixes = [
            "des-",
            "app-",
            "main-",
            "bev-",
            "drink-",
          ];
          const isFoodProduct = foodProductPrefixes.some((prefix) =>
            productIdString.toLowerCase().startsWith(prefix)
          );

          console.log("Is food product:", isFoodProduct);
          console.log("Current store mode (from ref):", currentStoreMode);

          // Auto-switch to food mode if adding food product while in fashion mode
          if (isFoodProduct && currentStoreMode === "fashion") {
            console.log(
              "Auto-switching to food mode for food product add to cart"
            );
            setStoreMode("food");
            if (!currentRestaurantValue) {
              setCurrentRestaurant(restaurants[0]);
            }
          }

          const productToAdd = currentProducts.find(
            (p) => p.id === productIdString
          );
          console.log("Found product:", productToAdd);

          if (productToAdd) {
            addToCart(productToAdd);
            addProducttomem(productToAdd);
            const itemType =
              currentStoreMode === "food" || isFoodProduct
                ? "menu item"
                : "product";
            return `I've added the ${productToAdd.name} to your cart for $${productToAdd.price}. This ${itemType} has been successfully added!`;
          } else {
            // Enhanced error message with debugging info
            const availableIds = currentProducts.map((p) => p.id).join(", ");
            const itemType =
              currentStoreMode === "food" || isFoodProduct
                ? "menu item"
                : "product";
            return `I'm sorry, I couldn't find that ${itemType} to add to your cart. Looking for ID: ${productIdString}. Available IDs: ${
              availableIds || "none"
            }.`;
          }
        } else if (selectedProduct) {
          // Use currently selected product
          console.log("Using selected product:", selectedProduct);
          addToCart(selectedProduct);
          addProducttomem(selectedProduct);
          const itemType =
            currentStoreMode === "food" ? "menu item" : "product";
          return `I've added the ${selectedProduct.name} to your cart for $${selectedProduct.price}. This ${itemType} has been successfully added!`;
        } else {
          const itemType =
            currentStoreMode === "food" ? "menu item" : "product";
          return `I'm sorry, please select a ${itemType} first or specify which ${itemType} you'd like to add to your cart.`;
        }
      },
      switch_category: async (query: {
        category?: string;
        type?: { category: string };
        "type "?: { category: string };
        categoryName?: string;
      }) => {
        // Use refs to get latest state values
        const currentStoreMode = storeModeRef.current;
        const currentRestaurantValue = currentRestaurantRef.current;

        console.log("from switch_category:", JSON.stringify(query, null, 2));
        console.log("Current store mode (from ref):", currentStoreMode);
        console.log("Current restaurant:", currentRestaurantValue?.name);

        // Get available categories based on current store mode
        const foodCategories = getAllRestaurantCategories();
        const fashionCategories = ["Clothing", "Bags", "Watches", "Shoes"];

        console.log(
          "Food categories from getAllRestaurantCategories():",
          foodCategories
        );
        console.log("Fashion categories:", fashionCategories);

        const availableCategories =
          currentStoreMode === "food" ? foodCategories : fashionCategories;

        // Handle multiple possible parameter formats - prioritize direct category parameter
        const categoryName =
          query.category ||
          query.type?.category ||
          query["type"]?.category ||
          query.categoryName;

        console.log("Final available categories:", availableCategories);
        console.log("Raw query object:", query);
        console.log("Extracted categoryName:", categoryName);
        console.log(
          "Store mode check - currentStoreMode === 'food':",
          currentStoreMode === "food"
        );

        if (!categoryName) {
          return `I'm sorry, I need a category name to switch to. Available categories are: ${availableCategories.join(
            ", "
          )}.`;
        }

        // Check if user is requesting a food category while in fashion mode
        const foodCategoryKeywords = [
          "dessert",
          "desserts",
          "appetizer",
          "appetizers",
          "main",
          "mains",
          "entree",
          "entrees",
          "beverage",
          "beverages",
          "drink",
          "drinks",
        ];
        const categoryLower = categoryName.toLowerCase().trim();

        const isFoodCategoryRequest = foodCategoryKeywords.some(
          (keyword) =>
            categoryLower.includes(keyword) || keyword.includes(categoryLower)
        );

        console.log("Is food category request:", isFoodCategoryRequest);
        console.log("Current store mode (from ref):", currentStoreMode);

        // Auto-switch to food mode if requesting food category while in fashion mode
        if (isFoodCategoryRequest && currentStoreMode === "fashion") {
          console.log("Auto-switching to food mode for food category request");
          setStoreMode("food");
          if (!currentRestaurantValue) {
            setCurrentRestaurant(restaurants[0]);
          }
          // Update available categories to food categories
          const updatedAvailableCategories = getAllRestaurantCategories();
          console.log(
            "Updated available categories after mode switch:",
            updatedAvailableCategories
          );
        }

        // Re-get available categories after potential mode switch
        const finalAvailableCategories =
          currentStoreMode === "food" || isFoodCategoryRequest
            ? getAllRestaurantCategories()
            : fashionCategories;
        console.log("Final categories for matching:", finalAvailableCategories);

        // Find matching category (fuzzy search with better matching)

        // First try exact match
        let matchedCategory = finalAvailableCategories.find(
          (cat) => cat.toLowerCase() === categoryLower
        );

        // Then try partial match
        if (!matchedCategory) {
          matchedCategory = finalAvailableCategories.find(
            (cat) =>
              cat.toLowerCase().includes(categoryLower) ||
              categoryLower.includes(cat.toLowerCase())
          );
        }

        // Try fuzzy matching for common variations
        if (!matchedCategory) {
          const categoryMappings: { [key: string]: string } = {
            // Fashion categories - handle lowercase inputs from new configuration
            clothing: "Clothing",
            clothes: "Clothing",
            shirts: "Clothing",
            pants: "Clothing",
            dress: "Clothing",
            bags: "Bags",
            bag: "Bags",
            purse: "Bags",
            handbag: "Bags",
            watches: "Watches",
            watch: "Watches",
            shoes: "Shoes",
            shoe: "Shoes",
            sneakers: "Shoes",
            boots: "Shoes",
            // Food categories
            appetizer: "Appetizers",
            appetizers: "Appetizers",
            starter: "Appetizers",
            starters: "Appetizers",
            main: "Main Course",
            mains: "Main Course",
            entree: "Main Course",
            entrees: "Main Course",
            dessert: "Desserts",
            desserts: "Desserts",
            sweet: "Desserts",
            sweets: "Desserts",
            drink: "Beverages",
            drinks: "Beverages",
            beverage: "Beverages",
            beverages: "Beverages",
          };

          matchedCategory = categoryMappings[categoryLower];
          if (
            matchedCategory &&
            !finalAvailableCategories.includes(matchedCategory)
          ) {
            matchedCategory = undefined;
          }
        }

        if (matchedCategory) {
          setCurrentCategory(matchedCategory);

          // Filter products by category and set first as selected
          const categoryProducts = products.filter(
            (p) => p.category === matchedCategory
          );
          if (categoryProducts.length > 0) {
            setSelectedProduct(categoryProducts[0]);
          }

          const storeType =
            currentStoreMode === "food" ? "menu item" : "product";
          return `I've switched to the ${matchedCategory} category and found ${
            categoryProducts.length
          } ${storeType}${categoryProducts.length !== 1 ? "s" : ""}. ${
            categoryProducts.length > 0
              ? `I've selected the ${categoryProducts[0].name} for you to view.`
              : ""
          }`;
        } else {
          return `I'm sorry, I couldn't find the "${categoryName}" category. Available categories are: ${finalAvailableCategories.join(
            ", "
          )}. Please try one of these categories.`;
        }
      },
      show_kart: async () => {
        console.log("from show_kart: Opening cart modal");

        // Get current cart state for accurate information
        const currentCartState = getCurrentCartState();
        console.log(
          "Current cart state from getCurrentCartState:",
          currentCartState
        );
        console.log("Type of currentCartState:", typeof currentCartState);
        console.log("currentCartState.isEmpty:", currentCartState.isEmpty);
        console.log(
          "currentCartState.totalItems:",
          currentCartState.totalItems
        );

        // Trigger the cart modal to open
        openCartModal();

        if (currentCartState.isEmpty) {
          return "I've opened your cart. It's currently empty. Would you like me to help you find some products?";
        }

        return `I've opened your cart for you. You have ${
          currentCartState.totalItems
        } items totaling $${currentCartState.totalPrice.toFixed(2)}.`;
      },
      trigger_checkout: async () => {
        console.log("from trigger_checkout: Processing checkout");

        // Get current cart state to check if cart is empty
        const currentCartState = getCurrentCartState();
        console.log("Cart state before checkout:", currentCartState);

        if (currentCartState.isEmpty) {
          return "Your cart is empty. Please add some items to your cart before checking out.";
        }

        // Trigger the cart modal to open
        openCartModal();

        // Wait a moment for the modal to render
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Use the cartModalRef to trigger the checkout button
        if (cartModalRef.current) {
          const result = await cartModalRef.current.triggerCheckout();
          return result;
        } else {
          return "Cart modal is not available. Please try again.";
        }
      },
      switch_store_mode: async (query: {
        type?: { mode: string };
        mode?: string;
      }) => {
        console.log("from switch_store_mode:", JSON.stringify(query, null, 2));

        const mode = query.type?.mode || query.mode;

        if (!mode) {
          return "I'm sorry, I need to know which store mode you'd like to switch to. You can say 'fashion' or 'food'.";
        }

        const normalizedMode = mode.toLowerCase();

        if (
          normalizedMode.includes("fashion") ||
          normalizedMode.includes("clothing")
        ) {
          setStoreMode("fashion");
          setCurrentRestaurant(null);
          setCurrentCategory("Clothing");
          return "I've switched to fashion mode. You can now browse clothing, bags, watches, and shoes. What would you like to see?";
        } else if (
          normalizedMode.includes("food") ||
          normalizedMode.includes("restaurant") ||
          normalizedMode.includes("delivery")
        ) {
          setStoreMode("food");
          if (!currentRestaurant) {
            setCurrentRestaurant(restaurants[0]);
          }
          setCurrentCategory("Appetizers");
          return `I've switched to food delivery mode. ${
            currentRestaurant
              ? `You're currently viewing ${currentRestaurant.name}.`
              : "Please select a restaurant."
          } What would you like to order?`;
        } else {
          return "I'm sorry, I can only switch between 'fashion' and 'food' modes. Which one would you like?";
        }
      },
      select_restaurant: async (query: {
        type?: { restaurantName: string };
        restaurantName?: string;
      }) => {
        console.log("from select_restaurant:", JSON.stringify(query, null, 2));

        if (storeMode !== "food") {
          return "Restaurant selection is only available in food mode. Would you like me to switch to food mode first?";
        }

        const restaurantName =
          query.type?.restaurantName || query.restaurantName;

        if (!restaurantName) {
          const restaurantList = restaurants.map((r) => r.name).join(", ");
          return `I'm sorry, I need to know which restaurant you'd like to select. Available restaurants are: ${restaurantList}.`;
        }

        // Find matching restaurant (fuzzy search)
        const matchedRestaurant = restaurants.find(
          (restaurant) =>
            restaurant.name
              .toLowerCase()
              .includes(restaurantName.toLowerCase()) ||
            restaurantName
              .toLowerCase()
              .includes(restaurant.name.toLowerCase()) ||
            restaurant.cuisine
              .toLowerCase()
              .includes(restaurantName.toLowerCase())
        );

        if (matchedRestaurant) {
          setCurrentRestaurant(matchedRestaurant);
          setCurrentCategory("Appetizers");
          setSelectedProduct(undefined);

          return `Great! I've selected ${matchedRestaurant.name}, a ${matchedRestaurant.cuisine} restaurant with a ${matchedRestaurant.rating} star rating and ${matchedRestaurant.deliveryTime} delivery time. What would you like to order?`;
        } else {
          const restaurantList = restaurants.map((r) => r.name).join(", ");
          return `I'm sorry, I couldn't find "${restaurantName}". Available restaurants are: ${restaurantList}.`;
        }
      },
      try_on_me: async () => {
        console.log("from try_on_me: Triggering try-on functionality");
        console.log(
          "try_on_me called - selectedProduct:",
          selectedProduct?.name,
          "selectedModelId:",
          selectedModelId
        );

        if (storeMode === "food") {
          return "I'm sorry, the virtual try-on feature is only available for fashion items. Please switch to fashion mode to use this feature.";
        }

        if (!selectedProduct) {
          return "Please select a product first before trying it on.";
        }

        // Check if the selected product is from clothing category
        if (selectedProduct.category !== "Clothing") {
          return "I'm sorry, the virtual try-on feature is only available for clothing items. Please select a clothing product to use this feature.";
        }

        if (!selectedModelId) {
          console.log("No selectedModelId found, opening photo modal");
          openPhotoModal();
          return "Please select a photo first. I've opened the photo selection modal for you.";
        }

        try {
          await handleTryOnMe();
          return `I'm starting the try-on process for the ${selectedProduct.name}. This may take a moment to generate your virtual try-on image.`;
        } catch (error) {
          console.error("Try-on error:", error);
          return "I'm sorry, there was an error starting the try-on process. Please make sure you have uploaded a photo and try again.";
        }
      },
      fetch_initial_memory: async () => {
        console.log("Fetching initial memory for user introduction...");

        try {
          const userContext = await fetchInitialMemory();

          // Create a personalized introduction based on memory
          let introduction =
            "Hello! I'm Riya, your personal shopping assistant. ";

          if (userContext.hasHistory) {
            introduction += `Welcome back! I remember our previous conversations. `;

            if (userContext.lastInteraction) {
              const lastDate = new Date(
                userContext.lastInteraction
              ).toLocaleDateString();
              introduction += `We last spoke on ${lastDate}. `;
            }

            introduction += `Based on your shopping history, I can help you find products that match your preferences. `;

            // Add context about current store state
            if (storeMode === "food") {
              introduction += `I see you're browsing our food section. Would you like me to suggest some dishes based on your previous orders?`;
            } else {
              introduction += `I see you're browsing our fashion section. Would you like me to recommend some items based on your style preferences?`;
            }
          } else {
            introduction += `I'm here to help you discover amazing ${
              storeMode === "food" ? "food" : "fashion"
            } options. `;
            introduction += `Feel free to ask me about products, get recommendations, or let me know what you're looking for today!`;
          }

          // Add current context information for logging
          const contextInfo = {
            storeMode,
            currentCategory: categories,
            selectedProduct: selectedProduct?.name,
            cartItems: cart.length,
            currentRestaurant: currentRestaurant?.name,
            userMemoryContext: userContext,
          };

          console.log("User introduction context:", contextInfo);

          // Return only the introduction string to match expected return type
          return introduction;
        } catch (error) {
          console.error("Error fetching initial memory:", error);
          return `Hello! I'm Riya, your personal shopping assistant. I'm here to help you discover amazing ${
            storeMode === "food" ? "food" : "fashion"
          } options. How can I assist you today?`;
        }
      },
      save_memory: async ({ query: saveQuery }: { query: string }) => {
        console.log("from save_memory:", saveQuery);

        if (!saveQuery) {
          return "I'm sorry, I need some information to save to memory.";
        }

        try {
          // Get consistent user ID for memory operations
          const userId = getUserId();

          // Add current context to the memory for better future recommendations
          const contextInfo = {
            storeMode,
            currentCategory: categories,
            selectedProduct: selectedProduct?.name,
            cartItems: cart.length,
            currentRestaurant: currentRestaurant?.name,
            timestamp: new Date().toISOString(),
          };

          // Create a comprehensive memory entry with context
          const memoryContent = `${saveQuery} [Context: ${JSON.stringify(
            contextInfo
          )}]`;

          // Prepare messages array with the information to remember
          const messages: Array<{
            role: "user" | "assistant";
            content: string;
          }> = [
            {
              role: "assistant",
              content: memoryContent,
            },
          ];

          console.log("Saving information to memory:", memoryContent);
          console.log("Context info:", contextInfo);

          // Save to memory service
          const result = await memoryService.addMemory(messages, userId);

          console.log(result, "result");
          return "I've saved this important information to memory for future personalized recommendations.";
        } catch (error) {
          console.error("Memory save error:", error);
          return "I had trouble saving this information to memory, but I'll continue to help you with your shopping!";
        }
      },
      search_memories: async ({ query: searchQuery }: { query: string }) => {
        console.log("from search_memories:", searchQuery);

        if (!searchQuery) {
          return "I'm sorry, I need a search query to look through your conversation history and memories.";
        }

        try {
          // Get consistent user ID for memory operations
          const userId = getUserId();

          // Search memories using the memory service
          const memories = await memoryService.searchMemories(
            searchQuery,
            userId,
            5
          );

          // Get current context for better recommendations
          const currentContext = {
            storeMode,
            currentCategory: categories,
            selectedProduct: selectedProduct?.name,
            cartItems: cart.length,
            currentRestaurant: currentRestaurant?.name,
          };

          console.log("Current context:", currentContext);
          console.log("Found memories:", memories);

          if (memories && memories.trim().length > 0) {
            // Combine memories with current context for personalized response
            let response = "Based on your previous interactions: " + memories;

            // Add current context information
            if (storeMode === "food" && currentRestaurant) {
              response += ` You're currently browsing ${currentRestaurant.name}.`;
            } else if (storeMode === "fashion") {
              response += " You're currently in fashion mode.";
            }

            if (selectedProduct) {
              response += ` You're currently viewing ${selectedProduct.name}.`;
            }

            if (cart.length > 0) {
              response += ` You have ${cart.length} items in your cart.`;
            }

            return response;
          } else {
            return "I don't have any previous conversation history about that topic, but I'm here to help you find what you're looking for!";
          }
        } catch (error) {
          console.error("Memory search error:", error);
          return "I'm having trouble accessing your conversation history right now, but I'm still here to help you with your shopping!";
        }
      },
      switch_store: async (query: {
        category?: string;
        type?: { category: string };
      }) => {
        console.log("from switch_store:", JSON.stringify(query, null, 2));

        const category = query.category || query.type?.category;

        if (!category) {
          return "I'm sorry, I need to know which store you'd like to switch to. You can say 'food' or 'fashion'.";
        }

        const normalizedCategory = category.toLowerCase();

        if (
          normalizedCategory.includes("food") ||
          normalizedCategory.includes("restaurant") ||
          normalizedCategory.includes("delivery") ||
          normalizedCategory.includes("eat")
        ) {
          setStoreMode("food");
          if (!currentRestaurant) {
            setCurrentRestaurant(restaurants[0]);
          }
          setCurrentCategory("Appetizers");
          setSelectedProduct(undefined);
          return `I've switched to the food store. ${
            currentRestaurant
              ? `You're currently viewing ${currentRestaurant.name}.`
              : "Please select a restaurant."
          } What would you like to order?`;
        } else if (
          normalizedCategory.includes("fashion") ||
          normalizedCategory.includes("clothing") ||
          normalizedCategory.includes("clothes") ||
          normalizedCategory.includes("wear")
        ) {
          setStoreMode("fashion");
          setCurrentRestaurant(null);
          setCurrentCategory("Clothing");
          setSelectedProduct(undefined);
          return "I've switched to the fashion store. You can now browse clothing, bags, watches, and shoes. What would you like to see?";
        } else {
          return "I'm sorry, I can only switch between 'food' and 'fashion' stores. Which one would you like?";
        }
      },
      cancel_checkout: async (query: { cancel?: boolean }) => {
        console.log("from cancel_checkout:", JSON.stringify(query, null, 2));

        const shouldCancel = query.cancel;

        if (shouldCancel) {
          // Get current cart state to check if cart is empty
          const currentCartState = getCurrentCartState();

          if (currentCartState.isEmpty) {
            return "Your cart is already empty. There's nothing to cancel.";
          }

          // Clear all items from cart using the clearCart function
          clearCart();

          // Close the cart modal if it's open
          closeCartModal();

          // Reset selected product
          setSelectedProduct(undefined);

          // Add memory about cancellation
          const mem: MemoryMessage[] = [
            {
              content: "user cancelled their order and cleared the cart",
              role: "assistant",
            },
          ];
          memoryService.addMemory(mem, "nanu");

          return "I've cancelled your order and cleared your cart. You can start fresh with a new selection. What would you like to browse?";
        } else {
          return "I understand you're considering cancelling. Would you like me to clear your cart and start over?";
        }
      },
    }),
    [
      products,
      setSelectedProduct,
      setCurrentCategory,
      addToCart,
      selectedProduct,
      getCurrentCartState,
      openCartModal,
      closeCartModal,
      cartModalRef,
      handleTryOnMe,
      selectedModelId,
      openPhotoModal,
      storeMode,
      setStoreMode,
      currentRestaurant,
      setCurrentRestaurant,
      restaurants,
      getAllRestaurantCategories,
      cart,
      categories,
      clearCart,
    ]
  );

  const conversation = useConversation({
    agentId: agentId || "agent_01jzaw4sr2fmpscr5zneha80bj",
    client: apiKey ? new ElevenLabsClient({ apiKey }) : undefined,
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    clientTools: clientTools(),
  });

  const handleModeSelect = (selectedMode: "voice" | "video") => {
    setMode(selectedMode);
  };

  const handleClose = () => {
    setMode("choice");
  };

  if (mode === "voice") {
    // return <RiyaVoiceAgent />;
  }

  // Video call mode - render within the same container
  if (mode === "video") {
    return (
      <div className="bg-black-500/10 backdrop-blur-xl rounded-3xl p-3 border border-blue-300/20 flex flex-col items-center text-center relative">
        {/* Voice Call Button - Disabled during video call */}
        <button
          disabled={true}
          className="absolute bottom-16 right-6 w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border z-50 bg-gray-500/50 border-gray-400/30 text-gray-400 cursor-not-allowed"
        >
          <Phone className="w-3 h-3" />
        </button>

        {/* Video Call Button - Red when active
        <button
          onClick={handleClose}
          className="absolute bottom-6 right-6 w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border z-50 bg-red-500/80 border-red-400/50 text-white hover:bg-red-600/80"
        >
         
        </button> */}

        {/* Tavus Video Call Container */}
        <div className="w-full h-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-300/30">
          <TavusVideoAgent autoStart={true} onClose={handleClose} />
        </div>

        {/* Status Text */}
        <div className="absolute bottom-8 left-0 right-0 text-center mt-2">
          {/* <p className="text-orange-500 font-medium text-sm mb-0 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
            Video Call Active
          </p> */}
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="bg-red-900/50 backdrop-blur-xl rounded-3xl p-6 border border-red-500/50 text-white text-center">
        <h3 className="font-semibold mb-2">Voice AI Disabled</h3>
        <p className="text-sm text-white/80">
          Please add your ElevenLabs API key to a `.env` file as
          `VITE_ELEVENLABS_API_KEY` to enable the voice assistant.
        </p>
      </div>
    );
  }

  // Default choice mode - preserve original orange video layout with minimal icon buttons
  return (
    <div className="bg-black-500/10 backdrop-blur-xl rounded-3xl p-3 border border-blue-300/20 flex flex-col items-center text-center relative">
      {/* Voice Call Button - Above Video Button */}
      <button
        onClick={() => {
          if (
            ["connected", "speaking", "listening"].includes(
              String(conversation.status)
            )
          ) {
            conversation.endSession();
          } else {
            conversation.startSession();
          }
        }}
        disabled={mode === "video"}
        className={`absolute bottom-16 right-6 w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border z-50 ${
          ["connected", "speaking", "listening"].includes(
            String(conversation.status)
          )
            ? "bg-red-500/80 border-red-400/50 text-white hover:bg-red-600/80"
            : mode === "video"
            ? "bg-gray-500/50 border-gray-400/30 text-gray-400 cursor-not-allowed"
            : "bg-black/20 border-white/20 text-white hover:border-white/30"
        }`}
      >
        <Phone className="w-3 h-3" />
      </button>
      {/* Video Call Button - Bottom Right */}
      <button
        onClick={() => handleModeSelect("video")}
        disabled={mode === "voice"}
        className={`absolute bottom-6 right-6 w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border z-50 ${
          mode === "voice"
            ? "bg-gray-500/50 border-gray-400/30 text-gray-400 cursor-not-allowed"
            : "bg-black/20 border-white/20 text-white hover:border-white/30"
        }`}
      ></button>
      <div className="w-full h-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-300/30">
        <video
          src="https://cdn.dribbble.com/userupload/15697531/file/original-0242acdc69146d4472fc5e69b48616dc.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      {/* Original Status Text */}
      <div className="absolute bottom-8 left-0 right-0 text-center mt-2">
        <p className="text-orange-500 font-medium text-sm mb-0 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
          {String(conversation.status) === "speaking"
            ? "speaking"
            : String(conversation.status) === "listening"
            ? "listening"
            : String(conversation.status) === "connected"
            ? "connected"
            : "Riya"}
        </p>
      </div>
    </div>
  );
};

export default RiyaInteractionHub;
