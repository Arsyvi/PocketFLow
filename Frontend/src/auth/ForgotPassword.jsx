import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { MailCheck, Loader2 } from "lucide-react";
import { forgotPassword } from "../API/api";
import AuthBox from "../components/AuthBox";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const data = await forgotPassword(email.trim());
      setSent(true);
      toast.success(data.message || "Link pengaturan ulang dikirim");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="login">
      {sent ? (
        <div className="login-form">
          <h1>Periksa Emailmu</h1>
          <div className="auth-success">
            <MailCheck size={40} aria-hidden="true" />
            <p>
              Jika <strong>{email}</strong> terdaftar, link pengaturan ulang
              kata sandi sudah dikirim ke sana. Link kedaluwarsa dalam 60 menit.
            </p>
            <Link className="btn-login auth-success-link" to="/login">
              Kembali ke Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <h1>Lupa Password</h1>
          <p className="auth-desc">
            Tulis email akunmu. Kami kirim link untuk membuat kata sandi baru.
          </p>
          <label htmlFor="email-lupa">Email</label>
          <input
            id="email-lupa"
            name="email"
            type="email"
            placeholder="User@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-login" disabled={sending}>
            {sending ? <Loader2 className="spin" /> : "Kirim Link Reset"}
          </button>
          <Link className="auth-back-link" to="/login">
            Kembali ke Login
          </Link>
        </form>
      )}

      <AuthBox
        titleBrand={"Lupa Kata Sandi?"}
        subBrand={
          "Tenang, tulis email akunmu dan kami bantu kamu masuk lagi ke PocketFlow"
        }
        btnText={"Sudah Ingat? Login"}
        NavigateTo={"/login"}
      />
    </div>
  );
}

export default ForgotPassword;
