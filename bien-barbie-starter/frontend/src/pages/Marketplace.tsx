import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { findMockUserById, getMockListings } from "../api/mock";
import ImageLightbox from "../components/ImageLightbox";
import { useAuthState } from "../hooks/useAuthState";

export type Listing = {
  id: string;
  title: string;
  brand?: string;
  category: string;
  size: string;
  condition: string;
  description?: string;
  priceClp: number;
  imageUrls: string[];
  seller: { id: string; name: string; city?: string; avatarUrl?: string };
};

export const demoListings: Listing[] = [
  {
    id: "demo-1",
    title: "Blazer vintage marfil",
    brand: "Zara",
    category: "CHAQUETAS",
    size: "M",
    condition: "COMO_NUEVO",
    description: "Blazer estructurado para looks de oficina o noche.",
    priceClp: 24990,
    imageUrls: ["/demo-images/blazer-vintage-marfil.jpg"],
    seller: { id: "demo-martina", name: "Martina", city: "Santiago" }
  },
  {
    id: "demo-2",
    title: "Vestido satinado fucsia",
    brand: "Mango",
    category: "VESTIDOS",
    size: "S",
    condition: "MUY_BUENO",
    description: "Vestido midi con espalda descubierta.",
    priceClp: 31990,
    imageUrls: ["/demo-images/vestido-satinado-fucsia.jpg"],
    seller: { id: "demo-agus", name: "Agus", city: "Vina del Mar" }
  },
  {
    id: "demo-3",
    title: "Jeans rectos azul lavado",
    brand: "Levi's",
    category: "JEANS",
    size: "38",
    condition: "BUENO",
    description: "Tiro alto y corte recto clasico.",
    priceClp: 18990,
    imageUrls: ["/demo-images/jeans-rectos-azul-lavado.jpg"],
    seller: { id: "demo-fer", name: "Fer", city: "Concepcion" }
  },
  {
    id: "demo-4",
    title: "Cinturon elegante negro",
    brand: "Aldo",
    category: "ACCESORIOS",
    size: "Unica",
    condition: "NUEVO_CON_ETIQUETA",
    description: "Ideal para eventos y salidas.",
    priceClp: 15990,
    imageUrls: ["/demo-images/cartera-mini-acolchada.jpg"],
    seller: { id: "demo-cata", name: "Cata", city: "La Serena" }
  }
];

export default function Marketplace() {
  const { mockUserId } = useAuthState();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);

  useEffect(() => {
    const visibleMockListings = getMockListings()
      .filter(item => !mockUserId || item.sellerId !== mockUserId);

    const mockListings = visibleMockListings.map(item => {
      const seller = findMockUserById(item.sellerId);

      return {
        id: item.id,
        title: item.title,
        brand: item.brand,
        category: item.category,
        size: item.size,
        condition: item.condition,
        description: item.description,
        priceClp: item.priceClp,
        imageUrls: item.imageUrls,
        seller: {
          id: seller?.id ?? item.sellerId,
          name: seller?.name ?? "Closet local",
          city: seller?.city,
          avatarUrl: seller?.avatarUrl
        }
      } satisfies Listing;
    });

    api<{ listings: Listing[] }>("/listings")
      .then(data => {
        const merged = [...demoListings, ...mockListings, ...data.listings];
        setListings(merged);
        if (merged.length === 0) {
          setMessage("Todavia no hay publicaciones reales. Mostrando referencias demo.");
          setListings(demoListings);
        }
      })
      .catch(() => {
        if (mockListings.length > 0) {
          setListings([...demoListings, ...mockListings]);
          setMessage(mockUserId ? "Mostrando referencias demo y publicaciones locales de otras usuarias." : "Mostrando referencias demo y publicaciones guardadas localmente.");
          return;
        }

        setListings(demoListings);
        setMessage("Mostrando publicaciones demo mientras la API no esta disponible.");
      })
      .finally(() => setLoading(false));
  }, [mockUserId]);

  return (
    <main className="market-page">
      <div className="page-heading">
        <p className="eyebrow">Explorar productos</p>
        <h1>Recomendados para ti</h1>
        {message ? <p className="muted">{message}</p> : null}
      </div>

      {loading ? <p>Cargando prendas...</p> : null}

      <section className="listing-grid">
        {listings.map(item => (
          <article className="listing-card" key={item.id}>
            <button
              className="listing-image listing-image-button"
              type="button"
              onClick={() => item.imageUrls[0] ? setSelectedImage({ url: item.imageUrls[0], alt: item.title }) : undefined}
              disabled={!item.imageUrls[0]}
            >
              {item.imageUrls[0] ? <img src={item.imageUrls[0]} alt={item.title} /> : <span>BB</span>}
            </button>
            <div>
              <h3>{item.title}</h3>
              <p>{item.brand ?? "Sin marca"} · Talla {item.size}</p>
              <strong>${item.priceClp.toLocaleString("es-CL")}</strong>
              <small>
                Closet de <Link className="seller-link" to={`/users/${item.seller.id}`}>{item.seller.name}</Link>
              </small>
            </div>
          </article>
        ))}
      </section>

      {selectedImage ? <ImageLightbox imageUrl={selectedImage.url} alt={selectedImage.alt} onClose={() => setSelectedImage(null)} /> : null}
    </main>
  );
}
