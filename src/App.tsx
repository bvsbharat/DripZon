import React, { useState, useEffect } from "react";
import MainContent from "./components/MainContent";
import VoiceAssistant from "./components/VoiceAssistant";
import BottomNav from "./components/BottomNav";
import WallpaperSettings from "./components/WallpaperSettings";
import FullscreenPrompt from "./components/FullscreenPrompt";
import FirstTimeWallpaperModal from "./components/FirstTimeWallpaperModal";
import StoreSwitch from "./components/StoreSwitch";
import LandingPage from "./components/LandingPage";

import { ShoppingProvider } from "./contexts/ShoppingContext";
import { VoiceProvider } from "./contexts/VoiceContext";
import { WallpaperProvider, useWallpaper } from "./contexts/WallpaperContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState("home");
  const [showWallpaperSelection, setShowWallpaperSelection] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const { currentWallpaper } = useWallpaper();

  // Check if user has selected wallpaper before on first load
  useEffect(() => {
    const hasSelectedWallpaper = localStorage.getItem("wallpaperSelected");
    if (!hasSelectedWallpaper) {
      console.log("🎨 First-time user, showing wallpaper selection");
      setShowWallpaperSelection(true);
    }
  }, []);

  const handleWallpaperSelectionComplete = () => {
    localStorage.setItem("wallpaperSelected", "true");
    setShowWallpaperSelection(false);
  };

  const handleLandingPageComplete = () => {
    setShowLandingPage(false);
  };

  // Show landing page first, then main dashboard
  if (showLandingPage) {
    return <LandingPage onComplete={handleLandingPageComplete} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${currentWallpaper}')`,
          backgroundAttachment: "fixed",
        }}
      ></div>

      {/* Multiple Shadow/Dark Overlays for Better Contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
      <div className="absolute inset-0 bg-black/5"></div>

      {/* Main Content - Centered */}
      <div className="relative z-10 min-h-screen p-8">
        <div className="w-full max-w-7xl mx-auto">
          <MainContent currentView={currentView} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

      {/* Wallpaper Settings */}
      {/* <WallpaperSettings /> */}

      {/* First Time Wallpaper Selection Modal */}
      {showWallpaperSelection && (
        <FirstTimeWallpaperModal
          isOpen={showWallpaperSelection}
          onClose={() => setShowWallpaperSelection(false)}
          onComplete={handleWallpaperSelectionComplete}
        />
      )}

      {/* Fullscreen Prompt */}
      <FullscreenPrompt />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <WallpaperProvider>
          <VoiceProvider>
            <ShoppingProvider>
              <AppContent />
            </ShoppingProvider>
          </VoiceProvider>
        </WallpaperProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
