import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getMockSessionUserId, getToken, isMockSession } from "../api/client";
import { findMockUserById, getMockLikedListings } from "../api/mock";
import { formatStyle, formatType } from "../lib/listingOptions";
import type { Listing } from "./Marketplace";

export default function Likes() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      setMessage("Inicia sesion para ver tus publicaciones guardadas.");
      return;
    }

    if (isMockSession()) {
      const userId = getMockSessionUserId();
      const likedListings = getMockLikedListings(userId).map(item => {
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
      setListings(likedListings);
      setLoading(false);
      return;
    }

    api<{ listings: Listing[] }>("/listings/likes/mine")
      .then(data => setListings(data.listings))
      .catch(err => setMessage(err instanceof Error ? err.message : "No se pudieron cargar tus me gusta"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="market-page">
      <div className="page-heading">
        <p className="eyebrow">Mis me gusta</p>
        <h1>Prendas guardadas</h1>
        {message ? <p className="muted">{message}</p> : null}
      </div>

      {loading ? <p>Cargando tus me gusta...</p> : null}
      {!loading && listings.length === 0 ? <p className="muted">Todavia no guardas publicaciones.</p> : null}

      <section className="listing-grid">
        {listings.map(item => (
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
      </section>
    </main>
  );
}