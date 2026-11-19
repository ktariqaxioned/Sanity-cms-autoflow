export default function WorkspaceLoading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div aria-busy="true" aria-label={`Loading ${title.toLowerCase()}`}>
      <header className="wf-page-heading">
        <div>
          <p className="wf-eyebrow">Your personal workspace</p>
          <h1>{title}</h1>
          <p>{description || `Getting your ${title.toLowerCase()} ready…`}</p>
        </div>
      </header>
      <div className="wf-loading-grid" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="wf-loading-card">
            <div className="wf-loading-block" />
            <div className="wf-loading-block" />
            <div className="wf-loading-block" />
          </div>
        ))}
      </div>
      <span className="wf-sr-only" role="status">
        Loading {title.toLowerCase()}.
      </span>
    </div>
  );
}
