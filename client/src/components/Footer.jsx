export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">Schema Report Studio</div>
      <div className="footer-note">
        JSON-LDを一括で確認し、共有しやすいレポートにまとめます。
      </div>
      <div className="footer-copy">
        (c) {new Date().getFullYear()} OzekiMasaki
      </div>
    </footer>
  );
}
