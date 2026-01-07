import { parseUrls } from "../lib/formatters.js";

export default function Hero({ input, stats }) {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">構造化データチェック</p>
        <h1>構造化データをやさしく整理して、見やすいレポートに。</h1>
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
        <div className="hero-stat">
          <span>JSON-LD</span>
          <strong>{stats.withJsonLd}</strong>
        </div>
      </div>
    </header>
  );
}
