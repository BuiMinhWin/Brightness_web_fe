// WhatNewCarousel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

interface WhatNewCarouselProps {
  initialIndex?: number;
}

const WhatNewCarousel: React.FC<WhatNewCarouselProps> = ({ initialIndex = 0 }) => {
  // Dữ liệu của bạn
  const baseItems = [
    {
      id: 1,
      name: "Product A",
      rating: 5,
      description:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit semper dalaracc lacus vel facilisis volutpat est velitolm.",
      bgColor: "#4b1414",
    },
    {
      id: 2,
      name: "Product B",
      rating: 4,
      description:
        "Amazing new features and improvements that will enhance your experience with our platform.",
      bgColor: "#1a472a",
    },
    {
      id: 3,
      name: "Product C",
      rating: 5,
      description:
        "Revolutionary design and functionality that sets new standards in the industry.",
      bgColor: "#2563eb",
    },
    {
      id: 4,
      name: "Product D",
      rating: 3,
      description: "Innovative solutions that address real-world problems with elegant simplicity.",
      bgColor: "#7c2d12",
    },
    {
      id: 5,
      name: "Product E",
      rating: 5,
      description:
        "Cutting-edge technology combined with user-friendly interface for maximum efficiency.",
      bgColor: "#581c87",
    },
    {
      id: 6,
      name: "Product F",
      rating: 4,
      description:
        "Next-generation features that transform the way you work and interact with technology.",
      bgColor: "#be185d",
    },
    {
      id: 7,
      name: "Product G",
      rating: 5,
      description:
        "Breakthrough innovations that deliver unprecedented performance and reliability.",
      bgColor: "#0f766e",
    },
    {
      id: 8,
      name: "Product H",
      rating: 4,
      description:
        "Advanced capabilities that streamline workflows and boost productivity significantly.",
      bgColor: "#b45309",
    },
    {
      id: 9,
      name: "Product I",
      rating: 5,
      description:
        "State-of-the-art solutions designed to meet the evolving needs of modern users.",
      bgColor: "#dc2626",
    },
    {
      id: 10,
      name: "Product J",
      rating: 4,
      description: "Premium quality and exceptional performance that exceeds industry benchmarks.",
      bgColor: "#059669",
    },
  ];

  // State & index
  const [active, setActive] = useState<number>(
    Math.max(0, Math.min(initialIndex, baseItems.length - 1))
  );
  const n = baseItems.length;

  const indices = useMemo(() => {
    const left = (active - 1 + n) % n;
    const right = (active + 1) % n;
    const farLeft = (active - 2 + n) % n;
    const farRight = (active + 2) % n;
    return { left, center: active, right, farLeft, farRight };
  }, [active, n]);

  const goPrev = () => setActive((a) => (a - 1 + n) % n);
  const goNext = () => setActive((a) => (a + 1) % n);

  // Swipe
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx > 0 ? goPrev() : goNext();
    touchStartX.current = null;
  };

  // Arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Stars
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={index < rating ? "black" : "none"}
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
      </svg>
    ));

  // Ghost card (ngang giống mẫu)
  const GhostCard: React.FC<{ item: (typeof baseItems)[number]; side: "left" | "right" }> = ({
    item,
    side,
  }) => (
    <div
      aria-hidden
      className={[
        "relative pointer-events-none select-none bg-white rounded-[32px] shrink-0 shadow-xl",
        "w-[240px] h-[240px] p-5 opacity-60",
        side === "left" ? "-rotate-[18deg]" : "rotate-[18deg]",
        "transition-transform duration-300 ease-out scale-[0.88]",
        "translate-y-10 z-10", // thấp nhất
      ].join(" ")}
      style={{
        backgroundColor: "white",
        transformOrigin: "center",
      }}
    >
      {/* Hàng ngang: avatar trái, text phải */}
      <div className="flex items-center gap-4 mb-3">
        <div
          className="rounded-full w-[48px] h-[48px] mb-4 shrink-0"
          style={{ backgroundColor: item.bgColor }}
        />
        <div className="flex flex-col justify-center min-w-0">
          <h4 className="text-black font-bold mb-1 text-[16px] truncate">{item.name}</h4>
          <div className="flex gap-1 text-black text-[14px]">{renderStars(item.rating)}</div>
        </div>
      </div>

      <p className="text-black text-[12px] leading-[1.5] clamp-2">{item.description}</p>
      {/* ghost: không có Read more */}
    </div>
  );

  // 3 card chính
  const trio = [indices.left, indices.center, indices.right].map((idx, pos) => {
    const item = baseItems[idx];
    const isCenter = pos === 1;

    const sideTilt = pos === 0 ? "-rotate-[15deg]" : pos === 2 ? "rotate-[15deg]" : "rotate-0";

    const scale = isCenter ? "scale-100" : "scale-[0.92]";

    return (
      <div
        key={`${item.id}-${pos}`}
        className={[
          "relative  rounded-[36px] shadow-xl snap-center shrink-0",
          "transition-transform duration-300 ease-out will-change-transform",
          isCenter
            ? "w-[300px] h-[300px] p-7 border-[6px] border-[#FF7B17] -translate-y-8 z-40" // <- raise center
            : "w-[300px] h-[300px] p-6 translate-y-50 z-20", // sides remain lower
          !isCenter ? `${sideTilt} ${scale}` : "rotate-0",
          !isCenter
            ? "hover:rotate-0 hover:translate-y-0 hover:scale-[0.98]"
            : "hover:scale-[1.02] hover:-translate-y-20", // small lift on hover for center
        ].join(" ")}
        style={{
          transformOrigin: "center",
          backgroundColor: "white",
          boxShadow: isCenter ? "0 12px 28px rgba(0,0,0,0.18)" : "0 16px 36px rgba(0,0,0,0.22)",
        }}
      >
        {/* HÀNG NGANG: avatar trái — text phải (đúng class bạn yêu cầu) */}
        <div className="flex items-center gap-4 mb-2">
          {/* Avatar: giữ đúng class đã yêu cầu */}
          <div
            className="rounded-full w-[64px] h-[64px] mb-4 shrink-0"
            style={{ backgroundColor: item.bgColor }}
            aria-hidden
          />
          <div className="flex flex-col justify-center min-w-0">
            {/* Tên: giữ đúng class đã yêu cầu */}
            <h4 className="text-black font-bold mb-1 text-[20px] truncate">{item.name}</h4>
            {/* Sao: giữ đúng class đã yêu cầu */}
            <div className="flex gap-1 text-black text-[16px] mb-4">{renderStars(item.rating)}</div>
          </div>
        </div>

        {/* Mô tả (clamp “…”) */}
        <p
          className={
            isCenter
              ? "text-black text-[14px] leading-[1.6] mb-6 clamp-3"
              : "text-black text-[13px] leading-[1.55] mb-4 clamp-3"
          }
        >
          {item.description}
        </p>

        {/* GIỮ NGUYÊN anchor Read more → và class */}
        <a
          href="#"
          className="text-[#FF7B17] font-bold"
          onClick={(e) => {
            e.preventDefault();
            setActive(idx); // click -> đưa vào giữa
          }}
        >
          Read more →
        </a>
      </div>
    );
  });

  return (
    <section
      className="whats-new-section relative py-[80px] max-w-[1200px] mx-auto px-4 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="What's new section"
    >
      {/* Nền gradient giống mẫu */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#05644C] to-[#E2F043] opacity-60" />

      <h2 className="whats-new-title text-white text-center font-bold text-[40px] mb-[36px]">
        What new?
      </h2>

      {/* Fade hai biên (tùy chọn) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#a8e6cf] via-[#a8e6cf]/70 to-transparent rounded-l-[100px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#f9e79f] via-[#f9e79f]/70 to-transparent rounded-r-[100px]" />

      {/* HÀNG CARD: ghost trái + 3 card chính + ghost phải */}
      <div className="relative flex items-end justify-center gap-6 mb-8 px-2 overflow-visible">
        <GhostCard item={baseItems[indices.farLeft]} side="left" />
        {trio}
        <GhostCard item={baseItems[indices.farRight]} side="right" />
      </div>

      {/* GIỮ NGUYÊN wrapper class các nút điều hướng */}
      <div className="flex items-center justify-center gap-8">
        <button
          type="button"
          aria-label="Previous"
          className="w-10 h-10 flex items-center justify-center text-black select-none cursor-pointer hover:scale-110 transition-transform opacity-90 bg-transparent border-none"
          onClick={goPrev}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="15 18 9 12 15 6" />
            <path d="M20 12H10" />
          </svg>
        </button>

        <div className="scroll-rail" />

        <button
          type="button"
          aria-label="Next"
          className="w-10 h-10 flex items-center justify-center text-black select-none cursor-pointer hover:scale-110 transition-transform bg-transparent border-none"
          onClick={goNext}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="9 18 15 12 9 6" />
            <path d="M14 12H4" />
          </svg>
        </button>
      </div>

      <style>{`
        .whats-new-section {
          background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #f9e79f 100%);
          border-radius: 100px 100px 0 0;
        }
        .scroll-rail {
          position: relative;
          width: 220px;
          height: 3px;
          background: rgba(0, 0, 0, 0.85);
          border-radius: 9999px;
        }
        .scroll-rail::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 90px;
          height: 7px;
          background: #000;
          border-radius: 9999px;
        }

        /* Clamp “…”, không cần plugin Tailwind */
        .clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default WhatNewCarousel;
