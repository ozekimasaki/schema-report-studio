export const LANG_OPTIONS = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
];

const COPY = {
  ja: {
    languageLabel: "言語",
    heroTitleLines: [
      "構造化データを",
      "やさしく整理して、",
      "見やすいレポートに。",
    ],
    heroSubtitle:
      "URLを貼り付けるだけで構造化データを抽出し、HTMLまたはPDFで出力できます。",
    heroStats: {
      inputCount: "入力URL数",
      total: "抽出結果",
    },
    urlPanel: {
      title: "URL入力",
      useSample: "サンプルを使う",
      clear: "クリア",
      placeholder: "1行に1URLを入力",
      extracting: "抽出中...",
      extract: "構造化データを抽出",
      max: "最大{count}件まで",
    },
    reportPanel: {
      title: "レポート出力",
      template: "テンプレート",
      downloadJson: "JSONダウンロード",
      downloadCsv: "CSVダウンロード",
      downloadHtml: "HTMLダウンロード",
      printPdf: "PDF書き出し",
    },
    stats: {
      total: "合計URL",
      ok: "成功",
      jsonld: "JSON-LDあり",
      microdata: "Microdataあり",
      rdfa: "RDFaあり",
      errors: "警告",
    },
    table: {
      title: "タイトル",
      url: "URL",
      type: "タイプ",
      fields: "項目一覧",
      warnings: "警告",
      rowHint: "行クリックで詳細",
      detailOpen: "詳細を見る",
      detailClose: "詳細を閉じる",
      rawJsonLd: "JSON-LD生データ",
      rawMicrodata: "Microdata生データ",
      rawRdfa: "RDFa生データ",
    },
    footer: {
      note:
        "JSON-LD / Microdata / RDFa をまとめて確認し、共有しやすいレポートにします。",
      githubLabel: "GitHub",
      copyrightName: "OzekiMasaki",
    },
    errors: {
      noUrl: "URLを1件以上入力してください。",
      limit: "URLは最大{count}件までです。",
      extractFail: "構造化データの抽出に失敗しました。",
      popupBlocked: "ポップアップがブロックされました。許可して再試行してください。",
    },
    labels: {
      ok: "問題なし",
      statusError: "エラー",
      noTitle: "（タイトルなし）",
      empty: "-",
      emptyValue: "（空）",
      moreSuffix: "…他",
    },
    csv: {
      headers: [
        "タイトル",
        "URL",
        "タイプ",
        "項目一覧",
        "Microdata",
        "RDFa",
        "警告",
        "ステータス",
        "処理時間(ms)",
      ],
      statusOk: "OK",
    },
    report: {
      title: "構造化データ レポート",
      generatedAt: "生成日時",
      tableHeaders: ["タイトル", "URL", "タイプ", "項目一覧", "警告"],
    },
  },
  en: {
    languageLabel: "Language",
    heroTitleLines: [
      "Bring structured data",
      "into a clear, friendly",
      "report anyone can read.",
    ],
    heroSubtitle:
      "Paste URLs to extract structured data and export as HTML or PDF.",
    heroStats: {
      inputCount: "Input URLs",
      total: "Results",
    },
    urlPanel: {
      title: "URL Input",
      useSample: "Use samples",
      clear: "Clear",
      placeholder: "One URL per line",
      extracting: "Extracting...",
      extract: "Extract structured data",
      max: "Up to {count} URLs",
    },
    reportPanel: {
      title: "Report Output",
      template: "Template",
      downloadJson: "Download JSON",
      downloadCsv: "Download CSV",
      downloadHtml: "Download HTML",
      printPdf: "Export PDF",
    },
    stats: {
      total: "Total URLs",
      ok: "Success",
      jsonld: "JSON-LD",
      microdata: "Microdata",
      rdfa: "RDFa",
      errors: "Warnings",
    },
    table: {
      title: "Title",
      url: "URL",
      type: "Type",
      fields: "Fields",
      warnings: "Warnings",
      rowHint: "Click row for details",
      detailOpen: "Show details",
      detailClose: "Hide details",
      rawJsonLd: "JSON-LD raw",
      rawMicrodata: "Microdata raw",
      rawRdfa: "RDFa raw",
    },
    footer: {
      note:
        "Review JSON-LD, Microdata, and RDFa together in a shareable report.",
      githubLabel: "GitHub",
      copyrightName: "OzekiMasaki",
    },
    errors: {
      noUrl: "Please enter at least one URL.",
      limit: "Up to {count} URLs are supported.",
      extractFail: "Failed to extract structured data.",
      popupBlocked: "Popup was blocked. Allow it and try again.",
    },
    labels: {
      ok: "OK",
      statusError: "Error",
      noTitle: "(No title)",
      empty: "-",
      emptyValue: "(Empty)",
      moreSuffix: "... more",
    },
    csv: {
      headers: [
        "Title",
        "URL",
        "Type",
        "Fields",
        "Microdata",
        "RDFa",
        "Warnings",
        "Status",
        "Time (ms)",
      ],
      statusOk: "OK",
    },
    report: {
      title: "Structured Data Report",
      generatedAt: "Generated at",
      tableHeaders: ["Title", "URL", "Type", "Fields", "Warnings"],
    },
  },
};

const THEME_OPTIONS = {
  ja: [
    { value: "editorial", label: "エディトリアル" },
    { value: "swiss", label: "スイス" },
    { value: "mono", label: "モノ" },
  ],
  en: [
    { value: "editorial", label: "Editorial" },
    { value: "swiss", label: "Swiss" },
    { value: "mono", label: "Mono" },
  ],
};

export function getCopy(lang) {
  return COPY[lang] || COPY.ja;
}

export function getThemeOptions(lang) {
  return THEME_OPTIONS[lang] || THEME_OPTIONS.ja;
}

export function formatMessage(template, params) {
  return Object.entries(params || {}).reduce(
    (result, [key, value]) =>
      result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template
  );
}
