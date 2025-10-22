import React, { useRef, useState } from "react";
import "./Homepage.css";
import HomepageHeader from "../../components/layout/HomepageHeader";
import WhatNewCarousel from "./WhatNewCarousel";
import ChatFAB from "@/components/ChatFAB/ChatFAB";
import GameFooter from "@/components/layout/GameFooter";
import { useNavigate } from 'react-router-dom';
import TopPerformanceSection from './TopPerformanceSection';

const Homepage: React.FC = () => {
  const whatRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string>("");

  const handleQuestionClick = (question: string) => {
    setChatInitialMessage(question);
    setChatOpen(true);
  };

  const handleChatOpenChange = (open: boolean) => {
    setChatOpen(open);
    if (!open) {
      // Clear initial message when chat closes
      setChatInitialMessage("");
    }
  };


  return (
    <div className="homepage min-h-screen w-full overflow-x-hidden">
      {/* Hero (Header + Achievement + Mood) */}
      <section className="mood-section relative py-20 text-center">
        <svg
          className="mood-bg"
          width="1440"
          height="1407"
          viewBox="0 0 1440 807"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M453.946 806.253C-9.28906 787.959 -320 615.378 -320 615.378V-13H1972V771.28C1972 771.28 1762.92 461.068 1467.6 480.953C1172.28 500.838 917.181 824.548 453.946 806.253Z"
            fill="url(#paint0_linear_1_707)"
          />
          <defs>
            {/* Match header gradient: right-to-left E2F043 → 05644C */}
            <linearGradient
              id="paint0_linear_1_707"
              x1="1440"
              y1="0"
              x2="0"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E2F043" />
              <stop offset="0.9" stopColor="#05644C" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mood-inner relative z-1 max-w-[500px] ml-[91px] pr-[150px] grid  text-center">
          <div className="mood-content  mt-1 text-left">
            <div className="achievement">
              <div>
                <h2 className="achievement-title text-[#046753] text-[48px] font-bold mx-auto ">
                  Achievement
                </h2>
                <h5 className="achievement-subtitle text-[#046753] font-normal ">
                  Take a closer look on what you did yesterday
                </h5>
                <div className="achievement-stats grid grid-cols-4 ">
                  <div className="stat text-[#046753] mx-auto text-center">
                    <div className="stat-value text-[36px] font-bold">1500</div>
                    <div className="stat-label text-[20px] font-normal">Step</div>
                    <div className="stat-sub text-black/60 text-[16px]">~150m</div>
                  </div>
                  <div className="stat text-[#046753] mx-auto text-center">
                    <div className="stat-value text-[36px] font-bold">8h03</div>
                    <div className="stat-label text-[20px] font-normal">Sleep</div>
                  </div>
                  <div className="stat text-[#046753 ] mx-auto text-center">
                    <div className="stat-value text-[36px] font-bold">12K</div>
                    <div className="stat-label text-[20px] font-normal">Calories</div>
                  </div>
                  <div className="stat text-[#046753] mx-auto text-center">
                    <div className="stat-value text-[36px] font-bold">3 cups</div>
                    <div className="stat-label text-[20px] font-normal">Water</div>
                    <div className="stat-sub text-black/60 text-[16px]">~1,2L</div>
                  </div>
                </div>
              </div>
            </div>

            <h1
              className="mood-title text-[#ffffff] text-[80px] mb-5 whitespace-nowrap"
              style={{ fontFamily: "Pacifico" }}
            >
              How are you today?
            </h1>

            <div className="mood-emojis flex justify-start gap-[56px] mb-[120px]">
              <div className="mood-emoji">
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
              <div className="mood-emoji">
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
              <div className="mood-emoji">
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
        </div>

        <img className="mood-fox" src="/assets/fox-home.png" alt="Fox character" />
      </section>

      {/* What's New Section */}
        <section className="whats-new-section relative mx-auto px-1 rounded-t-[100px] overflow-hidden">
          <WhatNewCarousel 
            onReadMore={() => navigate('/blogs')} 
          />
        </section>
      {/* Q&A Section */}
      <section className="  qa-section relative py-[100px]   ">
        <div
          className="qa-bubble absolute top-20 right-[250px] text-[#FED700] font-bold text-[40px] z-20 flex items-center justify-center text-center"
          style={{
            backgroundImage: "url('/assets/Vector.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "450px",
            height: "100px",
          }}
        >
          <h5 className="qa-bubble-text  absolute bottom-10">What you wonder?</h5>
        </div>

        <div className="qa-questions max-w-[800px] ml-[91px] px-5 flex flex-col gap-5 mt-[100px] items-start">
          <button 
            onClick={() => handleQuestionClick("What are my stats?")}
            className="qa-question bg-[#AEFFC4] rounded-[102px] py-[17px] px-[30px] font-bold text-[#007E85] hover:bg-[#9EEfB4] transition-colors"
          >
            What are my stats?
          </button>
          <button 
            onClick={() => handleQuestionClick("How to start working out?")}
            className="qa-question bg-[#AEFFC4] rounded-[102px] py-[17px] px-[30px] font-bold text-[#007E85] hover:bg-[#9EEfB4] transition-colors"
          >
            How to start working out?
          </button>
          <button 
            onClick={() => handleQuestionClick("What exercises are good for beginners?")}
            className="qa-question bg-[#AEFFC4] rounded-[102px] py-[17px] px-[30px] font-bold text-[#007E85] hover:bg-[#9EEfB4] transition-colors"
          >
            What exercises are good for beginners?
          </button>
          <button 
            onClick={() => handleQuestionClick("How much protein do I need per day?")}
            className="qa-question bg-[#AEFFC4] rounded-[102px] py-[17px] px-[30px] font-bold text-[#007E85] hover:bg-[#9EEfB4] transition-colors"
          >
            How much protein do I need per day?
          </button>
        </div>
      </section>

      {/* Top Performance Section */}
      <TopPerformanceSection />

      {/* Improve Experience Section */}
      <section className="improve-section grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center py-[100px] max-w-[1200px] mx-auto px-5">
        {/* Left: Content */}
  <div className="improve-content md:pr-12">
    <h2 className="text-[#046753] font-bold text-[48px] leading-tight mb-4">
      Improve your experience
    </h2>

    <h3 className="text-black font-bold text-[22px] mb-6">
      Description
    </h3>

    <div className="space-y-6 text-black text-[18px] leading-relaxed">
      <p>
        Welcome to <strong>BrightNest</strong> — your home for a brighter, more balanced fitness journey.
      </p>

      <p>
        “<em>Bright</em>” represents energy, positivity, and growth. <br />
        “<em>Nest</em>” stands for care, comfort, and nurturing your body and mind.
      </p>

      <p>
        At BrightNest, we believe fitness is more than workouts — it’s about building a lifestyle that helps you shine from within.  
        Sign up to receive updates on new features, exclusive offers, and practical fitness tips to keep your motivation alive every day.
      </p>
    </div>

    <button
      onClick={() => navigate("/about")}
      className="mt-10 bg-[#046753] text-white font-bold text-[24px] px-10 py-3 rounded-full hover:bg-[#058a6e] transition-all"
    >
      TRY
    </button>
  </div>

        <div className="improve-visual relative min-h-[368px]">
          <div
            className="improve-bg-green absolute right-0 top-0 w-[350px] h-[368px] rounded-[20px]"
            style={{ background: "rgba(4,103,83,0.75)" }}
          ></div>
          <div
            className="improve-bg-yellow absolute left-0 bottom-0 w-[350px] h-[407px] rounded-[20px]"
            style={{ background: "rgba(226,240,67,0.75)" }}
          ></div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ width: "100%" }}>
        <GameFooter />
      </div>

      {/* AI Chat FAB */}
      <ChatFAB 
        openChat={chatOpen}
        onChatOpenChange={handleChatOpenChange}
        initialMessage={chatInitialMessage}
      />
    </div>
  );
};

export default Homepage;
