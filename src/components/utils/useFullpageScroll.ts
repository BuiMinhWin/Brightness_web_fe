import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

type SectionRef = React.RefObject<HTMLElement | HTMLDivElement>;

// A more robust wheel handler to deal with trackpads
// This hook is now simplified and no longer manages the enabled state.
const useWheelScroll = (onScroll: (direction: "up" | "down") => void) => {
  const wheelAccumulator = useRef(0);
  const lastWheelTs = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (ev: WheelEvent) => {
      // The check for whether scrolling is enabled is now handled by the caller.
      ev.preventDefault();

      const now = performance.now();
      // Reset accumulator if there's a pause in scrolling
      if (now - lastWheelTs.current > 300) {
        wheelAccumulator.current = 0;
      }
      lastWheelTs.current = now;
      wheelAccumulator.current += ev.deltaY;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const threshold = 40; // Lower threshold for responsiveness
      if (Math.abs(wheelAccumulator.current) >= threshold) {
        const direction = wheelAccumulator.current > 0 ? "down" : "up";
        onScroll(direction);
        wheelAccumulator.current = 0; // Reset after firing
      } else {
        // If we don't cross threshold, set a timeout to eventually fire
        // This handles very slow/fine scrolling on trackpads
        timeoutRef.current = setTimeout(() => {
          if (Math.abs(wheelAccumulator.current) > 5) {
            const direction = wheelAccumulator.current > 0 ? "down" : "up";
            onScroll(direction);
          }
          wheelAccumulator.current = 0;
        }, 150);
      }
    },
    [onScroll] // Dependency is now only on the onScroll callback
  );
};

export function useFullpageScroll(
  sections: SectionRef[],
  containerRef: React.RefObject<HTMLDivElement>,
  wrapperRef: React.RefObject<HTMLDivElement>
) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isAnimating = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const clamp = (val: number) => Math.max(0, Math.min(val, sections.length - 1));

  const scrollToIndex = useCallback(
    (index: number) => {
      const newIndex = clamp(index);
      // The guard against scrolling to the same index or during animation remains.
      if (newIndex === activeIndex || isAnimating.current) return;

      isAnimating.current = true;
      setActiveIndex(newIndex);

      const wrapper = wrapperRef.current;
      if (wrapper) {
        animate(
          wrapper,
          { y: `-${newIndex * 100}vh` },
          {
            type: "tween",
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
            onComplete: () => {
              isAnimating.current = false;
            },
          }
        );
      } else {
        isAnimating.current = false;
      }
    },
    [activeIndex, wrapperRef, sections.length]
  );

  // --- Event Listeners ---

  // 1. Wheel
  // The check for `isAnimating` is now inside this callback.
  const handleWheel = useWheelScroll((direction) => {
    if (isAnimating.current) {
      return;
    }
    scrollToIndex(activeIndex + (direction === "down" ? 1 : -1));
  });

  // 2. Touch
  const handleTouchStart = useCallback((ev: TouchEvent) => {
    if (isAnimating.current) return;
    touchStartY.current = ev.touches[0]?.clientY ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (ev: TouchEvent) => {
      if (isAnimating.current || touchStartY.current === null) return;
      const endY = ev.changedTouches[0]?.clientY ?? 0;
      const delta = touchStartY.current - endY;
      const threshold = 50; // 50px swipe is a clear gesture

      if (Math.abs(delta) > threshold) {
        scrollToIndex(activeIndex + (delta > 0 ? 1 : -1));
      }
      touchStartY.current = null;
    },
    [activeIndex, scrollToIndex]
  );

  // 3. Keyboard
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isAnimating.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToIndex(sections.length - 1);
      }
    },
    [activeIndex, scrollToIndex, sections.length]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, handleWheel, handleTouchStart, handleTouchEnd, handleKeyDown]);

  return { activeIndex };
}
