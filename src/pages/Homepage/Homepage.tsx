import React from "react";
import "./Homepage.css";
import AppHeader from "../../components/layout/AppHeader";

const Homepage: React.FC = () => {
  return (
    <div className="homepage">
      <AppHeader />

      {/* Hero (Achievement + Mood) */}
      <section className="mood-section">
        <svg
          className="mood-bg"
          width="1440"
          height="807"
          viewBox="0 0 1440 807"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M453.946 806.253C-9.28906 787.959 -320 615.378 -320 615.378V-13H1972V771.28C1972 771.28 1762.92 461.068 1467.6 480.953C1172.28 500.838 917.181 824.548 453.946 806.253Z"
            fill="url(#paint0_linear_1_707)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_1_707"
              x1="1475.5"
              y1="-36.4999"
              x2="-102.5"
              y2="741"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E2F043" />
              <stop offset="1" stopColor="#05644C" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mood-inner">
          <div className="achievement-card">
            <h2 className="achievement-title">Achievement</h2>
            <p className="achievement-subtitle">Take a closer look at what you did yesterday</p>
            <div className="achievement-stats">
              <div className="stat-item">
                <h3 className="stat-value">1500</h3>
                <p className="stat-label">Step</p>
                <p className="stat-sublabel">12%</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-value">8h03</h3>
                <p className="stat-label">Sleep</p>
                <p className="stat-sublabel">+4%</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-value">12K</h3>
                <p className="stat-label">Calories</p>
                <p className="stat-sublabel">-8%</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-value">3 cups</h3>
                <p className="stat-label">Water</p>
                <p className="stat-sublabel">+5%</p>
              </div>
            </div>
          </div>

          <div className="mood-content">
            <h1 className="mood-title">How are you today?</h1>

            <div className="mood-emojis">
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
      <section className="whats-new-section">
        <h2 className="whats-new-title">What new?</h2>

        <div className="article-cards">
          <div className="article-card">
            <div className="article-avatar"></div>
            <h4 className="article-author">Name</h4>
            <div className="article-rating">★★★★★</div>
            <p className="article-content">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel
              facilisis volutpat est velitolm.
            </p>
            <a href="#" className="article-link">
              Read more →
            </a>
          </div>

          <div className="article-card">
            <div className="article-avatar"></div>
            <h4 className="article-author">Name</h4>
            <div className="article-rating">★★★★★</div>
            <p className="article-content">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel
              facilisis volutpat est velitolm.
            </p>
            <a href="#" className="article-link">
              Read more →
            </a>
          </div>

          <div className="article-card">
            <div className="article-avatar"></div>
            <h4 className="article-author">Name</h4>
            <div className="article-rating">★★★★★</div>
            <p className="article-content">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel
              facilisis volutpat est velitolm.
            </p>
            <a href="#" className="article-link">
              Read more →
            </a>
          </div>
        </div>

        <div className="carousel-controls">
          <div className="carousel-arrow left"></div>
          <div className="carousel-arrow right"></div>
        </div>
      </section>

      {/* Q&A Section */}
      <section className="qa-section">
        <div className="qa-bubble">What you wonder?</div>

        <div className="qa-questions">
          <button className="qa-question">When will I see results?</button>
          <button className="qa-question">How to start working out?</button>
          <button className="qa-question">What exercises are good for beginners?</button>
          <button className="qa-question">How much protein do I need per day?</button>
        </div>
      </section>

      {/* Top Performance Section */}
      <section className="top-performance-section">
        <h2 className="top-performance-title">Top performance</h2>

        <div className="performance-cards">
          <div className="performance-card">
            <div className="performance-avatar"></div>
            <h4 className="performance-name">Name</h4>
            <h3 className="performance-title">Top about</h3>
            <p className="performance-description">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus
            </p>
          </div>

          <div className="performance-card featured">
            <div className="performance-avatar featured"></div>
            <h4 className="performance-name">Name</h4>
            <h3 className="performance-title">Top about</h3>
            <p className="performance-description">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel
              facilisis volutpat est velitolm.
            </p>
          </div>

          <div className="performance-card">
            <div className="performance-avatar"></div>
            <h4 className="performance-name">Name</h4>
            <h3 className="performance-title">Top about</h3>
            <p className="performance-description">
              Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus
            </p>
          </div>
        </div>

        <button className="view-more-btn">View more →</button>
      </section>

      {/* Improve Experience Section */}
      <section className="improve-section">
        <div className="improve-content">
          <h2 className="improve-title">Improve your experience</h2>
          <h3 className="improve-subtitle">Description</h3>
          <p className="improve-description">
            Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel
            facilisis volutpat est velitolm. Lorem ipsum dolor sit amet consecte tur adipiscing elit
            semper dalaracc lacus vel facilisis volutpat est velitolm. Lorem ipsum dolor sit amet
            consecte tur adipiscing elit semper dalaracc lacus vel facilisis volutpat est velitolm.
          </p>
          <button className="improve-cta">TRY</button>
        </div>

        <div className="improve-visual">
          <div className="improve-bg-green"></div>
          <div className="improve-bg-yellow"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="homepage-footer-content">
          <div className="homepage-footer-logo">
            <img
              className="homepage-footer-logo-image"
              src="https://api.builder.io/api/v1/image/assets/TEMP/de986a7279fe24b5c6a9695fbf1915b1da6131e9?width=162"
              alt="BRIGHTNEST Logo"
            />
            <div className="homepage-footer-brand">BRIGHTNEST</div>
          </div>

          <div className="homepage-footer-contact">
            <h4 className="homepage-footer-contact-title">Contact us</h4>
            <div className="homepage-footer-contact-item">
              <div className="homepage-contact-icon">
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
              <span className="homepage-footer-contact-text">Contact us:</span>
            </div>
            <div className="homepage-footer-contact-item">
              <div className="homepage-contact-icon">
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
              <span className="homepage-footer-contact-text">0xxxxxxxxxx</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
