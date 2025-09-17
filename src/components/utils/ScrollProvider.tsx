// src/components/utils/ScrollProvider.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface ScrollContextType {
  activeSection: string | null;
  registerSection: (id: string, element: HTMLElement) => void;
  unregisterSection: (id: string) => void;
}

interface ScrollProviderProps {
  children: ReactNode;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<ScrollProviderProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());

  const registerSection = (id: string, element: HTMLElement): void => {
    if (!element) return;

    sectionsRef.current.set(id, element);

    // Tạo observer cho section mới
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveSection(id);
        }
      },
      {
        threshold: 0.3,
        rootMargin: "-15% 0px -15% 0px",
      }
    );

    observer.observe(element);
    observersRef.current.set(id, observer);
  };

  const unregisterSection = (id: string): void => {
    // Cleanup observer
    const observer = observersRef.current.get(id);
    if (observer) {
      observer.disconnect();
      observersRef.current.delete(id);
    }

    sectionsRef.current.delete(id);
  };

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      observersRef.current.forEach((observer) => observer.disconnect());
      observersRef.current.clear();
      sectionsRef.current.clear();
    };
  }, []);

  const contextValue: ScrollContextType = {
    activeSection,
    registerSection,
    unregisterSection,
  };

  return <ScrollContext.Provider value={contextValue}>{children}</ScrollContext.Provider>;
};

export const useScrollContext = (): ScrollContextType => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScrollContext must be used within a ScrollProvider");
  }
  return context;
};
