// WhatNewCarousel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

interface WhatNewCarouselProps {
  initialIndex?: number;
  onReadMore?: () => void;
}

interface PostData {
  id: string;
  title: string;
  content: string;
  reactionCount: number;
  createdAt: string;
  userId: string;
  userData?: {
    userName: string;
    fullName: string | null;
    profilePicture: string | null;
  };
  images?: any[];
}

const WhatNewCarousel: React.FC<WhatNewCarouselProps> = ({ 
  initialIndex = 0,
  onReadMore 
}) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate colors for avatars (same as TopPerformanceSection)
  const colors = ["4F46E5", "DC2626", "059669", "D97706", "7C3AED", "EC4899", "10B981"];

  // ✅ Generate avatar URL with colored background (from TopPerformanceSection)
  const getAvatarUrl = (userName: string, userId: string): string => {
    const colorIndex = userId.charCodeAt(0) % colors.length;
    const initial = userName?.charAt(0).toUpperCase() || "U";
    return `https://ui-avatars.com/api/?name=${initial}&background=${colors[colorIndex]}&color=fff&size=300&bold=true`;
  };

  // ✅ Resolve avatar URL - use real avatar or fallback (from TopPerformanceSection)
  const resolveAvatarUrl = (profilePicture: string | null | undefined, userName: string, userId: string): string => {
    // If user has a real avatar, use it
    if (profilePicture) {
      if (profilePicture.startsWith('/')) {
        return `${import.meta.env.VITE_API_URL || ''}${profilePicture}`;
      }
      return profilePicture;
    }
    
    // Fallback to UI Avatars with user's initial
    return getAvatarUrl(userName, userId);
  };

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { socialService } = await import("../../services/socialService");
        const { authService } = await import("../../services/authService");
        
        const fetchedPosts = await socialService.getPosts();
        
        // ✅ Fetch user data for each post (including real avatar)
        const postsWithUserData = await Promise.all(
          fetchedPosts.slice(0, 10).map(async (post) => {
            try {
              const user = await authService.getUser(post.userId);
              return {
                ...post,
                userData: {
                  userName: user.userName || `User ${post.userId.substring(0, 8)}`,
                  fullName: user.fullName || null,
                  profilePicture: user.profilePicture || null, // ✅ Get real avatar
                },
              };
            } catch (err) {
              console.error(`Failed to fetch user data for user ${post.userId}:`, err);
              return {
                ...post,
                userData: {
                  userName: `User ${post.userId.substring(0, 8)}`,
                  fullName: null,
                  profilePicture: null,
                },
              };
            }
          })
        );
        
        // Sort by newest first and take only 10
        const sortedPosts = postsWithUserData
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        
        setPosts(sortedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // State & index
  const [active, setActive] = useState<number>(
    Math.max(0, Math.min(initialIndex, posts.length - 1))
  );
  const n = posts.length;

  const indices = useMemo(() => {
    if (n === 0) return { left: 0, center: 0, right: 0, farLeft: 0, farRight: 0 };
    const left = (active - 1 + n) % n;
    const right = (active + 1) % n;
    const farLeft = (active - 2 + n) % n;
    const farRight = (active + 2) % n;
    return { left, center: active, right, farLeft, farRight };
  }, [active, n]);

  const goPrev = () => setActive((a) => (a - 1 + n) % n);
  const goNext = () => setActive((a) => (a + 1) % n);

  // Swipe and Drag
  const touchStartX = useRef<number | null>(null);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const wasDragged = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx > 0 ? goPrev() : goNext();
    touchStartX.current = null;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    wasDragged.current = false;
    dragStartX.current = e.clientX;
    (e.currentTarget as HTMLElement).style.cursor = "grabbing";
  };

  const onMouseUp = (e: React.MouseEvent) => {
    isDragging.current = false;
    (e.currentTarget as HTMLElement).style.cursor = "grab";

    if (dragStartX.current !== null) {
      const dx = e.clientX - dragStartX.current;
      if (Math.abs(dx) > 40) {
        dx > 0 ? goPrev() : goNext();
      }
    }
    dragStartX.current = null;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 10) {
      wasDragged.current = true;
    }
  };

  const onMouseLeave = (e: React.MouseEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      (e.currentTarget as HTMLElement).style.cursor = "grab";
      if (dragStartX.current !== null) {
        const dx = e.clientX - dragStartX.current;
        if (Math.abs(dx) > 40) {
          dx > 0 ? goPrev() : goNext();
        }
        dragStartX.current = null;
      }
    }
  };

  // Arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  // Calculate rating based on reaction count
  const calculateRating = (reactionCount: number): number => {
    if (reactionCount >= 100) return 5;
    if (reactionCount >= 50) return 4;
    if (reactionCount >= 20) return 3;
    if (reactionCount >= 5) return 2;
    return 1;
  };

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

  // Handle read more click
  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!wasDragged.current && onReadMore) {
      onReadMore();
    }
  };

  // Truncate text helper
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // ✅ Ghost card with real avatar
  const GhostCard: React.FC<{ post: PostData; side: "left" | "right" }> = ({
    post,
    side,
  }) => {
    const rating = calculateRating(post.reactionCount);
    const userName = post.userData?.userName || `User ${post.userId.substring(0, 8)}`;
    const avatarUrl = resolveAvatarUrl(post.userData?.profilePicture, userName, post.userId);

    return (
      <div
        aria-hidden
        className={[
          "relative pointer-events-none select-none bg-white rounded-[32px] shrink-0 shadow-xl",
          "w-[240px] h-[240px] p-5 opacity-60",
          side === "left" ? "-rotate-[18deg]" : "rotate-[18deg]",
          "transition-transform duration-300 ease-out scale-[0.88]",
          "translate-y-10 z-10",
        ].join(" ")}
        style={{
          backgroundColor: "white",
          transformOrigin: "center",
        }}
      >
        <div className="flex items-center gap-4 mb-3">
          {/* ✅ Real avatar with fallback */}
          <div
            className="rounded-full w-[48px] h-[48px] mb-4 shrink-0 overflow-hidden"
            style={{
              backgroundImage: `url(${avatarUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="flex flex-col justify-center min-w-0">
            <h4 className="text-black font-bold mb-1 text-[16px] truncate">
              {userName}
            </h4>
            <div className="flex gap-1 text-black text-[14px]">{renderStars(rating)}</div>
          </div>
        </div>

        <p className="text-black text-[12px] leading-[1.5] clamp-2">
          {truncateText(post.content, 100)}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <section aria-label="What's new section" className="relative py-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#05644C] to-[#E2F043] opacity-60" />
        <h2 className="whats-new-title text-white text-center font-bold text-[40px] pb-[46px]">
          What's new?
        </h2>
        <div className="text-center text-white text-xl">Loading posts...</div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    return (
      <section aria-label="What's new section" className="relative py-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#05644C] to-[#E2F043] opacity-60" />
        <h2 className="whats-new-title text-white text-center font-bold text-[40px] pb-[46px]">
          What's new?
        </h2>
        <div className="text-center text-white text-xl">
          {error || "No posts available yet"}
        </div>
      </section>
    );
  }

  // ✅ 3 main cards with real avatars
  const trio = [indices.left, indices.center, indices.right].map((idx, pos) => {
    const post = posts[idx];
    const isCenter = pos === 1;
    const rating = calculateRating(post.reactionCount);
    const userName = post.userData?.userName || `User ${post.userId.substring(0, 8)}`;
    const avatarUrl = resolveAvatarUrl(post.userData?.profilePicture, userName, post.userId);

    const sideTilt = pos === 0 ? "-rotate-[15deg]" : pos === 2 ? "rotate-[15deg]" : "rotate-0";
    const scale = isCenter ? "scale-100" : "scale-[0.92]";

    const handleCardClick = (e: React.MouseEvent) => {
      if (wasDragged.current) {
        e.preventDefault();
        return;
      }
      if (!isCenter) {
        setActive(idx);
      }
    };

    return (
      <div
        key={`${post.id}-${pos}`}
        onClick={handleCardClick}
        className={[
          "relative rounded-[36px] shadow-xl snap-center shrink-0 cursor-pointer",
          "transition-transform duration-300 ease-out will-change-transform",
          isCenter
            ? "w-[300px] h-[300px] p-7 border-[6px] border-[#FF7B17] -translate-y-12 z-40"
            : "w-[300px] h-[300px] p-6 -translate-y-4 z-30",
          !isCenter ? `${sideTilt} ${scale}` : "rotate-0",
          !isCenter
            ? "hover:rotate-0 hover:-translate-y-6 hover:scale-[0.98]"
            : "hover:scale-[1.02] hover:-translate-y-20",
        ].join(" ")}
        style={{
          transformOrigin: "center",
          backgroundColor: "white",
          boxShadow: isCenter ? "0 12px 28px rgba(0,0,0,0.18)" : "0 16px 36px rgba(0,0,0,0.22)",
        }}
      >
        <div className="flex items-center gap-4 mb-2">
          {/* ✅ Real avatar with fallback */}
          <div
            className="rounded-full w-[64px] h-[64px] mb-4 shrink-0 overflow-hidden"
            style={{
              backgroundImage: `url(${avatarUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
          <div className="flex flex-col justify-center min-w-0">
            <h4 className="text-black font-bold mb-1 text-[20px] truncate">
              {userName}
            </h4>
            <div className="flex gap-1 text-black text-[16px] mb-4">{renderStars(rating)}</div>
          </div>
        </div>

        <p
          className={
            isCenter
              ? "text-black text-[14px] leading-[1.6] mb-6 clamp-3"
              : "text-black text-[13px] leading-[1.55] mb-4 clamp-3"
          }
        >
          {truncateText(post.content, 150)}
        </p>

        <span 
          className="text-[#FF7B17] font-bold cursor-pointer hover:underline"
          onClick={handleReadMore}
        >
          Read more →
        </span>
      </div>
    );
  });

  return (
    <section
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "grab" }}
      aria-label="What's new section"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#05644C] to-[#E2F043] opacity-60" />

      <h2 className="whats-new-title text-white text-center font-bold text-[40px] pb-[46px]">
        What's new?
      </h2>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#a8e6cf] via-[#a8e6cf]/70 to-transparent rounded-l-[100px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#f9e79f] via-[#f9e79f]/70 to-transparent rounded-r-[100px]" />

      <div className="relative flex items-end justify-center gap-6 mb-8 px-2 overflow-visible">
        <GhostCard post={posts[indices.farLeft]} side="left" />
        {trio}
        <GhostCard post={posts[indices.farRight]} side="right" />
      </div>

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