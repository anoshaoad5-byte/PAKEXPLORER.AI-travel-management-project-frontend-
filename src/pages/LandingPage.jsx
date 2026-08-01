import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavMenu from "../components/NavMenu";
import "./LandingPage.css";

// TODO: point this at your existing shared axios instance / API base if you have one
const API_BASE = "https://pakexplorerai-travel-management-project-backend-production.up.railway.app";

const WHATSAPP_NUMBER = "923319042709"; // no +, no spaces, no leading 0
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi! I'd like help planning a trip on PakExplorer AI."
)}`;

const FEATURES = [
  {
    icon: "🧭",
    title: "Vedhi, Your AI Guide",
    text: "Tell Vedhi your budget and vibe — get a full day-by-day plan in seconds.",
  },
  {
    icon: "📍",
    title: "Live Location Tracking",
    text: "See hidden gems near you, ranked by real distance from where you stand.",
  },
  {
    icon: "🌐",
    title: "5-Language Translator",
    text: "Urdu, Sindhi, Punjabi, Pashto, Balochi — talk to anyone, anywhere.",
  },
  {
    icon: "💰",
    title: "Budget Calculator",
    text: "Hotels, transport, food — one real number, no surprises at the end.",
  },
];

const TRUST_POINTS = [
  { label: "Verified Stays", value: "Every hotel checked" },
  { label: "Real-Time Routes", value: "GPS-accurate distances" },
  { label: "Local Voices", value: "Reviews from real travelers" },
];

function DestinationsCarousel({ destinations }) {
  const [index, setIndex] = useState(0);
  const total = destinations.length;

  const next = () => setIndex((prev) => (prev + 1) % total);
  const prev = () => setIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(interval);
  }, [total]);

  const current = destinations[index];

  return (
    <div className="dest-carousel">
      <div
        className="dest-carousel__slide"
        style={{ backgroundImage: current.image ? `url(${current.image})` : undefined }}
      >
        <div className="dest-carousel__overlay">
          <span className="dest-carousel__location">{current.city || current.province || ""}</span>
          <h3>{current.name}</h3>
          <Link to={`/destinations/${current.id}`} className="btn btn--gold">
            Explore
          </Link>
        </div>

        <button className="dest-carousel__arrow dest-carousel__arrow--left" onClick={prev}>‹</button>
        <button className="dest-carousel__arrow dest-carousel__arrow--right" onClick={next}>›</button>
      </div>

      <div className="dest-carousel__dots">
        {destinations.map((_, i) => (
          <span
            key={i}
            className={`dest-carousel__dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDestinations() {
      try {
        const res = await fetch(`${API_BASE}/api/destinations`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setDestinations(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDestinations();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav__brand">
          <span className="landing-nav__logo">PakExplorer AI</span>
          <span className="landing-nav__tagline">Your Safety, Our Responsibility</span>
        </div>
        <div className="landing-nav__links">
          <Link to="/about" className="landing-nav__link">
            About
          </Link>
          <span className="landing-nav__link landing-nav__location"></span>
              <Link to="/our-location" className="landing-nav__link landing-nav__location">
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.5 7.5 12.5 7.5 12.5s7.5-7 7.5-12.5C19.5 5.36 16.14 2 12 2Zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z" />
  </svg>
  Karachi, Pakistan 🇵🇰
</Link>
          <Link to="/contact" className="landing-nav__link">
            Contact
          </Link>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero__route" aria-hidden="true">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              d="M -20 320 C 200 260, 320 380, 480 300 S 780 140, 960 200 S 1180 120, 1240 60"
              className="hero__route-path"
            />
          </svg>
        </div>

        <div className="hero__content">
          <span className="hero__eyebrow">Pakistan, Planned Intelligently</span>
          <h1 className="hero__headline">
            Every valley,
            <br />
            one smart itinerary away.
          </h1>
          <p className="hero__sub">
            PakExplorer AI turns "I want to go somewhere" into a full trip —
            hotels, transport, and a day-by-day plan built around your budget.
          </p>
          <div className="hero__actions">
            <Link to="/destinations" className="btn btn--gold">
              Explore Destinations
            </Link>
            <Link to="/chatbot" className="btn btn--ghost">
              Plan with Vedhi →
            </Link>
          </div>
        </div>

        <div className="hero__image" role="img" aria-label="Mountain valley in northern Pakistan" />
      </section>

      {/* ---------- TRUST STRIP ---------- */}
      <section className="trust-strip">
        {TRUST_POINTS.map((point) => (
          <div className="trust-strip__item" key={point.label}>
            <span className="trust-strip__value">{point.value}</span>
            <span className="trust-strip__label">{point.label}</span>
          </div>
        ))}
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="section features">
        <div className="section__head">
          <span className="section__eyebrow">What You Get</span>
          <h2>Built for the way you actually travel</h2>
        </div>
        <div className="features__grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-card__icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- TOP DESTINATIONS (auto-sliding carousel) ---------- */}
      <section className="section destinations">
        <div className="section__head">
          <span className="section__eyebrow">Most Loved</span>
          <h2>Top destinations right now</h2>
          <Link to="/destinations" className="section__link">
            See all destinations →
          </Link>
        </div>

        {loading && <p className="state-msg">Loading destinations…</p>}
        {error && <p className="state-msg state-msg--error">Couldn't load destinations: {error}</p>}
        {!loading && !error && destinations.length === 0 && (
          <p className="state-msg">No destinations yet — check back soon.</p>
        )}

        {!loading && !error && destinations.length > 0 && (
          <DestinationsCarousel destinations={destinations} />
        )}
      </section>

      {/* ---------- WHY CHOOSE US ---------- */}
      <section className="section why-us">
        <div className="why-us__image" role="img" aria-label="Traveler overlooking a valley" />
        <div className="why-us__content">
          <span className="section__eyebrow">Why PakExplorer AI</span>
          <h2>Less guessing, more going.</h2>
          <ul className="why-us__list">
            <li>
              <strong>AI-personalized plans</strong> — not a generic package,
              a trip shaped by your budget and travel style.
            </li>
            <li>
              <strong>Verified hotels &amp; transport</strong> — checked
              listings, not scraped guesses.
            </li>
            <li>
              <strong>Talk to Vedhi anytime</strong> — plan, replan, or ask
              "what's near me" on the fly.
            </li>
          </ul>
          <Link to="/about" className="btn btn--gold">
            Learn More
          </Link>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta">
        <h2>Your next trip starts with one message to Vedhi.</h2>
        <Link to="/chatbot" className="btn btn--gold btn--lg">
          Start Planning — It's Free
        </Link>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section className="contact">
        <div className="contact__content">
          <span className="section__eyebrow">Get in Touch</span>
          <h2>Have a question before you book?</h2>
          <p>
            Reach out on WhatsApp or call us directly — we usually reply
            within a few minutes.
          </p>
          <div className="contact__actions">
            
            <a  href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--gold"
            >
              Chat on WhatsApp
            </a>
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="btn btn--ghost">
              +{WHATSAPP_NUMBER.replace(/(\d{2})(\d{3})(\d{7})/, "$1 $2 $3")}
            </a>
          </div>
        </div>
      </section>

      {/* ---------- FLOATING WHATSAPP BUTTON ---------- */}
      
       <a href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat with us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.35c1.36.72 2.9 1.13 4.55 1.13h.01c5.46 0 9.91-4.45 9.91-9.91C21.88 6.45 17.5 2 12.04 2Zm5.79 14c-.24.68-1.4 1.31-1.94 1.36-.5.05-1.06.24-3.55-.74-2.99-1.18-4.92-4.18-5.07-4.38-.15-.2-1.22-1.62-1.22-3.1 0-1.47.77-2.19 1.05-2.49.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.19.01.44-.07.68.53.24.6.83 2.07.9 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.32.38-.45.51-.15.15-.31.32-.13.62.17.3.77 1.28 1.66 2.08 1.14 1.02 2.1 1.34 2.4 1.49.3.15.47.13.65-.07.18-.2.75-.87.95-1.17.2-.3.4-.24.65-.15.25.1 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.36Z" />
        </svg>
      </a>

      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <div className="footer__grid">
          <div>
            <h4>PakExplorer AI</h4>
            <p>Your AI-powered guide to exploring Pakistan, end to end.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/destinations">Destinations</Link>
            <Link to="/hotels">Hotels</Link>
            <Link to="/trips">Trips</Link>
            <Link to="/chatbot">Vedhi Chatbot</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} PakExplorer AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}