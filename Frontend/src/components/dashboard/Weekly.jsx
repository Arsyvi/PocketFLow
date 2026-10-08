import { useEffect, useState } from "react";
import { BarChart } from "lucide-react";
import { getTransactions } from "../../API/api";
import { WeeklySkeleton } from "./DashboardSkeleton";
import { enrichPocket } from "../../utils/pocketUI";

function startOfWeekMonday(now = new Date()) {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  const day = (monday.getDay() + 6) % 7; // Senin = 0
  monday.setDate(monday.getDate() - day);
  return monday;
}

function formatRp(value) {
  return `Rp${Number(value ?? 0).toLocaleString("id-ID")}`;
}

function Weekly() {
  const [weeklyAmount, setWeeklyAmount] = useState(0);
  const [topPocket, setTopPocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTransactions()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const monday = startOfWeekMonday();
        const weekly = list.filter(
          (tx) => tx.type === "expense" && new Date(tx.created_at) >= monday,
        );
        const total = weekly.reduce(
          (sum, tx) => sum + Number(tx.amount ?? 0),
          0,
        );
        setWeeklyAmount(total);

        const byPocket = new Map();
        for (const tx of weekly) {
          const key =
            tx.pocket?.id ?? tx.pocket_id ?? tx.pocket?.name ?? "unknown";
          const entry = byPocket.get(key) ?? {
            name: tx.pocket?.name ?? "Pocket",
            total: 0,
            count: 0,
            sample: tx.pocket ?? { name: tx.pocket?.name ?? "Pocket" },
          };
          entry.total += Number(tx.amount ?? 0);
          entry.count += 1;
          byPocket.set(key, entry);
        }
        let top = null;
        for (const entry of byPocket.values()) {
          if (!top || entry.total > top.total) top = entry;
        }
        setTopPocket(top);
      })
      .catch((error) => console.log(error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <WeeklySkeleton />;
  }

  const share =
    weeklyAmount > 0 && topPocket
      ? Math.round((topPocket.total / weeklyAmount) * 100)
      : 0;
  const enriched = topPocket
    ? enrichPocket(topPocket.sample ?? { name: topPocket.name })
    : null;
  const TopIcon = enriched?.Icon;

  return (
    <div className="weekly-card">
      <div className="weekly-header">
        <BarChart />
        <h1 className="weekly-title">Pengeluaran Mingguan</h1>
      </div>
      <h1 className={`weekly-amount ${weeklyAmount === 0 ? "is-empty" : ""}`}>
        {formatRp(weeklyAmount)}
      </h1>

      {weeklyAmount === 0 ? (
        <p className="empty-state-weekly">Belum ada pengeluaran minggu ini</p>
      ) : topPocket ? (
        <div className="weekly-top">
          {TopIcon && (
            <span
              className={`weekly-top-icon pocket-icon-${enriched.color}`}
              aria-hidden="true"
            >
              <TopIcon size={18} />
            </span>
          )}
          <div className="weekly-top-info">
            <p className="weekly-top-label">
              Minggu ini paling banyak dari <strong>{topPocket.name}</strong>
            </p>
            <p className="weekly-top-value">
              {formatRp(topPocket.total)}
              <span className="weekly-top-share">
                {" "}
                ({share}% dari minggu ini, {topPocket.count} transaksi)
              </span>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Weekly;
