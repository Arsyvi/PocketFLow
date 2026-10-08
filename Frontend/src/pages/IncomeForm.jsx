import { useMemo, useState } from "react";
import { CirclePlus, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import formatRibuan from "../utils/formatCurrency";
import { createTransaction, invalidatePocketsCache } from "../API/api";
import { usePockets } from "../hooks/usePockets";
import { sortDefaultPocketsFirst } from "../utils/pocketUI";

function IncomeForm({ onBack }) {
    const [amount, setAmount] = useState("");
    const [pocketId, setPocketId] = useState("");
    const [description, setDescription] = useState("");
    const { pockets, loading: loadingPockets } = usePockets();
    const [saving, setSaving] = useState(false);
    const sortedPockets = useMemo(() => sortDefaultPocketsFirst(pockets), [pockets]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        const nominal = Number(amount.replace(/\D/g, ""));
        if (!nominal || nominal < 1) {
            toast.error("Masukkan nominal yang valid");
            return;
        }
        if (!pocketId) {
            toast.error("Pilih pocket dulu");
            return;
        }
        setSaving(true);
        try {
            await createTransaction({
                pocket_id: Number(pocketId),
                type: "income",
                amount: nominal,
                description: description.trim() || null,
            });
            toast.success("Pemasukan berhasil dicatat");
            invalidatePocketsCache();
            onBack();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Gagal mencatat pemasukan");
            setSaving(false);
        }
    };

    return (
        <div className="income-form">
            <header className="income-header">
                <button className="btn-back" onClick={onBack}>
                    <ArrowLeft size={30} />
                </button>
                <div className="income-title">
                    <CirclePlus size={30} />
                     <h1 className="income-title">Pemasukan</h1>
                </div>
            </header>
            <form className="form-income" onSubmit={handleSubmit}>
                <div className="input-group">
                    <span>Rp</span>
                <input
                    className="input-income"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(formatRibuan(e.target.value))}
                    required
                />
                </div>
                <label className="lblPocket" >Pocket</label>
                <select
                    className="select-income"
                    value={pocketId}
                    onChange={(e) => setPocketId(e.target.value)}
                    required
                >
                    <option value="" disabled hidden>
                        {loadingPockets ? "Memuat pocket..." : (pockets.length === 0 ? "Belum ada pocket, buat dulu" : "Pilih Pocket")}
                    </option>
                    {sortedPockets.map((pocket) => (
                        <option key={pocket.id} value={pocket.id}>
                            {pocket.name} (Rp{Number(pocket.balance).toLocaleString("id-ID")})
                        </option>
                    ))}
                </select>
                <label>Deskripsi</label>
                <textarea
                    className="desc-income"
                    placeholder="Masukan Deskripsi"
                    maxLength={100}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <button className="save-income" type="submit" disabled={saving}>
                    {saving ? <span className="spinner spinner-sm" /> : <><CheckCircle size={20} /> Simpan</>}
                </button>
            </form>
        </div>
    );
}

export default IncomeForm;
