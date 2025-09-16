import React from "react";
import "./AboutPage.css";

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      {/* Header */}
      <header className="about-header">
        <div className="about-brand">
          <div className="about-logo" />
          <div className="about-brand-text">BRIGHTNEST</div>
        </div>
        <nav className="about-nav">
          <a className="about-nav-item" href="#">Home</a>
          <a className="about-nav-item" href="#">Blogs</a>
          <a className="about-nav-item active" href="#">Gamification</a>
          <a className="about-nav-item" href="#">First aid</a>
          <a className="about-nav-item" href="#">About</a>
          <div className="about-actions">
            <span className="about-icon" />
            <span className="about-icon" />
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-text">
          <h1 className="about-hero-title">Thắp sáng Hành trình Sức khỏe</h1>
          <p className="about-hero-sub">
            Empowering young Vietnamese users by offering a safe, engaging,
            personalized platform to improve mental and physical well‑being.
          </p>
        </div>
        <div className="about-hero-visual">
          <div className="about-hero-circle" />
        </div>
      </section>

      {/* Quote + Intro */}
      <section className="about-quote">
        <div className="about-quote-visual">
          <div className="about-quote-circle" />
          <div className="about-quote-blob" />
        </div>
        <div className="about-quote-text">
          <h2 className="about-quote-title">
            "Wellness isn’t just a personal journey… — it’s the strength we build together."
          </h2>
          <p className="about-quote-desc">
            BrightNest is a health platform that blends personalized AI support, a rich article library,
            wellness tracking, and a safe space for both anonymous and public sharing. With a mission to build
            lasting healthy habits, it creates a positive, empowering community where everyone grows stronger—together.
          </p>
        </div>
      </section>

      {/* What makes us stand out */}
      <section className="about-standout">
        <div className="about-standout-head">
          <div className="about-standout-title">WHAT MAKES US</div>
          <div className="about-standout-kicker">STAND OUT?</div>
        </div>
        <div className="about-cards">
          <div className="about-card">
            <div className="about-card-icon">
              {/* simple stacked rectangles icon */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="4" y="20" width="32" height="24" rx="8" stroke="#FF7B17" strokeWidth="3"/><rect x="20" y="12" width="32" height="24" rx="8" stroke="#FF7B17" strokeWidth="3"/></svg>
            </div>
            <div className="about-card-title">GAMIFICATION</div>
          </div>
          <div className="about-card">
            <div className="about-card-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="8" y="12" width="40" height="32" rx="8" stroke="#FF7B17" strokeWidth="3"/><rect x="16" y="24" width="16" height="4" rx="2" fill="#FF7B17"/></svg>
            </div>
            <div className="about-card-title">BLOG</div>
          </div>
          <div className="about-card">
            <div className="about-card-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="6" y="10" width="44" height="28" rx="6" stroke="#FF7B17" strokeWidth="3"/><rect x="14" y="34" width="28" height="12" rx="6" stroke="#FF7B17" strokeWidth="3"/></svg>
            </div>
            <div className="about-card-title">CHATBOX AI</div>
          </div>
        </div>
      </section>

      {/* Closing band */}
      <section className="about-band">
        <div className="about-band-text">
          <h3 className="about-band-title">Shape up the way you choose</h3>
          <p className="about-band-desc">
            We’re not here to preach — we’re here to change the game. With unique gamification, personalized goal setting,
            and an AI chatbox that actually gets you, we make wellness feel real, not rigid. For anyone who’s tired of
            clinical vibes or just wants to grow on their own terms, our vibrant community is where motivation meets momentum.
            No white coats. Just smart support, good vibes, and steady progress.
          </p>
        </div>
        <div className="about-band-visual" />
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="about-footer-inner">
          <div className="about-footer-brand">
            <div className="about-logo" />
            <div className="about-brand-text light">BRIGHTNEST</div>
          </div>
          <div className="about-footer-contacts">
            <div className="about-contact-col">
              <div className="about-contact-title">Contact us</div>
              <div className="about-contact-item">0xxxxxxxxxx</div>
              <div className="about-contact-item">Contact us:</div>
            </div>
            <div className="about-contact-col">
              <div className="about-contact-title">Contact us</div>
              <div className="about-contact-item">0xxxxxxxxxx</div>
              <div className="about-contact-item">Contact us:</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;

