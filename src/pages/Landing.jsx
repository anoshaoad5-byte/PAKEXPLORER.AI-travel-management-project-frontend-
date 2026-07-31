import React from "react";
import { useNavigate } from "react-router-dom";
import heroMountain from "../assets/hero-mountain.jpg";
import welcomeGuide from "../assets/welcome-guide.jpg";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroMountain})` }}
      >
        <div className="hero-overlay" />

        <header className="landing-nav">
          <span className="brand">PakExplorer AI</span>
          <button className="nav-cta" onClick={() => navigate("/login")}>
            Get Started
          </button>
        </header>

        <div className="hero-content">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Travel, Made for Pakistan
          </span>

          <h1>
            Discover Pakistan,
            <br />
            <span className="hero-highlight">guided by AI.</span>
          </h1>

          <p className="hero-subtext">
            Real hidden gems, smart recommendations, and live translation —
            all in one place.
          </p>

          <div className="hero-actions">
            <button className="hero-cta" onClick={() => navigate("/login")}>
              Start Exploring
            </button>
            <span className="hero-scroll-hint">Scroll to meet your guide ↓</span>
          </div>
        </div>
      </section>

      {/* Guide section */}
      <section className="guide-section">
        <div className="guide-card">
          <div className="guide-photo-frame">
            <img
              src={welcomeGuide}
              alt="Your travel guide"
              className="guide-photo"
            />
          </div>

          <div className="welcome-note">
            <p className="welcome-note-label">A note from your guide</p>
            <p className="welcome-note-text">
              "Welcome, traveler. Let's find your valley together."
            </p>
            <p className="welcome-note-signoff">—  ANOSHA, Valley Scout</p>
          </div>
        </div>

        <div className="guide-text">
          <h2>Your AI travel companion</h2>
          <p>
            PakExplorer AI learns what you love and surfaces the hidden gems
            other apps miss — then helps you get there, understand the
            locals, and stay safe along the way.
          </p>
        </div>
      </section>
    </div>
  );
}CDATASection