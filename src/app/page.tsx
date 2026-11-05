import { Compass } from "lucide-react";
import { InformationBrowser } from "@/components/information-browser";
import { information } from "@/lib/information";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to information
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="Common Sense home">
            <span className="brand-mark">
              <Compass size={18} strokeWidth={1.5} aria-hidden="true" />
            </span>
            common sense<span className="brand-period">.</span>
          </a>
          <span className="country">
            <span className="nigeria-flag" aria-hidden="true" />
            Nigeria
          </span>
        </div>
      </header>
      <main id="main" className="container">
        <InformationBrowser information={information} />
      </main>
      <footer className="site-footer container">
        <a className="footer-brand" href="/">
          common sense.
        </a>
        <p>Everyday information for Nigeria</p>
        <span>An information project</span>
      </footer>
    </>
  );
}
