import React, { useMemo, useRef, useEffect, useState } from "react";
import "./LandingPage.css";
import { motion, animate } from "framer-motion";
import AppHeader from "../../components/layout/AppHeader";
import Reveal from "../../components/utils/Reveal";
import { useFullpageScroll } from "../../components/utils/useFullpageScroll";

const LandingPage: React.FC = () => {
  // Section refs for fullpage snapping
  const heroRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const gamificationRef = useRef<HTMLElement | null>(null);
  const chatboxRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  // container ref to attach native listeners
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Snap order (down): hero -> about -> service -> gamification
  const sections = useMemo(
    () => [heroRef, aboutRef, servicesRef, gamificationRef, chatboxRef, footerRef],
    []
  );
  // Map each section to a route for deep-linking and back/forward support
  // const routes = useMemo(
  //   () => ["/", "/about-content", "/services", "/gamification", "/chatbox", "/footer"],
  //   []
  // );
  // const { handlers } = useFullpageScroll(sections as any, routes);

  // Controlled scrolling state
  const [activeIndex, setActiveIndex] = useState(0);
  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  // Ensure initial scroll on mount (in case route/deep-link)
  useEffect(() => {
    const el = sections[activeIndex]?.current as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToIndex = (index: number) => {
    if (isScrollingRef.current) return;
    const bounded = Math.max(0, Math.min(index, sections.length - 1));
    if (bounded === activeIndex) return;

    isScrollingRef.current = true;
    setActiveIndex(bounded);

    const targetElement = sections[bounded]?.current;
    const container = containerRef.current;

    if (targetElement && container) {
      const targetScrollTop = targetElement.offsetTop;
      animate(container.scrollTop, targetScrollTop, {
        type: "tween",
        duration: 1,
        ease: "easeInOut",
        onUpdate: (latest) => {
          container.scrollTop = latest;
        },
        onComplete: () => {
          isScrollingRef.current = false;
        },
      });
    } else {
      isScrollingRef.current = false;
    }
  };

  // Native listeners — đảm bảo preventDefault và passive:false để ngăn cuộn mặc định
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let touchStartY: number | null = null;

    const onWheel = (ev: WheelEvent) => {
      console.log("User scrolled, deltaY:", ev.deltaY);
      ev.preventDefault();
      if (isScrollingRef.current) return;
      if (ev.deltaY > 0) scrollToIndex(activeIndex + 1);
      else if (ev.deltaY < 0) scrollToIndex(activeIndex - 1);
    };

    const onTouchStart = (ev: TouchEvent) => {
      touchStartY = ev.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (ev: TouchEvent) => {
      // khi đã bắt touch, ngăn scroll mặc định để tránh cuộn lướt tự do
      if (touchStartY != null) ev.preventDefault();
    };

    const onTouchEnd = (ev: TouchEvent) => {
      if (isScrollingRef.current) return;
      const endY = ev.changedTouches[0]?.clientY ?? null;
      if (touchStartY == null || endY == null) {
        touchStartY = null;
        return;
      }
      const diff = touchStartY - endY;
      const threshold = 40;
      if (diff > threshold) scrollToIndex(activeIndex + 1);
      else if (diff < -threshold) scrollToIndex(activeIndex - 1);
      touchStartY = null;
    };

    root.addEventListener("wheel", onWheel, { passive: false, capture: true });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      root.removeEventListener("wheel", onWheel, { capture: true } as any);
      root.removeEventListener("touchstart", onTouchStart as any);
      root.removeEventListener("touchmove", onTouchMove as any);
      root.removeEventListener("touchend", onTouchEnd as any);
    };
    // activeIndex intentionally in deps so scrollToIndex uses latest index
  }, [activeIndex, sections.length]);

  const handleWheel = (e: React.WheelEvent) => {
    // Keep React-level handler but native listener above is primary
    e.preventDefault();
    if (isScrollingRef.current) return;
    if (e.deltaY > 0) {
      scrollToIndex(activeIndex + 1);
    } else if (e.deltaY < 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isScrollingRef.current) return;
    const startY = touchStartYRef.current;
    const endY = e.changedTouches[0]?.clientY ?? null;
    if (startY == null || endY == null) return;
    const diff = startY - endY;
    const threshold = 40; // ngưỡng px để xác nhận swipe
    if (diff > threshold) {
      // swipe lên -> xuống trang tiếp theo
      scrollToIndex(activeIndex + 1);
    } else if (diff < -threshold) {
      // swipe xuống -> lên trang trước
      scrollToIndex(activeIndex - 1);
    }
    touchStartYRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

  // Combine external handlers (from useFullpageScroll) with our controlled handlers.
  // Our handlers intentionally prevent default wheel/touch to enforce full-section snapping.
  // const combinedHandlers = {
  //   ...handlers,
  //   onWheel: (e: React.WheelEvent) => {
  //     handlers?.onWheel?.(e);
  //     handleWheel(e);
  //   },
  //   onTouchStart: (e: React.TouchEvent) => {
  //     handlers?.onTouchStart?.(e);
  //     handleTouchStart(e);
  //   },
  //   onTouchEnd: (e: React.TouchEvent) => {
  //     handlers?.onTouchEnd?.(e);
  //     handleTouchEnd(e);
  //   },
  //   onKeyDown: (e: React.KeyboardEvent) => {
  //     handlers?.onKeyDown?.(e);
  //     handleKeyDown(e);
  //   },
  // };

  return (
    <div
      className="landing-page w-full h-screen overflow-x-hidden overflow-y-auto"
      ref={containerRef}
      // {...(combinedHandlers as any)}
      tabIndex={0} // enable keyboard capture
    >
      <AppHeader />

      {/* Hero - Không cần Reveal vì luôn hiển thị */}
      <section
        id="hero"
        className="hero-section relative min-h-screen overflow-hidden"
        ref={heroRef as any}
      >
        <div className="hero-content relative z-20 max-w-[1200px] mx-auto flex flex-col items-end text-right pt-[calc(120px+var(--section-offset,0px)-var(--nudge-up,0px))] pr-10">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            How are you today?
          </motion.h1>
          <div className="emoji-group flex justify-end gap-6 mt-5 mb-[100px]">
            <div className="emoji-face">
              <svg width="113" height="113" viewBox="0 0 113 113" fill="none">
                <circle
                  cx="56.5"
                  cy="56.5"
                  r="56.5"
                  fill="#E5F249"
                  stroke="black"
                  strokeWidth="2"
                />
                <path d="M37 41H37.05" stroke="black" strokeWidth="8" strokeLinecap="round" />
                <path d="M77 41H77.05" stroke="black" strokeWidth="8" strokeLinecap="round" />
                <path
                  d="M37 68C37 68 44.437 77.917 56.833 77.917C69.229 77.917 76.666 68 76.666 68"
                  stroke="black"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="emoji-face">
              <svg width="113" height="113" viewBox="0 0 113 113" fill="none">
                <circle
                  cx="56.5"
                  cy="56.5"
                  r="56.5"
                  fill="#E5F249"
                  stroke="black"
                  strokeWidth="2"
                />
                <path d="M37 41H37.05" stroke="black" strokeWidth="8" strokeLinecap="round" />
                <path d="M77 41H77.05" stroke="black" strokeWidth="8" strokeLinecap="round" />
                <path d="M37 68H76.67" stroke="black" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="emoji-face">
              <svg width="113" height="113" viewBox="0 0 113 113" fill="none">
                <circle
                  cx="56.5"
                  cy="56.5"
                  r="56.5"
                  fill="#E5F249"
                  stroke="black"
                  strokeWidth="2"
                />
                <path d="M37 41H37.05" stroke="black" strokeWidth="8" strokeLinecap="round" />
                <path d="M77 41H77.05" stroke="black" strokeWidth="8" strokeLinecap="round" />
                <path
                  d="M76.67 72.917C76.67 72.917 69.23 63 56.83 63C44.44 63 37 72.917 37 72.917"
                  stroke="black"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <img
          className="fox-illustration absolute bottom-[100px] left-[86px] w-[578px] h-[564px] -rotate-[-5deg] z-[3]"
          src="https://api.builder.io/api/v1/image/assets/TEMP/9e48ea33ceadf9e90f946b17a07cc7729d8c8c34?width=1156"
          alt="Fox"
        />
        <img
          className="leaf-decoration-1 absolute bottom-[150px] left-[180px] w-[217px] h-[133px] -rotate-[-18deg] z-[3]"
          src="https://api.builder.io/api/v1/image/assets/TEMP/288871bc2234fd41595e2acaee689ebf87895367?width=433"
          alt="Leaf"
        />
        <img
          className="leaf-decoration-2 absolute bottom-[240px] left-[479px] w-[217px] h-[133px] z-[3]"
          src="https://api.builder.io/api/v1/image/assets/TEMP/1bc954f19c70fdb4619ccc91981956a180bcad93?width=433"
          alt="Leaf"
        />
      </section>

      {/* About - Chỉ hiện khi scroll tới */}
      <section id="about-content" className="about-section" ref={aboutRef as any}>
        <div className="about-overlay" />
        <Reveal sectionId="about" variant="fade-up" className="about-content">
          <h2 className="about-title">We are BRIGHTNEST</h2>
          <p className="about-description">
            A group of young dreamers turning clicks into care—designing a digital home where
            Vietnamese youth uplift each other through health and honest sharing.
          </p>
          <p className="vietnamese-tagline">Thắp sáng Hành trình Sức khỏe</p>
        </Reveal>
      </section>

      {/* Services - Chỉ hiện khi scroll tới */}
      <section id="service" className="services-section" ref={servicesRef as any}>
        <Reveal sectionId="services" variant="fade-up">
          <h2 className="services-title">Our services</h2>
          <div className="service-item">
            <div className="service-content">
              <h3 className="service-title">Blog (Article Library)</h3>
              <p className="service-description">
                Where everyone can explore, rate, and interact with health-related articles. With
                admin-managed quality control and content tagging, the platform fosters trustworthy
                information and community-driven discussions.
              </p>
            </div>
            <div>
              <img
                className="service-image"
                src="https://api.builder.io/api/v1/image/assets/TEMP/6d4dfd2294452fce40337b54a469a713ddcf0572?width=1600"
                alt="Blog service"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Gamification - Chỉ hiện khi scroll tới */}
      <section id="gamification" className="gamification-section" ref={gamificationRef as any}>
        <Reveal sectionId="gamification" variant="slide-right">
          <div className="gamification-row">
            <div className="gamification-icons">
              <div className="gami-card tl">
                <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden>
                  <g transform="translate(12,0)">
                    <rect
                      x="26"
                      y="28"
                      width="24"
                      height="40"
                      rx="8"
                      stroke="#FF7B17"
                      strokeWidth="4"
                    />
                    <rect
                      x="44"
                      y="18"
                      width="24"
                      height="50"
                      rx="8"
                      stroke="#FF7B17"
                      strokeWidth="4"
                    />
                    <rect
                      x="10"
                      y="36"
                      width="24"
                      height="32"
                      rx="8"
                      stroke="#FF7B17"
                      strokeWidth="4"
                    />
                  </g>
                </svg>
                <div className="gami-label">Racing top</div>
              </div>

              <div className="gami-card tr">
                <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden>
                  <circle cx="24" cy="60" r="10" fill="#FF7B17" />
                  <path
                    d="M36 60 C 60 50, 70 50, 90 60"
                    stroke="#FF7B17"
                    strokeWidth="4"
                    strokeDasharray="8 10"
                    fill="none"
                  />
                  <path
                    d="M96 24c-8.837 0-16 7.163-16 16 0 12 16 28 16 28s16-16 16-28c0-8.837-7.163-16-16-16Z"
                    stroke="#FF7B17"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle cx="96" cy="40" r="6" fill="#FF7B17" />
                </svg>
                <div className="gami-label">Tracking</div>
              </div>

              <div className="gami-card bl">
                <svg width="96" height="96" viewBox="0 0 68 80" fill="none" aria-hidden>
                  <path d="M34 62H56.695" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round" />
                  <path
                    d="M34 39.5898H56.695"
                    stroke="#FF7B17"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path d="M34 16H56.695" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round" />
                  <rect
                    x="2"
                    y="2"
                    width="64"
                    height="75.3333"
                    rx="8"
                    stroke="#FF7B17"
                    strokeWidth="4"
                  />
                  <path
                    d="M13.6 16.94L19 20.61L25.7 12.47"
                    stroke="#FF7B17"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13.6 39.61L19 43.28L25.7 35.13"
                    stroke="#FF7B17"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13.6 61.14L19 64.81L25.7 56.67"
                    stroke="#FF7B17"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="gami-label">Daily task</div>
              </div>
            </div>
            <div className="service-content">
              <h3 className="service-title">Gamification</h3>
              <p className="service-description">
                It brings motivation to daily health habits through engaging features like task
                checklists, progress tracking, and competitive leaderboards - turning personal
                growth into a fun, goal-driven experience.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* AI Chatbox + CTA - Chỉ hiện khi scroll tới */}
      <section className="chatbox-content" id="chatbox" ref={chatboxRef as any}>
        <Reveal sectionId="chatbox" variant="scale">
          <div className="chatbox-header">
            <h3 className="chatbox-title">AI Chatbox</h3>
            <p className="chatbox-description">
              Personalized AI Health Assistant with integrated RAG3
            </p>
          </div>
          <div className="chatbox-mockup ">
            <div className="chat-dot left -translate-y-8" />
            <div className="chat-dot right translate-y-9" />
            <div className="chat-bubbles">
              <div className="chat-bubble user1 -translate-y-8">
                Do you have any questions today?
              </div>
              <div className="chat-bubble user2 translate-y-9">
                What exercises are good for beginners?
              </div>
            </div>
          </div>
          <div className="cta-inline">
            <h2 className="cta-title">Start small, shine big—together with us.</h2>
            <button className="cta-button">TRY NOW</button>
          </div>
        </Reveal>
      </section>
      <section id="footer" className="services-section" ref={footerRef as any}>
        <footer className="footer app-footer">
          <div className="footer-content">
            <div className="footer-logo">
              <img
                className="footer-logo-image"
                src="https://api.builder.io/api/v1/image/assets/TEMP/de986a7279fe24b5c6a9695fbf1915b1da6131e9?width=162"
                alt="BRIGHTNEST Logo"
              />
              <div className="footer-brand">BRIGHTNEST</div>
            </div>
            <div className="footer-contact">
              <h4 className="footer-contact-title">Contact us</h4>
              <div className="footer-contact-item">
                <div className="contact-icon">📞</div>
                <span className="footer-contact-text">0xxxxxxxxxx</span>
              </div>
              <div className="footer-contact-item">
                <div className="contact-icon">✉️</div>
                <span className="footer-contact-text">Contact us:</span>
              </div>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default LandingPage;
