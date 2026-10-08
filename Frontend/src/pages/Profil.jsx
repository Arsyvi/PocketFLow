import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronRight, CircleUser, Lock, LogOut, Mail, Palette, Moon, Sun, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { userLogout } from "../API/api";
import EditNameForm from "../components/Profil/EditNameForm";
import ChangePasswordForm from "../components/Profil/ChangePasswordForm";

const AVATAR_KEY = "pocketflow:avatar";
const MAX_AVATAR_DIM = 256;

function readStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user")) ?? null;
    } catch {
        return null;
    }
}

function fileToAvatarDataUrl(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            try {
                const scale = Math.min(1, MAX_AVATAR_DIM / Math.max(img.width, img.height));
                const w = Math.max(1, Math.round(img.width * scale));
                const h = Math.max(1, Math.round(img.height * scale));
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            } catch (error) {
                URL.revokeObjectURL(url);
                reject(error);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Foto tidak bisa dibaca"));
        };
        img.src = url;
    });
}

function Profil({ theme = "light", setTheme }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(readStoredUser);
    const [avatar, setAvatar] = useState(() => localStorage.getItem(AVATAR_KEY));
    const [view, setView] = useState("main");
    const [loggingOut, setLoggingOut] = useState(false);
    const fileRef = useRef(null);

    const handleNameSaved = (apiUser, name) => {
        const merged = { ...(user ?? {}), ...(apiUser ?? {}), name };
        localStorage.setItem("user", JSON.stringify(merged));
        setUser(merged);
        window.dispatchEvent(new Event("user-updated"));
        setView("main");
    };

    const onPickPhoto = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Pilih file gambar (JPG atau PNG)");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran foto maksimal 2MB");
            return;
        }
        try {
            const dataUrl = await fileToAvatarDataUrl(file);
            localStorage.setItem(AVATAR_KEY, dataUrl);
            setAvatar(dataUrl);
            window.dispatchEvent(new Event("user-updated"));
            toast.success("Foto profil diperbarui");
        } catch {
            toast.error("Foto tidak bisa diproses");
        }
    };

    const removePhoto = () => {
        localStorage.removeItem(AVATAR_KEY);
        setAvatar(null);
        window.dispatchEvent(new Event("user-updated"));
        toast.success("Foto profil dihapus");
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await userLogout();
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            toast.success("Logout Berhasil");
            navigate("/login");
            setLoggingOut(false);
        }
    };

    if (view === "name") {
        return <EditNameForm currentName={user?.name} onBack={() => setView("main")} onSaved={handleNameSaved} />;
    }

    if (view === "password") {
        return <ChangePasswordForm onBack={() => setView("main")} />;
    }

    return (
        <div className="profil-page">

            <div className="profil-header">
                <div className="profil-title">
                    <CircleUser size={35} />
                    <h1>Profil</h1>
                </div>
                <h2>Kelola akunmu di sini</h2>
            </div>

            <div className="profil-box">
                <div className={avatar ? "profil-img has-photo" : "profil-img"}>
                    {avatar ? (
                        <img className="profil-photo" src={avatar} alt={`Foto profil ${user?.name ?? ""}`} />
                    ) : (
                        <CircleUser aria-label="Belum ada foto profil" />
                    )}
                </div>
                <p className="profil-username">{user?.name || "Dummy"}</p>
                <p className="profil-email">{user?.email || "dummy@gmail.com"}</p>

                <div className="profil-btn">
                    <button type="button" className="ganti-foto" onClick={() => fileRef.current?.click()}>
                        <Camera size={16} aria-hidden="true" />
                        <span>{avatar ? "Ganti Foto" : "Tambah Foto"}</span>
                    </button>
                    {avatar && (
                        <button type="button" className="hapus-foto" onClick={removePhoto}>
                            <Trash2 size={16} aria-hidden="true" />
                            <span>Hapus Foto</span>
                        </button>
                    )}
                </div>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="profil-file-hidden"
                    aria-label="Pilih foto profil"
                    onChange={onPickPhoto}
                />
            </div>

            <h2>Akun</h2>
            <div className="akun-box">

                <button type="button" className="akun-row-btn" onClick={() => setView("name")} aria-label={`Ubah nama, saat ini ${user?.name || "kosong"}`}>
                    <span className="akun-item">
                        <User />
                        <span className="nama">Nama</span>
                    </span>
                    <span className="akun-value">
                        <span>{user?.name || "Dummy"}</span>
                        <ChevronRight />
                    </span>
                </button>
                <div className="akun-email">
                    <div className="akun-item">
                        <Mail />
                        <p className="email">Email</p>
                    </div>
                    <div className="akun-value">
                        <p>{user?.email || "dummy@gmail.com"}</p>
                    </div>
                </div>
                <button type="button" className="akun-row-btn" onClick={() => setView("password")} aria-label="Ganti kata sandi">
                    <span className="akun-item">
                        <Lock />
                        <span className="password">Password</span>
                    </span>
                    <span className="akun-value">
                        <span>••••••••</span>
                        <ChevronRight />
                    </span>
                </button>
            </div>

            <h2>Preferensi</h2>
            <div className="preferensi-box">
                <div className="preferensi-tema">
                    <div className="akun-item">
                        <Palette />
                        <p>Tema</p>
                    </div>
                    <div className="preferensi-btn">
                        <button
                            className={`theme-btn ${theme === "light" ? "active" : ""}`}
                            onClick={() => setTheme("light")}
                            title="Light Mode"
                            aria-label="Light Mode"
                        >
                            <Sun size={16} /> Light Mode
                        </button>
                        <button
                            className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                            onClick={() => setTheme("dark")}
                            title="Dark Mode"
                            aria-label="Dark Mode"
                        >
                            <Moon size={16} /> Dark Mode
                        </button>
                    </div>
                </div>
            </div>

            <button
                type="button"
                className="profil-logout-mobile"
                onClick={handleLogout}
                disabled={loggingOut}
            >
                <LogOut size={18} aria-hidden="true" />
                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>

        </div>
    );
}

export default Profil;
