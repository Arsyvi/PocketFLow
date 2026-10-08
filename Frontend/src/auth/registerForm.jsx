import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthBox from "../components/AuthBox";
import { Eye, EyeOff, Loader } from "lucide-react";
import { userRegister } from "../API/api";
import { toast } from "sonner"
import logo from "../assets/favicon.png";

function Register() {
    const navigate = useNavigate()
    const [showPassword,setShowPassword] = useState(false)
    const [showCPassword, setShowCPassword] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await userRegister ({
                name: name,
                email: email,
                password: password,
                password_confirmation: confirmPassword,
            });

            console.log(data)
            toast.success("Register Berhasil!")

            navigate("/login")
        }

        catch (Error) {
            console.error(Error)
            toast.error(Error.message)
        }

        finally {
            setLoading(false);
        }
    }

    return(
        <div className="register">
         <AuthBox titleBrand={"Mulai Kelola Uangmu"} subBrand={"Buat akun dan mulai atur keuangan mu dengan lebih mudah pakai PocketFlow"} 
         btnText={"Sudah Punya Akun? Login"} NavigateTo={"/login"} />

            <form onSubmit={handleSubmit} method="post" className="register-form">
                <div className="auth-mobile-brand" aria-hidden="true">
                    <img src={logo} alt="" className="auth-mobile-logo" />
                    <p className="auth-mobile-title">Pocket<span>Flow</span></p>
                </div>
                <h1>Register</h1>
                <label htmlFor="nama">Nama</label>
                <input className="input-nama" type="text" name="nama" id="nama" placeholder="Masukan Nama kamu" autoComplete="name" value={name} onChange={(e)=>setName(e.target.value)} required />
                <label htmlFor="email">Email</label>
                <input className="input-email" type="email" name="email" id="email" placeholder="user@example.com" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                <label htmlFor="password">Password</label>
                <input type={showPassword ? "text" : "password"} name="password" id="password" placeholder="Masukan Password kamu" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                <button className="btn-mata" type="button" onClick={()=> setShowPassword(!showPassword)}>
                    {showPassword ? <Eye />  : <EyeOff />}
                    <span>
                        {showPassword ? "Hide Password" : "Show Password"}
                    </span>
                </button>
                <label htmlFor="ConfirmPassword">Confirm Password</label>
                <input type={showCPassword ? "text" : "password"} name="ConfirmPassword" id="ConfirmPassword" placeholder="Konfirmasi Password mu" autoComplete="new-password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required />
                <button className="btn-mata" type="button" onClick={()=> setShowCPassword(!showCPassword)}>
                    {showCPassword ? <Eye /> : <EyeOff />}
                    <span>
                    {showCPassword ? "Hide Password" : "Show Password"}
                    </span>
                </button>
                <button className="btn-register" type="submit" disabled={loading}>
                    {loading ? <Loader className="spin" /> : "Register"}
                </button>
                <p className="auth-switch-mobile">
                    Sudah punya akun?{" "}
                    <button type="button" onClick={() => navigate("/login")}>
                        Login
                    </button>
                </p>
            </form>
        </div>
    )
}

export default Register;