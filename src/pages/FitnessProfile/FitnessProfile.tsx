import React, { useState } from "react";
import "./FitnessProfile.css";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const FitnessProfile: React.FC = () => {
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [role, setRole] = useState<"User" | "Trainer">("User");
  const [activity, setActivity] = useState<
    "Sedentary" | "Lightly Active" | "Active" | "Very Active"
  >("Sedentary");
  const [daysSel, setDaysSel] = useState<string[]>(["Mon", "Wed", "Fri"]);

  const toggleDay = (d: string) =>
    setDaysSel((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  return (
    <div className="fitness-profile-page">
      <div className="fp-container">
        <section className="fp-hero">
          <h1 className="fp-title">Create Your Fitness Profile</h1>
          <p className="fp-subtitle">
            Tell us about yourself so we can create a personalized workout and nutrition plan
            tailored to your unique needs and goals.
          </p>
        </section>

        {/* Personal Information */}
        <section className="fp-card">
          <div className="fp-card-header">Personal Information</div>
          <div className="fp-card-body">
            <div className="fp-grid">
              <div>
                <label className="fp-label">Full Name *</label>
                <input className="fp-input" placeholder="David Backome" />
              </div>
              <div>
                <label className="fp-label">Age *</label>
                <input className="fp-input" type="number" placeholder="30" />
              </div>
            </div>

            <div className="fp-row" style={{ marginTop: 12 }}>
              <label className="fp-label">Gender *</label>
              <div className="fp-segment">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`fp-pill ${gender === g ? "is-active" : ""}`}
                    onClick={() => setGender(g as any)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="fp-grid" style={{ marginTop: 12 }}>
              <div>
                <label className="fp-label">Height *</label>
                <input className="fp-input" placeholder="180" />
              </div>
              <div>
                <label className="fp-label">Weight *</label>
                <input className="fp-input" placeholder="82" />
              </div>
            </div>
          </div>
        </section>

        {/* Fitness Goals */}
        <section className="fp-card">
          <div className="fp-card-header">Fitness Goals</div>
          <div className="fp-card-body">
            <div className="fp-row">
              <label className="fp-label">You are? *</label>
              <div className="fp-segment">
                {["User", "Trainer"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`fp-pill ${role === r ? "is-active" : ""}`}
                    onClick={() => setRole(r as any)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="fp-row" style={{ marginTop: 12 }}>
              <label className="fp-label">Activity Level *</label>
              <div className="fp-activity">
                {[
                  { t: "Sedentary", d: "Little to no exercise, desk job" },
                  { t: "Lightly Active", d: "Light exercise 1-3 days per week" },
                  { t: "Active", d: "Moderate exercise 3-5 days per week" },
                  { t: "Very Active", d: "Hard exercise 6-7 days per week" },
                ].map((a) => (
                  <div
                    key={a.t}
                    className={`fp-activity-item ${activity === a.t ? "is-active" : ""}`}
                    onClick={() => setActivity(a.t as any)}
                  >
                    <div className="fp-activity-title">{a.t}</div>
                    <div className="fp-activity-desc">{a.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fp-row" style={{ marginTop: 12 }}>
              <label className="fp-label">Preferred Workout Days *</label>
              <div className="fp-days">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`fp-pill ${daysSel.includes(d) ? "is-active" : ""}`}
                    onClick={() => toggleDay(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Health Information */}
        <section className="fp-card">
          <div className="fp-card-header">Health Information</div>
          <div className="fp-card-body">
            <label className="fp-label">
              Do you have any medical conditions or injuries we should know about?
            </label>
            <textarea
              className="fp-textarea"
              placeholder="Please list any conditions or injuries that might affect your workout plan..."
            />
          </div>
        </section>

        {/* Optional Information */}
        <section className="fp-card">
          <div className="fp-card-header">Optional Information</div>
          <div className="fp-card-body">
            <div className="fp-grid">
              <div>
                <label className="fp-label">Waist (cm)</label>
                <input className="fp-input" placeholder="80" />
              </div>
              <div>
                <label className="fp-label">Chest (cm)</label>
                <input className="fp-input" placeholder="90" />
              </div>
              <div>
                <label className="fp-label">Hips (cm)</label>
                <input className="fp-input" placeholder="95" />
              </div>
            </div>

            <div className="fp-row" style={{ marginTop: 12 }}>
              <label className="fp-label">Upload a photo for progress tracking</label>
              <div className="fp-upload">Upload a photo</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="fp-cta-wrap">
          <button className="fp-cta">Create My Fitness Plan →</button>
        </div>
      </div>
    </div>
  );
};

export default FitnessProfile;
