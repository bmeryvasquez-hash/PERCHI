import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, loginAsMockUser, setToken } from "../api/client";
import { createMockUser, ensureMockData, findMockUserByEmail } from "../api/mock";
import { cityOptions, getCommuneOptionsForCity } from "../lib/chileLocations";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", commune: "" });
  const [error, setError] = useState("");
  const filteredCommuneOptions = useMemo(() => getCommuneOptionsForCity(form.city), [form.city]);

  useEffect(() => {
    ensureMockData();
  }, []);

  useEffect(() => {
    if (!form.commune) return;
    const isValidCommune = filteredCommuneOptions.some(commune => commune.label === form.commune);
    if (!isValidCommune) setForm(current => ({ ...current, commune: "" }));
  }, [filteredCommuneOptions, form.commune]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const data = await api<{ token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setToken(data.token);
      navigate("/sell");
      return;
    } catch {
      if (findMockUserByEmail(form.email)) {
        setError("Ese correo ya existe en modo local.");
        return;
      }

      const user = createMockUser({
        name: form.name,
        email: form.email,
        password: form.password,
        city: form.city,
        commune: form.commune
      });
      loginAsMockUser(user.id);
      navigate("/sell");
      return;
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Unete a la comunidad</h1>
        <p className="muted">Si la API no esta levantada, la cuenta se crea igual en modo local para seguir probando la interfaz.</p>
        {error && <p className="error">{error}</p>}
        <label>Nombre<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Correo<input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" required /></label>
        <label>Ciudad<select value={form.city} onChange={e => setForm({ ...form, city: e.target.value, commune: "" })}><option value="">Selecciona ciudad</option>{cityOptions.map(city => <option key={city.value} value={city.label}>{city.label}</option>)}</select></label>
        <label>Comuna<select value={form.commune} onChange={e => setForm({ ...form, commune: e.target.value })}><option value="">Selecciona comuna</option>{filteredCommuneOptions.map(commune => <option key={commune.value} value={commune.label}>{commune.label}</option>)}</select></label>
        <label>Contrasena<input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" minLength={8} required /></label>
        <button className="primary-button">Crear cuenta</button>
        <p>Ya tienes cuenta? <Link to="/login">Entrar</Link></p>
      </form>
    </main>
  );
}
