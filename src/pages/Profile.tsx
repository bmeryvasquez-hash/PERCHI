import { Heart } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getMockSessionUserId, getToken, isDemoSession, isMockSession } from "../api/client";
import ImageLightbox from "../components/ImageLightbox";
import { findMockUserById, getMockLikedListingIds, getMockListingsByUser, toggleMockLike, updateMockListing, updateMockUser } from "../api/mock";
import { deliveryModes, formatDeliveryMode } from "../lib/deliveryModes";
import { cityOptions, getCommuneOptionsForCity } from "../lib/chileLocations";
import { clothingConditions, clothingStyles, clothingTypes, formatStyle, formatType } from "../lib/listingOptions";
import { demoListings, type Listing } from "./Marketplace";

type ProfileUser = {
  id: string;
  name: string;
  city?: string;
  commune?: string;
  bio?: string;
  avatarUrl?: string;
  status: string;
  deliveryMode?: string;
  createdAt?: string;
  _count: { listings: number };
};

type ListingForm = {
  title: string;
  brand: string;
  category: string;
  style: string;
  size: string;
  condition: string;
  description: string;
  priceClp: string;
  imageUrl: string;
};

const demoProfiles: Record<string, ProfileUser> = {
  "demo-self": { id: "demo-self", name: "Tu closet demo", city: "Santiago", commune: "Santiago", bio: "Perfil demo para recorrer la interfaz de Perchi.", status: "ACTIVE", deliveryMode: "PRESENCIAL_ENVIO", _count: { listings: 0 } }
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

function listingToForm(listing: Listing): ListingForm {
  return {
    title: listing.title,
    brand: listing.brand ?? "",
    category: listing.category,
    style: listing.style ?? "CASUAL",
    size: listing.size,
    condition: listing.condition,
    description: listing.description ?? "",
    priceClp: String(listing.priceClp),
    imageUrl: listing.imageUrls[0] ?? ""
  };
}

export default function Profile() {
  const { userId } = useParams();
  const isOwnProfile = !userId;
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(getMockSessionUserId());
  const [form, setForm] = useState({ name: "", city: "", commune: "", bio: "", avatarUrl: "", deliveryMode: "PRESENCIAL_ENVIO" });
  const [listingForm, setListingForm] = useState<ListingForm | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  const filteredCommuneOptions = useMemo(() => getCommuneOptionsForCity(form.city), [form.city]);
  useEffect(() => {
    if (isMockSession()) {
      const userId = getMockSessionUserId();
      setCurrentUserId(userId);
      setLikedIds(getMockLikedListingIds(userId));
      return;
    }

    if (!getToken() || isDemoSession()) {
      setCurrentUserId(null);
      setLikedIds([]);
      return;
    }

    Promise.all([
      api<{ user: ProfileUser }>("/auth/me"),
      api<{ listingIds: string[] }>("/listings/liked-ids/mine")
    ])
      .then(([meData, likedData]) => {
        setCurrentUserId(meData.user.id);
        setLikedIds(likedData.listingIds);
      })
      .catch(() => {
        setCurrentUserId(null);
        setLikedIds([]);
      });
  }, []);

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
            commune: demoUser.commune ?? "",
            bio: demoUser.bio ?? "",
            avatarUrl: demoUser.avatarUrl ?? "",
            deliveryMode: demoUser.deliveryMode ?? "PRESENCIAL_ENVIO"
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
              commune: mockUser.commune,
              avatarUrl: mockUser.avatarUrl
            }
          }));

          setUser({
            id: mockUser.id,
            name: mockUser.name,
            city: mockUser.city,
            commune: mockUser.commune,
            bio: mockUser.bio,
            avatarUrl: mockUser.avatarUrl,
            status: mockUser.status,
            _count: { listings: mockListings.length }
          });
          setListings(mockListings);
          setForm({
            name: mockUser.name,
            city: mockUser.city ?? "",
            commune: mockUser.commune ?? "",
            bio: mockUser.bio ?? "",
            avatarUrl: mockUser.avatarUrl ?? "",
            deliveryMode: mockUser.deliveryMode ?? "PRESENCIAL_ENVIO"
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
            commune: meData.user.commune ?? "",
            bio: meData.user.bio ?? "",
            avatarUrl: meData.user.avatarUrl ?? "",
            deliveryMode: meData.user.deliveryMode ?? "PRESENCIAL_ENVIO"
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
          commune: updated.commune,
          bio: updated.bio,
          avatarUrl: updated.avatarUrl,
          deliveryMode: updated.deliveryMode ?? form.deliveryMode,
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
      setUser({ ...data.user, commune: data.user.commune ?? form.commune, deliveryMode: data.user.deliveryMode ?? form.deliveryMode });
      setMessage(data.message);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el perfil");
    }
  }

  async function onToggleLike(item: Listing) {
    if (!getToken() || isDemoSession()) {
      setMessage("Inicia sesion para guardar publicaciones en Mis me gusta.");
      return;
    }

    if (item.seller.id === currentUserId) return;

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
  function startEditingListing(listing: Listing) {
    setError("");
    setMessage("");
    setEditingListingId(listing.id);
    setListingForm(listingToForm(listing));
  }

  function cancelEditingListing() {
    setEditingListingId(null);
    setListingForm(null);
  }

  async function saveListing(listingId: string) {
    if (!listingForm) return;
    setError("");
    setMessage("");

    const payload = {
      title: listingForm.title,
      brand: listingForm.brand || undefined,
      category: listingForm.category,
      style: listingForm.style,
      size: listingForm.size,
      condition: listingForm.condition,
      description: listingForm.description || undefined,
      priceClp: Number(listingForm.priceClp),
      imageUrls: listingForm.imageUrl ? [listingForm.imageUrl] : []
    };

    if (isMockSession()) {
      const updated = updateMockListing(listingId, payload);
      if (updated) {
        setListings(current => current.map(item => item.id === listingId ? {
          ...item,
          ...updated,
          seller: item.seller
        } : item));
        setMessage("Publicacion local actualizada.");
      }
      cancelEditingListing();
      return;
    }

    try {
      const data = await api<{ listing: Listing; message: string }>(`/listings/${listingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setListings(current => current.map(item => item.id === listingId ? {
        ...item,
        ...data.listing,
        seller: item.seller
      } : item));
      setMessage(data.message);
      cancelEditingListing();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la publicacion");
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
                <div><strong>{user.commune ?? "Sin comuna"}</strong><span>comuna</span></div>
                <div><strong>{formatDeliveryMode(user.deliveryMode)}</strong><span>entrega</span></div>
              </div>

              <p className="profile-bio">{user.bio || "Este closet todavia no tiene descripcion."}</p>
              {message ? <p className="success">{message}</p> : null}
            </div>
          </section>

          {isOwnProfile && isEditing ? (
            <section className="profile-editor">
              <label>Nombre<input value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} /></label>
              <label>Ciudad<select value={form.city} onChange={e => setForm(current => ({ ...current, city: e.target.value, commune: "" }))}><option value="">Selecciona ciudad</option>{cityOptions.map(city => <option key={city.value} value={city.label}>{city.label}</option>)}</select></label>
              <label>Comuna<select value={form.commune} onChange={e => setForm(current => ({ ...current, commune: e.target.value }))}><option value="">Selecciona comuna</option>{filteredCommuneOptions.map(commune => <option key={commune.value} value={commune.label}>{commune.label}</option>)}</select></label>
              <label>Modalidad de entrega<select value={form.deliveryMode} onChange={e => setForm(current => ({ ...current, deliveryMode: e.target.value }))}>{deliveryModes.map(mode => <option key={mode.value} value={mode.value}>{mode.label}</option>)}</select></label>
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
              {listings.map(item => {
                const isListingEditing = editingListingId === item.id && listingForm;
                const canLike = !isOwnProfile && !isDemoSession() && item.seller.id !== currentUserId;
                const isLiked = likedIds.includes(item.id);

                return (
                  <article className="listing-card" key={item.id}>
                    <button
                      className="listing-image listing-image-button"
                      type="button"
                      onClick={() => item.imageUrls[0] ? setSelectedImage({ url: item.imageUrls[0], alt: item.title }) : undefined}
                      disabled={!item.imageUrls[0] || Boolean(isListingEditing)}
                    >
                      {item.imageUrls[0] ? <img src={item.imageUrls[0]} alt={item.title} /> : <span>P</span>}
                    </button>

                    {isListingEditing ? (
                      <form className="listing-edit-form" onSubmit={event => { event.preventDefault(); void saveListing(item.id); }}>
                        <label>Titulo<input value={listingForm.title} onChange={e => setListingForm(current => current ? { ...current, title: e.target.value } : current)} required /></label>
                        <label>Marca<input value={listingForm.brand} onChange={e => setListingForm(current => current ? { ...current, brand: e.target.value } : current)} /></label>
                        <div className="form-row compact-row">
                          <label>Tipo<select value={listingForm.category} onChange={e => setListingForm(current => current ? { ...current, category: e.target.value } : current)}>{clothingTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
                          <label>Talla<input value={listingForm.size} onChange={e => setListingForm(current => current ? { ...current, size: e.target.value } : current)} required /></label>
                        </div>
                        <label>Estilo<select value={listingForm.style} onChange={e => setListingForm(current => current ? { ...current, style: e.target.value } : current)}>{clothingStyles.map(style => <option key={style.value} value={style.value}>{style.label}</option>)}</select></label>
                        <label>Estado<select value={listingForm.condition} onChange={e => setListingForm(current => current ? { ...current, condition: e.target.value } : current)}>{clothingConditions.map(condition => <option key={condition.value} value={condition.value}>{condition.label}</option>)}</select></label>
                        <label>Descripcion<textarea value={listingForm.description} onChange={e => setListingForm(current => current ? { ...current, description: e.target.value } : current)} /></label>
                        <label>Precio CLP<input value={listingForm.priceClp} onChange={e => setListingForm(current => current ? { ...current, priceClp: e.target.value } : current)} type="number" min="1" required /></label>
                        <label>URL de imagen<input value={listingForm.imageUrl} onChange={e => setListingForm(current => current ? { ...current, imageUrl: e.target.value } : current)} placeholder="https://..." /></label>
                        <div className="listing-edit-actions">
                          <button className="primary-button" type="submit">Guardar</button>
                          <button className="secondary-button" type="button" onClick={cancelEditingListing}>Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="listing-title-row">
                          <h3>{item.title}</h3>
                          {canLike ? (
                            <button className={`icon-button ${isLiked ? "is-liked" : ""}`} type="button" onClick={() => void onToggleLike(item)} aria-label="Guardar en Mis me gusta">
                              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                            </button>
                          ) : null}
                        </div>
                        <p>{item.brand ?? "Sin marca"} - Talla {item.size}</p>
                        <p>{formatType(item.category)} - {formatStyle(item.style ?? "CASUAL")}</p>
                        {item.description ? <p className="listing-description">{item.description}</p> : null}
                        <strong>${item.priceClp.toLocaleString("es-CL")}</strong>
                        {isOwnProfile ? <button className="secondary-button listing-edit-button" type="button" onClick={() => startEditingListing(item)}>Editar</button> : null}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          {selectedImage ? <ImageLightbox imageUrl={selectedImage.url} alt={selectedImage.alt} onClose={() => setSelectedImage(null)} /> : null}
        </>
      ) : null}
    </main>
  );
}
