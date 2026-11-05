"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  Info,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  categories,
  reviewLevels,
  type Category,
  type Information,
} from "@/lib/information";

function ReviewBars({ level }: { level: number }) {
  return (
    <span
      className="review-bars"
      role="img"
      aria-label={`Example review level ${level} of 4: ${reviewLevels[level - 1]}`}
    >
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={n <= level ? "filled" : ""} />
      ))}
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="dialog-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function InformationBrowser({
  information,
}: {
  information: Information[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All info");
  const [sort, setSort] = useState("default");
  const [selected, setSelected] = useState<Information | null>(null);
  const [modal, setModal] = useState<"add" | "about" | "reviews" | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const filtered = information.filter(
    (item) =>
      (category === "All info" || item.category === category) &&
      `${item.title} ${item.summary} ${item.category} Nigeria ${item.keywords.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  const visible =
    sort === "alphabetical"
      ? [...filtered].sort((a, b) => a.title.localeCompare(b.title))
      : filtered;

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const existing = JSON.parse(
        localStorage.getItem("common-sense-drafts") || "[]",
      );
      const drafts = Array.isArray(existing) ? existing : [];
      localStorage.setItem(
        "common-sense-drafts",
        JSON.stringify([
          ...drafts,
          { ...fields, createdAt: new Date().toISOString() },
        ]),
      );
      setSaved(true);
      setSaveError("");
    } catch {
      setSaveError(
        "Your browser could not save this draft. Allow local storage and try again.",
      );
    }
  }

  return (
    <>
      <nav className="utility-nav" aria-label="Site">
        <button onClick={() => setModal("about")}>About this project</button>
        <button
          className="button button-small"
          onClick={() => {
            setSaved(false);
            setSaveError("");
            setModal("add");
          }}
        >
          <Plus size={18} strokeWidth={1.5} aria-hidden="true" /> Add info
        </button>
      </nav>
      <section className="intro" aria-labelledby="page-title">
        <h1 id="page-title">Everyday information for Nigeria</h1>
        <p>Find help, understand a change, or check something you’ve heard.</p>
        <div className="search-box">
          <Search size={18} strokeWidth={1.5} aria-hidden="true" />
          <label className="sr-only" htmlFor="search">
            Search information
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search a topic or question"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="suggestions">
          <span>Try searching</span>
          {["emergency", "baby", "scam"].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                setCategory("All info");
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      <nav className="categories" aria-label="Information categories">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="info-section" aria-labelledby="results-heading">
        <div className="section-heading">
          <div>
            <h2 id="results-heading">
              {query
                ? `Results for “${query}”`
                : category === "All info"
                  ? "Browse information"
                  : category}
            </h2>
            <p>
              {query || category !== "All info"
                ? `${visible.length} sample ${visible.length === 1 ? "guide" : "guides"}`
                : `${visible.length} sample guides for life in Nigeria`}
            </p>
          </div>
          <label className="sort-label">
            <span className="sr-only">Sort information</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Default order</option>
              <option value="alphabetical">Title: A to Z</option>
            </select>
            <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" />
          </label>
        </div>
        <div className="prototype-note">
          <Info size={18} strokeWidth={1.5} aria-hidden="true" />
          <span>
            Prototype: sample content and review levels. Not verified guidance.
          </span>
        </div>
        <div className="card-grid" aria-live="polite">
          {visible.map((item) => (
            <article className="info-card" key={item.id}>
              <span className="category-label">{item.category}</span>
              <h3>
                <button onClick={() => setSelected(item)}>{item.title}</button>
              </h3>
              <p>{item.summary}</p>
              <div className="card-bottom">
                <button
                  className="review-button"
                  onClick={() => setModal("reviews")}
                >
                  <ReviewBars level={item.level} />
                  <span>{item.level}/4 · Example</span>
                </button>
                <button
                  className="read-button"
                  onClick={() => setSelected(item)}
                  aria-label={`Read: ${item.title}`}
                >
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="empty-state">
            <Search size={18} strokeWidth={1.5} aria-hidden="true" />
            <h3>No matching information yet.</h3>
            <p>Try a different word or browse all the sample guides.</p>
            <button
              className="button"
              onClick={() => {
                setQuery("");
                setCategory("All info");
              }}
            >
              Show all info
            </button>
          </div>
        )}
      </section>
      <aside className="contribution">
        <div>
          <h2>Something missing?</h2>
          <p>Suggest information and include a source.</p>
        </div>
        <button
          onClick={() => {
            setSaved(false);
            setSaveError("");
            setModal("add");
          }}
        >
          Add info{" "}
          <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </aside>
      <div className="trust-note">
        <ShieldCheck size={18} strokeWidth={1.5} aria-hidden="true" />
        <span>Four bars show the review stage</span>
        <button onClick={() => setModal("reviews")}>
          How the bars work{" "}
          <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <span className="detail-category">{selected.category} · Nigeria</span>
          <p className="sample-label">Sample guide · Not yet reviewed</p>
          <p className="detail-body">{selected.body}</p>
          <div className="source-placeholder">
            <h3>Sources will appear here</h3>
            <p>
              Published guides will include original sources, a review date, and
              a way to suggest a correction.
            </p>
          </div>
          <button className="button" onClick={() => setSelected(null)}>
            Back to information
          </button>
        </Modal>
      )}
      {modal === "about" && (
        <Modal title="About Common Sense" onClose={() => setModal(null)}>
          <p className="detail-body">
            A simple place to find useful everyday information for life in
            Nigeria. Find an answer, see where it comes from, and get on with
            your day.
          </p>
          <p className="detail-body">
            We're starting with help and support, health, everyday life, online
            safety, and public announcements in plain English.
          </p>
          <p className="sample-label">
            This first version is an interface prototype with sample content.
          </p>
        </Modal>
      )}
      {modal === "reviews" && (
        <Modal
          title="What do the four bars mean?"
          onClose={() => setModal(null)}
        >
          <p className="detail-body">
            The bars show how far information has been checked. They aren't
            votes or a guarantee that a claim is true.
          </p>
          <div className="review-explainer">
            {reviewLevels.map((label, i) => (
              <div key={label}>
                <ReviewBars level={i + 1} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="sample-label">
            These levels are a proposed system. All bars in this prototype are
            illustrative.
          </p>
        </Modal>
      )}
      {modal === "add" && (
        <Modal
          title={saved ? "Your draft is saved" : "Add information"}
          onClose={() => setModal(null)}
        >
          {saved ? (
            <div className="saved-state">
              <span className="saved-check">
                <Check size={18} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p>
                This draft is saved only in this browser. It hasn't been sent
                for review or published.
              </p>
              <button className="button" onClick={() => setModal(null)}>
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="form-intro">
                Share one useful piece of information and its source.
              </p>
              <form className="add-form" onSubmit={saveDraft}>
                <label>
                  What should people know?
                  <input
                    name="title"
                    required
                    maxLength={140}
                    placeholder="Give it a clear, simple title"
                  />
                </label>
                <label>
                  Tell us a little more
                  <textarea
                    name="description"
                    required
                    rows={3}
                    maxLength={2000}
                    placeholder="Explain it in everyday language"
                  />
                </label>
                <div className="form-row">
                  <label>
                    Section
                    <select name="category">
                      {categories.slice(1).map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Where does it apply?
                    <input
                      name="location"
                      required
                      defaultValue="Nigeria"
                      maxLength={120}
                    />
                  </label>
                </div>
                <label>
                  Source link
                  <input
                    name="source"
                    type="url"
                    required
                    placeholder="https://"
                  />
                  <span className="field-help">
                    An original source or the organisation responsible.
                  </span>
                </label>
                <p className="draft-note">
                  Prototype: drafts stay in your browser. Review and publishing
                  will come later.
                </p>
                {saveError && (
                  <p role="alert" className="form-error">
                    {saveError}
                  </p>
                )}
                <button className="button" type="submit">
                  Save draft{" "}
                  <ArrowDown size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
