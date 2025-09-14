import React, { useState, useEffect } from "react";
import { Play, ArrowRight, LogIn, User, X } from "lucide-react";
import WallpaperSettings from "./WallpaperSettings";
import AuthModal from "./auth/AuthModal";
import UserProfile from "./UserProfile";
import FullscreenPrompt from "./FullscreenPrompt";
import { useWallpaper } from "../contexts/WallpaperContext";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";

// Color Thief for extracting dominant colors
interface ColorThief {
  getColor: (
    img: HTMLImageElement | HTMLVideoElement,
    quality?: number
  ) => [number, number, number];
  getPalette: (
    img: HTMLImageElement | HTMLVideoElement,
    colorCount?: number,
    quality?: number
  ) => [number, number, number][];
}

declare global {
  interface Window {
    ColorThief: new () => ColorThief;
  }
}

interface LandingPageProps {
  onComplete: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onComplete }) => {
  const { currentWallpaper } = useWallpaper();
  const { user, isAuthenticated } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDemoOverlay, setShowDemoOverlay] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [extractedColors, setExtractedColors] = useState<{
    [key: number]: {
      dominant: string;
      palette: string[];
    };
  }>({});

  const mediaItems = [
    {
      type: "video",
      src: "https://cdn.midjourney.com/video/50616673-2100-4c44-b989-b23f18cf67c1/0.mp4",
      theme: {
        primary: "#fbbf24", // Yellow from street fashion
        secondary: "#3b82f6", // Blue from denim
        accent: "#f59e0b",
        gradient: "from-yellow-400/30 via-blue-500/20 to-slate-700/25",
        contentBg: "from-slate-800/30 via-blue-900/20 to-yellow-900/15",
        textAccent: "text-yellow-400",
      },
    },
    {
      type: "video",
      src: "https://cdn.midjourney.com/video/6abfe078-eeba-4286-8ef0-007044bc2366/0.mp4",
      theme: {
        primary: "#ea580c", // Orange from soup/food
        secondary: "#92400e", // Brown tones
        accent: "#f97316",
        gradient: "from-orange-400/30 via-amber-600/20 to-orange-800/25",
        contentBg: "from-slate-800/30 via-orange-900/20 to-amber-900/15",
        textAccent: "text-orange-400",
      },
    },
    {
      type: "video",
      src: "https://cdn.midjourney.com/video/fbb34a5a-fa15-46d2-8d2a-00a711eb5abc/0.mp4",
      theme: {
        primary: "#0891b2", // Turquoise from ocean
        secondary: "#0369a1", // Deep blue
        accent: "#06b6d4",
        gradient: "from-cyan-400/30 via-blue-500/20 to-teal-700/25",
        contentBg: "from-slate-800/30 via-cyan-900/20 to-blue-900/15",
        textAccent: "text-cyan-400",
      },
    },
    {
      type: "video",
      src: "https://cdn.midjourney.com/video/ae40c75f-5c39-4a67-9e60-04164c8d6b84/0.mp4",
      theme: {
        primary: "#16a34a", // Green from perfume
        secondary: "#15803d", // Forest green
        accent: "#22c55e",
        gradient: "from-green-400/30 via-emerald-500/20 to-green-800/25",
        contentBg: "from-slate-800/30 via-green-900/20 to-emerald-900/15",
        textAccent: "text-green-400",
      },
    },
  ];

  useEffect(() => {
    // Animate content in after component mounts
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Extract colors from media items
  const extractColorsFromMedia = (
    element: HTMLImageElement | HTMLVideoElement,
    index: number
  ) => {
    if (typeof window !== "undefined" && window.ColorThief) {
      try {
        const colorThief = new window.ColorThief();
        const dominantColor = colorThief.getColor(element, 10);
        const palette = colorThief.getPalette(element, 5, 10);

        const dominantRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
        const paletteRgb = palette.map(
          (color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`
        );

        setExtractedColors((prev) => ({
          ...prev,
          [index]: {
            dominant: dominantRgb,
            palette: paletteRgb,
          },
        }));
      } catch (error) {
        console.log("Color extraction failed:", error);
      }
    }
  };

  // Handle seamless media transitions
  const handleMediaEnd = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
  };

  // Auto-advance for images after 5 seconds
  useEffect(() => {
    if (mediaItems[currentMediaIndex].type === "image") {
      const timer = setTimeout(() => {
        handleMediaEnd();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentMediaIndex, mediaItems]);

  // Redirect to dashboard when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Small delay to show the login success state
      const redirectTimer = setTimeout(() => {
        onComplete();
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, user, onComplete]);

  const handleUserClick = () => {
    if (isAuthenticated) {
      setIsProfileOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    // The useEffect above will handle the redirect
  };

  const handleEnterExperience = () => {
    // Always proceed to main app, regardless of authentication status
    onComplete();
  };

  const handleSignIn = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
      {/* Dynamic Background with Crystal Clear Tones */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: `url('${currentWallpaper}')`,
          backgroundAttachment: "fixed",
        }}
      />

      {/* Dynamic Gradient Overlays - Based on Current Media */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          mediaItems[currentMediaIndex]?.theme?.gradient ||
          "from-blue-400/20 via-amber-400/10 to-slate-700/15"
        } transition-all duration-1000`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-slate-600/10 transition-all duration-1000" />

      {/* Main Glass Container - Full Width */}
      <div
        className={`relative w-[90vw] h-[90vh] max-w-none transition-all duration-1000 ${
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Street Fashion Glass Container */}
        <div className="relative w-full h-full bg-slate-800/20 backdrop-blur-2xl border border-blue-300/30 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
          {/* Content Section - Dynamic Theme Aesthetic */}
          <div
            className={`w-full md:w-1/2 relative flex flex-col justify-center md:justify-center justify-end px-8 md:px-16 py-8 md:py-20 order-2 md:order-1 bg-gradient-to-br ${
              mediaItems[currentMediaIndex]?.theme?.contentBg ||
              "from-slate-800/40 via-blue-900/30 to-amber-900/25"
            } transition-all duration-1000`}
          >
            {/* Header with Menu */}
            <div className="fixed top-[45%] left-8 md:top-8 md:left-8 flex items-center gap-4 z-30 ">
              <Logo size="md" className="mb-25" />
            </div>

            {/* Success Message for Logged In Users */}
            {isAuthenticated && user && (
              <div className="absolute top-16 md:top-24 left-4 md:left-8 z-30">
                <div className="bg-amber-500/25 backdrop-blur-xl border border-amber-400/40 rounded-2xl px-4 py-2">
                  <p className="text-amber-100 text-sm font-medium">
                    welcome back, {user.name?.split(" ")[0]}! redirecting to
                    dashboard...
                  </p>
                </div>
              </div>
            )}

            {/* Main Content - Following Reference Style */}
            <div className="space-y-6 mt-8">
              <div
                className={`opacity-0 ${showContent ? "fade-in-up" : ""}`}
                style={{ animationDelay: "0.7s" }}
              >
                {/* Main Heading - Large Bold Text Like Reference */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[0.9] tracking-tight mb-8 drop-shadow-2xl">
                  What's your vibe today?
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        currentMediaIndex === 0
                          ? "linear-gradient(135deg, #ec4899, #f97316)" // NEW DRIP - Pink to Orange (fashion)
                          : currentMediaIndex === 1
                          ? "linear-gradient(135deg, #f59e0b, #dc2626)" // BIG FEAST - Amber to Red (food)
                          : currentMediaIndex === 2
                          ? "linear-gradient(135deg, #06b6d4, #3b82f6)" // QUICK ESCAPE - Cyan to Blue (travel)
                          : "linear-gradient(135deg, #ec4899, #f97316)", // Default NEW DRIP
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color:
                        currentMediaIndex === 0
                          ? "#ec4899"
                          : currentMediaIndex === 1
                          ? "#f59e0b"
                          : currentMediaIndex === 2
                          ? "#06b6d4"
                          : "#ec4899",
                    }}
                  >
                    {currentMediaIndex === 0
                      ? "New Drip"
                      : currentMediaIndex === 1
                      ? "Big Feast"
                      : currentMediaIndex === 2
                      ? "Quick Escape"
                      : "New Drip"}
                    ,
                  </span>{" "}
                  <br />
                  Try with{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: extractedColors[currentMediaIndex]
                        ?.dominant
                        ? `linear-gradient(135deg, ${extractedColors[currentMediaIndex].palette[0]}, ${extractedColors[currentMediaIndex].dominant})`
                        : "linear-gradient(135deg, #fbbf24, #f97316)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "#fbbf24",
                    }}
                  >
                    Dripify
                  </span>
                </h1>
              </div>

              {/* Description Text - Matching Reference Style */}
              <div
                className={`opacity-0 ${showContent ? "fade-in-up" : ""}`}
                style={{ animationDelay: "0.4s" }}
              >
                <p className="text-white text-sm md:text-lg lg:text-xl leading-relaxed max-w-3xl font-light mb-6 drop-shadow-lg">
                  Level up your life with this AI-powered super-app because{" "}
                  <br /> why juggle apps when you can do it all with{" "}
                  <span
                    className="font-medium transition-colors duration-1000 bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${
                        mediaItems[currentMediaIndex]?.theme?.primary ||
                        "#fbbf24"
                      }, ${
                        mediaItems[currentMediaIndex]?.theme?.accent ||
                        "#f59e0b"
                      })`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color:
                        mediaItems[currentMediaIndex]?.theme?.primary ||
                        "#fbbf24",
                    }}
                  >
                    {" "}
                    Dripify
                  </span>
                  .
                </p>
              </div>

              <div
                className={`opacity-0 ${showContent ? "fade-in-up" : ""}`}
                style={{ animationDelay: "0.6s" }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleEnterExperience}
                    className="backdrop-blur-xl border border-white/20 rounded-full px-8 md:px-10 py-3 md:py-4 text-white font-semibold text-sm md:text-base tracking-wide transition-all duration-300 group transform hover:scale-105"
                    style={{
                      background: `linear-gradient(to right, ${
                        mediaItems[currentMediaIndex]?.theme?.secondary ||
                        "#3b82f6"
                      }, ${
                        mediaItems[currentMediaIndex]?.theme?.primary ||
                        "#fbbf24"
                      })`,
                      borderColor: `${
                        mediaItems[currentMediaIndex]?.theme?.primary ||
                        "#fbbf24"
                      }30`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${
                        mediaItems[currentMediaIndex]?.theme?.primary ||
                        "#fbbf24"
                      }, ${
                        mediaItems[currentMediaIndex]?.theme?.accent ||
                        "#f59e0b"
                      })`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${
                        mediaItems[currentMediaIndex]?.theme?.secondary ||
                        "#3b82f6"
                      }, ${
                        mediaItems[currentMediaIndex]?.theme?.primary ||
                        "#fbbf24"
                      })`;
                    }}
                  >
                    <span className="flex items-center gap-2">
                      Start Experience
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  
                  {!isAuthenticated && (
                    <button
                      onClick={handleSignIn}
                      className="backdrop-blur-xl border border-white/30 rounded-full px-8 md:px-10 py-3 md:py-4 text-white font-medium text-sm md:text-base tracking-wide transition-all duration-300 group transform hover:scale-105 bg-white/10 hover:bg-white/20"
                    >
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="w-full md:w-1/2 relative order-1 md:order-2 h-1/2 md:h-full">
            {/* Media Background - Full Coverage */}
            <div className="absolute inset-0 overflow-hidden">
              {mediaItems[currentMediaIndex].type === "video" ? (
                <video
                  key={currentMediaIndex}
                  src={mediaItems[currentMediaIndex].src}
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleMediaEnd}
                  onLoadedData={(e) =>
                    extractColorsFromMedia(e.currentTarget, currentMediaIndex)
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  key={currentMediaIndex}
                  src={mediaItems[currentMediaIndex].src}
                  alt="Featured content"
                  onLoad={(e) =>
                    extractColorsFromMedia(e.currentTarget, currentMediaIndex)
                  }
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Minimal Media Overlay - Crystal Clear */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-900/10 to-slate-900/20" />
          </div>

          {/* Sponsers*/}
          <div className="absolute inset-0 pointer-events-none w-1/2"></div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* User Profile Modal */}
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Fullscreen Prompt */}
      <FullscreenPrompt />
    </div>
  );
};

export default LandingPage;
