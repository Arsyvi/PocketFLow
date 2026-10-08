import formatRibuan from "../../utils/formatCurrency";
import { toast } from "sonner";
import { useState } from "react";
import { addAmount, invalidatePocketsCache } from "../../API/api";
import { usePockets } from "../../hooks/usePockets";
import PocketSourcePicker from "../Pocket/PocketSourcePicker";
import { GoalIcon, Trophy, ArrowRight } from "lucide-react";

const QUICK_AMOUNTS = [50000, 100000, 500000];

function GoalEdit({ goal, onBack, onUpdated }) {
  const target = Number(goal.target_amount ?? 0);
  const current = Number(goal.current_amount ?? 0);
  const remaining = Math.max(target - current, 0);

  const { pockets, loading: loadingPockets } = usePockets();
  const [pocketId, setPocketId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const nominal = Number(amount.replace(/\D/g, "")) || 0;
  const selected = pockets.find((p) => String(p.id) === String(pocketId));
  const selectedBalance = selected ? Number(selected.balance ?? 0) : 0;
  const overBalance = selected && nominal > selectedBalance;
  const credited = Math.min(nominal, remaining);
  const capped = nominal > remaining;
  const canSubmit =
    !loading && selected && nominal >= 1 && !overBalance && remaining > 0;

  const fillRemaining = () => {
    if (!selected || remaining <= 0) return;
    setAmount(Math.min(remaining, selectedBalance).toLocaleString("id-ID"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      if (!selected) toast.error("Pilih pocket sumber dulu");
      else if (overBalance)
        toast.error(`Saldo "${selected.name}" tidak mencukupi`);
      return;
    }
    setLoading(true);
    try {
      const result = await addAmount(goal.id, {
        amount: nominal,
        pocket_id: Number(pocketId),
      });
      const got = Number(result.credited ?? nominal);
      if (Number(current) + got >= Number(target)) {
        toast.success(`Selamat! Goal "${goal.name}" tercapai!`, {
          icon: <Trophy size={18} />,
        });
      } else {
        toast.success(
          `Rp${got.toLocaleString("id-ID")} dari "${selected.name}" masuk ke "${goal.name}"`,
        );
      }
      invalidatePocketsCache();
      onUpdated();
      onBack();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gagal memindahkan dana");
      setLoading(false);
    }
  };

  return (
    <div className="goal-progress-modal" onClick={onBack}>
      <div
        className="modal-box modal-box-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="goal-title">
          <GoalIcon size={22} />
          <h1 className="modal-title">Pindah Dana ke "{goal.name}"</h1>
        </div>

        <div className="goal-transfer-recap">
          <div>
            <p className="goal-transfer-label">Terkumpul</p>
            <h3>Rp{current.toLocaleString("id-ID")}</h3>
          </div>
          <ArrowRight size={18} className="goal-transfer-arrow" />
          <div>
            <p className="goal-transfer-label">Target</p>
            <h3>Rp{target.toLocaleString("id-ID")}</h3>
          </div>
          <div className="goal-transfer-remaining">
            <p className="goal-transfer-label">Sisa</p>
            <h3>Rp{remaining.toLocaleString("id-ID")}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Dari Pocket</label>
          <PocketSourcePicker
            pockets={pockets}
            loading={loadingPockets}
            value={pocketId}
            onChange={setPocketId}
            disabledEmpty
          />

          <label htmlFor="tambahDanaGoal">Nominal</label>
          <div className="goal-amount-row">
            <div className="input-group">
              <span>Rp</span>
              <input
                type="text"
                inputMode="numeric"
                id="tambahDanaGoal"
                className="input-income"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(formatRibuan(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="goal-quick-chips">
            {QUICK_AMOUNTS.map((quick) => (
              <button
                key={quick}
                type="button"
                className="goal-chip"
                onClick={() => setAmount(quick.toLocaleString("id-ID"))}
              >
                {quick >= 1000000
                  ? `${quick / 1000000}jt`
                  : `${quick / 1000}rb`}
              </button>
            ))}
            <button
              type="button"
              className="goal-chip goal-chip-accent"
              onClick={fillRemaining}
              disabled={!selected}
            >
              Sisa
            </button>
          </div>
          {overBalance && (
            <p className="goal-transfer-error">
              Melebihi saldo "{selected.name}" (Rp
              {selectedBalance.toLocaleString("id-ID")})
            </p>
          )}

          {selected && nominal >= 1 && !overBalance && (
            <p className="goal-transfer-summary">
              Rp{credited.toLocaleString("id-ID")} dari "{selected.name}" → "
              {goal.name}"{capped && " (pas target, sisanya tetap di pocket)"}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onBack}
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn-confirm" disabled={!canSubmit}>
              {loading ? (
                <span className="spinner spinner-sm" />
              ) : (
                "Pindahkan Dana"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoalEdit;
