import { useEffect, useMemo, useState } from "react";
import Hero from "./components/Hero.jsx";
import UrlInputPanel from "./components/UrlInputPanel.jsx";
import ReportPanel from "./components/ReportPanel.jsx";
import Footer from "./components/Footer.jsx";
import { EXAMPLE_URLS, THEME_OPTIONS, LIMITS } from "./lib/constants.js";
import { parseUrls, summarizeResults } from "./lib/formatters.js";
import { createReportHtml } from "./lib/report.js";
import { extractStructuredData } from "./lib/api.js";
import { createCsv, downloadBlob } from "./lib/exporters.js";

export default function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [generatedAt, setGeneratedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("editorial");
  const [expandedRows, setExpandedRows] = useState({});

  const stats = useMemo(() => summarizeResults(results), [results]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function handleExtract() {
    setError("");
    const urls = parseUrls(input);
    if (urls.length === 0) {
      setError("URLを1件以上入力してください。");
      return;
    }
    if (urls.length > LIMITS.maxUrls) {
      setError(`URLは最大${LIMITS.maxUrls}件までです。`);
      return;
    }

    setLoading(true);
    try {
      const data = await extractStructuredData(urls);
      setResults(data.results || []);
      setGeneratedAt(data.generatedAt || new Date().toISOString());
      setExpandedRows({});
    } catch (err) {
      setError(err?.message || "構造化データの抽出に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setInput("");
    setResults([]);
    setGeneratedAt("");
    setError("");
    setExpandedRows({});
  }

  function handleUseExample() {
    setInput(EXAMPLE_URLS);
  }

  function handleDownloadJson() {
    downloadBlob(
      "structured-data-report.json",
      JSON.stringify({ generatedAt, results }, null, 2),
      "application/json"
    );
  }

  function handleDownloadHtml() {
    const html = createReportHtml(
      results,
      generatedAt || new Date().toISOString(),
      theme
    );
    downloadBlob("structured-data-report.html", html, "text/html");
  }

  function handlePrintPdf() {
    const html = createReportHtml(
      results,
      generatedAt || new Date().toISOString(),
      theme
    );
    const popup = window.open("", "_blank");
    if (!popup) {
      setError("ポップアップがブロックされました。許可して再試行してください。");
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    setTimeout(() => popup.print(), 400);
  }

  function handleDownloadCsv() {
    downloadBlob("structured-data-report.csv", createCsv(results), "text/csv");
  }

  function handleToggleRow(rowKey) {
    setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
  }

  return (
    <div className="page">
      <Hero input={input} stats={stats} />
      <UrlInputPanel
        input={input}
        loading={loading}
        error={error}
        onInputChange={setInput}
        onUseExample={handleUseExample}
        onClear={handleClear}
        onExtract={handleExtract}
      />
      <ReportPanel
        themeOptions={THEME_OPTIONS}
        theme={theme}
        onThemeChange={setTheme}
        onDownloadJson={handleDownloadJson}
        onDownloadCsv={handleDownloadCsv}
        onDownloadHtml={handleDownloadHtml}
        onPrintPdf={handlePrintPdf}
        stats={stats}
        results={results}
        expandedRows={expandedRows}
        onToggleRow={handleToggleRow}
      />
      <Footer />
    </div>
  );
}
