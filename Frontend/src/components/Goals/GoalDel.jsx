import { GoalIcon, Trash2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DeleteGoal,
  getGoalContributions,
  invalidatePocketsCache,
} from "../../API/api";
import { enrichPocket } from "../../utils/pocketUI";
import { toast } from "sonner";

function formatRp(value) {
  return `Rp${Number(value ?? 0).toLocaleString("id-ID")}`;
}

function GoalDel({
  goal,
  nameGoalDel,
  targetGoalDel,
  currentGoalDel,
  onBack,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const [saldoAwal, setSaldoAwal] = useState(0);
  const [loadingSources, setLoadingSources] = useState(
    () => Number(goal?.current_amount ?? 0) > 0,
  );

  const collected = Number(goal?.current_amount ?? 0);
  const needRefund = collected > 0;

  useEffect(() => {
    if (!needRefund) return;
    let active = true;
    getGoalContributions(goal.id)
      .then((data) => {
        if (!active) return;
        setSources(data.contributions);
        const rest = Number(data.remainder ?? 0);
        setSaldoAwal(rest > 0 ? rest : 0);
      })
      .catch(() => {
        if (active) setSaldoAwal(collected);
      })
      .finally(() => {
        if (active) setLoadingSources(false);
      });
    return () => {
      active = false;
    };
  }, [goal.id, needRefund, collected]);

  const totalKembali = sources.reduce(
    (sum, s) => sum + Number(s.amount ?? 0),
    0,
  );
  const canSubmit = !loading && !loadingSources;

  const DelGoal = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const result = await DeleteGoal(goal.id);
      const kembali = Number(result.refunded ?? totalKembali);
      const hangus = Number(result.saldo_awal ?? result.remainder ?? saldoAwal);
      if (!needRefund || (kembali <= 0 && hangus <= 0)) {
        toast.success(`"${goal.name}" berhasil dihapus`);
      } else if (kembali > 0 && hangus > 0) {
        toast.success(
          `${formatRp(kembali)} kembali ke pocket asal. ${formatRp(hangus)} saldo awal tidak dikembalikan.`,
        );
      } else if (kembali > 0) {
        toast.success(
          sources.length > 1
            ? `${formatRp(kembali)} kembali ke ${sources.length} pocket asal`
            : `${formatRp(kembali)} kembali ke pocket asal`,
        );
      } else {
        toast.success(
          `"${goal.name}" berhasil dihapus. ${formatRp(hangus)} saldo awal tidak dikembalikan.`,
        );
      }
      invalidatePocketsCache();
      onUpdated();
      onBack();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Gagal menghapus goal");
      setLoading(false);
    }
  };

  return (
    <div className="GoalDel-overlay" onClick={onBack}>
      <div
        className="GoalDel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-del-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="GoalDel-header">
          <span>
            <Trash2 />
          </span>
          <h2 className="GoalDel-title" id="goal-del-title">
            Hapus goal ini?
          </h2>
        </div>

        <p className="GoalDel-peringatan">
          Kamu yakin ingin menghapus <span>"{nameGoalDel}"</span>? Tindakan ini
          tidak bisa dibatalkan dan seluruh riwayat penambahan dana pada goal
          ini akan ikut terhapus.
        </p>

        <div className="GoalDel-info">
          <div className="goalDel-box">
            <span>
              <GoalIcon />
            </span>
            <div className="goalDel-info-1">
              <h3 className="goalDel-text">Goal</h3>
              <h3 className="goalDel-name">{nameGoalDel}</h3>
            </div>
            <div className="goalDel-amount">
              <p className="goalDel-text">Target goal</p>
              <h3 className="goalDel-name">Rp{targetGoalDel}</h3>
            </div>
          </div>

          <div className="goalDel-box">
            <div className="goalDel-info-2">
              <p className="goalDel-text">Sudah terkumpul saat ini</p>
              <h3 className="goalDel-current">Rp{currentGoalDel}</h3>
            </div>
          </div>
        </div>

        {needRefund && (
          <div className="GoalDel-info">
            <p className="goalDel-text">Dana yang dikembalikan</p>
            {loadingSources ? (
              <div className="goal-pocket-loading">
                <span className="spinner spinner-sm" />
                <p>Memuat rincian dana...</p>
              </div>
            ) : (
              <>
                {sources.length > 0 ? (
                  <div className="goal-fund-rows">
                    {sources.map((source) => {
                      const enriched = enrichPocket(
                        source.pocket ?? { name: "Pocket" },
                      );
                      const Icon = enriched.Icon;
                      return (
                        <div key={source.pocket_id} className="goal-fund-row">
                          <span
                            className={`goal-pocket-option-icon pocket-icon-${enriched.color}`}
                          >
                            <Icon size={18} />
                          </span>
                          <span className="goal-pocket-option-info">
                            <span className="goal-pocket-option-name">
                              {source.pocket?.name ?? "Pocket"}
                            </span>
                            <span className="goal-pocket-option-balance">
                              Kembali otomatis
                            </span>
                          </span>
                          <span className="goal-fund-static">
                            {formatRp(source.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="goalDel-text">
                    Tidak ada dana setoran yang bisa dikembalikan.
                  </p>
                )}

                {saldoAwal > 0 && (
                  <div className="goalDel-notice">
                    <Info size={16} aria-hidden="true" />
                    <p>
                      {formatRp(saldoAwal)} berasal dari saldo awal yang kamu
                      isi saat membuat goal, jadi tidak dikembalikan ke pocket
                      mana pun. Yang dikembalikan hanya {formatRp(totalKembali)}{" "}
                      dana setoran di atas.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="goalDel-action">
          <button className="btn-cancel" onClick={onBack} disabled={loading}>
            Batal
          </button>
          <button
            className="btnGoalDel-confirm"
            onClick={DelGoal}
            disabled={!canSubmit}
          >
            {loading ? (
              <span className="spinner spinner-sm" />
            ) : (
              <>
                <Trash2 size={16} /> Hapus goal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GoalDel;
