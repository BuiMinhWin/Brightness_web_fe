import React, { useEffect, useMemo, useState } from "react";

type DotItem = {
  id: string; // unique id for the dot
  targetId: string; // id of the section element
  label: string; // accessible label/tooltip
};

type ScrollDotsProps = {
  items: DotItem[];
  onSelect?: (targetId: string, index: number) => void;
  activeIndex?: number;
};

const ScrollDots: React.FC<ScrollDotsProps> = ({ items, onSelect, activeIndex }) => {
  const [active, setActive] = useState<string | null>(null);

  const targets = useMemo(() => items.map((i) => i.targetId), [items]);

  useEffect(() => {
    if (typeof activeIndex === "number" && items[activeIndex]) {
      setActive(items[activeIndex].targetId);
    }
  }, [activeIndex, items]);

  useEffect(() => {
    const sections = targets
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Choose the most visible section in viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { root: null, rootMargin: "0px", threshold: [0.25, 0.5, 0.75] }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [targets]);

  const handleClick = (targetId: string, index: number) => {
    if (onSelect) {
      onSelect(targetId, index);
      return;
    }
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 select-none">
      {items.map((item, idx) => {
        const isActive = active === item.targetId;
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={() => handleClick(item.targetId, idx)}
            className={
              "transition-all duration-200 rounded-full focus:outline-none " +
              (isActive
                ? "w-3.5 h-3.5 bg-gray-500/80 border border-gray-500/80"
                : "w-2.5 h-2.5 bg-gray-500/40 border border-gray-500/40 hover:bg-gray-500/60 hover:scale-110")
            }
          />
        );
      })}
    </div>
  );
};

export default ScrollDots;
