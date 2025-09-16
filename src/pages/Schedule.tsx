import React from "react";
import "./Schedule.css";

const Schedule: React.FC = () => {
  const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  // Mock month grid for July layout (starts on Mon in this composition)
  const rows = [
    ["30","1","2","3","4","5","6"],
    ["7","8","9","10","11","12","13"],
    ["14","15","16","17","18","19","20"],
    ["15","22","23","24","25","26","27"],
    ["15","29","30","31","1","2","3"],
  ];

  return (
    <div className="sch-page">
      {/* Topbar */}
      <div className="sch-topbar">
        <div className="sch-brand"><div className="sch-logo"/><div className="sch-brand-name">BRIGHTNEST</div></div>
        <nav className="sch-nav">
          <a href="#">Home</a>
          <a href="#">Blogs</a>
          <a href="#">Gamification</a>
          <a href="#">First aid</a>
          <a href="#">About</a>
        </nav>
        <div className="sch-actions"><div className="sch-circle"/><div className="sch-circle"/></div>
      </div>

      <div className="sch-wrap">
        {/* Left rail */}
        <aside className="sch-rail">
          <div style={{height:12}}/>
          {Array.from({length:4}).map((_,i)=> <div className="sch-ico" key={i}/>) }
        </aside>

        {/* Calendar content */}
        <main>
          <div className="sch-head">
            <div className="sch-title">Schedule</div>
            <div className="sch-month">JULY</div>
            <div className="sch-tools">
              <div className="sch-tool">🔍</div>
              <div className="sch-tool">15</div>
            </div>
          </div>

          <section className="sch-cal">
            <div className="sch-weekdays">
              {weekdays.map((d,i)=>(
                <div key={d} className={i===6?"sun":""}>{d}</div>
              ))}
            </div>
            {rows.map((r,ri)=> (
              <div key={ri} className="sch-grid">
                {r.map((d,ci)=> {
                  const isSun = ci===6; const isMuted = ri===0 && d==="30" || (ri===3 && ci===0) || (ri===4 && ci>=4);
                  const isSelected = d==="15" && ri===2 && ci===1;
                  return (
                    <div key={ci} className={`sch-day${isSun?" sun":""}${isMuted?" muted":""}${isSelected?" selected":""}`}>
                      <span>{d}</span>
                      {isSelected && (<>
                        <div className="badge">15</div>
                        <div className="underline" />
                      </>)}
                    </div>
                  );
                })}
              </div>
            ))}
          </section>

          <div className="sch-sep" />

          {/* Event tile */}
          <div className="sch-event">
            <div className="sch-ev-ico">📅</div>
            <div>
              <div className="sch-ev-title">Go to gym</div>
              <div className="sch-ev-time">6pm – 8pm</div>
            </div>
          </div>

          <div className="sch-add-wrap">
            <div className="sch-add-note">Add event on july 15</div>
            <div className="sch-add">＋</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Schedule;

