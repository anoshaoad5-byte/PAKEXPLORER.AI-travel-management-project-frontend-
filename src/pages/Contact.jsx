import { Link } from "react-router-dom";
import "./Contact.css";

const WHATSAPP_NUMBER = "923319042709";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi! I'd like to know more about PakExplorer AI."
)}`;

export default function Contact() {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <span className="contact-hero__eyebrow">We're Here to Help</span>
        <h1 className="contact-hero__title">Get in Touch</h1>
        <p className="contact-hero__sub">
          Questions about a trip, a hotel, or how Vedhi plans your
          itinerary? Reach out and we'll get back to you fast.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-block">
          <h2>WhatsApp</h2>
          <p>The fastest way to reach us — usually a reply within minutes.</p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="contact-cta">
            Chat on WhatsApp →
          </a>
        </div>

        <div className="contact-block">
          <h2>Call Us</h2>
          <p>Prefer to talk it through? Give us a call directly.</p>
          <a href={`tel:+${WHATSAPP_NUMBER}`} className="contact-cta contact-cta--ghost">
            +{WHATSAPP_NUMBER.replace(/(\d{2})(\d{3})(\d{7})/, "$1 $2 $3")}
          </a>
        </div>

        <div className="contact-block">
          <h2>Email</h2>
          <p>For partnerships, feedback, or anything not urgent.</p>
          <a href="mailto:hello@pakexplorer.ai" className="contact-cta contact-cta--ghost">
            hello@pakexplorer.ai
          </a>
        </div>

        <Link to="/" className="contact-back">
          ← Back to Home
        </Link>
      </section>
    </div>
  );
}