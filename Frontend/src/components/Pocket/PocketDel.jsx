import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Wallet } from "lucide-react";
import { deletePocket } from "../../API/api";
import { formatPocketAmount } from "../../utils/pocketUI";

function PocketDel({ pocket, onBack, onUpdated }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await deletePocket(pocket.id);
      toast.success(`"${pocket.name}" berhasil dihapus`);
      onUpdated();
      onBack();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gagal menghapus Pocket");
      setLoading(false);
    }
  };

  return (
    <div className="GoalDel-overlay" onClick={onBack}>
      <div className="GoalDel" onClick={(e) => e.stopPropagation()}>
        <div className="GoalDel-header">
          <span>
            <Trash2 size={20} />
          </span>
          <h2 className="GoalDel-title">Hapus Pocket ini?</h2>
        </div>

        <p className="GoalDel-peringatan">
          Apakah Anda yakin ingin menghapus <span>"{pocket?.name}"</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="GoalDel-info">
          <div className="goalDel-box">
            <span>
              <Wallet size={18} />
            </span>
            <div className="goalDel-info-1">
              <h3 className="goalDel-text">Pocket</h3>
              <h3 className="goalDel-name">{pocket?.name}</h3>
            </div>
            <div className="goalDel-amount">
              <p className="goalDel-text">Saldo</p>
              <h3 className="goalDel-name">
                Rp{formatPocketAmount(pocket?.balance)}
              </h3>
            </div>
          </div>
        </div>

        <div className="goalDel-action">
          <button className="btn-cancel" onClick={onBack} disabled={loading}>
            Batal
          </button>
          <button
            className="btnGoalDel-confirm"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner spinner-sm" />
            ) : (
              <>
                <Trash2 size={16} /> Hapus Pocket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PocketDel;
