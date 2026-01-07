import { Fragment } from "react";
import { LABELS } from "../lib/constants.js";
import { summarizeFieldKeys, buildFieldSections } from "../lib/formatters.js";

function FieldPreview({ nodes }) {
  const sections = buildFieldSections(nodes);
  if (sections.length === 0) return <span>{LABELS.empty}</span>;
  return (
    <div className="field-preview">
      <div className="field-preview-text">{summarizeFieldKeys(nodes)}</div>
      <span className="field-preview-hint">行クリックで詳細</span>
    </div>
  );
}

function FieldDetails({ nodes }) {
  const sections = buildFieldSections(nodes);
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
                    <FieldPreview nodes={row.nodes} />
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
                        <FieldDetails nodes={row.nodes} />
                        {row.nodes?.length ? (
                          <details className="raw-details">
                            <summary>JSON-LD生データ</summary>
                            <pre>{JSON.stringify(row.nodes, null, 2)}</pre>
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
