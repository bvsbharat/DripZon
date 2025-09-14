import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { CartModalRef } from "../components/CartModal";
import { Product } from "./products";
import { useProducts } from "../hooks/useProducts";
import { Restaurant } from '../data/restaurants';

type StoreMode = 'fashion' | 'food';

export interface CartItem extends Product {
  quantity: number;
}

export interface ModelImage {
  id: string;
  name: string;
  url: string;
  isCustom?: boolean;
}

interface GeneratedImage {
  id: string;
  url: string;
  productName: string;
  productId: string;
  productImage: string;
  createdAt: string;
  modelUsed: string;
  modelId: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  productName: string;
  productId: string;
  productImage: string;
  tryOnImage: string;
  createdAt: string;
  modelUsed: string;
  modelId: string;
  duration: number;
}

interface ShoppingContextType {
  // Store mode
  storeMode: StoreMode;
  setStoreMode: (mode: StoreMode) => void;
  
  // Restaurant state (for food mode)
  currentRestaurant: Restaurant | null;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  
  products: Product[];
  loading: boolean;
  error: string | null;
  categories: string[];
  cart: CartItem[];
  wishlist: Product[];
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  refetchProducts: () => void;
  searchProducts: (query: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getCartItemCount: () => number;
  getCurrentCartState: () => {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    isEmpty: boolean;
  };
  cartModalRef: React.RefObject<CartModalRef>;
  selectedProduct: Product | undefined;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | undefined>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  selectedImageIndex: number;
  setSelectedImageIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedModelId: string | null;
  setSelectedModelId: (modelId: string | null) => void;
  tryOnResult: string | null;
  isTryingOn: boolean;
  tryOnError: string | null;
  predictionId: string | null;
  tryOnStatus: string | null;
  tryOnProgress: number;
  isTransitioning: boolean;
  fadeDirection: string;
  isImageTransitioning: boolean;
  isProductDetailLoading: boolean;
  modelImages: ModelImage[];
  generatedImages: GeneratedImage[];
  generatedVideos: GeneratedVideo[];
  handleImageChange: (index: number) => void;
  handleCategoryChange: (categoryId: string) => void;
  smoothProductChange: (product: Product) => void;
  handleAddToCart: () => void;
  handleTryOnMe: () => Promise<void>;
  setTryOnResult: (result: string | null) => void;
  setIsTryingOn: (isTryingOn: boolean) => void;
  setTryOnError: (error: string | null) => void;
  setTryOnProgress: (progress: number) => void;
  addCustomPhoto?: (photo: ModelImage) => void;
  saveGeneratedImage: (imageUrl: string) => void;
  loadGeneratedImages: () => GeneratedImage[];
  deleteGeneratedImage: (imageId: string) => void;
  saveGeneratedVideo: (videoUrl: string) => void;
  loadGeneratedVideos: () => GeneratedVideo[];
  deleteGeneratedVideo: (videoId: string) => void;
  isCartModalOpen: boolean;
  setIsCartModalOpen: (isOpen: boolean) => void;
  openCartModal: () => void;
  closeCartModal: () => void;
  isPhotoModalOpen: boolean;
  setIsPhotoModalOpen: (isOpen: boolean) => void;
  openPhotoModal: () => void;
  closePhotoModal: () => void;
  // Video generation states
  videoResult: string | null;
  isGeneratingVideo: boolean;
  videoError: string | null;
  videoProgress: number;
  setVideoResult: (result: string | null) => void;
  setIsGeneratingVideo: (isGenerating: boolean) => void;
  setVideoError: (error: string | null) => void;
  setVideoProgress: (progress: number) => void;
  handleGenerateVideo: () => Promise<void>;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(
  undefined
);

const modelImages: ModelImage[] = [
  {
    id: "7",
    name: "Photo 7",
    url: "https://assetsimagesai.s3.us-east-1.amazonaws.com/model_pics/YEN_7671.JPG",
  },
  {
    id: "8",
    name: "Photo 8",
    url: "https://assetsimagesai.s3.us-east-1.amazonaws.com/model_pics/IMG_7514.JPG",
  },
  {
    id: "3",
    name: "Photo 3",
    url: "https://assetsimagesai.s3.us-east-1.amazonaws.com/supriya_final_images+/88c1bd2e-4679-428f-8045-17e8325526db.jpg",
  },
  {
    id: "4",
    name: "Photo 4",
    url: "https://assetsimagesai.s3.us-east-1.amazonaws.com/supriya_final_images+/IMG_20191214_102707.jpg",
  },
  {
    id: "5",
    name: "Photo 5",
    url: "https://assetsimagesai.s3.us-east-1.amazonaws.com/supriya_final_images+/5.jpg",
  },
  {
    id: "6",
    name: "Photo 6",
    url: "https://assetsimagesai.s3.us-east-1.amazonaws.com/supriya_final_images+/6.JPG",
  },
  {
    id: "2",
    name: "Photo 2",
    url: "https://assetsimagesai.s3.us-east-1.amazonaws.com/supriya_final_images+/2.JPG",
  },
  {
    id: "1",
    name: "Photo 1",
    url: "https://assetsimagesai.s3.us-east-1.amazonaws.com/supriya_final_images+/1.JPG",
  },
];

export const ShoppingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Store mode state
  const [storeMode, setStoreMode] = useState<StoreMode>('fashion');
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  
  // Use products hook for database integration
  const {
    products,
    loading,
    error,
    categories,
    fetchProductsByCategory,
    searchProducts: searchProductsDB,
    refetch: refetchProducts
  } = useProducts({ 
    storeMode, 
    restaurantId: currentRestaurant?.id 
  });

  // Initialize cart state without localStorage
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartRef = useRef<CartItem[]>([]);

  // Keep cartRef in sync with cart state
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState("Clothing");

  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [customPhotos, setCustomPhotos] = useState<ModelImage[]>([]);

  // selectedModelId is now managed purely in context state
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  // Cart Modal state
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const cartModalRef = useRef<CartModalRef>(null);

  // Photo Selection Modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Try On feature states
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [tryOnError, setTryOnError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [tryOnStatus, setTryOnStatus] = useState<string | null>(null);
  const [tryOnProgress, setTryOnProgress] = useState<number>(0);
  const pollingTimeoutRef = useRef<number | null>(null);

  // Video generation states
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Transition state to control smooth transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeDirection, setFadeDirection] = useState("out"); // "in" or "out"
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const [isProductDetailLoading, setIsProductDetailLoading] = useState(false);
  const nextImageIndexRef = useRef(selectedImageIndex);
  const nextProductRef = useRef(selectedProduct);

  // Set initial selected product when products are loaded
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      const categoryProduct = products.find((p) => p.category === currentCategory);
      setSelectedProduct(categoryProduct || products[0]);
    }
  }, [products, currentCategory, selectedProduct]);

  // Auto-select first product when category changes and products are loaded
  useEffect(() => {
    if (products.length > 0 && currentCategory) {
      const categoryProducts = products.filter((p) => p.category === currentCategory);
      if (categoryProducts.length > 0) {
        // Only update if we're in a loading state or if the current product doesn't belong to the new category
        if (isProductDetailLoading || !selectedProduct || selectedProduct.category !== currentCategory) {
          nextProductRef.current = categoryProducts[0];
          setSelectedImageIndex(0);
          
          // If we're in loading state, complete the transition with minimum duration
          if (isProductDetailLoading) {
            // Ensure minimum loading duration of 600ms for smooth animation
            const minLoadingDuration = 600;
            setTimeout(() => {
              setSelectedProduct(nextProductRef.current);
              setFadeDirection("in");
              setIsProductDetailLoading(false);
              
              setTimeout(() => {
                setIsTransitioning(false);
              }, 300);
            }, minLoadingDuration);
          } else {
            // Direct update if not in loading state
            setSelectedProduct(categoryProducts[0]);
          }
        }
      } else if (isProductDetailLoading) {
        // If no products found and we're loading, stop loading
        setTimeout(() => {
          setIsProductDetailLoading(false);
          setIsTransitioning(false);
        }, 300);
      }
    }
  }, [products, currentCategory, isProductDetailLoading, selectedProduct]);

  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    
    // Show loading in product detail section immediately
    setIsProductDetailLoading(true);
    setIsTransitioning(true);
    setFadeDirection("out");
    
    // Fetch products for the new category
    // The useEffect will handle product selection once products are loaded
    fetchProductsByCategory(categoryId);
  };

  // Add smooth transition when product changes without category change
  const smoothProductChange = (product: typeof selectedProduct) => {
    if (!product || !selectedProduct || product.id === selectedProduct.id) return;

    setIsTransitioning(true);
    setFadeDirection("out");
    nextProductRef.current = product;

    setTimeout(() => {
      setSelectedProduct(product);
      setFadeDirection("in");

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  const handleImageChange = (index: number) => {
    if (index === selectedImageIndex) return;

    setIsImageTransitioning(true);
    nextImageIndexRef.current = index;

    setTimeout(() => {
      setSelectedImageIndex(index);
      setTimeout(() => {
        setIsImageTransitioning(false);
      }, 300); // Fade in duration
    }, 300); // Fade out duration
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(selectedProduct);
    }
  };

  const clearPolling = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  const checkPredictionStatus = async (id: string) => {
    try {
      const apiKey = import.meta.env.VITE_FASHN_API_KEY;
      const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        console.error("API error, retrying...", response.status);
        // Retry after 5 seconds on server error
        pollingTimeoutRef.current = window.setTimeout(
          () => checkPredictionStatus(id),
          5000
        );
        return;
      }

      const data = await response.json();
      console.log("Status API Response:", data);
      setTryOnStatus(data.status || "unknown");

      switch (data.status) {
        case "completed":
          // Extract URL from the output array
          let resultUrl = data.output?.[0] || data.output;

          // Handle case where output contains backticks and URL
          if (typeof resultUrl === "string" && resultUrl.includes("`")) {
            // Extract URL from string like: ' `https://cdn.fashn.ai/...` '
            const urlMatch = resultUrl.match(/`([^`]+)`/);
            if (urlMatch && urlMatch[1]) {
              resultUrl = urlMatch[1].trim();
            }
          }

          console.log("Processed try-on result URL:", resultUrl);
          setTryOnProgress(100);
          setTryOnResult(resultUrl);

          // Save the generated image to localStorage
          if (resultUrl) {
            saveGeneratedImage(resultUrl);
          }

          setIsTryingOn(false);
          clearPolling();
          break;
        case "failed":
          setTryOnError(
            typeof data.error === "string"
              ? data.error
              : JSON.stringify(data.error) || "The prediction failed."
          );
          setTryOnProgress(0);
          setIsTryingOn(false);
          clearPolling();
          break;
        case "starting":
          setTryOnProgress(20);
          // Continue polling
          pollingTimeoutRef.current = window.setTimeout(
            () => checkPredictionStatus(id),
            3000
          );
          break;
        case "in_queue":
          setTryOnProgress(10);
          // Continue polling
          pollingTimeoutRef.current = window.setTimeout(
            () => checkPredictionStatus(id),
            3000
          );
          break;
        case "processing":
          setTryOnProgress(60);
          // Continue polling
          pollingTimeoutRef.current = window.setTimeout(
            () => checkPredictionStatus(id),
            3000
          );
          break;
        default:
          console.warn(`Unknown status: ${data.status}. Retrying...`);
          pollingTimeoutRef.current = window.setTimeout(
            () => checkPredictionStatus(id),
            5000
          );
          break;
      }
    } catch (error) {
      console.error("Error checking prediction status, retrying...", error);
      // Retry after 5 seconds on network error
      pollingTimeoutRef.current = window.setTimeout(
        () => checkPredictionStatus(id),
        5000
      );
    }
  };

  // Load generated images from localStorage on mount
  useEffect(() => {
    const storedImages = loadGeneratedImages();
    setGeneratedImages(storedImages);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("shopping-cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  // Clean up polling on component unmount
  useEffect(() => {
    return () => {
      clearPolling();
      clearVideoPolling();
    };
  }, []);

  const handleTryOnMe = async () => {
    console.log(
      "handleTryOnMe - selectedProduct from state:",
      selectedProduct?.name
    );

    if (!selectedProduct) {
      console.log("No selectedProduct found, cannot proceed with try-on");
      return;
    }
    // Reset state for a new request
    setIsTryingOn(true);
    setTryOnError(null);
    setTryOnResult(null);
    setTryOnStatus("Initializing...");
    setTryOnProgress(0);
    setPredictionId(null);
    clearPolling(); // Ensure no previous polling is running

    try {
      const apiKey = import.meta.env.VITE_FASHN_API_KEY;
      if (!apiKey) {
        setTryOnError("API key is not set.");
        setIsTryingOn(false);
        return;
      }

      // Get the selected model image URL
      const getSelectedModelImage = () => {
        console.log(
          "handleTryOnMe - selectedModelId from state:",
          selectedModelId
        );

        if (!selectedModelId) {
          console.log("No selectedModelId found, using default image");
          // Default model image if no model is selected
          return "https://media.istockphoto.com/id/907261794/photo/handsome-man.jpg?s=612x612&w=0&k=20&c=31YyQlon3lBpv7izm6h05HdwZXNiQKRX6_lkFQcTPRY=";
        }

        // Find the model image from the centralized modelImages array
        const selectedModel = modelImages.find(
          (model) => model.id === selectedModelId
        );

        console.log("handleTryOnMe - found selectedModel:", selectedModel);
        console.log(
          "handleTryOnMe - using model image URL:",
          selectedModel?.url || modelImages[0]?.url
        );

        return selectedModel?.url || modelImages[0]?.url; // Fallback to first model
      };

      const requestBody = {
        model_name: "tryon-v1.6",
        inputs: {
          model_image: await convertImageToBase64(getSelectedModelImage()),
          garment_image: await convertImageToBase64(selectedProduct.image),
        },
      };

      console.log(
        "handleTryOnMe - API request using product:",
        selectedProduct.name
      );
      console.log(
        "handleTryOnMe - API request using garment image:",
        selectedProduct.image
      );

      // Helper function to convert image URL to base64
      async function convertImageToBase64(imageUrl: string): Promise<string> {
        // For S3 URLs, return the URL directly since the API can handle URLs
        if (imageUrl.includes("s3.")) {
          return imageUrl;
        }

        try {
          const response = await fetch(imageUrl, {
            mode: "cors",
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }

          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Error converting image to base64:", error);
          // Return the URL directly as fallback if fetch fails
          return imageUrl;
        }
      }

      const response = await fetch("https://api.fashn.ai/v1/run", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "image/png", // Changed from image/png to application/json since we're sending JSON data
        },
      });

      const data = await response.json();
      console.log("Initial API Response:", data);

      if (response.ok && data.id) {
        setPredictionId(data.id);
        setTryOnStatus("starting");
        // Kick off the polling
        checkPredictionStatus(data.id);
      } else {
        setTryOnError(data.error || "Failed to start prediction.");
        setIsTryingOn(false);
      }
    } catch (error) {
      console.error("Try on error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setTryOnError(errorMessage);
      setIsTryingOn(false);
    }
  };

  // Search products wrapper
  const searchProducts = useCallback((query: string) => {
    searchProductsDB(query);
  }, [searchProductsDB]);

  const addToCart = (product: Product) => {
    if (!product) {
      console.error("Cannot add undefined product to cart");
      return;
    }
    console.log("Adding product to cart:", product.name, product.id);
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }
      console.log("Updated cart:", newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    console.log("Removing product from cart:", productId);
    setCart((prev) => {
      const newCart = prev.filter((item) => item.id !== productId);
      console.log("Updated cart after removal:", newCart);
      return newCart;
    });
  };

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    console.log("Clearing cart");
    setCart([]);
  };

  const getTotalPrice = useCallback(() => {
    return cartRef.current.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cartRef.current.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Function to get current cart state - useful for voice agent
  // Using ref to ensure we always get the most current cart state
  const getCurrentCartState = useCallback(() => {
    const currentCart = cartRef.current;
    const currentTotalItems = currentCart.reduce((total, item) => total + item.quantity, 0);
    const currentTotalPrice = currentCart.reduce((total, item) => total + item.price * item.quantity, 0);
    
    return {
      items: currentCart,
      totalItems: currentTotalItems,
      totalPrice: currentTotalPrice,
      isEmpty: currentCart.length === 0
    };
  }, [cart]); // Keep cart as dependency to trigger re-creation when cart changes

  const addCustomPhoto = (photo: ModelImage) => {
    setCustomPhotos((prev) => [...prev, photo]);
  };

  const saveGeneratedImage = (imageUrl: string) => {
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: imageUrl,
      productName: selectedProduct?.name || "Unknown Product",
      productId: selectedProduct?.id || "unknown",
      productImage: selectedProduct?.image || "",
      createdAt: new Date().toISOString(),
      modelUsed: selectedModelId ? `Model ${selectedModelId}` : "Default Model",
      modelId: selectedModelId || "default",
    };

    setGeneratedImages((prev) => [newImage, ...prev]);
  };

  const loadGeneratedImages = (): GeneratedImage[] => {
    return generatedImages;
  };

  const deleteGeneratedImage = (imageId: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const saveGeneratedVideo = (videoUrl: string) => {
    const newVideo: GeneratedVideo = {
      id: Date.now().toString(),
      url: videoUrl,
      productName: selectedProduct?.name || "Unknown Product",
      productId: selectedProduct?.id || "unknown",
      productImage: selectedProduct?.image || "",
      tryOnImage: tryOnResult || "",
      createdAt: new Date().toISOString(),
      modelUsed: "MiniMax Hailuo",
      modelId: selectedModelId || "default",
      duration: 6
    };
    setGeneratedVideos(prev => [newVideo, ...prev]);
  };

  const loadGeneratedVideos = (): GeneratedVideo[] => {
    return generatedVideos;
  };

  const deleteGeneratedVideo = (videoId: string) => {
    setGeneratedVideos((prev) => prev.filter((video) => video.id !== videoId));
  };

  // Cart Modal functions
  const openCartModal = () => {
    setIsCartModalOpen(true);
  };

  const closeCartModal = () => {
    setIsCartModalOpen(false);
  };

  // Photo Modal functions
  const openPhotoModal = () => {
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
  };

  // Video generation polling timeout ref
  const videoPollingTimeoutRef = useRef<number | null>(null);

  // Clear video polling
  const clearVideoPolling = () => {
    if (videoPollingTimeoutRef.current) {
      clearTimeout(videoPollingTimeoutRef.current);
      videoPollingTimeoutRef.current = null;
    }
  };

  // Query video generation status
  const queryVideoGeneration = async (taskId: string) => {
    try {
      const apiKey = import.meta.env.VITE_MINIMAX_API_KEY;
      if (!apiKey) {
        throw new Error('MiniMax API key not found in environment variables');
      }

      const response = await fetch(`https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        console.error('Video status API error, retrying...', response.status);
        // Retry after 10 seconds on server error
        videoPollingTimeoutRef.current = window.setTimeout(
          () => queryVideoGeneration(taskId),
          10000
        );
        return;
      }

      const data = await response.json();
      console.log('Video Status API Response:', data);
      
      const status = data.status;
      
      switch (status) {
        case 'Preparing':
          setVideoProgress(20);
          console.log('...Preparing...');
          videoPollingTimeoutRef.current = window.setTimeout(
            () => queryVideoGeneration(taskId),
            10000
          );
          break;
        case 'Queueing':
          setVideoProgress(30);
          console.log('...In the queue...');
          videoPollingTimeoutRef.current = window.setTimeout(
            () => queryVideoGeneration(taskId),
            10000
          );
          break;
        case 'Processing':
          setVideoProgress(60);
          console.log('...Generating...');
          videoPollingTimeoutRef.current = window.setTimeout(
            () => queryVideoGeneration(taskId),
            10000
          );
          break;
        case 'Success':
          const fileId = data.file_id;
          if (fileId) {
            await fetchVideoResult(fileId);
          } else {
            throw new Error('No file_id returned from successful generation');
          }
          break;
        case 'Fail':
          setVideoError('Video generation failed');
          setIsGeneratingVideo(false);
          clearVideoPolling();
          break;
        default:
          console.warn(`Unknown video status: ${status}. Retrying...`);
          videoPollingTimeoutRef.current = window.setTimeout(
            () => queryVideoGeneration(taskId),
            10000
          );
          break;
      }
    } catch (error) {
      console.error('Error checking video generation status, retrying...', error);
      videoPollingTimeoutRef.current = window.setTimeout(
        () => queryVideoGeneration(taskId),
        10000
      );
    }
  };

  // Fetch video result
  const fetchVideoResult = async (fileId: string) => {
    try {
      const apiKey = import.meta.env.VITE_MINIMAX_API_KEY;
      if (!apiKey) {
        throw new Error('MiniMax API key not found in environment variables');
      }

      setVideoProgress(80);
      console.log('Video generated successfully, fetching download URL...');
      
      const response = await fetch(`https://api.minimax.io/v1/files/retrieve?file_id=${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video result: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Video fetch response:', data);
      
      const downloadUrl = data.file?.download_url;
      if (downloadUrl) {
        setVideoResult(downloadUrl);
        setVideoProgress(100);
        
        // Save the generated video
        saveGeneratedVideo(downloadUrl);
        
        console.log('Video download URL:', downloadUrl);
      } else {
        throw new Error('No download URL returned from API');
      }
    } catch (error) {
      console.error('Error fetching video result:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch video result';
      setVideoError(errorMessage);
    } finally {
      setIsGeneratingVideo(false);
      clearVideoPolling();
    }
  };

  // Video generation function
  const handleGenerateVideo = async () => {
    if (!tryOnResult) {
      setVideoError("No try-on result available for video generation");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoError(null);
    setVideoResult(null);
    setVideoProgress(0);
    clearVideoPolling(); // Ensure no previous polling is running

    try {
      const apiKey = import.meta.env.VITE_MINIMAX_API_KEY;
      if (!apiKey) {
        throw new Error('MiniMax API key not found in environment variables');
      }

      // Convert try-on result image to base64
       const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
         const response = await fetch(imageUrl);
         const blob = await response.blob();
         return new Promise((resolve, reject) => {
           const reader = new FileReader();
           reader.onloadend = () => {
             const base64String = reader.result as string;
             resolve(base64String);
           };
           reader.onerror = reject;
           reader.readAsDataURL(blob);
         });
       };

       const imageBase64 = await convertImageToBase64(tryOnResult);

       // Submit video generation task
       console.log('Submitting video generation task...');
       const requestBody = {
         model: "MiniMax-Hailuo-02",
         prompt: `A person wearing ${selectedProduct?.name || 'fashionable clothing'} in a stylish pose, moving naturally and confidently, showing off the outfit with smooth, elegant movements`,
         first_frame_image: imageBase64,
         duration: 6,
         resolution: "1080P"
       };

      setVideoProgress(10);

      const response = await fetch('https://api.minimax.io/v1/video_generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Video generation submission failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Video generation response:', data);
      
      if (data.base_resp?.status_code === 0 && data.task_id) {
        const taskId = data.task_id;
        console.log('Video generation task submitted successfully, task ID:', taskId);
        
        // Start polling for status
        queryVideoGeneration(taskId);
      } else {
        throw new Error(data.base_resp?.status_msg || 'Failed to submit video generation task');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate video';
      setVideoError(errorMessage);
      setIsGeneratingVideo(false);
      clearVideoPolling();
    }
  };

  // Combine default model images with custom photos
  const allModelImages = [...modelImages, ...customPhotos];

  return (
    <ShoppingContext.Provider
      value={{
        // Store mode
        storeMode,
        setStoreMode,
        
        // Restaurant state
        currentRestaurant,
        setCurrentRestaurant,
        
        products,
        loading,
        error,
        categories,
        cart,
        wishlist,
        currentCategory,
        setCurrentCategory,
        refetchProducts,
        searchProducts,
        addToCart,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        clearCart,
        getTotalPrice,
        getCartItemCount,
        getCurrentCartState,
        cartModalRef,
        selectedProduct,
        setSelectedProduct,
        quantity,
        setQuantity,
        selectedImageIndex,
        setSelectedImageIndex,
        selectedModelId,
        setSelectedModelId,
        tryOnResult,
        isTryingOn,
        tryOnError,
        predictionId,
        tryOnStatus,
        tryOnProgress,
        isTransitioning,
        fadeDirection,
        isImageTransitioning,
        isProductDetailLoading,
        modelImages: allModelImages,
        generatedImages,
        generatedVideos,
        handleImageChange,
        handleCategoryChange,
        smoothProductChange,
        handleAddToCart,
        handleTryOnMe,
        setTryOnResult,
        setIsTryingOn,
        setTryOnError,
        setTryOnProgress,
        addCustomPhoto,
        saveGeneratedImage,
        loadGeneratedImages,
        deleteGeneratedImage,
        saveGeneratedVideo,
        loadGeneratedVideos,
        deleteGeneratedVideo,
        isCartModalOpen,
        setIsCartModalOpen,
        openCartModal,
        closeCartModal,
        isPhotoModalOpen,
        setIsPhotoModalOpen,
        openPhotoModal,
        closePhotoModal,
        // Video generation
        videoResult,
        isGeneratingVideo,
        videoError,
        videoProgress,
        setVideoResult,
        setIsGeneratingVideo,
        setVideoError,
        setVideoProgress,
        handleGenerateVideo,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error("useShopping must be used within a ShoppingProvider");
  }
  return context;
};
