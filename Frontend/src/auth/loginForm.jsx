import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { userLogin } from "../API/api";
import AuthBox from "../components/AuthBox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "../assets/favicon.png";

function Login() {
  const [akun, setAkun] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await userLogin({
        akun: akun,
        password: password,
      });

      console.log(data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const message = JSON.parse(localStorage.getItem("user"));
      toast.success("Login Berhasil", {
        description: `Selamat datang kembali, ${message?.name}`,
      });
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="auth-mobile-brand" aria-hidden="true">
          <img src={logo} alt="" className="auth-mobile-logo" />
          <p className="auth-mobile-title">
            Pocket<span>Flow</span>
          </p>
        </div>
        <h1>Login</h1>
        <label htmlFor="akun">Nama atau Email</label>
        <input
          id="akun"
          name="akun"
          type="text"
          className="input-nama"
          placeholder="User atau User@email.com"
          autoComplete="username"
          value={akun}
          onChange={(e) => setAkun(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Masukan Password Kamu"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="btn-mata"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <Eye /> : <EyeOff />}
          <span>{showPassword ? "Hide Password" : "Show Password"}</span>
        </button>
        <button
          type="button"
          className="lupa-password"
          onClick={() => navigate("/forgot-password")}
        >
          Lupa Password
        </button>

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? <Loader2 className="spin" /> : "Login"}
        </button>
        <p className="auth-switch-mobile">
          Belum punya akun?{" "}
          <button type="button" onClick={() => navigate("/register")}>
            Register
          </button>
        </p>
      </form>

      <AuthBox
        titleBrand={"Selamat Datang Kembali"}
        subBrand={
          "Masuk dan lanjutkan atur keuanganmu lebih mudah pakai PocketFlow"
        }
        btnText={"Belum Punya Akun? Register"}
        NavigateTo={"/register"}
      />
    </div>
  );
}

export default Login;
