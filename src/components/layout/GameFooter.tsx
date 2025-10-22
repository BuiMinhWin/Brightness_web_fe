import React from "react";
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const GameFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#05644c] py-12">
      <div className="max-w-7xl mx-auto px-8">
        {/* Top Section */}
        <div className="grid grid-cols-4 gap-12 mb-10">
          {/* Logo + Brand + Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/LogoWhite.png"
                className="w-16 h-16"
                alt="BrightNest Logo"
              />
              <span className="text-white text-xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                BRIGHTNEST
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Your AI-powered wellness companion for a healthier, happier life.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-base font-bold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/your-challenges" className="text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Challenges
                </a>
              </li>
              <li>
                <a href="/blogs" className="text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Community
                </a>
              </li>
              <li>
                <a href="/schedule" className="text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Schedule
                </a>
              </li>
              <li>
                <a href="/profile" className="text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  My Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-base font-bold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Help Center
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/about" className="text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-base font-bold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/70">
                <PhoneIcon sx={{ fontSize: 18 }} />
                <span className="text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  0374479899
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <EmailIcon sx={{ fontSize: 18 }} />
                <a href="mailto:brightnest@maildrop.cc" className="text-sm hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  brightnest@maildrop.cc
                </a>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61581767391971" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                >
                  <FacebookIcon sx={{ fontSize: 20, color: 'white' }} />
                </a>
                <a 
                  href="https://www.instagram.com/brightnest.fitness/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                >
                  <InstagramIcon sx={{ fontSize: 20, color: 'white' }} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="pt-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60" style={{ fontFamily: "DM Sans, sans-serif" }}>
              © 2025 BrightNest. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Privacy
              </a>
              <a href="/terms" className="text-sm text-white/60 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Terms
              </a>
              <a href="/faq" className="text-sm text-white/60 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GameFooter;
