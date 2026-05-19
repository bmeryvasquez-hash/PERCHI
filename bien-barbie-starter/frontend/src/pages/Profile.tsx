import { ChangeEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getMockSessionUserId, getToken, isDemoSession, isMockSession } from "../api/client";
import ImageLightbox from "../components/ImageLightbox";
import { findMockUserById, getMockListingsByUser, updateMockUser } from "../api/mock";
import { demoListings, type Listing } from "./Marketplace";

type ProfileUser = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
  status: string;
  createdAt?: string;
  _count: { listings: number };
};

const demoProfiles: Record<string, ProfileUser> = {
  "demo-martina": { id: "demo-martina", name: "Martina", city: "Santiago", bio: "Blazers, capas y prendas de oficina con giro femenino.", avatarUrl: "/demo-images/blazer-vintage-marfil.jpg", status: "ACTIVE", _count: { listings: 1 } },
  "demo-agus": { id: "demo-agus", name: "Agus", city: "Vina del Mar", bio: "Closet colorido para eventos, verano y escapadas.", avatarUrl: "/demo-images/vestido-satinado-fucsia.jpg", status: "ACTIVE", _count: { listings: 1 } },
  "demo-fer": { id: "demo-fer", name: "Fer", city: "Concepcion", bio: "Denim lavado, basicos premium y capas neutras.", avatarUrl: "/demo-images/jeans-rectos-azul-lavado.jpg", status: "ACTIVE", _count: { listings: 1 } },
  "demo-cata": { id: "demo-cata", name: "Cata", city: "La Serena", bio: "Accesorios versatiles para looks de noche y oficina.", avatarUrl: "/demo-images/cartera-mini-acolchada.jpg", status: "ACTIVE", _count: { listings: 1 } },
  "demo-self": { id: "demo-self", name: "Tu closet demo", email: "demo@bienbarbie.local", city: "Santiago", bio: "Perfil demo para recorrer la interfaz de Bien Barbie.", avatarUrl: "/demo-images/vestido-satinado-fucsia.jpg", status: "ACTIVE", _count: { listings: 0 } }
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { userId } = useParams();
  const isOwnProfile = !userId;
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [form, setForm] = useState({ name: "", city: "", bio: "", avatarUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

      if (isDemoSession()) {
        if (isOwnProfile) {
          const demoUser = demoProfiles["demo-self"];
          setUser(demoUser);
          setListings([]);
          setForm({
            name: demoUser.name,
            city: demoUser.city ?? "",
            bio: demoUser.bio ?? "",
            avatarUrl: demoUser.avatarUrl ?? ""
          });
          setLoading(false);
          return;
        }

        const demoUser = userId ? demoProfiles[userId] : null;
        setUser(demoUser ?? null);
        setListings(demoListings.filter(item => item.seller.id === userId));
        setLoading(false);
        return;
      }

      const mockUserId = isOwnProfile ? (isMockSession() ? getMockSessionUserId() : null) : userId;

      if (mockUserId) {
        const mockUser = mockUserId ? findMockUserById(mockUserId) : null;

        if (mockUser) {
          const mockListings: Listing[] = getMockListingsByUser(mockUser.id).map(item => ({
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
              id: mockUser.id,
              name: mockUser.name,
              city: mockUser.city,
              avatarUrl: mockUser.avatarUrl
            }
          }));

          setUser({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            city: mockUser.city,
            bio: mockUser.bio,
            avatarUrl: mockUser.avatarUrl,
            status: mockUser.status,
            _count: { listings: mockListings.length }
          });
          setListings(mockListings);
          setForm({
            name: mockUser.name,
            city: mockUser.city ?? "",
            bio: mockUser.bio ?? "",
            avatarUrl: mockUser.avatarUrl ?? ""
          });
        }

        setLoading(false);
        return;
      }

      if (isOwnProfile && !getToken()) {
        setLoading(false);
        return;
      }

      try {
        if (isOwnProfile) {
          const [meData, listingData] = await Promise.all([
            api<{ user: ProfileUser }>("/auth/me"),
            api<{ listings: Listing[] }>("/listings/mine/all")
          ]);
          setUser(meData.user);
          setListings(listingData.listings);
          setForm({
            name: meData.user.name,
            city: meData.user.city ?? "",
            bio: meData.user.bio ?? "",
            avatarUrl: meData.user.avatarUrl ?? ""
          });
        } else if (userId) {
          const [userData, listingData] = await Promise.all([
            api<{ user: ProfileUser }>(`/auth/users/${userId}`),
            api<{ listings: Listing[] }>(`/listings/user/${userId}`)
          ]);
          setUser(userData.user);
          setListings(listingData.listings);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isOwnProfile, userId]);

  async function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm(current => ({ ...current, avatarUrl: dataUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la imagen");
    }
  }

  async function saveProfile() {
    setError("");
    setMessage("");

    if (isDemoSession()) {
      setUser(current => current ? { ...current, ...form } : current);
      setMessage("Perfil demo actualizado localmente.");
      setIsEditing(false);
      return;
    }

    if (isMockSession()) {
      const currentUserId = getMockSessionUserId();
      if (!currentUserId) {
        setError("No se encontro la sesion local.");
        return;
      }

      const updated = updateMockUser(currentUserId, form);
      if (updated) {
        setUser(current => current ? {
          ...current,
          name: updated.name,
          city: updated.city,
          bio: updated.bio,
          avatarUrl: updated.avatarUrl,
          status: updated.status
        } : current);
        setMessage("Perfil local actualizado.");
      }
      setIsEditing(false);
      return;
    }

    try {
      const data = await api<{ user: ProfileUser; message: string }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(form)
      });
      setUser(data.user);
      setMessage(data.message);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el perfil");
    }
  }

  if (!isOwnProfile && !loading && !user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Perfil no encontrado</h1>
          <p className="muted">La usuaria que buscas no existe o aun no tiene perfil publico.</p>
        </section>
      </main>
    );
  }

  if (isOwnProfile && !loading && !user && !isDemoSession()) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Inicia sesion para ver tu perfil</h1>
          <Link className="primary-button" to="/login">Ir a login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      {loading ? <p>Cargando perfil...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {user ? (
        <>
          <section className="profile-header">
            <div className="profile-avatar-wrap">
              {user.avatarUrl ? (
                <button className="profile-avatar-button" type="button" onClick={() => setSelectedImage({ url: user.avatarUrl!, alt: user.name })}>
                  <img className="profile-avatar" src={user.avatarUrl} alt={user.name} />
                </button>
              ) : (
                <div className="profile-avatar profile-avatar-fallback">{user.name.slice(0, 1)}</div>
              )}
            </div>

            <div className="profile-summary">
              <div className="profile-title-row">
                <div>
                  <p className="eyebrow">Perfil</p>
                  <h1>{user.name}</h1>
                </div>
                {isOwnProfile ? (
                  <button className="secondary-button" type="button" onClick={() => setIsEditing(current => !current)}>
                    {isEditing ? "Cerrar edicion" : "Editar perfil"}
                  </button>
                ) : null}
              </div>

              <div className="profile-stats">
                <div><strong>{listings.length}</strong><span>publicaciones</span></div>
                <div><strong>{user.city ?? "Chile"}</strong><span>ciudad</span></div>
                <div><strong>{user.status === "ACTIVE" ? "Activa" : "Pendiente"}</strong><span>estado</span></div>
              </div>

              <p className="profile-bio">{user.bio || "Este closet todavia no tiene descripcion."}</p>
              {message ? <p className="success">{message}</p> : null}
            </div>
          </section>

          {isOwnProfile && isEditing ? (
            <section className="profile-editor">
              <label>Nombre<input value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} /></label>
              <label>Ciudad<input value={form.city} onChange={e => setForm(current => ({ ...current, city: e.target.value }))} /></label>
              <label>Descripcion<textarea value={form.bio} onChange={e => setForm(current => ({ ...current, bio: e.target.value }))} maxLength={240} /></label>
              <label>Subir foto de perfil<input type="file" accept="image/*" onChange={onAvatarChange} /></label>
              <label>o URL de avatar<input value={form.avatarUrl} onChange={e => setForm(current => ({ ...current, avatarUrl: e.target.value }))} placeholder="https://..." /></label>
              {form.avatarUrl ? <img className="profile-avatar-preview" src={form.avatarUrl} alt="Vista previa del avatar" /> : null}
              <button className="primary-button" type="button" onClick={saveProfile}>Guardar perfil</button>
            </section>
          ) : null}

          <section className="profile-posts">
            <div className="page-heading">
              <p className="eyebrow">Closet</p>
              <h2>Publicaciones</h2>
            </div>

            {listings.length === 0 ? <p className="muted">Todavia no hay prendas publicadas en este perfil.</p> : null}

            <div className="profile-grid">
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
                  </div>
                </article>
              ))}
            </div>
          </section>

          {selectedImage ? <ImageLightbox imageUrl={selectedImage.url} alt={selectedImage.alt} onClose={() => setSelectedImage(null)} /> : null}
        </>
      ) : null}
    </main>
  );
}
