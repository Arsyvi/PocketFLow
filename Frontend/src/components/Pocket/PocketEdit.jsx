import { useState } from "react";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { updatePocket } from "../../API/api";
import { resolvePocketSelection } from "../../utils/pocketUI";
import PocketIconPicker from "./PocketIconPicker";

function PocketEdit({ pocket, onBack, onUpdated }) {
  const initial = resolvePocketSelection(pocket);
  const [name, setName] = useState(pocket?.name ?? "");
  const [icon, setIcon] = useState(initial.icon);
  const [color, setColor] = useState(initial.color);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      await updatePocket(pocket.id, { name: trimmed, icon, color });
      toast.success(`Pocket "${trimmed}" berhasil diperbarui`);
      onUpdated();
      onBack();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gagal memperbarui Pocket");
      setLoading(false);
    }
  };

  return (
    <div className="goal-progress-modal" onClick={onBack}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="goal-title">
          <Wallet size={22} />
          <h1 className="modal-title">Ubah Pocket</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="editPocketName">Nama Pocket</label>
          <input
            type="text"
            id="editPocketName"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Pocket"
            required
          />
          <PocketIconPicker
            icon={icon}
            color={color}
            onIconChange={setIcon}
            onColorChange={setColor}
          />
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onBack}
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PocketEdit;
