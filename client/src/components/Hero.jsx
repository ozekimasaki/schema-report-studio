import { parseUrls } from "../lib/formatters.js";

export default function Hero({ input, stats }) {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Schema Report Studio</p>
        <h1 className="hero-title">
          <span className="title-line">構造化データを</span>
          <span className="title-line">やさしく整理して、</span>
          <span className="title-line">見やすいレポートに。</span>
        </h1>
        <p className="sub">
          URLを貼り付けるだけで構造化データを抽出し、HTMLまたはPDFで出力できます。
        </p>
      </div>
      <div className="hero-card">
        <div className="hero-stat">
          <span>入力URL数</span>
          <strong>{input.trim() ? parseUrls(input).length : 0}</strong>
        </div>
        <div className="hero-stat">
          <span>抽出結果</span>
          <strong>{stats.total}</strong>
        </div>
      </div>
    </header>
  );
}
