import { Link } from "react-router-dom";
import "./OurLocation.css";

export default function OurLocation() {
  return (
    <div className="our-location-page">
      <section className="our-location-hero">
        <span className="our-location-eyebrow">Find Us</span>
        <h1 className="our-location-title">We're Real, We're Here</h1>
        <p className="our-location-sub">
          PakExplorer AI isn't just an app — we're a real team based in
          Pakistan. If anything ever goes wrong with your trip, you can
          reach us directly, or visit us in person.
        </p>
      </section>

      <section className="our-location-content">
        <div className="our-location-block">
          <h2>📍 Our Address</h2>
          <p>
            Hyderabad, Sindh, Pakistan
          </p>
        </div>

        <div className="our-location-block">
          <h2>🤝 Our Promise</h2>
          <p>
            We know booking a trip online can feel uncertain. That's why
            we're upfront: if there's ever an issue with your booking,
            payment, or trip — big or small — you can contact us any time,
            and if needed, come find us in person. We're not hiding behind
            a screen.
          </p>
        </div>

        <div className="our-location-block">
          <h2>📞 Reach Us Anytime</h2>
          <ul>
            <li>Phone: 0331-9042709</li>
            <li>WhatsApp: +92 331 9042709</li>
            <li>Email: support@pakexplorer.ai</li>
            <li>Hours: Everyday, 9:00 AM – 9:00 PM PKT</li>
          </ul>
        </div>

        <Link to="/" className="our-location-back">
          ← Back to Home
        </Link>
      </section>
    </div>
  );
}