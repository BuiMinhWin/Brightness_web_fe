// src/components/utils/Reveal.tsx
import React, { useRef, useEffect, ReactNode } from "react";
import { motion, Variants } from "framer-motion";
import { useScrollContext } from "./ScrollProvider";

type AnimationVariant = "fade-up" | "fade-down" | "slide-right" | "slide-left" | "scale" | "rotate";

interface RevealProps {
  children: ReactNode;
  sectionId?: string;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
}

const Reveal: React.FC<RevealProps> = ({
  children,
  sectionId,
  variant = "fade-up",
  delay = 0,
  duration = 0.6,
  className = "",
}) => {
  const { activeSection, registerSection, unregisterSection } = useScrollContext();
  const ref = useRef<HTMLDivElement>(null);

  // Register section khi component mount
  useEffect(() => {
    if (ref.current && sectionId) {
      registerSection(sectionId, ref.current);
    }

    return () => {
      if (sectionId) {
        unregisterSection(sectionId);
      }
    };
  }, [sectionId, registerSection, unregisterSection]);

  const isVisible = activeSection === sectionId;

  // Animation variants với proper typing
  const variants: Record<AnimationVariant, Variants> = {
    "fade-up": {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    "fade-down": {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 },
    },
    "slide-right": {
      hidden: { opacity: 0, x: -100 },
      visible: { opacity: 1, x: 0 },
    },
    "slide-left": {
      hidden: { opacity: 0, x: 100 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10, scale: 0.9 },
      visible: { opacity: 1, rotate: 0, scale: 1 },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants[variant]}
      transition={{
        duration,
        delay: isVisible ? delay : 0,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
