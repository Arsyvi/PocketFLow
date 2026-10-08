import { useState } from "react";
import { Wallet, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createPocket } from "../API/api";
import PocketIconPicker from "../components/Pocket/PocketIconPicker";
import { suggestPocketUI } from "../utils/pocketUI";

function PocketForm({ onBack, onCreated }) {
    const [pocketName, setPocketName] = useState("");
    const [pocketIcon, setPocketIcon] = useState("wallet");
    const [pocketColor, setPocketColor] = useState("blue");
    const [pickerTouched, setPickerTouched] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleNameChange = (value) => {
        setPocketName(value);
        // Auto-suggest icon+warna dari nama selama user belum pilih manual
        if (!pickerTouched) {
            const suggested = suggestPocketUI(value);
            setPocketIcon(suggested.icon);
            setPocketColor(suggested.color);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        const trimmed = pocketName.trim();
        if (!trimmed) {
            toast.error("Masukkan nama pocket");
            return;
        }
        setSaving(true);
        try {
            await createPocket(trimmed, { icon: pocketIcon, color: pocketColor });
            toast.success(`Pocket "${trimmed}" berhasil dibuat`);
            onCreated();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Gagal membuat Pocket");
            setSaving(false);
        }
    };

    return (
        <div className="pocket-form">
            <header className="pocket-form-header">
                <button className="btn-back" onClick={onBack}>
                    <ArrowLeft size={30} />
                </button>
                <div className="pocket-form-title">
                    <Wallet size={30} />
                    <h1>Buat Pocket</h1>
                </div>
            </header>
            <form className="form-pocket" onSubmit={handleSubmit}>
                <label>Nama Pocket</label>
                <input
                    type="text"
                    className="input-pocket"
                    placeholder="Contoh: Tabungan"
                    maxLength={100}
                    value={pocketName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                />
                <PocketIconPicker
                    icon={pocketIcon}
                    color={pocketColor}
                    onIconChange={(key) => { setPocketIcon(key); setPickerTouched(true); }}
                    onColorChange={(key) => { setPocketColor(key); setPickerTouched(true); }}
                />
                <button className="save-pocket" type="submit" disabled={saving}>
                    {saving ? <span className="spinner spinner-sm" /> : <><CheckCircle size={20} /> Simpan</>}
                </button>
            </form>
        </div>
    );
}

export default PocketForm;
