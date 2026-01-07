import { parseUrls } from "../lib/formatters.js";

export default function Hero({ input, stats, copy }) {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Schema Report Studio</p>
        <h1 className="hero-title">
          {copy.heroTitleLines.map((line) => (
            <span key={line} className="title-line">
              {line}
            </span>
          ))}
        </h1>
        <p className="sub">
          {copy.heroSubtitle}
        </p>
      </div>
      <div className="hero-card">
        <div className="hero-stat">
          <span>{copy.heroStats.inputCount}</span>
          <strong>{input.trim() ? parseUrls(input).length : 0}</strong>
        </div>
        <div className="hero-stat">
          <span>{copy.heroStats.total}</span>
          <strong>{stats.total}</strong>
        </div>
      </div>
    </header>
  );
}
