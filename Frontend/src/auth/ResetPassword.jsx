import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { resetPassword } from "../API/api";
import AuthBox from "../components/AuthBox";
import PasswordField from "../components/PasswordField";

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ password: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Kata sandi baru minimal 8 karakter");
      return;
    }
    if (password !== confirm) {
      toast.error("Konfirmasi kata sandi tidak sama");
      return;
    }
    setSaving(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirm,
      });
      setDone(true);
      toast.success("Kata sandi berhasil diubah");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="login">
      <div className="login-form">
        <h1>Buat Sandi Baru</h1>
        {!token || !email ? (
          <div className="auth-success">
            <CircleAlert size={40} aria-hidden="true" />
            <p>
              Link pengaturan ulang tidak lengkap. Minta link baru di halaman
              lupa kata sandi.
            </p>
            <Link className="btn-login auth-success-link" to="/forgot-password">
              Minta Link Baru
            </Link>
          </div>
        ) : done ? (
          <div className="auth-success">
            <CircleCheck size={40} aria-hidden="true" />
            <p>Kata sandi barumu sudah aktif. Silakan login lagi.</p>
            <Link className="btn-login auth-success-link" to="/login">
              Ke Halaman Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-inner-form">
            <p className="auth-desc">
              Buat kata sandi baru untuk <strong>{email}</strong>.
            </p>
            <PasswordField
              id="sandi-baru-reset"
              label="Kata sandi baru"
              value={password}
              onChange={setPassword}
              show={show.password}
              onToggle={() => toggle("password")}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
            />
            <PasswordField
              id="sandi-konfirmasi-reset"
              label="Ulangi kata sandi baru"
              value={confirm}
              onChange={setConfirm}
              show={show.confirm}
              onToggle={() => toggle("confirm")}
              autoComplete="new-password"
              placeholder="Ulangi kata sandi baru"
            />
            <button type="submit" className="btn-login" disabled={saving}>
              {saving ? <Loader2 className="spin" /> : "Simpan Sandi Baru"}
            </button>
          </form>
        )}
      </div>

      <AuthBox
        titleBrand={"Satu Langkah Lagi"}
        subBrand={"Buat kata sandi baru yang kuat dan gampang kamu ingat"}
        btnText={"Kembali ke Login"}
        NavigateTo={"/login"}
      />
    </div>
  );
}

export default ResetPassword;
