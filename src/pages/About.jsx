import { Link } from "react-router-dom";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <span className="about-hero__eyebrow">Our Promise</span>
        <h1 className="about-hero__slogan">Safety First</h1>
        <p className="about-hero__sub">
          Before anything else — before the itinerary, the hotel, the
          route — we ask one question: is this safe for you? Every
          recommendation on PakExplorer AI is built around that answer.
        </p>
      </section>

      <section className="about-content">
        <div className="about-block">
          <h2>Why We Exist</h2>
          <p>
            Pakistan has some of the most breathtaking landscapes in the
            world, but planning a trip here shouldn't mean guessing which
            hotel is real, which road is safe, or which guide actually
            knows the route. PakExplorer AI was built to remove that
            guesswork — verified stays, real-time location awareness, and
            an AI guide that plans with your safety and budget in mind
            from the first message.
          </p>
        </div>

        <div className="about-block">
          <h2>How We Keep It Safe</h2>
          <ul>
            <li>Every hotel and transport listing is manually verified before it goes live.</li>
            <li>Live location tracking helps you and your travel companions stay aware, always.</li>
            <li>Our AI guide, Vedhi, flags risky routes or seasons before you book.</li>
          </ul>
        </div>

        <Link to="/" className="about-back">
          ← Back to Home
        </Link>
      </section>
    </div>
  );
}