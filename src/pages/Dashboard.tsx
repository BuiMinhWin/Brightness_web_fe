import React from "react";
import "./Dashboard.css";

const LineChart = () => (
  <svg viewBox="0 0 640 240" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <g stroke="rgba(255,255,255,.5)" strokeDasharray="2 6">
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="0" x2="640" y1={40+i*40} y2={40+i*40} />
      ))}
    </g>
    <path d="M20 190 C 100 100, 140 130, 200 120 S 260 160, 320 120 400 110, 460 160 520 80, 620 80" fill="none" stroke="#eaf7f2" strokeWidth="6" strokeLinecap="round"/>
    <path d="M20 190 C 100 120, 140 140, 200 130 S 260 170, 320 130 400 120, 460 170 520 90, 620 90" fill="url(#g)" stroke="none"/>
    {[80,200,300,380,500,620].map((x,i)=> (
      <circle key={i} cx={x} cy={[150,130,170,130,150,90][i]} r="6" fill="#0b7e63" stroke="#eaf7f2" strokeWidth="3"/>
    ))}
  </svg>
);

const Gauge = () => (
  <svg viewBox="0 0 200 120">
    <path d="M20 100 A 80 80 0 0 1 180 100" fill="#eaf2ef" />
    <path d="M20 100 A 80 80 0 0 1 160 60" fill="#0b7e63" />
    <line x1="100" y1="100" x2="165" y2="65" stroke="#222" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const Dashboard: React.FC = () => {
  return (
    <div className="db-page">
      {/* Topbar */}
      <div className="db-topbar">
        <div className="db-brand">
          <div className="db-logo" />
          <div className="db-brand-name">BRIGHTNEST</div>
        </div>
        <nav className="db-nav">
          <a href="#" className="active">Home</a>
          <a href="#">Blogs</a>
          <a href="#">Gamification</a>
          <a href="#">First aid</a>
          <a href="#">About</a>
        </nav>
        <div className="db-actions">
          <div className="db-circle" />
          <div className="db-circle" />
        </div>
      </div>

      <div className="db-wrap">
        {/* Left rail */}
        <aside className="db-rail">
          <div>
            <div className="db-ico" />
            <div className="db-ico" />
            <div className="db-ico" />
            <div className="db-ico" />
          </div>
          <div className="db-rail-footer" />
        </aside>

        {/* Main */}
        <main className="db-main">
          <div>
            <h1 className="db-title">Own Your Journey</h1>

            <div className="db-chart-card">
              <div className="db-chart-head">
                <div>Daily Walking</div>
                <div className="db-chip">Weekly ▾</div>
              </div>
              <div className="db-chart"><LineChart /></div>
              <div className="db-week">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>

            <div className="db-cards">
              <div className="db-card">
                <div className="db-card-head"><div className="db-card-ico">🏃</div><div><div>Cyberling Hero</div><small>10 km / week</small></div></div>
                <div className="db-progress">
                  <div className="db-progress-bar"><div className="db-progress-fill" style={{width:'55%'}}/></div>
                </div>
                <div className="db-target">Target: 10km</div>
              </div>
              <div className="db-card">
                <div className="db-card-head"><div className="db-card-ico">🏃‍♀️</div><div><div>Daily Running</div><small>5 km / week</small></div></div>
                <div className="db-progress">
                  <div className="db-progress-bar"><div className="db-progress-fill" style={{width:'75%'}}/></div>
                </div>
                <div className="db-target">Target: 5km/ week</div>
              </div>
              <div className="db-card">
                <div className="db-card-head"><div className="db-card-ico">👣</div><div><div>Daily Steps</div><small>10000 steps / week</small></div></div>
                <div className="db-progress">
                  <div className="db-progress-bar"><div className="db-progress-fill" style={{width:'66%'}}/></div>
                </div>
                <div className="db-target">Target: 10000/week</div>
              </div>
            </div>
          </div>

          <div className="db-mini-col">
            <div className="db-mini green">
              <div className="db-mini-title">15 / 07</div>
              <div>Go to gym at 6pm</div>
            </div>
            <div className="db-mini lime">
              <div className="db-mini-title">Calories</div>
              <div className="db-mini-value">3200</div>
            </div>
            <div className="db-mini orange">
              <div className="db-mini-title">Water</div>
              <div>Total Glass</div>
              <div className="db-mini-value">4</div>
              <div className="db-curve" />
            </div>
          </div>
        </main>

        {/* Right column */}
        <aside className="db-right">
          <div className="db-user">
            <div className="db-user-head">
              <div className="db-avatar" />
              <button className="db-edit">Edit</button>
            </div>
            <div className="db-user-name">Name</div>
            <div className="db-user-meta">Joined 4 months ago</div>
            <div className="db-user-meta">180 m · 82 kg · 30 yrs</div>
          </div>
          <div className="db-gauge">
            <div className="db-gauge-title">Weight loss Goal</div>
            <div><strong>Loss:</strong> 5kg / Month</div>
            <Gauge />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;

