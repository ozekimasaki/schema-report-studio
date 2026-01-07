import { LIMITS } from "../lib/constants.js";

export default function UrlInputPanel({
  input,
  loading,
  error,
  onInputChange,
  onUseExample,
  onClear,
  onExtract,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>URL入力</h2>
        <div className="panel-actions">
          <button className="ghost" onClick={onUseExample}>
            サンプルを使う
          </button>
          <button className="ghost" onClick={onClear}>
            クリア
          </button>
        </div>
      </div>
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="1行に1URLを入力"
        rows={7}
      />
      <div className="panel-footer">
        <button className="primary" onClick={onExtract} disabled={loading}>
          {loading ? "抽出中..." : "構造化データを抽出"}
        </button>
        <span className="hint">最大{LIMITS.maxUrls}件まで</span>
        {error ? <span className="error">{error}</span> : null}
      </div>
    </section>
  );
}
