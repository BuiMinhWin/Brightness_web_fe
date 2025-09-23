import React from "react";
import "./Connect.css";
import HomepageHeader from "@/components/layout/HomepageHeader";
import Navbar from "@/components/layout/Navbar";

const Connect: React.FC = () => {
  return (
    <div className="connect-page">
      {/* Topbar */}
      <div className="connect-topbar">
        <Navbar />
      </div>

      <div className="connect-wrap">
        {/* Left rail */}
        <aside className="connect-rail">
          <div style={{ height: 12 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="connect-ico" key={i} />
          ))}
        </aside>

        {/* Main area */}
        <main>
          <h1 className="connect-title">Connect</h1>
          <div className="connect-orbit">
            <div className="orbit">
              <div className="ring r3" />
              <div className="ring r2" />
              <div className="ring r1" />
              <div className="orbit-center" />
              <div className="node n1" />
              <div className="node n2" />
              <div className="node n3" />
              <div className="node n4" />
            </div>
          </div>
          <div className="connect-sub">Find users around you</div>
        </main>

        {/* Close friends card */}
        <aside className="friends">
          <div className="friends-head">
            <div className="friends-title">Close Friends</div>
            <div className="friends-add">+</div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div className="friend-item" key={i}>
              <div className="friend-avatar" />
              <div>
                <div className="friend-name">Name</div>
                <div className="friend-sub">Class</div>
              </div>
              <div className="friend-action">x</div>
            </div>
          ))}
        </aside>

        {/* Search */}
        <div className="connect-search-wrap">
          <div className="connect-search">
            <input placeholder="Search" />
            <span>🔍</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
