import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, loginAsMockUser, setToken } from "../api/client";
import { ensureMockData, getSeedMockCredentials, verifyMockCredentials } from "../api/mock";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (import.meta.env.DEV) {
      ensureMockData();
      const seeded = getSeedMockCredentials();
      setEmail(seeded.email);
      setPassword(seeded.password);
    }
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const data = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      navigate("/marketplace");
      return;
    } catch {
      if (!import.meta.env.DEV) {
        setError("No se pudo iniciar sesion. Revisa tu correo y contrasena.");
        return;
      }

      const user = verifyMockCredentials(email, password);
      if (user) {
        loginAsMockUser(user.id);
        navigate("/marketplace");
        return;
      }
    }

    setError("No se pudo iniciar sesion. Revisa tu correo y contrasena.");
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Entrar a Perchi</h1>
        {error && <p className="error">{error}</p>}
        <label>Correo<input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label>
        <label>Contrasena<input value={password} onChange={e => setPassword(e.target.value)} type="password" required /></label>
        <button className="primary-button">Ingresar</button>
        <p>No tienes cuenta? <Link to="/register">Crear cuenta</Link></p>
      </form>
    </main>
  );
}
