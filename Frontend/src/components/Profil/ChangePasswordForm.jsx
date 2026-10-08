import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "../../API/api";
import PasswordField from "../PasswordField";

function ChangePasswordForm({ onBack }) {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [saving, setSaving] = useState(false);

    const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

    const submit = async (e) => {
        e.preventDefault();
        if (next.length < 8) {
            toast.error("Kata sandi baru minimal 8 karakter");
            return;
        }
        if (next !== confirm) {
            toast.error("Konfirmasi kata sandi tidak sama");
            return;
        }
        if (next === current) {
            toast.error("Kata sandi baru harus beda dari yang lama");
            return;
        }
        setSaving(true);
        try {
            await changePassword({ current_password: current, password: next, password_confirmation: confirm });
            toast.success("Kata sandi berhasil diubah");
            onBack();
        } catch (error) {
            toast.error(error.message || "Gagal mengubah kata sandi");
            setSaving(false);
        }
    };

    return (
        <div className="profil-page">
            <div className="profil-subheader">
                <button type="button" className="btn-back" onClick={onBack} aria-label="Kembali ke profil">
                    <ArrowLeft size={20} />
                </button>
                <h1>Ganti Kata Sandi</h1>
            </div>

            <form className="profil-edit-card" onSubmit={submit}>
                <PasswordField
                    id="sandi-lama"
                    label="Kata sandi lama"
                    value={current}
                    onChange={setCurrent}
                    show={show.current}
                    onToggle={() => toggle("current")}
                    autoComplete="current-password"
                />
                <PasswordField
                    id="sandi-baru"
                    label="Kata sandi baru"
                    value={next}
                    onChange={setNext}
                    show={show.next}
                    onToggle={() => toggle("next")}
                    autoComplete="new-password"
                />
                <PasswordField
                    id="sandi-konfirmasi"
                    label="Ulangi kata sandi baru"
                    value={confirm}
                    onChange={setConfirm}
                    show={show.confirm}
                    onToggle={() => toggle("confirm")}
                    autoComplete="new-password"
                />
                <p className="field-hint">Minimal 8 karakter. Perangkat lain akan diminta login ulang.</p>
                <button type="submit" className="save-pocket" disabled={saving}>
                    {saving ? <span className="spinner spinner-sm" /> : <><Check size={16} /> Simpan Kata Sandi</>}
                </button>
            </form>
        </div>
    );
}

export default ChangePasswordForm;
