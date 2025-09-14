import React, { createContext, useContext, useState, ReactNode } from "react";

interface WallpaperContextType {
  currentWallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  wallpapers: { id: string; name: string; url: string }[];
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(
  undefined
);

const wallpapers = [
  {
    id: "luxury-living",
    name: "Luxury Living Room",
    url: "https://cdn.midjourney.com/d1e10271-d043-4197-9dcb-d2cde34d3805/0_0.png",
  },
  {
    id: "luxury-living",
    name: "Luxury Living Room",
    url: "https://cdn.midjourney.com/291f41e6-fc1e-4b14-a739-a1402d7408fb/0_0.png",
  },
  {
    id: "modern-apartment",
    name: "Modern Apartment",
    url: "https://cdn.midjourney.com/e53f573b-5db8-4d12-95dc-f8d78247edde/0_0.png",
  },
  {
    id: "white-interior",
    name: "White Interior",
    url: "https://cdn.midjourney.com/7cd336b6-40eb-40b6-a6a6-31994c690bcf/0_0.png",
  },
  {
    id: "minimalist",
    name: "Minimalist Space",
    url: "https://cdn.midjourney.com/bc3e9355-8ca8-4615-a3a9-37730c81c749/0_1.png",
  },
  {
    id: "cozy-home-1",
    name: "Cozy Home",
    url: "https://cdn.midjourney.com/f2d87d24-0dc6-4911-a210-7553008ed668/0_0.png",
  },
  {
    id: "cozy-home-2",
    name: "Cozy Home",
    url: "https://cdn.midjourney.com/36484f3d-f225-4f76-b7b2-27604900752b/0_0.png",
  },
  {
    id: "cozy-home-3",
    name: "Cozy Home",
    url: "https://cdn.midjourney.com/3f3a4c53-60cd-4421-969d-d604e173fdb2/0_0.png",
  },
  {
    id: "cozy-home-4",
    name: "Cozy Home",
    url: "https://cdn.midjourney.com/cdde15b9-edda-41da-a7e3-e2723cfb09ec/0_0.png",
  },
  {
    id: "cozy-home-5",
    name: "Cozy Home",
    url: "https://cdn.midjourney.com/11d55cd3-3356-4b7c-8983-6d00c484489d/0_0.png",
  },
];

export const WallpaperProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentWallpaper, setCurrentWallpaper] = useState(wallpapers[0].url);

  const setWallpaper = (wallpaper: string) => {
    setCurrentWallpaper(wallpaper);
  };

  return (
    <WallpaperContext.Provider
      value={{
        currentWallpaper,
        setWallpaper,
        wallpapers,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error("useWallpaper must be used within a WallpaperProvider");
  }
  return context;
};
