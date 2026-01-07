import { Fragment, useState } from "react";
import {
  buildFieldSections,
  buildMicrodataSections,
  buildRdfaSections,
  summarizeFieldKeys,
  summarizeMicrodataKeys,
  summarizeRdfaKeys,
} from "../lib/formatters.js";

function FieldPreview({ jsonLd, microdata, rdfa, copy, labels }) {
  const jsonLdCount = Array.isArray(jsonLd) ? jsonLd.length : 0;
  const microdataCount = Array.isArray(microdata) ? microdata.length : 0;
  const rdfaCount = Array.isArray(rdfa) ? rdfa.length : 0;
  const hasAny = jsonLdCount + microdataCount + rdfaCount > 0;
  if (!hasAny) return <span>{labels.empty}</span>;
  const meta = [];
  if (jsonLdCount) {
    meta.push(`JSON-LD: ${summarizeFieldKeys(jsonLd, 4, labels)}`);
  }
  if (microdataCount) {
    meta.push(`Microdata: ${summarizeMicrodataKeys(microdata, 4, labels)}`);
  }
  if (rdfaCount) {
    meta.push(`RDFa: ${summarizeRdfaKeys(rdfa, 4, labels)}`);
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
      <span className="field-preview-hint">{copy.table.rowHint}</span>
    </div>
  );
}

function SectionList({ sections, labels }) {
  if (sections.length === 0) return <div>{labels.empty}</div>;
  return (
    <div className="field-details">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="field-section">
          <div className="field-title">{section.title}</div>
          {section.entries.length === 0 ? (
            <div className="field-row">
              <span className="field-key">{labels.emptyValue}</span>
              <span className="field-value"></span>
            </div>
          ) : (
            section.entries.map((entry, entryIndex) => (
              <div key={entryIndex} className="field-row">
                <span className="field-key">{entry.key}</span>
                <span className="field-value">
                  {entry.value || labels.emptyValue}
                </span>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

export default function ResultsTable({
  results,
  expandedRows,
  onToggleRow,
  copy,
  labels,
}) {
  const [tabByRow, setTabByRow] = useState({});

  function setActiveTab(rowKey, tab) {
    setTabByRow((prev) => ({ ...prev, [rowKey]: tab }));
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{copy.table.title}</th>
            <th>{copy.table.url}</th>
            <th>{copy.table.type}</th>
            <th>{copy.table.fields}</th>
            <th>{copy.table.warnings}</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => {
            const types =
              Object.keys(row.typeCounts || {}).join(", ") || labels.empty;
            const warnings = row.errors?.length
              ? row.errors.join(" | ")
              : labels.ok;
            const rowKey = `${row.url}-${index}`;
            const isExpanded = Boolean(expandedRows[rowKey]);
            const activeTab = tabByRow[rowKey] || "jsonld";
            return (
              <Fragment key={rowKey}>
                <tr
                  className={`data-row ${isExpanded ? "expanded" : ""}`}
                  onClick={() => onToggleRow(rowKey)}
                >
                  <td data-label={copy.table.title}>
                    {row.title || labels.noTitle}
                  </td>
                  <td data-label={copy.table.url}>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.url}
                    </a>
                  </td>
                  <td data-label={copy.table.type}>{types}</td>
                  <td data-label={copy.table.fields}>
                    <FieldPreview
                      jsonLd={row.nodes}
                      microdata={row.microdata}
                      rdfa={row.rdfa}
                      copy={copy}
                      labels={labels}
                    />
                  </td>
                  <td data-label={copy.table.warnings}>
                    <span
                      className={warnings === labels.ok ? "chip ok" : "chip warn"}
                    >
                      {warnings}
                    </span>
                    <span className="toggle-detail">
                      {isExpanded ? copy.table.detailClose : copy.table.detailOpen}
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
                          <SectionList
                            sections={buildFieldSections(row.nodes)}
                            labels={labels}
                          />
                        ) : null}
                        {activeTab === "microdata" ? (
                          <SectionList
                            sections={buildMicrodataSections(row.microdata, labels)}
                            labels={labels}
                          />
                        ) : null}
                        {activeTab === "rdfa" ? (
                          <SectionList
                            sections={buildRdfaSections(row.rdfa, labels)}
                            labels={labels}
                          />
                        ) : null}
                        {activeTab === "jsonld" && row.nodes?.length ? (
                          <details className="raw-details">
                            <summary>{copy.table.rawJsonLd}</summary>
                            <pre>{JSON.stringify(row.nodes, null, 2)}</pre>
                          </details>
                        ) : null}
                        {activeTab === "microdata" && row.microdata?.length ? (
                          <details className="raw-details">
                            <summary>{copy.table.rawMicrodata}</summary>
                            <pre>{JSON.stringify(row.microdata, null, 2)}</pre>
                          </details>
                        ) : null}
                        {activeTab === "rdfa" && row.rdfa?.length ? (
                          <details className="raw-details">
                            <summary>{copy.table.rawRdfa}</summary>
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
