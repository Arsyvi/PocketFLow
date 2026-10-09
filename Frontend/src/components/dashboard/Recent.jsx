import { Receipt } from "lucide-react";
import { RecentSkeleton } from "./DashboardSkeleton";
import { useTransactions } from "../../hooks/useTransactions";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TransactionItem({ transaction }) {
  const isIncome = transaction.type === "income";
  return (
    <div className="transaction-item">
      <div className="transaction-icon">{isIncome ? "+" : "-"}</div>
      <div className="transaction-info">
        <div className="transaction-title">
          <h1>{transaction.title}</h1>
        </div>
        <div className="transaction-desc">
          <p>{transaction.desc || "-"}</p>
        </div>
        <div className="transaction-date">
          <p>{transaction.date}</p>
        </div>
      </div>
      <div className={`transaction-amount ${transaction.type}`}>
        {isIncome ? "+" : "-"}Rp{transaction.amount}
      </div>
    </div>
  );
}

function Recent({ onOpenIncome }) {
  // Pakai cache bersama: tidak fetch ulang tiap ganti halaman,
  // hanya berubah saat ada pemasukan/pengeluaran baru.
  const { transactions, loading } = useTransactions();

  if (loading) {
    return <RecentSkeleton count={5} />;
  }

  const recent = transactions.slice(0, 5).map((tx) => ({
    id: tx.id,
    type: tx.type,
    title: tx.pocket?.name ?? "Pocket",
    desc: tx.description ?? "",
    date: formatDate(tx.created_at),
    amount: Number(tx.amount ?? 0).toLocaleString("id-ID"),
  }));

  return (
    <div className="recent-card">
      <div className="recent-header">
        <Receipt />
        <h1 className="recent-title">Transaksi Terakhir</h1>
      </div>

      {recent.length === 0 ? (
        <div className="empty-state-recent">
          <Receipt size={36} />
          <p>Belum ada Transaksi</p>
          <button className="btn-cta-recent" onClick={onOpenIncome}>
            + Catat Transaksi
          </button>
        </div>
      ) : (
        <div className="transaction-list">
          {recent.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Recent;
