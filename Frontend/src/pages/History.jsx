import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, HistoryIcon, Inbox } from "lucide-react";
import { getTransactions } from "../API/api";

function formatRp(value) {
    return `Rp${Number(value ?? 0).toLocaleString("id-ID")}`;
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function History() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);

    const load = () => {
        setLoading(true);
        setError(null);
        getTransactions()
            .then((data) => setTransactions(Array.isArray(data) ? data : []))
            .catch(() => setError("Gagal memuat riwayat. Periksa koneksi lalu coba lagi."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        let active = true;
        getTransactions()
            .then((data) => { if (active) setTransactions(Array.isArray(data) ? data : []); })
            .catch(() => { if (active) setError("Gagal memuat riwayat. Periksa koneksi lalu coba lagi."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const toggleFilter = (type) => {
        setActiveFilter((prev) => (prev === type ? null : type));
    };

    const summary = useMemo(() => {
        let pemasukan = 0;
        let pengeluaran = 0;
        const countByPocket = new Map();
        for (const tx of transactions) {
            const amount = Number(tx.amount ?? 0);
            if (tx.type === "income") pemasukan += amount;
            else if (tx.type === "expense") pengeluaran += amount;
            const key = tx.pocket?.id ?? tx.pocket_id ?? tx.pocket?.name ?? "unknown";
            const name = tx.pocket?.name ?? "Pocket";
            const entry = countByPocket.get(key) ?? { name, count: 0, total: 0 };
            entry.name = name;
            entry.count += 1;
            entry.total += amount;
            countByPocket.set(key, entry);
        }
        let andalan = null;
        for (const entry of countByPocket.values()) {
            if (!andalan || entry.count > andalan.count || (entry.count === andalan.count && entry.total > andalan.total)) {
                andalan = entry;
            }
        }
        return {
            pemasukan,
            pengeluaran,
            total: transactions.length,
            andalan,
        };
    }, [transactions]);

    const visible = useMemo(() => {
        if (!activeFilter) return transactions;
        return transactions.filter((tx) => tx.type === activeFilter);
    }, [transactions, activeFilter]);

    return (
        <div className="history">
            <header className="history-header">
                <div className="history-title">
                    <HistoryIcon size={27} />
                    <h1>Riwayat</h1>
                </div>
                <div className="history-card">
                    <div className="income-card">
                        <p>Total Pemasukan</p>
                        <h2>{loading ? "..." : formatRp(summary.pemasukan)}</h2>
                    </div>
                    <div className="expense-card">
                        <p>Total Pengeluaran</p>
                        <h2>{loading ? "..." : formatRp(summary.pengeluaran)}</h2>
                    </div>
                    <div className="totalTransaksi-card">
                        <p>Total Transaksi</p>
                        <h2>{loading ? "..." : `${summary.total} transaksi`}</h2>
                    </div>
                    <div className="pocket-andalan">
                        <p>Pocket Andalan</p>
                        <h2>{loading ? "..." : (summary.andalan?.name ?? "-")}</h2>
                        {!loading && summary.andalan && (
                            <span className="pocket-andalan-sub">
                                {summary.andalan.count} transaksi
                            </span>
                        )}
                    </div>
                </div>
            </header>
            <main className="history-main">
                <div className="history-filter" role="group" aria-label="Saring riwayat">
                    <button
                        type="button"
                        className={activeFilter === "income" ? "income-filter is-active" : "income-filter"}
                        aria-pressed={activeFilter === "income"}
                        onClick={() => toggleFilter("income")}
                    >
                        <ArrowDownLeft size={15} aria-hidden="true" />
                        <span>Pemasukan</span>
                    </button>
                    <button
                        type="button"
                        className={activeFilter === "expense" ? "expense-filter is-active" : "expense-filter"}
                        aria-pressed={activeFilter === "expense"}
                        onClick={() => toggleFilter("expense")}
                    >
                        <ArrowUpRight size={15} aria-hidden="true" />
                        <span>Pengeluaran</span>
                    </button>
                    {activeFilter && (
                        <span className="history-filter-hint">
                            Ketuk lagi untuk menampilkan semua
                        </span>
                    )}
                </div>
                <div className="history-list">
                    {loading ? (
                        <div className="history-loading" aria-busy="true" aria-label="Memuat riwayat">
                            {[1, 2, 3].map((i) => (
                                <div className="transaction-item" key={i} aria-hidden="true">
                                    <div className="skeleton skeleton-tx-icon" />
                                    <div className="transaction-info">
                                        <div className="skeleton skeleton-tx-title" />
                                        <div className="skeleton skeleton-tx-desc" />
                                    </div>
                                    <div className="skeleton skeleton-tx-amount" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="empty-state-history">
                            <Inbox size={40} />
                            <p>{error}</p>
                            <button type="button" className="btn-cta-recent" onClick={load}>
                                Coba lagi
                            </button>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="empty-state-history">
                            <Inbox size={40} />
                            <p>Belum ada transaksi</p>
                            <span>Transaksi yang kamu catat akan muncul di sini</span>
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="empty-state-history">
                            <Inbox size={40} />
                            <p>
                                Tidak ada {activeFilter === "income" ? "pemasukan" : "pengeluaran"} yang tercatat
                            </p>
                            <span>Ketuk filter sekali lagi untuk menampilkan semua transaksi</span>
                        </div>
                    ) : (
                        visible.map((tx) => {
                            const isIncome = tx.type === "income";
                            return (
                                <div className="transaction-item" key={tx.id}>
                                    <div className={`transaction-icon tx-${tx.type}`} aria-hidden="true">
                                        {isIncome ? "+" : "-"}
                                    </div>
                                    <div className="transaction-info">
                                        <div className="transaction-title">
                                            <h1>{tx.pocket?.name ?? "Pocket"}</h1>
                                        </div>
                                        <div className="transaction-desc">
                                            <p>{tx.description || "-"}</p>
                                        </div>
                                        <div className="transaction-date">
                                            <p>{formatDate(tx.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount ${tx.type}`}>
                                        {isIncome ? "+" : "-"}{formatRp(tx.amount)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}

export default History;
