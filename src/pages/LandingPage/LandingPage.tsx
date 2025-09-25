import React, { useMemo, useRef } from "react";
import "./LandingPage.css";
import { motion } from "framer-motion";
import AppHeader from "../../components/layout/AppHeader";
import Reveal from "../../components/utils/Reveal";
import { useFullpageScroll } from "../../components/utils/useFullpageScroll";
import ScrollDots from "@/components/ScrollDots/ScrollDots";

const LandingPage: React.FC = () => {
  // Refs for sections
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const gamificationRef = useRef<HTMLElement>(null);
  const chatboxRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Refs for containers
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(
    () => [heroRef, aboutRef, servicesRef, gamificationRef, chatboxRef, footerRef],
    []
  );

  // Use the optimized full-page scroll hook without routes
  const { activeIndex, scrollToIndex } = useFullpageScroll(sections, containerRef, wrapperRef);

  return (
    <div
      className="landing-page-container"
      ref={containerRef}
      tabIndex={-1} // Make it focusable for keyboard events
    >
      <AppHeader />
      <motion.div className="scroll-wrapper" ref={wrapperRef}>
        {/* Hero Section */}
        <section id="hero" className="hero-section full-page-section" ref={heroRef}>
          <div className="hero-content relative z-20 max-w-[1200px] mx-auto flex flex-col items-end text-right pt-[calc(120px+var(--section-offset,0px)-var(--nudge-up,0px))] ">
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
            className="fox-illustration absolute bottom-[50px] left-[86px] w-[578px] h-[564px] -rotate-[-5deg] z-[3]"
            src="https://api.builder.io/api/v1/image/assets/TEMP/9e48ea33ceadf9e90f946b17a07cc7729d8c8c34?width=1156"
            alt="Fox"
          />
          <img
            className="leaf-decoration-1 absolute bottom-[100px] left-[180px] w-[217px] h-[133px] -rotate-[-18deg] z-[3]"
            src="https://api.builder.io/api/v1/image/assets/TEMP/288871bc2234fd41595e2acaee689ebf87895367?width=433"
            alt="Leaf"
          />
          <img
            className="leaf-decoration-2 absolute bottom-[190px] left-[479px] w-[217px] h-[133px] z-[3]"
            src="https://api.builder.io/api/v1/image/assets/TEMP/1bc954f19c70fdb4619ccc91981956a180bcad93?width=433"
            alt="Leaf"
          />
        </section>

        {/* About Section */}
        <section id="about" className="about-section full-page-section" ref={aboutRef}>
          <Reveal sectionId="about" variant="fade-up" className="about-content">
            <h2 className="about-title">We are BRIGHTNEST</h2>
            <p className="about-description">
              A group of young dreamers turning clicks into care—designing a digital home where
              Vietnamese youth uplift each other through health and honest sharing.
            </p>
            <p className="vietnamese-tagline">Thắp sáng Hành trình Sức khỏe</p>
          </Reveal>
        </section>

        {/* Services Section */}
        <section id="services" className="services-section full-page-section" ref={servicesRef}>
          <Reveal sectionId="services" variant="fade-up">
            <h2 className="services-title">Our services</h2>
            <div className="service-item">
              <div className="service-content">
                <h3 className="service-title">Blog (Article Library)</h3>
                <p className="service-description">
                  Where everyone can explore, rate, and interact with health-related articles. With
                  admin-managed quality control and content tagging, the platform fosters
                  trustworthy information and community-driven discussions.
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

        {/* Gamification Section */}
        <section
          id="gamification"
          className="gamification-section full-page-section"
          ref={gamificationRef}
        >
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
                    <path
                      d="M34 62H56.695"
                      stroke="#FF7B17"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M34 39.5898H56.695"
                      stroke="#FF7B17"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M34 16H56.695"
                      stroke="#FF7B17"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
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

        {/* AI Chatbox Section */}
        <section id="chatbox" className="chatbox-content full-page-section" ref={chatboxRef}>
          <Reveal sectionId="chatbox" variant="scale">
            <div className="chatbox-header">
              <h3 className="chatbox-title">AI Chatbox</h3>
              <p className="chatbox-description">
                Personalized AI Health Assistant with integrated RAG3
              </p>
            </div>
            <div className="chatbox-mockup">
              <div className="chat-message user1">
                <img src="/assets/brightnesslogo.png" alt="Bot Avatar" className="chat-avatar" />
                <div className="chat-bubble">Do you have any questions today?</div>
              </div>
              <div className="chat-message user2">
                <div className="chat-bubble">What exercises are good for beginners?</div>
                <img
                  src="src/assets/images/logo_color.png"
                  alt="User Avatar"
                  className="chat-avatar"
                />
              </div>
            </div>
            <div className="cta-inline">
              <h2 className="cta-title">Start small, shine big—together with us.</h2>
              <button className="cta-button">TRY NOW</button>
            </div>
          </Reveal>
        </section>

        {/* Footer Section */}
        <section id="footer" className="footer-section full-page-section" ref={footerRef}>
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
      </motion.div>

      {/* Right-side scroll dots for Landing sections */}
      <ScrollDots
        items={[
          { id: "dot-hero", targetId: "hero", label: "Hero" },
          { id: "dot-about", targetId: "about", label: "About" },
          { id: "dot-services", targetId: "services", label: "Services" },
          { id: "dot-gamification", targetId: "gamification", label: "Gamification" },
          { id: "dot-chatbox", targetId: "chatbox", label: "AI Chatbox" },
          { id: "dot-footer", targetId: "footer", label: "Footer" },
        ]}
        onSelect={(targetId, index) => scrollToIndex(index)}
        activeIndex={activeIndex}
      />
    </div>
  );
};

export default LandingPage;
