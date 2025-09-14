import React from "react";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img 
            className="logo-image" 
            src="https://api.builder.io/api/v1/image/assets/TEMP/6baac292ed20ef5d5c64b4c24038dc8d93be59a6?width=170" 
            alt="BRIGHTNEST Logo" 
          />
          <div className="brand-text">
            <span className="brand-bright">BRIGHT</span>
            <span className="brand-nest">NEST</span>
          </div>
        </div>
        <div className="auth-buttons">
          <button className="login-btn">Log in</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <svg className="hero-bg-svg" width="1440" height="815" viewBox="0 0 1440 815" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M382.146 732.226C-80.0807 690.589 -386.095 528.624 -386.095 528.624L-361.624 -48L1928.91 74.9513L1898.37 794.636C1898.37 794.636 1701.51 498.758 1405.6 501.164C1109.69 503.569 844.372 773.864 382.146 732.226Z" fill="#04634D"/>
          <path d="M387.873 746.313C-75.3621 729.491 -386.073 570.801 -386.073 570.801V-7H1905.93V714.155C1905.93 714.155 1696.85 428.911 1401.53 447.196C1106.21 465.481 851.108 763.135 387.873 746.313Z" fill="url(#paint0_linear_1_517)"/>
          <defs>
            <linearGradient id="paint0_linear_1_517" x1="1535" y1="-68.4999" x2="-268.761" y2="1293.66" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E2F043"/>
              <stop offset="0.863144" stopColor="#05644C"/>
            </linearGradient>
          </defs>
        </svg>
        
        <div className="hero-content">
          <h1 className="hero-title">How are you today?</h1>
          
          <div className="emoji-group">
            <div className="emoji-face">
              <svg width="113" height="113" viewBox="0 0 113 113" fill="none">
                <circle cx="56.5" cy="56.5" r="56.5" fill="#E5F249" stroke="black" strokeWidth="2"/>
                <path d="M37 41H37.05" stroke="black" strokeWidth="8" strokeLinecap="round"/>
                <path d="M77 41H77.05" stroke="black" strokeWidth="8" strokeLinecap="round"/>
                <path d="M37 68C37 68 44.437 77.917 56.833 77.917C69.229 77.917 76.666 68 76.666 68" stroke="black" strokeWidth="8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="emoji-face">
              <svg width="113" height="113" viewBox="0 0 113 113" fill="none">
                <circle cx="56.5" cy="56.5" r="56.5" fill="#E5F249" stroke="black" strokeWidth="2"/>
                <path d="M37 41H37.05" stroke="black" strokeWidth="8" strokeLinecap="round"/>
                <path d="M77 41H77.05" stroke="black" strokeWidth="8" strokeLinecap="round"/>
                <path d="M37 68H76.67" stroke="black" strokeWidth="8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="emoji-face">
              <svg width="113" height="113" viewBox="0 0 113 113" fill="none">
                <circle cx="56.5" cy="56.5" r="56.5" fill="#E5F249" stroke="black" strokeWidth="2"/>
                <path d="M37 41H37.05" stroke="black" strokeWidth="8" strokeLinecap="round"/>
                <path d="M77 41H77.05" stroke="black" strokeWidth="8" strokeLinecap="round"/>
                <path d="M76.67 72.917C76.67 72.917 69.23 63 56.83 63C44.44 63 37 72.917 37 72.917" stroke="black" strokeWidth="8" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        <img 
          className="fox-illustration" 
          src="https://api.builder.io/api/v1/image/assets/TEMP/9e48ea33ceadf9e90f946b17a07cc7729d8c8c34?width=1156" 
          alt="Fox character illustration" 
        />
        <img 
          className="leaf-decoration-1" 
          src="https://api.builder.io/api/v1/image/assets/TEMP/288871bc2234fd41595e2acaee689ebf87895367?width=433" 
          alt="Leaf decoration" 
        />
        <img 
          className="leaf-decoration-2" 
          src="https://api.builder.io/api/v1/image/assets/TEMP/1bc954f19c70fdb4619ccc91981956a180bcad93?width=433" 
          alt="Leaf decoration" 
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
            A group of young dreamers turning clicks into care—designing a digital home where Vietnamese youth 
            uplift each other through health and honest sharing.
          </p>
          <p className="vietnamese-tagline">Thắp sáng Hành trình Sức khỏe</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2 className="services-title">Our services</h2>
        
        {/* Blog Service */}
        <div className="service-item">
          <div className="service-content">
            <h3 className="service-title">Blog (Article Library)</h3>
            <p className="service-description">
              Where everyone can explore, rate, and interact with health-related articles. 
              With admin-managed quality control and content tagging, the platform fosters 
              trustworthy information and community-driven discussions.
            </p>
          </div>
          <div>
            <img 
              className="service-image" 
              src="https://api.builder.io/api/v1/image/assets/TEMP/6d4dfd2294452fce40337b54a469a713ddcf0572?width=1600" 
              alt="Blog service illustration" 
            />
          </div>
        </div>

        {/* Gamification Service */}
        <div className="service-item reverse">
          <div className="service-content">
            <h3 className="service-title">Gamification</h3>
            <p className="service-description">
              It brings motivation to daily health habits through engaging features like task checklists, 
              progress tracking, and competitive leaderboards—turning personal growth into a fun, 
              goal-driven experience.
            </p>
          </div>
          <div className="gamification-icons">
            <div className="gamification-item">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/e146cec419566a54360918862878f7cdb6aa4b7b?width=174" 
                alt="Racing top icon" 
                style={{ width: '87px', height: '70px' }}
              />
              <div className="gamification-title">Racing top</div>
            </div>
            <div className="gamification-item">
              <svg width="90" height="16" viewBox="0 0 110 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.63802 32.1982C1.63661 38.004 7.15265 41.901 12.9584 40.9024C18.7642 39.9038 22.6612 34.3877 21.6626 28.5819C20.664 22.7762 15.148 18.8792 9.34221 19.8778C3.53642 20.8764 -0.360575 26.3924 0.63802 32.1982ZM88.4493 12.9183C89.4479 18.7241 94.964 22.6211 100.77 21.6225C106.576 20.6239 110.473 15.1079 109.474 9.30211C108.475 3.49633 102.959 -0.400667 97.1535 0.597928C91.3477 1.59652 87.4507 7.11256 88.4493 12.9183Z" fill="#FF7B17"/>
              </svg>
              <div className="gamification-title">Tracking</div>
            </div>
            <div className="gamification-item full-width">
              <svg width="68" height="80" viewBox="0 0 68 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 62H56.695" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round"/>
                <path d="M34 39.5898H56.695" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round"/>
                <path d="M34 16H56.695" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round"/>
                <rect x="2" y="2" width="64" height="75.3333" rx="8" stroke="#FF7B17" strokeWidth="4"/>
                <path d="M13.5996 16.9434L19.0023 20.6098L25.7014 12.4668" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round"/>
                <path d="M13.5996 39.6094L19.0023 43.2758L25.7014 35.1328" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round"/>
                <path d="M13.5996 61.1436L19.0023 64.81L25.7014 56.667" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <div className="gamification-title">Daily task</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbox Section */}
      <section className="chatbox-section">
        <div className="chatbox-bg"></div>
        <div className="chatbox-content">
          <h3 className="chatbox-title">AI Chatbox</h3>
          <p className="chatbox-description">Personalized AI Health Assistant with integrated RAG3</p>
          
          <div className="chat-bubbles">
            <div style={{ position: 'relative' }}>
              <div className="chat-avatar left"></div>
              <div className="chat-bubble user1">Do you have any questions today?</div>
            </div>
            <div style={{ position: 'relative' }}>
              <div className="chat-bubble user2">What exercises are good for beginners?</div>
              <div className="chat-avatar right"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Start small, shine big—together with us.</h2>
        <button className="cta-button">TRY NOW</button>
      </section>

      {/* Footer */}
      <footer className="footer">
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
              <div className="contact-icon">
                <svg width="27" height="10" viewBox="0 0 27 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.49939L13.5 8.2485L26 1.49939" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <span className="footer-contact-text">Contact us:</span>
            </div>
            <div className="footer-contact-item">
              <div className="contact-icon">
                <svg width="7" height="6" viewBox="0 0 7 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="3.4625" cy="3.18748" r="1.7125" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <span className="footer-contact-text">0xxxxxxxxxx</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
