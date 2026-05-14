import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getMockSessionUserId, getToken, isDemoSession, isMockSession } from "../api/client";
import { createMockListing, updateMockUser } from "../api/mock";

const categories = ["TOPS", "VESTIDOS", "JEANS", "CHAQUETAS", "ACCESORIOS", "ZAPATOS", "OTRO"];
const conditions = ["NUEVO_CON_ETIQUETA", "COMO_NUEVO", "MUY_BUENO", "BUENO", "CON_DETALLES"];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

export default function SellCloset() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: "TOPS",
    size: "M",
    condition: "COMO_NUEVO",
    description: "",
    priceClp: "",
    imageUrl: ""
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
      if (userId) {
        updateMockUser(userId, { status: "ACTIVE" });
      }
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
      const dataUrl = await readFileAsDataUrl(file);
      setImagePreview(dataUrl);
      setForm(current => ({ ...current, imageUrl: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la imagen");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");

    const imageUrls = [imagePreview || form.imageUrl].filter(Boolean);

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
        size: form.size,
        condition: form.condition,
        description: form.description,
        priceClp: Number(form.priceClp),
        imageUrls,
        sellerId: userId
      });
      navigate("/marketplace");
      return;
    }

    try {
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
            <label>Categoria<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Talla<input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} required /></label>
          </div>
          <label>Estado<select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>{conditions.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Descripcion<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label>Precio CLP<input value={form.priceClp} onChange={e => setForm({ ...form, priceClp: e.target.value })} type="number" min="1" required /></label>
          <label>Subir imagen<input type="file" accept="image/*" onChange={onImageChange} /></label>
          <label>o URL de imagen<input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></label>
          {imagePreview || form.imageUrl ? (
            <div className="upload-preview">
              <img src={imagePreview || form.imageUrl} alt="Vista previa de la prenda" />
            </div>
          ) : null}
          <button className="primary-button">Publicar prenda</button>
        </form>
      </section>
    </main>
  );
}
