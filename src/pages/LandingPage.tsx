import React from "react";
import "./LandingPage.css";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <AppHeader />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">How are you today?</h1>

          <div className="emoji-group">
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
                <path
                  d="M37 41H37.05"
                  stroke="black"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M77 41H77.05"
                  stroke="black"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
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
                <path
                  d="M37 41H37.05"
                  stroke="black"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M77 41H77.05"
                  stroke="black"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M37 68H76.67"
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
                <path
                  d="M37 41H37.05"
                  stroke="black"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M77 41H77.05"
                  stroke="black"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
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
          className="fox-illustration"
          src="https://api.builder.io/api/v1/image/assets/TEMP/9e48ea33ceadf9e90f946b17a07cc7729d8c8c34?width=1156"
          alt="Fox"
        />
        <img
          className="leaf-decoration-1"
          src="https://api.builder.io/api/v1/image/assets/TEMP/288871bc2234fd41595e2acaee689ebf87895367?width=433"
          alt="Leaf"
        />
        <img
          className="leaf-decoration-2"
          src="https://api.builder.io/api/v1/image/assets/TEMP/1bc954f19c70fdb4619ccc91981956a180bcad93?width=433"
          alt="Leaf"
        />
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <img
            className="about-logo"
            src="https://api.builder.io/api/v1/image/assets/TEMP/f158ef054b9c7f3b6944323487763cfceef7df1f?width=1240"
            alt="BRIGHTNEST Logo Large"
          />
          <h2 className="about-title">We are BRIGHTNEST</h2>
          <p className="about-description">
            A group of young dreamers turning clicks into care — designing a
            digital home where Vietnamese youth uplift each other through health
            and honest sharing.
          </p>
          <p className="vietnamese-tagline">Thắp sáng Hành trình Sức khỏe</p>
        </div>
      </section>

      {/* Middle combined gradient wrapper */}
      <div className="landing-combined">
        {/* Services Section */}
        <section className="services-section">
          <h2 className="services-title">Our services</h2>

          {/* Blog Service */}
          <div className="service-item">
            <div className="service-content">
              <h3 className="service-title">Blog (Article Library)</h3>
              <p className="service-description">
                Where everyone can explore, rate, and interact with
                health-related articles. With admin-managed quality control and
                content tagging, the platform fosters trustworthy information
                and community-driven discussions.
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

          {/* Gamification Service */}
          <div className="service-item reverse">
            <div className="service-content">
              <h3 className="service-title">Gamification</h3>
              <p className="service-description">
                It brings motivation to daily health habits through engaging
                features like task checklists, progress tracking, and
                competitive leaderboards - turning personal growth into a fun,
                goal-driven experience.
              </p>
            </div>
            <div className="gamification-icons">
              {/* Top-left: Racing top */}
              <div className="gami-card tl">
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 96 96"
                  fill="none"
                  aria-hidden
                >
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

              {/* Top-right: Tracking */}
              <div className="gami-card tr">
                <svg
                  width="120"
                  height="96"
                  viewBox="0 0 120 96"
                  fill="none"
                  aria-hidden
                >
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

              {/* Bottom-left: Daily task */}
              <div className="gami-card bl">
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 68 80"
                  fill="none"
                  aria-hidden
                >
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

              {/* Bottom-right: empty card to complete layout */}
            </div>
          </div>
        </section>

        {/* AI Chatbox Section */}
        <div className="chatbox-content">
          <div className="chatbox-header">
            <h3 className="chatbox-title">AI Chatbox</h3>
            <p className="chatbox-description">
              Personalized AI Health Assistant with integrated RAG3
            </p>
          </div>
          <div className="chatbox-mockup">
            <div className="chat-dot left" />
            <div className="chat-dot right" />
            <div className="chat-bubbles">
              <div className="chat-bubble user1">
                Do you have any questions today?
              </div>
              <div className="chat-bubble user2">
                What exercises are good for beginners?
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="cta-section">
          <h2 className="cta-title">
            Start small, shine big—together with us.
          </h2>
          <button className="cta-button">TRY NOW</button>
        </section>
      </div>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default LandingPage;
