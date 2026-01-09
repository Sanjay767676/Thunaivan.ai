import { motion } from "framer-motion";
import type { Source } from "@shared/schema";

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-sm hover:bg-secondary transition-colors"
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 min-w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
          {index + 1}
        </div>
        <div className="space-y-1">
          <p className="text-foreground/90 line-clamp-3 italic">"{source.text}"</p>
          {source.relevance && (
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60"
                  style={{ width: `${Math.round(source.relevance * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(source.relevance * 100)}% Match
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
