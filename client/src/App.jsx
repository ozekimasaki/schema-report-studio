import { useEffect, useMemo, useState } from "react";
import Hero from "./components/Hero.jsx";
import UrlInputPanel from "./components/UrlInputPanel.jsx";
import ReportPanel from "./components/ReportPanel.jsx";
import Footer from "./components/Footer.jsx";
import { EXAMPLE_URLS, LIMITS } from "./lib/constants.js";
import { getCopy, getThemeOptions, LANG_OPTIONS } from "./lib/i18n.js";
import { parseUrls, summarizeResults } from "./lib/formatters.js";
import { createReportHtml } from "./lib/report.js";
import { extractStructuredData } from "./lib/api.js";
import { createCsv, downloadBlob } from "./lib/exporters.js";

export default function App() {
  const storedLanguage =
    typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
  const initialLanguage = LANG_OPTIONS.some(
    (option) => option.value === storedLanguage
  )
    ? storedLanguage
    : "ja";
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [generatedAt, setGeneratedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("editorial");
  const [expandedRows, setExpandedRows] = useState({});
  const [language, setLanguage] = useState(initialLanguage);

  const stats = useMemo(() => summarizeResults(results), [results]);
  const copy = useMemo(() => getCopy(language), [language]);
  const themeOptions = useMemo(() => getThemeOptions(language), [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("lang", language);
  }, [language]);

  async function handleExtract() {
    setError("");
    const urls = parseUrls(input);
    if (urls.length === 0) {
      setError(copy.errors.noUrl);
      return;
    }
    if (urls.length > LIMITS.maxUrls) {
      setError(copy.errors.limit.replace("{count}", LIMITS.maxUrls));
      return;
    }

    setLoading(true);
    try {
      const data = await extractStructuredData(urls);
      setResults(data.results || []);
      setGeneratedAt(data.generatedAt || new Date().toISOString());
      setExpandedRows({});
    } catch (err) {
      setError(err?.message || copy.errors.extractFail);
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
      theme,
      language
    );
    downloadBlob("structured-data-report.html", html, "text/html");
  }

  function handlePrintPdf() {
    const html = createReportHtml(
      results,
      generatedAt || new Date().toISOString(),
      theme,
      language
    );
    const popup = window.open("", "_blank");
    if (!popup) {
      setError(copy.errors.popupBlocked);
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    const waitForReady = new Promise((resolve) => {
      const timeoutId = popup.setTimeout(() => resolve(), 2000);
      const intervalId = popup.setInterval(() => {
        if (popup.document.readyState === "complete") {
          popup.clearTimeout(timeoutId);
          popup.clearInterval(intervalId);
          resolve();
        }
      }, 50);
    });
    const waitForFonts = popup.document.fonts
      ? popup.document.fonts.ready.catch(() => {})
      : Promise.resolve();
    Promise.all([waitForReady, waitForFonts]).then(() => popup.print());
  }

  function handleDownloadCsv() {
    downloadBlob(
      "structured-data-report.csv",
      createCsv(results, language),
      "text/csv"
    );
  }

  function handleToggleRow(rowKey) {
    setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
  }

  return (
    <div className="page">
      <div className="page-top">
        <label className="select">
          <span>{copy.languageLabel}</span>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANG_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Hero input={input} stats={stats} copy={copy} />
      <UrlInputPanel
        input={input}
        loading={loading}
        error={error}
        onInputChange={setInput}
        onUseExample={handleUseExample}
        onClear={handleClear}
        onExtract={handleExtract}
        copy={copy}
      />
      <ReportPanel
        themeOptions={themeOptions}
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
        copy={copy}
        labels={copy.labels}
      />
      <Footer copy={copy} githubUrl="https://github.com/ozekimasaki" />
    </div>
  );
}
