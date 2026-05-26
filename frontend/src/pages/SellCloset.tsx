import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getMockSessionUserId, getToken, isDemoSession, isMockSession, uploadImageDataUrl } from "../api/client";
import { createMockListing, updateMockUser } from "../api/mock";
import { readImageFileAsDataUrl } from "../lib/images";
import { clothingConditions, clothingStyles, clothingTypes } from "../lib/listingOptions";

export default function SellCloset() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: "POLERA",
    style: "CASUAL",
    size: "M",
    condition: "COMO_NUEVO",
    description: "",
    priceClp: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isLoggedIn = Boolean(getToken());
  const isDemo = isDemoSession();
  const isMock = isMockSession();

  async function activateMembership() {
    setError("");
    if (isDemo) {
      setMessage("Membresia demo activada. Esta sesion es solo para recorrer la interfaz.");
      return;
    }

    if (isMock) {
      const userId = getMockSessionUserId();
      if (userId) updateMockUser(userId, { status: "ACTIVE" });
      setMessage("Membresia activada en modo local.");
      return;
    }

    try {
      const data = await api<{ message: string }>("/subscriptions/mock-activate", { method: "POST" });
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar la membresia");
    }
  }

  async function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setImagePreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la imagen");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");

    let imageUrls: string[] = [];

    if (isDemo) {
      setMessage("Publicacion simulada correctamente en modo demo.");
      navigate("/marketplace");
      return;
    }

    if (isMock) {
      const userId = getMockSessionUserId();
      if (!userId) {
        setError("No se encontro la sesion local.");
        return;
      }

      createMockListing({
        title: form.title,
        brand: form.brand,
        category: form.category,
        style: form.style,
        size: form.size,
        condition: form.condition,
        description: form.description,
        priceClp: Number(form.priceClp),
        imageUrls: imagePreview ? [imagePreview] : [],
        sellerId: userId
      });
      navigate("/marketplace");
      return;
    }

    try {
      if (imagePreview) {
        setMessage("Subiendo imagen...");
        imageUrls = [await uploadImageDataUrl(imagePreview)];
      }

      await api("/listings", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          priceClp: Number(form.priceClp),
          imageUrls
        })
      });
      navigate("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar");
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Para vender debes iniciar sesion</h1>
          <p className="muted">Crea una cuenta o entra en demo para armar tu closet y recorrer el flujo.</p>
          <Link className="primary-button" to="/login">Ir a login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="sell-page">
      <section className="sell-layout">
        <div className="membership-card">
          <p className="eyebrow">Membresia vendedora</p>
          <h2>Fee mensual</h2>
          <p>Activa tu cuenta para publicar prendas y participar en la comunidad.</p>
          {isDemo ? <p className="muted">Estas navegando con una sesion demo local.</p> : null}
          <button className="secondary-button" type="button" onClick={activateMembership}>Activar membresia demo</button>
        </div>

        <form className="sell-form" onSubmit={onSubmit}>
          <h1>Vender mi closet</h1>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          <label>Titulo<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></label>
          <label>Marca<input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></label>
          <div className="form-row">
            <label>Tipo<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{clothingTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
            <label>Talla<input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} required /></label>
          </div>
          <label>Estilo<select value={form.style} onChange={e => setForm({ ...form, style: e.target.value })}>{clothingStyles.map(style => <option key={style.value} value={style.value}>{style.label}</option>)}</select></label>
          <label>Estado<select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>{clothingConditions.map(condition => <option key={condition.value} value={condition.value}>{condition.label}</option>)}</select></label>
          <label>Descripcion<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label>Precio CLP<input value={form.priceClp} onChange={e => setForm({ ...form, priceClp: e.target.value })} type="number" min="1" required /></label>
          <label>Tomar foto de la prenda<input type="file" accept="image/*" capture="environment" onChange={onImageChange} /></label>
          <label>Subir imagen desde galeria<input type="file" accept="image/*" onChange={onImageChange} /></label>
          {imagePreview ? (
            <div className="upload-preview">
              <img src={imagePreview} alt="Vista previa de la prenda" />
            </div>
          ) : null}
          <button className="primary-button">Publicar prenda</button>
        </form>
      </section>
    </main>
  );
}
