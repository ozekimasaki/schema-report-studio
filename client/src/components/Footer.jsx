export default function Footer({ copy, githubUrl }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">Schema Report Studio</div>
      <div className="footer-note">
        {copy.footer.note}
      </div>
      <div className="footer-links">
        <a href={githubUrl} target="_blank" rel="noreferrer">
          {copy.footer.githubLabel}
        </a>
      </div>
      <div className="footer-copy">
        (c) {new Date().getFullYear()}{" "}
        <a href={githubUrl} target="_blank" rel="noreferrer">
          {copy.footer.copyrightName}
        </a>
      </div>
    </footer>
  );
}
