import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, loginAsMockUser, setToken } from "../api/client";
import { createMockUser, ensureMockData, findMockUserByEmail } from "../api/mock";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    ensureMockData();
  }, []);

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
        city: form.city
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
        <label>Ciudad<input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></label>
        <label>Contrasena<input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" minLength={8} required /></label>
        <button className="primary-button">Crear cuenta</button>
        <p>Ya tienes cuenta? <Link to="/login">Entrar</Link></p>
      </form>
    </main>
  );
}
