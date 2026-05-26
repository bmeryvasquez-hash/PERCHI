import { Heart, Search, UserRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { api, logout } from "./api/client";
import { getCommunityMockUsers, getMockListings } from "./api/mock";
import { useAuthState } from "./hooks/useAuthState";
import { cityOptions, communeOptions } from "./lib/chileLocations";
import { clothingStyles, clothingTypes, formatStyle, formatType } from "./lib/listingOptions";
import Community from "./pages/Community";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Likes from "./pages/Likes";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import SearchPage from "./pages/SearchPage";
import SellCloset from "./pages/SellCloset";

type SearchSuggestion = {
  label: string;
  meta: string;
  path: string;
};

type SearchUser = {
  id: string;
  name: string;
  city?: string;
  commune?: string;
  bio?: string;
};

type SearchListing = {
  id: string;
  title: string;
  brand?: string;
  category: string;
  style?: string;
  size: string;
  description?: string;
  seller: { id: string; name: string; city?: string; commune?: string };
};

function normalizeSearch(value?: string | number) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesSuggestion(suggestion: SearchSuggestion, query: string) {
  const normalizedQuery = normalizeSearch(query);
  return normalizeSearch(`${suggestion.label} ${suggestion.meta}`).includes(normalizedQuery);
}

export default function App() {
  const { isLoggedIn } = useAuthState();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([]);
  const [searchListings, setSearchListings] = useState<SearchListing[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ users: SearchUser[] }>("/auth/users"),
      api<{ listings: SearchListing[] }>("/listings")
    ])
      .then(([userData, listingData]) => {
        setSearchUsers(userData.users);
        setSearchListings(listingData.listings);
      })
      .catch(() => {
        setSearchUsers(getCommunityMockUsers());
        setSearchListings(getMockListings().map(item => ({
          id: item.id,
          title: item.title,
          brand: item.brand,
          category: item.category,
          style: item.style,
          size: item.size,
          description: item.description,
          seller: { id: item.sellerId, name: "Closet local" }
        })));
      });
  }, []);

  const suggestions = useMemo(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return [];

    const allSuggestions: SearchSuggestion[] = [
      ...searchUsers.map(user => ({
        label: user.name,
        meta: [user.commune, user.city, "perfil"].filter(Boolean).join(" - "),
        path: `/users/${user.id}`
      })),
      ...searchListings.flatMap(listing => [
        {
          label: listing.title,
          meta: [listing.brand, formatType(listing.category), formatStyle(listing.style ?? "CASUAL"), listing.seller.name].filter(Boolean).join(" - "),
          path: `/search?q=${encodeURIComponent(listing.title)}`
        },
        {
          label: formatType(listing.category),
          meta: "tipo de prenda",
          path: `/search?q=${encodeURIComponent(formatType(listing.category))}`
        },
        {
          label: formatStyle(listing.style ?? "CASUAL"),
          meta: "estilo",
          path: `/search?q=${encodeURIComponent(formatStyle(listing.style ?? "CASUAL"))}`
        }
      ]),
      ...clothingTypes.map(type => ({
        label: type.label,
        meta: "tipo de prenda",
        path: `/search?q=${encodeURIComponent(type.label)}`
      })),
      ...clothingStyles.map(style => ({
        label: style.label,
        meta: "estilo",
        path: `/search?q=${encodeURIComponent(style.label)}`
      })),
      ...cityOptions.map(city => ({
        label: city.label,
        meta: "ciudad",
        path: `/search?q=${encodeURIComponent(city.label)}`
      })),
      ...communeOptions.map(commune => ({
        label: commune.label,
        meta: "comuna",
        path: `/search?q=${encodeURIComponent(commune.label)}`
      }))
    ];

    const unique = new Map<string, SearchSuggestion>();
    allSuggestions
      .filter(suggestion => matchesSuggestion(suggestion, query))
      .forEach(suggestion => {
        const key = `${suggestion.label}-${suggestion.meta}`;
        if (!unique.has(key)) unique.set(key, suggestion);
      });

    return Array.from(unique.values()).slice(0, 8);
  }, [searchListings, searchQuery, searchUsers]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setIsSearchFocused(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  function openSuggestion(path: string) {
    setIsSearchFocused(false);
    navigate(path);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand brand-logo" aria-label="Perchi"><img src="/logo_perchi.png" alt="Perchi" /></Link>
        <nav>
          <Link to="/marketplace">Comprar</Link>
          <Link to="/community">Comunidad</Link>
          <Link to="/sell">Vender</Link>
        </nav>
        <div className="top-actions">
          <div className="search-wrap">
            <form className="search-pill" onSubmit={onSearch}>
              <Search size={16} />
              <input
                aria-label="Buscar en Perchi"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
                placeholder="Buscar..."
              />
            </form>
            {isSearchFocused && suggestions.length > 0 ? (
              <div className="search-suggestions">
                {suggestions.map(suggestion => (
                  <button key={`${suggestion.label}-${suggestion.meta}`} type="button" onMouseDown={() => openSuggestion(suggestion.path)}>
                    <strong>{suggestion.label}</strong>
                    <span>{suggestion.meta}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <Link className="icon-link" to="/likes" aria-label="Mis me gusta"><Heart size={20} /></Link>
          {isLoggedIn ? (
            <div className="session-actions">
              <Link className="profile-pill" to="/profile"><UserRound size={18} /> Mi perfil</Link>
              <button className="link-button" onClick={logout}>Salir</button>
            </div>
          ) : (
            <div className="session-actions">
              <Link className="icon-link" to="/login" aria-label="Iniciar sesion"><UserRound size={20} /></Link>
            </div>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/community" element={<Community />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/sell" element={<SellCloset />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users/:userId" element={<Profile />} />
      </Routes>
    </div>
  );
}
