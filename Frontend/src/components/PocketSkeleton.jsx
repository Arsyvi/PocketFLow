function PocketCardSkeletonItem({ variant = "dashboard" }) {
  if (variant === "page") {
    return (
      <div className="pocket-card-skeleton" aria-hidden="true">
        <div className="pocket-card-skeleton-header">
          <div className="skeleton skeleton-icon" />
          <div className="skeleton skeleton-card-title" />
        </div>
        <div className="skeleton skeleton-card-amount" />
        <div className="pocket-skeleton-actions pocket-skeleton-actions-end">
          <div className="skeleton skeleton-btn-icon" />
          <div className="skeleton skeleton-btn-icon" />
        </div>
      </div>
    );
  }

  return (
    <div className="pocket-card-skeleton" aria-hidden="true">
      <div className="pocket-card-skeleton-header">
        <div className="skeleton skeleton-icon" />
        <div className="skeleton skeleton-card-title" />
      </div>
      <div className="skeleton skeleton-card-amount" />
    </div>
  );
}

export function PocketPageSkeleton({ count = 6 }) {
  return (
    <div
      className="pocket-skeleton"
      aria-busy="true"
      aria-label="Memuat pocket"
    >
      <div className="pocket-skeleton-header pocket-header-spread page-header">
        <div className="pocket-skeleton-titlebox">
          <div className="skeleton skeleton-circle" />
          <div className="skeleton skeleton-title" />
        </div>
        <div className="skeleton skeleton-button" />
      </div>
      <div className="pocketsPage-grid">
        {Array.from({ length: count }).map((_, i) => (
          <PocketCardSkeletonItem key={i} variant="page" />
        ))}
      </div>
    </div>
  );
}

export function PocketDashboardSkeleton({ count = 3 }) {
  return (
    <div className="pockets-grid" aria-busy="true" aria-label="Memuat pocket">
      {Array.from({ length: count }).map((_, i) => (
        <PocketCardSkeletonItem key={i} variant="dashboard" />
      ))}
    </div>
  );
}

export default PocketCardSkeletonItem;
