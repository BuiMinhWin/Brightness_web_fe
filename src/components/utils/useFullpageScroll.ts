import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type SectionRef = React.RefObject<HTMLElement | HTMLDivElement>;

export function useFullpageScroll(sections: SectionRef[], routes: string[]) {
  const navigate = useNavigate();
  const location = useLocation();

  const routeToIndex = useMemo(() => {
    const map = new Map<string, number>();
    routes.forEach((r, i) => map.set(r, i));
    return map;
  }, [routes]);

  const [index, setIndex] = useState<number>(() => routeToIndex.get(location.pathname) ?? 0);
  const isAnimating = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const wheelAccumulator = useRef(0);
  const lastWheelTs = useRef<number>(0);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const navIntentRef = useRef<"none" | "push" | "replace">("none");

  const scrollToIndex = useCallback(
    (next: number, behavior: ScrollBehavior = "smooth", intent: "push" | "replace" = "push") => {
      const target = sections[next]?.current;
      if (!target) return;
      setIndex(next);
      // Smooth scroll within scrollable container
      target.scrollIntoView({ behavior, block: "start" });
      // Defer URL update to IntersectionObserver to reflect actual visible section
      navIntentRef.current = intent;

      isAnimating.current = true;
      // Reset wheel accumulator when we trigger a snap
      wheelAccumulator.current = 0;
      lastWheelTs.current = performance.now();
      // Fall back timer; modern browsers also dispatch 'scrollend'
      window.setTimeout(
        () => {
          isAnimating.current = false;
        },
        behavior === "smooth" ? 700 : 60
      );
    },
    [sections]
  );

  // Sync on initial mount and whenever URL changes
  const didInit = useRef(false);
  useEffect(() => {
    const fromRoute = routeToIndex.get(location.pathname);
    if (fromRoute != null) {
      // Defer to ensure sections are mounted
      const behavior: ScrollBehavior = didInit.current ? "smooth" : "auto";
      window.requestAnimationFrame(() => scrollToIndex(fromRoute, behavior, "replace"));
    }
    didInit.current = true;
  }, [location.pathname, routeToIndex, scrollToIndex]);

  const onWheel: React.WheelEventHandler = (e) => {
    // Prevent zoom/pinch gestures from triggering
    if (e.ctrlKey) return;
    // Always prevent default scrolling to avoid CSS snap conflicts
    e.preventDefault();
    // Lock to one section per gesture
    if (isAnimating.current) {
      return;
    }

    const now = performance.now();
    // If it's been a while since last wheel, reset accumulation
    if (now - lastWheelTs.current > 450) {
      wheelAccumulator.current = 0;
    }
    lastWheelTs.current = now;

    // Accumulate deltaY; trackpads emit many small deltas
    wheelAccumulator.current += e.deltaY;

    const threshold = 90; // more sensitive to user intent
    if (Math.abs(wheelAccumulator.current) < threshold) return;

    const dir = wheelAccumulator.current > 0 ? 1 : -1;
    const next = clamp(index + dir, 0, sections.length - 1);
    if (next !== index) {
      scrollToIndex(next, "smooth", "push");
    } else {
      // If at edges, consume and reset to avoid jitter
      wheelAccumulator.current = 0;
    }
  };

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (isAnimating.current) {
      e.preventDefault();
      return;
    }
    if (["PageDown", "ArrowDown", "Space"].includes(e.key)) {
      e.preventDefault();
      scrollToIndex(clamp(index + 1, 0, sections.length - 1), "smooth", "push");
    } else if (["PageUp", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      scrollToIndex(clamp(index - 1, 0, sections.length - 1), "smooth", "push");
    }
  };

  const onTouchStart: React.TouchEventHandler = (e) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchEnd: React.TouchEventHandler = (e) => {
    if (isAnimating.current) return;
    const start = touchStartY.current;
    touchStartY.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientY ?? start;
    const delta = start - end; // positive means swipe up (next)
    const threshold = 50; // px - more sensitive
    if (Math.abs(delta) < threshold) return;
    const dir = delta > 0 ? 1 : -1;
    scrollToIndex(clamp(index + dir, 0, sections.length - 1), "smooth", "push");
  };

  // Keep URL in sync with the section most visible on screen
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = sections.findIndex((r) => r.current === entry.target);
          if (idx >= 0 && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = idx;
          }
        }
        if (bestIdx >= 0 && bestIdx !== index) {
          setIndex(bestIdx);
          const path = routes[bestIdx] ?? "/";
          if (location.pathname !== path) {
            const mode = navIntentRef.current;
            if (mode === "push") navigate(path);
            else navigate(path, { replace: true });
          }
          // Reset intent after applying navigation decision
          navIntentRef.current = "none";
        }
      },
      { threshold: [0.51, 0.75] }
    );

    sections.forEach((ref) => {
      if (ref.current) obs.observe(ref.current);
    });
    return () => obs.disconnect();
  }, [sections, routes, index, navigate, location.pathname]);

  return {
    activeIndex: index,
    handlers: {
      onWheel,
      onKeyDown,
      onTouchStart,
      onTouchEnd,
      tabIndex: 0 as 0, // allow container to receive key events
    },
  };
}

export default useFullpageScroll;
