import { useRegion } from "@/contexts/RegionContext";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "h-10 w-auto object-contain", showText = true }: LogoProps) {
  const { logoPath } = useRegion();
  const [currentLogo, setCurrentLogo] = useState(logoPath);

  useEffect(() => {
    setCurrentLogo(logoPath);
  }, [logoPath]);

  return (
    <div className="flex items-center gap-2">
      <img
        key={currentLogo}
        src={currentLogo}
        alt="Thunaivan Logo"
        className={className}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== "/Logo.png") {
            target.src = "/Logo.png";
          }
        }}
      />
      {showText && (
        <span className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">
          Thunaivan
        </span>
      )}
    </div>
  );
}
