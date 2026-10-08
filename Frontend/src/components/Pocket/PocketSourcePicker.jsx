import { useMemo } from "react";
import { enrichPocket, sortDefaultPocketsFirst } from "../../utils/pocketUI";


function PocketSourcePicker({
  pockets,
  loading,
  value,
  onChange,
  disabledEmpty = true,
}) {
  const sortedPockets = useMemo(
    () => sortDefaultPocketsFirst(pockets),
    [pockets],
  );

  if (loading) {
    return (
      <div className="goal-pocket-loading">
        <span className="spinner spinner-sm" />
        <p>Memuat pocket...</p>
      </div>
    );
  }

  if (pockets.length === 0) {
    return (
      <div className="goal-pocket-empty">
        <p>Belum ada pocket. Buat pocket dulu di halaman Pocket.</p>
      </div>
    );
  }

  return (
    <div
      className="goal-pocket-options"
      role="radiogroup"
      aria-label="Pilih pocket"
    >
      {sortedPockets.map((pocket, index) => {
        const enriched = enrichPocket(pocket, index);
        const Icon = enriched.Icon;
        const balance = Number(pocket.balance ?? 0);
        const empty = disabledEmpty && balance <= 0;
        const active = String(value) === String(pocket.id);
        return (
          <button
            key={pocket.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={empty}
            title={empty ? `${pocket.name} kosong` : pocket.name}
            onClick={() => onChange(pocket.id)}
            className={
              active ? "goal-pocket-option active" : "goal-pocket-option"
            }
          >
            <span
              className={`goal-pocket-option-icon pocket-icon-${enriched.color}`}
            >
              <Icon size={18} />
            </span>
            <span className="goal-pocket-option-info">
              <span className="goal-pocket-option-name">{pocket.name}</span>
              <span className="goal-pocket-option-balance">
                {balance <= 0
                  ? "Kosong"
                  : `Rp${balance.toLocaleString("id-ID")}`}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default PocketSourcePicker;
