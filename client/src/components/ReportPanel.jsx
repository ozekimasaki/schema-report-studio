import ResultsTable from "./ResultsTable.jsx";

export default function ReportPanel({
  themeOptions,
  theme,
  onThemeChange,
  onDownloadJson,
  onDownloadCsv,
  onDownloadHtml,
  onPrintPdf,
  stats,
  results,
  expandedRows,
  onToggleRow,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>レポート出力</h2>
        <div className="panel-actions">
          <label className="select">
            <span>テンプレート</span>
            <select value={theme} onChange={(e) => onThemeChange(e.target.value)}>
              {themeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="ghost"
            onClick={onDownloadJson}
            disabled={results.length === 0}
          >
            JSONダウンロード
          </button>
          <button
            className="ghost"
            onClick={onDownloadCsv}
            disabled={results.length === 0}
          >
            CSVダウンロード
          </button>
          <button
            className="ghost"
            onClick={onDownloadHtml}
            disabled={results.length === 0}
          >
            HTMLダウンロード
          </button>
          <button
            className="primary"
            onClick={onPrintPdf}
            disabled={results.length === 0}
          >
            PDF書き出し
          </button>
        </div>
      </div>

      <div className="stats">
        <div>
          <span>合計URL</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>成功</span>
          <strong>{stats.ok}</strong>
        </div>
        <div>
          <span>JSON-LDあり</span>
          <strong>{stats.withJsonLd}</strong>
        </div>
        <div>
          <span>警告</span>
          <strong>{stats.errors}</strong>
        </div>
      </div>

      <ResultsTable
        results={results}
        expandedRows={expandedRows}
        onToggleRow={onToggleRow}
      />
    </section>
  );
}
