import { LIMITS } from "../lib/constants.js";

export default function UrlInputPanel({
  input,
  loading,
  error,
  onInputChange,
  onUseExample,
  onClear,
  onExtract,
  copy,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{copy.urlPanel.title}</h2>
        <div className="panel-actions">
          <button className="ghost" onClick={onUseExample}>
            {copy.urlPanel.useSample}
          </button>
          <button className="ghost" onClick={onClear}>
            {copy.urlPanel.clear}
          </button>
        </div>
      </div>
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={copy.urlPanel.placeholder}
        rows={7}
      />
      <div className="panel-footer">
        <button className="primary" onClick={onExtract} disabled={loading}>
          {loading ? copy.urlPanel.extracting : copy.urlPanel.extract}
        </button>
        <span className="hint">
          {copy.urlPanel.max.replace("{count}", LIMITS.maxUrls)}
        </span>
        {error ? <span className="error">{error}</span> : null}
      </div>
    </section>
  );
}
