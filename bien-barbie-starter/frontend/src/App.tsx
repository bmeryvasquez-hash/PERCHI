import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link, Route, Routes } from "react-router-dom";
import { logout } from "./api/client";
import { useAuthState } from "./hooks/useAuthState";
import Community from "./pages/Community";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import SellCloset from "./pages/SellCloset";

export default function App() {
  const { isLoggedIn } = useAuthState();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">Bien Barbie</Link>
        <nav>
          <Link to="/marketplace">Explorar productos</Link>
          <Link to="/community">Comunidad</Link>
          <Link to="/sell">Vender mi closet</Link>
        </nav>
        <div className="top-actions">
          <div className="search-pill"><Search size={16} /> Buscar prendas...</div>
          <Heart size={20} />
          <ShoppingBag size={20} />
          {isLoggedIn ? (
            <>
              <Link className="profile-pill" to="/profile"><UserRound size={18} /> Mi perfil</Link>
              <button className="link-button" onClick={logout}>Salir</button>
            </>
          ) : (
            <Link to="/login"><UserRound size={20} /></Link>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/community" element={<Community />} />
        <Route path="/sell" element={<SellCloset />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users/:userId" element={<Profile />} />
      </Routes>
    </div>
  );
}
