import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRegion } from "@/contexts/RegionContext";
import { MapPin } from "lucide-react";

export function RegionSelector() {
  const { region, setRegion, logoPath } = useRegion();
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(region === "india" ? 100 : 0);
  const springX = useSpring(x, { damping: 20, stiffness: 300 });

  useEffect(() => {
    x.set(region === "india" ? 100 : 0);
  }, [region, x]);

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentX = x.get();
    const newRegion = currentX > 50 ? "india" : "tamilnadu";
    if (newRegion !== region) {
      setRegion(newRegion);
    }
  };

  const opacity = useTransform(springX, [0, 100], [1, 0.3]);
  const opacityIndia = useTransform(springX, [0, 100], [0.3, 1]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      className="fixed top-4 right-4 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-700 p-2"
      style={{ marginRight: '1rem' }}
    >
      <div className="flex items-center gap-2 px-2">
        <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <div
          ref={constraintsRef}
          className="relative w-32 h-10 bg-slate-200 dark:bg-slate-700 rounded-full p-1 cursor-pointer"
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              x: springX,
              width: "calc(50% - 4px)",
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-md" />
          </motion.div>

          <motion.div
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{
              x: springX,
            }}
            className="absolute top-1 w-[calc(50%-4px)] h-8 bg-white dark:bg-slate-900 rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              style={{ opacity: isDragging ? 0.5 : 1 }}
            >
              {region === "india" ? "🇮🇳" : "🏛️"}
            </motion.span>
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
            <motion.span
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
              style={{ opacity }}
            >
              TN
            </motion.span>
            <motion.span
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
              style={{ opacity: opacityIndia }}
            >
              IN
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
