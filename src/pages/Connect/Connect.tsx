import React from "react";
import "./Connect.css";

const Connect: React.FC = () => {
  return (
    <div className="connect-page">
      <div className="connect-wrap">
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
