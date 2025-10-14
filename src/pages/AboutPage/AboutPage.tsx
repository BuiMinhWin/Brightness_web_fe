import React from "react";
import "./AboutPage.css";
import logo from "/assets/LogoWhite.png";

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-[#8BD3B8] via-[#BFE8D6] to-[#F2F8D0] text-[#022C3C] overflow-y-auto no-scrollbar flex flex-col min-h-screen">
      <main>
        {/* Header */}
        <section className="relative overflow-hidden min-h-[100vh] flex flex-col">
          <div className="absolute inset-0 z-0">
            {/* Ellipse (below) */}
            <img
              src="/assets/Ellipse 156.svg"
              alt="ellipse"
              className="absolute top-[45%] left-[78%] w-[670px] h-auto transform -translate-x-1/2 -translate-y-1/2"
            />
            {/* URL Background (on top) */}
            <div
              className="absolute top-1/2 left-[70%] top-[52%] transform -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cover bg-center rounded-full"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1200&auto=format&fit=crop')",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col flex-grow">
            <div className="about-hero-text px-25 pt-16 pb-30 text-white max-w-[500px] flex-grow flex items-center">
              <div>
                <h1 className="about-hero-title font-['Pacifico'] text-6xl lg:text-5xl mb-8 leading-tight whitespace-nowrap text-[#0A6A56]">
                  Thắp sáng Hành trình Sức khỏe
                </h1>
                <p className="about-hero-sub text-xl lg:text-2xl opacity-95 leading-relaxed text-[#0A6A56]">
                  Empowering young Vietnamese users by offering a safe, engaging, personalized
                  platform to improve mental and physical well‑being.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section
          className="py-12 px-6"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(68, 146, 127, 0%) , rgba(212, 212, 47, 0.54) 100%)",
          }}
        >
          <div className="grid md:grid-cols-2 items-center gap-12 max-w-6xl mx-auto">
            {/* Left side with images */}
            <div className="relative h-[300px] md:h-[400px]">
              <img
                src="/assets/Mask group.svg"
                alt="mask"
                className="absolute inset-0 w-full h-full object-contain z-10 pt-10 -translate-x-19.5"
              />
              <img
                src="/assets/Asset 6.svg"
                alt="asset"
                className="absolute inset-0 w-full h-full object-contain mt-40 z-0"
              />
            </div>

            {/* Right side with text */}
            <div>
              <h2 className="text-[#0A6A56] font-extrabold text-2xl leading-tight">
                "Wellness isn't just a personal journey… — it's the strength we build together."
              </h2>
              <p className="text-[#022C3C] leading-relaxed mt-4">
                BrightNest is a health platform that blends personalized AI support, a rich article
                library, wellness tracking, and a safe space for both anonymous and public sharing.
                With a mission to build lasting healthy habits, it creates a positive, empowering
                community where everyone grows stronger—together.
              </p>
            </div>
          </div>
        </section>

        {/* What makes us stand out */}
        <section className="bg-gradient-to-r from-[#dce642] to-[#ffaf72] py-16 px-6 text-center">
          <div className="relative inline-block mb-16">
            <div className="relative">
              <div className="text-white font-black text-5xl tracking-wider mb-2 -translate-x-50">
                WHAT MAKES US
              </div>
              <div className=" text-black font-black -rotate-5 text-4xl md:text-6xl tracking-tight leading-none translate-x-50">
                STAND OUT?
              </div>

              {/* Shadow/reflection effect - subtle layers for depth (moved right, black, flipped bottom reflection) */}
              <div
                className="absolute inset-0 text-black font-black -rotate-1 text-4xl md:text-6xl tracking-tight leading-none opacity-10 translate-x-47"
                style={{ transform: "translate(12px,50px) scaleY(-1)" }}
              >
                STAND OUT?
              </div>

              <div
                className="absolute inset-0 text-black font-black -rotate-1 text-4xl md:text-6xl tracking-tight leading-none opacity-10 translate-x-47"
                style={{ transform: "translate(13px,50px) scaleY(-1)" }}
              >
                STAND OUT?
              </div>

              <div
                className="absolute inset-0 text-black font-black -rotate-1 text-4xl md:text-6xl tracking-tight leading-none opacity-10 translate-x-47"
                style={{ transform: "translate(13px,50px) scaleY(-1)" }}
              >
                STAND OUT?
              </div>

              <div
                className="absolute inset-0 text-black font-black -rotate-1 text-4xl md:text-6xl tracking-tight leading-none opacity-10 translate-x-47"
                style={{ transform: "translate(16px,50px) scaleY(-1)" }}
              >
                STAND OUT?
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-4xl p-8 grid place-items-center gap-4 shadow-lg h-80 w-full">
              <div className="about-card-icon">
                <svg width="180" height="180" viewBox="0 0 96 96" fill="none" aria-hidden>
                  <g transform="translate(12,0)">
                    <rect
                      x="26"
                      y="28"
                      width="24"
                      height="50"
                      rx="8"
                      stroke="#FF7B17"
                      strokeWidth="4"
                    />
                    <rect
                      x="44"
                      y="18"
                      width="24"
                      height="60"
                      rx="8"
                      stroke="#FF7B17"
                      strokeWidth="4"
                    />
                    <rect
                      x="10"
                      y="36"
                      width="24"
                      height="42"
                      rx="8"
                      stroke="#FF7B17"
                      strokeWidth="4"
                    />
                  </g>
                </svg>
              </div>
              <div className="text-[#ff7b17] font-extrabold text-xl tracking-wide">
                GAMIFICATION
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 grid place-items-center gap-4 shadow-lg">
              <div className="about-card-icon">
                {/* Blog icon - chat bubbles */}
                <svg width="180" height="180" viewBox="0 0 64 64" fill="none">
                  <path
                    d="M20 12 C14.4772 12 10 16.4772 10 22V34C10 39.5228 14.4772 44 20 44H24L32 52L40 44H44C49.5228 44 54 39.5228 54 34V22C54 16.4772 49.5228 12 44 12H20Z"
                    fill="none"
                    stroke="#FF7B17"
                    strokeWidth="3"
                  />
                  <path
                    d="M36 16C33.7909 16 32 17.7909 32 20V28C32 30.2091 33.7909 32 36 32H38L42 36L46 32H48C50.2091 32 52 30.2091 52 28V20C52 17.7909 50.2091 16 48 16H36Z"
                    fill="none"
                    stroke="#FF7B17"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="text-[#ff7b17] font-extrabold text-xl tracking-wide">BLOG</div>
            </div>
            <div className="bg-white rounded-3xl p-8 grid place-items-center gap-4 shadow-lg">
              <div className="about-card-icon">
                {/* Chatbox AI icon - browser with chat */}
                <svg width="180" height="180" viewBox="0 0 64 64" fill="none">
                  <rect
                    x="3"
                    y="10"
                    width="55"
                    height="44"
                    rx="6"
                    fill="none"
                    stroke="#FF7B17"
                    strokeWidth="3"
                  />
                  <circle cx="14" cy="20" r="2" fill="#FF7B17" />
                  <circle cx="20" cy="20" r="2" fill="#FF7B17" />
                  <circle cx="26" cy="20" r="2" fill="#FF7B17" />
                  <rect x="14" y="28" width="20" height="4" rx="2" fill="#FF7B17" />
                  <rect x="14" y="36" width="16" height="4" rx="2" fill="#FF7B17" />
                  <path
                    d="M42 38C40.8954 38 40 37.1046 40 36V32C40 30.8954 40.8954 30 42 30H48C49.1046 30 50 30.8954 50 32V36C50 37.1046 49.1046 38 48 38H46L44 40L42 38Z"
                    fill="none"
                    stroke="#FF7B17"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="text-[#ff7b17] font-extrabold text-xl tracking-wide">CHATBOX AI</div>
            </div>
          </div>
        </section>

        {/* Closing band */}
        <section
          className="grid md:grid-cols-[1.2fr_1fr] gap-1 items-center  px-1 h-[600px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(80,191,165,0.45) 0%, rgba(211,212,47,0.45) 100%)",
          }}
        >
          <div className="flex flex-col   ">
            {/* changed: center left content vertically */}
            <h3 className="text-[#ff7b17] font-black text-3xl mb-3.5 text-center">
              Shape up the way you choose
            </h3>
            <p className="text-[#022c3c] leading-loose mx-47 ">
              We're not here to preach — we're here to change the game. With unique gamification,
              personalized goal setting, and an AI chatbox that actually gets you, we make wellness
              feel real, not rigid. For anyone who's tired of clinical vibes or just wants to grow
              on their own terms, our vibrant community is where motivation meets momentum. No white
              coats. Just smart support, good vibes, and steady progress.
            </p>
          </div>
          <div
            className="w-full h-full min-h-[500px] rounded-3xl bg-cover bg-center overflow-hidden" /* changed: make image fill the whole right grid cell */
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=1200&auto=format&fit=center')",
            }}
          />
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-[#05644c] text-white py-6">
        <div
          className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 items-center   "
          style={{
            gap: "200px",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="rounded-full"
              style={{
                backgroundImage: `url(${logo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "130px",
                height: "110px",
              }}
            />
            <div className="font-['Lexend_Tera'] tracking-[-1px] text-white font-bold">
              BRIGHTNEST
            </div>
          </div>
          <div className="footer-contact">
            <h4>Contact us</h4>
            <div className="contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92V19.92A2 2 0 0 1 20.02 21.92C8.91 21.92 0 13.01 0 1.92A2 2 0 0 1 2 -0.08H5A2 2 0 0 1 7 1.92"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>0xxxxxxxxxx</span>
            </div>
            <div className="contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span>contact@brightnest.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
