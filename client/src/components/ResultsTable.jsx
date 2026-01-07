import { Fragment, useState } from "react";
import { LABELS } from "../lib/constants.js";
import {
  buildFieldSections,
  buildMicrodataSections,
  buildRdfaSections,
  summarizeFieldKeys,
  summarizeMicrodataKeys,
  summarizeRdfaKeys,
} from "../lib/formatters.js";

function FieldPreview({ jsonLd, microdata, rdfa }) {
  const jsonLdCount = Array.isArray(jsonLd) ? jsonLd.length : 0;
  const microdataCount = Array.isArray(microdata) ? microdata.length : 0;
  const rdfaCount = Array.isArray(rdfa) ? rdfa.length : 0;
  const hasAny = jsonLdCount + microdataCount + rdfaCount > 0;
  if (!hasAny) return <span>{LABELS.empty}</span>;
  const meta = [];
  if (jsonLdCount) {
    meta.push(`JSON-LD: ${summarizeFieldKeys(jsonLd)}`);
  }
  if (microdataCount) {
    meta.push(`Microdata: ${summarizeMicrodataKeys(microdata)}`);
  }
  if (rdfaCount) {
    meta.push(`RDFa: ${summarizeRdfaKeys(rdfa)}`);
  }
  return (
    <div className="field-preview">
      <div className="field-preview-text">
        JSON-LD {jsonLdCount} / Microdata {microdataCount} / RDFa {rdfaCount}
      </div>
      <div className="field-preview-meta">
        {meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <span className="field-preview-hint">行クリックで詳細</span>
    </div>
  );
}

function SectionList({ sections }) {
  if (sections.length === 0) return <div>{LABELS.empty}</div>;
  return (
    <div className="field-details">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="field-section">
          <div className="field-title">{section.title}</div>
          {section.entries.length === 0 ? (
            <div className="field-row">
              <span className="field-key">{LABELS.emptyValue}</span>
              <span className="field-value"></span>
            </div>
          ) : (
            section.entries.map((entry, entryIndex) => (
              <div key={entryIndex} className="field-row">
                <span className="field-key">{entry.key}</span>
                <span className="field-value">
                  {entry.value || LABELS.emptyValue}
                </span>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

export default function ResultsTable({ results, expandedRows, onToggleRow }) {
  const [tabByRow, setTabByRow] = useState({});

  function setActiveTab(rowKey, tab) {
    setTabByRow((prev) => ({ ...prev, [rowKey]: tab }));
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>タイトル</th>
            <th>URL</th>
            <th>タイプ</th>
            <th>項目一覧</th>
            <th>警告</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => {
            const types =
              Object.keys(row.typeCounts || {}).join(", ") || LABELS.empty;
            const warnings = row.errors?.length
              ? row.errors.join(" | ")
              : LABELS.ok;
            const rowKey = `${row.url}-${index}`;
            const isExpanded = Boolean(expandedRows[rowKey]);
            const activeTab = tabByRow[rowKey] || "jsonld";
            return (
              <Fragment key={rowKey}>
                <tr
                  className={`data-row ${isExpanded ? "expanded" : ""}`}
                  onClick={() => onToggleRow(rowKey)}
                >
                  <td data-label="タイトル">{row.title || LABELS.noTitle}</td>
                  <td data-label="URL">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.url}
                    </a>
                  </td>
                  <td data-label="タイプ">{types}</td>
                  <td data-label="項目一覧">
                    <FieldPreview
                      jsonLd={row.nodes}
                      microdata={row.microdata}
                      rdfa={row.rdfa}
                    />
                  </td>
                  <td data-label="警告">
                    <span
                      className={warnings === LABELS.ok ? "chip ok" : "chip warn"}
                    >
                      {warnings}
                    </span>
                    <span className="toggle-detail">
                      {isExpanded ? "詳細を閉じる" : "詳細を見る"}
                    </span>
                  </td>
                </tr>
                {isExpanded ? (
                  <tr className="row-details">
                    <td colSpan={5}>
                      <div className="row-details-inner">
                        <div className="data-tabs" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={activeTab === "jsonld" ? "tab active" : "tab"}
                            onClick={() => setActiveTab(rowKey, "jsonld")}
                          >
                            JSON-LD
                          </button>
                          <button
                            type="button"
                            className={activeTab === "microdata" ? "tab active" : "tab"}
                            onClick={() => setActiveTab(rowKey, "microdata")}
                          >
                            Microdata
                          </button>
                          <button
                            type="button"
                            className={activeTab === "rdfa" ? "tab active" : "tab"}
                            onClick={() => setActiveTab(rowKey, "rdfa")}
                          >
                            RDFa
                          </button>
                        </div>
                        {activeTab === "jsonld" ? (
                          <SectionList sections={buildFieldSections(row.nodes)} />
                        ) : null}
                        {activeTab === "microdata" ? (
                          <SectionList sections={buildMicrodataSections(row.microdata)} />
                        ) : null}
                        {activeTab === "rdfa" ? (
                          <SectionList sections={buildRdfaSections(row.rdfa)} />
                        ) : null}
                        {activeTab === "jsonld" && row.nodes?.length ? (
                          <details className="raw-details">
                            <summary>JSON-LD生データ</summary>
                            <pre>{JSON.stringify(row.nodes, null, 2)}</pre>
                          </details>
                        ) : null}
                        {activeTab === "microdata" && row.microdata?.length ? (
                          <details className="raw-details">
                            <summary>Microdata生データ</summary>
                            <pre>{JSON.stringify(row.microdata, null, 2)}</pre>
                          </details>
                        ) : null}
                        {activeTab === "rdfa" && row.rdfa?.length ? (
                          <details className="raw-details">
                            <summary>RDFa生データ</summary>
                            <pre>{JSON.stringify(row.rdfa, null, 2)}</pre>
                          </details>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
