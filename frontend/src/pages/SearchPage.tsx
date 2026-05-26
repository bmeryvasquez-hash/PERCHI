import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { findMockUserById, getCommunityMockUsers, getMockListings } from "../api/mock";
import { formatStyle, formatType } from "../lib/listingOptions";
import type { Listing } from "./Marketplace";

type CommunityUser = {
  id: string;
  name: string;
  city?: string;
  commune?: string;
  bio?: string;
  avatarUrl?: string;
  status: string;
  _count?: { listings: number };
};

function normalize(value?: string | number) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesQuery(values: Array<string | number | undefined>, query: string) {
  const normalizedQuery = normalize(query);
  return values.some(value => normalize(value).includes(normalizedQuery));
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setMessage("");

    Promise.all([
      api<{ users: CommunityUser[] }>("/auth/users"),
      api<{ listings: Listing[] }>("/listings")
    ])
      .then(([userData, listingData]) => {
        setUsers(userData.users);
        setListings(listingData.listings);
      })
      .catch(() => {
        if (!import.meta.env.DEV) {
          setUsers([]);
          setListings([]);
          setMessage("No se pudo conectar con la API para buscar.");
          return;
        }

        const mockUsers = getCommunityMockUsers();
        const mockListings = getMockListings().map(item => {
          const seller = findMockUserById(item.sellerId);
          return {
            id: item.id,
            title: item.title,
            brand: item.brand,
            category: item.category,
            style: item.style,
            size: item.size,
            condition: item.condition,
            description: item.description,
            priceClp: item.priceClp,
            imageUrls: item.imageUrls,
            seller: {
              id: seller?.id ?? item.sellerId,
              name: seller?.name ?? "Closet local",
              city: seller?.city,
              commune: seller?.commune,
              avatarUrl: seller?.avatarUrl
            }
          } satisfies Listing;
        });
        setUsers(mockUsers);
        setListings(mockListings);
        setMessage("Mostrando resultados locales mientras la API no esta disponible.");
      })
      .finally(() => setLoading(false));
  }, [query]);

  const matchingUsers = useMemo(() => {
    if (!query) return [];
    return users.filter(user => includesQuery([
      user.name,
      user.city,
      user.commune,
      user.bio,
      user._count?.listings
    ], query));
  }, [query, users]);

  const matchingListings = useMemo(() => {
    if (!query) return [];
    return listings.filter(listing => includesQuery([
      listing.title,
      listing.brand,
      listing.category,
      formatType(listing.category),
      listing.style,
      formatStyle(listing.style ?? "CASUAL"),
      listing.size,
      listing.condition,
      listing.description,
      listing.priceClp,
      listing.seller.name,
      listing.seller.city,
      listing.seller.commune
    ], query));
  }, [query, listings]);

  return (
    <main className="market-page">
      <div className="page-heading">
        <p className="eyebrow">Busqueda</p>
        <h1>{query ? `Resultados para "${query}"` : "Busca en Perchi"}</h1>
        {message ? <p className="muted">{message}</p> : null}
        {!query ? <p className="muted">Busca por prenda, estilo, marca, comuna, ciudad o perfil.</p> : null}
      </div>

      {loading ? <p>Cargando resultados...</p> : null}

      {!loading && query && matchingUsers.length === 0 && matchingListings.length === 0 ? (
        <p className="muted">No encontramos resultados para esa busqueda.</p>
      ) : null}

      {matchingUsers.length > 0 ? (
        <section className="search-section">
          <h2>Perfiles</h2>
          <div className="community-grid">
            {matchingUsers.map(user => (
              <article className="community-card" key={user.id}>
                <Link className="community-cover" to={`/users/${user.id}`}>
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user.name.slice(0, 1)}</span>}
                </Link>
                <div className="community-body">
                  <h3>{user.name}</h3>
                  <p className="muted">{user.commune ?? user.city ?? "Chile"}</p>
                  <p className="community-bio">{user.bio ?? "Closet sin descripcion todavia."}</p>
                  <Link className="secondary-button" to={`/users/${user.id}`}>Ver perfil</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {matchingListings.length > 0 ? (
        <section className="search-section">
          <h2>Prendas</h2>
          <div className="listing-grid">
            {matchingListings.map(item => (
              <article className="listing-card" key={item.id}>
                <div className="listing-image">
                  {item.imageUrls[0] ? <img src={item.imageUrls[0]} alt={item.title} /> : <span>P</span>}
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.brand ?? "Sin marca"} - Talla {item.size}</p>
                  <p>{formatType(item.category)} - {formatStyle(item.style ?? "CASUAL")}</p>
                  <strong>${item.priceClp.toLocaleString("es-CL")}</strong>
                  <small>Closet de <Link className="seller-link" to={`/users/${item.seller.id}`}>{item.seller.name}</Link></small>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
