import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "../../API/api";

function EditNameForm({ currentName, onBack, onSaved }) {
    const [name, setName] = useState(currentName ?? "");
    const [saving, setSaving] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const next = name.trim();
        if (next.length < 3) {
            toast.error("Nama minimal 3 huruf");
            return;
        }
        if (next === currentName) {
            onBack();
            return;
        }
        setSaving(true);
        try {
            const updated = await updateProfile({ name: next });
            toast.success("Nama berhasil diperbarui");
            onSaved(updated ?? { name: next }, next);
        } catch (error) {
            toast.error(error.message || "Gagal memperbarui nama");
            setSaving(false);
        }
    };

    return (
        <div className="profil-page">
            <div className="profil-subheader">
                <button type="button" className="btn-back" onClick={onBack} aria-label="Kembali ke profil">
                    <ArrowLeft size={20} />
                </button>
                <h1>Ubah Nama</h1>
            </div>

            <form className="profil-edit-card" onSubmit={submit}>
                <label htmlFor="nama-baru">Nama baru</label>
                <input
                    id="nama-baru"
                    type="text"
                    className="input-pocket"
                    value={name}
                    maxLength={30}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tulis nama barumu"
                    autoComplete="name"
                    required
                />
                <p className="field-hint">Minimal 3 huruf. Nama ini tampil di sidebar dan halaman profil.</p>
                <button type="submit" className="save-pocket" disabled={saving}>
                    {saving ? <span className="spinner spinner-sm" /> : <><Check size={16} /> Simpan Nama</>}
                </button>
            </form>
        </div>
    );
}

export default EditNameForm;
