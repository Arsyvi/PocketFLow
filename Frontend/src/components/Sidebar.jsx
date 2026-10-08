import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { userLogout } from "../API/api";
import { toast } from "sonner";
import {
  CircleUser,
  LayoutDashboard,
  HistoryIcon,
  GoalIcon,
  Wallet,
  LogOutIcon,
  Loader2,
} from "lucide-react";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) ?? null;
  } catch {
    return null;
  }
}

function Sidebar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(readStoredUser);
  const [avatar, setAvatar] = useState(() =>
    localStorage.getItem("pocketflow:avatar"),
  );

  useEffect(() => {
    const refresh = () => {
      setUser(readStoredUser());
      setAvatar(localStorage.getItem("pocketflow:avatar"));
    };
    window.addEventListener("user-updated", refresh);
    return () => window.removeEventListener("user-updated", refresh);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await userLogout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logout Berhasil");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="sidebar" aria-label="Navigasi utama">
      <div className="profil">
        <div className="profil-img">
          {avatar ? (
            <img className="sidebar-avatar" src={avatar} alt="" />
          ) : (
            <CircleUser />
          )}
        </div>
        <div className="profil-info">
          <h1 className="profil-usn">{user?.name}</h1>
          <p className="profil-gmail">{user?.email}</p>
        </div>
      </div>
      <hr className="sidebar-divider" />
      <ul className="menu">
        <p className="menu-label">MENU</p>
        <li>
          <NavLink to="/dashboard">
            <LayoutDashboard size={22} />
            <span className="nav-label">Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/history">
            <HistoryIcon size={22} />
            <span className="nav-label">History</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/goals">
            <GoalIcon size={22} />
            <span className="nav-label">Goal</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/pocket">
            <Wallet size={22} />
            <span className="nav-label">Pocket</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/profil">
            <CircleUser size={22} />
            <span className="nav-label">Profil</span>
          </NavLink>
        </li>
      </ul>
      <button className="btn-logout" onClick={handleLogout} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="spin" /> Logging out...
          </>
        ) : (
          <>
            <LogOutIcon /> Logout
          </>
        )}
      </button>
    </nav>
  );
}

export default Sidebar;
