import React, { useRef } from "react";
import "./Homepage.css";

import AppHeader from "../../components/layout/AppHeader";
import HomepageHeader from "../../components/layout/HomepageHeader";
import WhatNewCarousel from "./WhatNewCarousel";

const Homepage: React.FC = () => {
  const whatRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="homepage min-h-screen w-full overflow-x-hidden">
      {/* Hero (Header + Achievement + Mood) */}
      <section className="mood-section relative py-10 text-center">
        <HomepageHeader />
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
      <section className="whats-new-section relative  mx-auto px-1 rounded-t-[100px] overflow-hidden">
        <WhatNewCarousel />
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
          <h5 className="qa-bubble-text  absolute -bottom-2.25">What you wonder?</h5>
        </div>

        <div className="qa-questions max-w-[800px] ml-[91px] px-5 flex flex-col gap-5 mt-[100px] items-start">
          <button className="qa-question bg-[#AEFFC4] rounded-[102px] py-[17px] px-[30px] font-bold text-[#007E85]">
            When will I see results?
          </button>
          <button className="qa-question bg-[#AEFFC4] rounded-[102px] py-[17px] px-[30px] font-bold text-[#007E85]">
            How to start working out?
          </button>
          <button className="qa-question bg-[#AEFFC4] rounded-[102px] py-[17px] px-[30px] font-bold text-[#007E85]">
            What exercises are good for beginners?
          </button>
          <button className="qa-question bg-[#AEFFC4] rounded-[102px] py-[17px] px-[30px] font-bold text-[#007E85]">
            How much protein do I need per day?
          </button>
        </div>
      </section>

      {/* Top Performance Section */}
      <section
        className="top-performance-section relative py-[100px] rounded-[100px] my-[50px]"
        style={{
          backgroundImage: "url('/assets/Ellipse.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <h2 className="top-performance-title text-white text-center font-bold text-[48px] mb-[50px]">
          Top performance
        </h2>

        <div className="performance-cards flex justify-center gap-10 max-w-[1200px] mx-auto px-5 flex-wrap">
          <div className="performance-card bg-white rounded-[16px] p-[30px] text-center w-[312px] relative">
            <div className="performance-avatar w-[265px] h-[265px] rounded-full bg-[#4b1414] -mt-[50px] mx-auto mb-5"></div>
            <h4 className="performance-name font-bold text-[24px] mb-2">Name</h4>
            <h3 className="performance-title font-bold text-[48px] mb-5">Top about</h3>
            <p className="performance-description">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus
            </p>
          </div>

          <div className="performance-card featured bg-[#FF9C50] text-white rounded-[16px] p-[30px] text-center w-[344px] relative scale-[1.1]">
            <div className="performance-avatar featured w-[292px] h-[292px] rounded-full bg-[#4b1414] -mt-[50px] mx-auto mb-5"></div>
            <h4 className="performance-name font-bold text-[24px] mb-2">Name</h4>
            <h3 className="performance-title font-bold text-[48px] mb-5">Top about</h3>
            <p className="performance-description">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel
              facilisis volutpat est velitolm.
            </p>
          </div>

          <div className="performance-card bg-white rounded-[16px] p-[30px] text-center w-[312px] relative">
            <div className="performance-avatar w-[265px] h-[265px] rounded-full bg-[#4b1414] -mt-[50px] mx-auto mb-5"></div>
            <h4 className="performance-name font-bold text-[24px] mb-2">Name</h4>
            <h3 className="performance-title font-bold text-[48px] mb-5">Top about</h3>
            <p className="performance-description">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus
            </p>
          </div>
        </div>

        <button className="view-more-btn bg-[#AEFFC4] rounded-[82.5px] py-[15px] px-[40px] text-black font-bold text-[24px] mx-auto block mt-10">
          View more →
        </button>
      </section>

      {/* Improve Experience Section */}
      <section className="improve-section grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center py-[100px] max-w-[1200px] mx-auto px-5">
        <div className="improve-content pr-0 md:pr-10">
          <h2 className="improve-title text-[#046753] font-bold text-[48px] leading-[46px] mb-5">
            Improve your experience
          </h2>
          <h3 className="improve-subtitle text-black font-bold text-[24px] mb-[30px]">
            Description
          </h3>
          <p className="improve-description text-black text-[20px] leading-8 mb-[30px]">
            Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel
            facilisis volutpat est velitolm. Lorem ipsum dolor sit amet consecte tur adipiscing elit
            semper dalaracc lacus vel facilisis volutpat est velitolm. Lorem ipsum dolor sit amet
            consecte tur adipiscing elit semper dalaracc lacus vel facilisis volutpat est velitolm.
          </p>
          <button className="improve-cta bg-[#046753] text-white text-center font-bold text-[32px] py-4 px-11 rounded-[16px]">
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
      <footer className="homepage-footer bg-[#05644C] py-[63px] text-white">
        <div className="homepage-footer-content max-w-[1200px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center">
          <div className="homepage-footer-logo flex items-center gap-5">
            <img
              className="homepage-footer-logo-image w-[81px] h-[81px]"
              src="https://api.builder.io/api/v1/image/assets/TEMP/de986a7279fe24b5c6a9695fbf1915b1da6131e9?width=162"
              alt="BRIGHTNEST Logo"
            />
            <div className="homepage-footer-brand font-[600] text-[26px] text-[#ffffff] tracking-[-2.34px] capitalize">
              BRIGHTNEST
            </div>
          </div>

          <div className="homepage-footer-contact text-left">
            <h4 className="homepage-footer-contact-title text-[20px] font-bold leading-[18px] mb-5">
              Contact us
            </h4>
            <div className="homepage-footer-contact-item flex items-center gap-[15px] mb-[15px]">
              <div className="homepage-contact-icon w-[25px] h-[25px] border-2 border-white rounded-[8px] flex items-center justify-center">
                <svg
                  width="27"
                  height="10"
                  viewBox="0 0 27 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1.49939L13.5 8.2485L26 1.49939" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="homepage-footer-contact-text font-bold text-[16px] leading-[18px]">
                Contact us:
              </span>
            </div>
            <div className="homepage-footer-contact-item flex items-center gap-[15px] mb-[15px]">
              <div className="homepage-contact-icon w-[25px] h-[25px] border-2 border-white rounded-[8px] flex items-center justify-center">
                <svg
                  width="7"
                  height="6"
                  viewBox="0 0 7 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="3.4625" cy="3.18748" r="1.7125" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="homepage-footer-contact-text font-bold text-[16px] leading-[18px]">
                0xxxxxxxxxx
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
