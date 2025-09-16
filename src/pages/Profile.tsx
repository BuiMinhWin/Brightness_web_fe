import React from "react";
import "./Profile.css";

const Profile: React.FC = () => {
  return (
    <div className="pf-page">
      {/* Topbar */}
      <div className="pf-topbar">
        <div className="pf-brand"><div className="pf-logo"/><div className="pf-brand-name">BRIGHTNEST</div></div>
        <nav className="pf-nav">
          <a href="#">Home</a>
          <a href="#">Blogs</a>
          <a href="#">Gamification</a>
          <a href="#">First aid</a>
          <a href="#">About</a>
        </nav>
        <div className="pf-actions"><div className="pf-circle"/><div className="pf-circle"/></div>
      </div>

      <div className="pf-wrap">
        {/* Left rail */}
        <aside className="pf-rail">
          <div style={{height:12}}/>
          {Array.from({length:5}).map((_,i)=> <div className="pf-ico" key={i}/>) }
        </aside>

        {/* Left profile column */}
        <section>
          <div className="pf-title">Profile</div>

          <div className="pf-card pf-header">
            <div className="pf-avatar" />
            <div>
              <div className="pf-name">Name</div>
              <div className="pf-class">Class</div>
            </div>
            <button className="pf-edit">Edit</button>
          </div>

          <div className="pf-stats">
            <div className="pf-stat-box">
              <div>
                <div className="pf-stat-num">15</div>
                <div className="pf-stat-label">Post</div>
              </div>
              <div>
                <div className="pf-stat-num">567</div>
                <div className="pf-stat-label">Like</div>
              </div>
            </div>

            <div className="pf-metrics">
              <div className="pf-chip">
                <div className="pf-chip-ico">⚡</div>
                <div>
                  <div className="pf-chip-title">55</div>
                  <div className="pf-chip-sub">Active day</div>
                </div>
              </div>
              <div className="pf-chip">
                <div className="pf-chip-ico">📊</div>
                <div>
                  <div className="pf-chip-title">#2</div>
                  <div className="pf-chip-sub">Leaderboard</div>
                </div>
              </div>
              <div className="pf-chip">
                <div className="pf-chip-ico">✅</div>
                <div>
                  <div className="pf-chip-title">95%</div>
                  <div className="pf-chip-sub">Reach target</div>
                </div>
              </div>
              <div className="pf-chip">
                <div className="pf-chip-ico">🏆</div>
                <div>
                  <div className="pf-chip-title">3/4</div>
                  <div className="pf-chip-sub">Challenge done</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right column Recent post */}
        <aside className="pf-post">
          <div className="pf-post-head">
            <div className="pf-post-title">Recent post</div>
            <div className="pf-post-date">hh:mm, dd/mm/yyyy</div>
          </div>
          <div className="pf-post-body">
            Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel facilisis volutpat est velitolm.
            Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel facilisis volutpat est velitolm.
            Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalaracc lacus vel facilisis volutpat est velitolm.
          </div>
          <div className="pf-grid">
            <div className="pf-ph" /><div className="pf-ph" />
            <div className="pf-ph" /><div className="pf-ph" />
          </div>
          <div className="pf-post-actions">💬 28  🔁 15  🤍 31</div>
          <div className="pf-hr" />
        </aside>
      </div>
    </div>
  );
};

export default Profile;

