import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, loginAsDemo, loginAsMockUser, setToken } from "../api/client";
import { ensureMockData, getSeedMockCredentials, verifyMockCredentials } from "../api/mock";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    ensureMockData();
    const seeded = getSeedMockCredentials();
    setEmail(seeded.email);
    setPassword(seeded.password);
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
      const user = verifyMockCredentials(email, password);
      if (user) {
        loginAsMockUser(user.id);
        navigate("/marketplace");
        return;
      }
    }

    setError("No se pudo iniciar sesion. En modo local usa el correo y clave precargados.");
  }

  function onDemoLogin() {
    setError("");
    loginAsDemo();
    navigate("/marketplace");
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Entrar a Bien Barbie</h1>
        <p className="muted">Modo local listo: puedes entrar con la cuenta precargada o navegar con sesion demo.</p>
        <p className="muted">Tambien puedes usar `3arbie.urm@gmail.com` con clave `1234`.</p>
        {error && <p className="error">{error}</p>}
        <label>Correo<input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label>
        <label>Contrasena<input value={password} onChange={e => setPassword(e.target.value)} type="password" required /></label>
        <button className="primary-button">Ingresar</button>
        <button className="secondary-button auth-secondary-action" type="button" onClick={onDemoLogin}>Entrar como usuaria demo</button>
        <p>No tienes cuenta? <Link to="/register">Crear cuenta</Link></p>
      </form>
    </main>
  );
}
