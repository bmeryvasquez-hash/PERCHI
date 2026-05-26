import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getMockSessionUserId, getToken, isMockSession } from "../api/client";
import { findMockUserById, getMockLikedListingIds, getMockListings, toggleMockLike } from "../api/mock";
import ImageLightbox from "../components/ImageLightbox";
import { useAuthState } from "../hooks/useAuthState";
import { formatStyle, formatType } from "../lib/listingOptions";

export type Listing = {
  id: string;
  title: string;
  brand?: string;
  category: string;
  style?: string;
  size: string;
  condition: string;
  description?: string;
  priceClp: number;
  imageUrls: string[];
  seller: { id: string; name: string; city?: string; commune?: string; avatarUrl?: string };
  _count?: { likes: number };
};

export const demoListings: Listing[] = [];

export default function Marketplace() {
  const { mockUserId } = useAuthState();
  const [listings, setListings] = useState<Listing[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);

  useEffect(() => {
    const visibleMockListings = import.meta.env.DEV
      ? getMockListings().filter(item => !mockUserId || item.sellerId !== mockUserId)
      : [];

    const mockListings = visibleMockListings.map(item => {
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

    if (isMockSession()) {
      setLikedIds(getMockLikedListingIds(mockUserId));
    } else if (getToken()) {
      api<{ listingIds: string[] }>("/listings/liked-ids/mine")
        .then(data => setLikedIds(data.listingIds))
        .catch(() => setLikedIds([]));
    }

    api<{ listings: Listing[] }>("/listings")
      .then(data => {
        const merged = [...mockListings, ...data.listings];
        setListings(merged);
        if (merged.length === 0) {
          setMessage("Todavia no hay publicaciones. Publica la primera prenda desde Vender mi closet.");
        }
      })
      .catch(() => {
        if (import.meta.env.DEV && mockListings.length > 0) {
          setListings(mockListings);
          setMessage(mockUserId ? "Mostrando publicaciones locales de otras usuarias." : "Mostrando publicaciones guardadas localmente.");
          return;
        }

        setListings([]);
        setMessage("No se pudo conectar con la API para cargar publicaciones.");
      })
      .finally(() => setLoading(false));
  }, [mockUserId]);

  async function onToggleLike(item: Listing) {
    if (!getToken()) {
      setMessage("Inicia sesion para guardar publicaciones en Mis me gusta.");
      return;
    }

    if (item.seller.id === mockUserId) return;

    if (isMockSession()) {
      const userId = getMockSessionUserId();
      if (!userId) return;
      const liked = toggleMockLike(userId, item.id);
      setLikedIds(current => liked ? [item.id, ...current] : current.filter(id => id !== item.id));
      return;
    }

    const isLiked = likedIds.includes(item.id);
    try {
      await api(`/listings/${item.id}/like`, { method: isLiked ? "DELETE" : "POST" });
      setLikedIds(current => isLiked ? current.filter(id => id !== item.id) : [item.id, ...current]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo actualizar el me gusta");
    }
  }

  return (
    <main className="market-page">
      <div className="page-heading">
        <p className="eyebrow">Explorar productos</p>
        <h1>Recomendados para ti</h1>
        {message ? <p className="muted">{message}</p> : null}
      </div>

      {loading ? <p>Cargando prendas...</p> : null}

      <section className="listing-grid">
        {listings.map(item => {
          const isLiked = likedIds.includes(item.id);

          return (
            <article className="listing-card" key={item.id}>
              <button
                className="listing-image listing-image-button"
                type="button"
                onClick={() => item.imageUrls[0] ? setSelectedImage({ url: item.imageUrls[0], alt: item.title }) : undefined}
                disabled={!item.imageUrls[0]}
              >
                {item.imageUrls[0] ? <img src={item.imageUrls[0]} alt={item.title} /> : <span>P</span>}
              </button>
              <div>
                <div className="listing-title-row">
                  <h3>{item.title}</h3>
                  <button className={`icon-button ${isLiked ? "is-liked" : ""}`} type="button" onClick={() => void onToggleLike(item)} aria-label="Guardar en Mis me gusta">
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                </div>
                <p>{item.brand ?? "Sin marca"} - Talla {item.size}</p>
                <p>{formatType(item.category)} - {formatStyle(item.style ?? "CASUAL")}</p>
                <strong>${item.priceClp.toLocaleString("es-CL")}</strong>
                <small>
                  Closet de <Link className="seller-link" to={`/users/${item.seller.id}`}>{item.seller.name}</Link>
                </small>
              </div>
            </article>
          );
        })}
      </section>

      {selectedImage ? <ImageLightbox imageUrl={selectedImage.url} alt={selectedImage.alt} onClose={() => setSelectedImage(null)} /> : null}
    </main>
  );
}
