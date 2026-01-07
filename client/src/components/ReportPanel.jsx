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
  copy,
  labels,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{copy.reportPanel.title}</h2>
        <div className="panel-actions">
          <label className="select">
            <span>{copy.reportPanel.template}</span>
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
            {copy.reportPanel.downloadJson}
          </button>
          <button
            className="ghost"
            onClick={onDownloadCsv}
            disabled={results.length === 0}
          >
            {copy.reportPanel.downloadCsv}
          </button>
          <button
            className="ghost"
            onClick={onDownloadHtml}
            disabled={results.length === 0}
          >
            {copy.reportPanel.downloadHtml}
          </button>
          <button
            className="primary"
            onClick={onPrintPdf}
            disabled={results.length === 0}
          >
            {copy.reportPanel.printPdf}
          </button>
        </div>
      </div>

      <div className="stats">
        <div>
          <span>{copy.stats.total}</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>{copy.stats.ok}</span>
          <strong>{stats.ok}</strong>
        </div>
        <div>
          <span>{copy.stats.jsonld}</span>
          <strong>{stats.withJsonLd}</strong>
        </div>
        <div>
          <span>{copy.stats.microdata}</span>
          <strong>{stats.withMicrodata}</strong>
        </div>
        <div>
          <span>{copy.stats.rdfa}</span>
          <strong>{stats.withRdfa}</strong>
        </div>
        <div>
          <span>{copy.stats.errors}</span>
          <strong>{stats.errors}</strong>
        </div>
      </div>

      <ResultsTable
        results={results}
        expandedRows={expandedRows}
        onToggleRow={onToggleRow}
        copy={copy}
        labels={labels}
      />
    </section>
  );
}
