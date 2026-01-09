import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

type AssistantState = "idle" | "listening" | "thinking" | "speaking";

interface AssistantAvatarProps {
  state: AssistantState;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AssistantAvatar({ state, className, size = "md" }: AssistantAvatarProps) {
  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64",
  };

  const containerSize = sizeMap[size];

  const variants = {
    idle: {
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    listening: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    thinking: {
      rotate: [0, 360],
      scale: [0.9, 1.1, 0.9],
      transition: {
        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
      },
    },
    speaking: {
      scale: [1, 1.15, 0.95, 1.1, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const colors = {
    idle: "from-blue-500/20 to-cyan-500/20",
    listening: "from-blue-500/40 to-cyan-500/40",
    thinking: "from-purple-500/40 to-indigo-500/40",
    speaking: "from-emerald-500/40 to-teal-500/40",
  };

  const coreColors = {
    idle: "bg-blue-500",
    listening: "bg-cyan-500",
    thinking: "bg-purple-500",
    speaking: "bg-emerald-500",
  };

  return (
    <div className={clsx("relative flex items-center justify-center", containerSize, className)}>
      <motion.div
        className={clsx(
          "absolute inset-0 rounded-full blur-xl bg-gradient-to-tr opacity-50",
          colors[state]
        )}
        animate={state}
        variants={{
          idle: { scale: [1, 1.2, 1], opacity: 0.5 },
          thinking: { scale: [1.1, 1.3, 1.1], opacity: 0.7, rotate: 180 },
          listening: { scale: 1.2, opacity: 0.6 },
          speaking: { scale: [1, 1.4, 1], opacity: 0.8 },
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <motion.div
        className={clsx(
          "absolute inset-4 rounded-full blur-lg bg-gradient-to-bl opacity-40 mix-blend-screen",
          colors[state]
        )}
        animate={state}
        variants={variants}
      />

      <motion.div
        className={clsx(
          "relative z-10 w-1/2 h-1/2 rounded-full shadow-inner shadow-white/50 backdrop-blur-sm",
          coreColors[state]
        )}
        animate={state}
        variants={variants}
      >
        <div className="absolute top-2 left-2 w-1/3 h-1/3 bg-white/40 rounded-full blur-[2px]" />
      </motion.div>

      {state === "thinking" && (
        <motion.div
          className="absolute inset-0 z-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full blur-[1px] shadow-lg shadow-white" />
          <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full blur-[1px]" />
        </motion.div>
      )}
    </div>
  );
}
