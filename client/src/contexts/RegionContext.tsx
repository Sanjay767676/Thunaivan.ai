import { createContext, useContext, useState, ReactNode } from "react";

type Region = "india" | "tamilnadu";

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  logoPath: string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>(() => {
    // Load from localStorage or default to tamilnadu
    const saved = localStorage.getItem("region") as Region | null;
    return saved || "tamilnadu";
  });

  const logoPath = region === "india" ? "/India.png" : "/Logo.png";
  
  // Force component updates when region changes
  const [, forceUpdate] = useState({});
  const updateRegion = (newRegion: Region) => {
    setRegion(newRegion);
    localStorage.setItem("region", newRegion);
    forceUpdate({}); // Trigger re-render
  };

  const handleSetRegion = (newRegion: Region) => {
    setRegion(newRegion);
    localStorage.setItem("region", newRegion);
    // Trigger a small delay to ensure state updates propagate
    setTimeout(() => {
      window.dispatchEvent(new Event('regionchange'));
    }, 0);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion: handleSetRegion, logoPath }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within RegionProvider");
  }
  return context;
}

