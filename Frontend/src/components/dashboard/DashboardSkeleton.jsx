export function WeeklySkeleton() {
  return (
    <div
      className="weekly-card"
      aria-busy="true"
      aria-label="Memuat pengeluaran mingguan"
      aria-hidden="true"
    >
      <div className="weekly-header">
        <div className="skeleton skeleton-icon-sm" />
        <div className="skeleton skeleton-card-title" />
      </div>
      <div className="skeleton skeleton-weekly-amount" />
      <div className="skeleton skeleton-weekly-text" />
    </div>
  );
}

function RecentSkeletonRow() {
  return (
    <div className="transaction-item" aria-hidden="true">
      <div className="skeleton skeleton-tx-icon" />
      <div className="transaction-info">
        <div className="skeleton skeleton-tx-title" />
        <div className="skeleton skeleton-tx-desc" />
      </div>
      <div className="skeleton skeleton-tx-amount" />
    </div>
  );
}

export function RecentSkeleton({ count = 5 }) {
  return (
    <div
      className="recent-card"
      aria-busy="true"
      aria-label="Memuat transaksi terakhir"
    >
      <div className="recent-header">
        <div className="skeleton skeleton-icon-sm" />
        <div className="skeleton skeleton-card-title" />
      </div>
      <div className="transaction-list">
        {Array.from({ length: count }).map((_, i) => (
          <RecentSkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
