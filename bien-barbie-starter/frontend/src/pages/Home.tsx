import { Link } from "react-router-dom";
import { BadgeCheck, CreditCard, HeartHandshake, Sparkles } from "lucide-react";
import { useAuthState } from "../hooks/useAuthState";

export default function Home() {
  const { isLoggedIn } = useAuthState();

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Comunidad circular de moda</p>
          <h1>Tu closet merece una <span>segunda historia</span></h1>
          <p>Bien Barbie es una comunidad de mujeres que compran, venden e inspiran. Sube tus prendas, crea tu closet y conecta con compradoras reales.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/sell">Vender mi closet</Link>
            <Link className="secondary-button" to="/marketplace">Explorar productos</Link>
            {isLoggedIn ? <Link className="secondary-button" to="/profile">Ir a mi perfil</Link> : null}
          </div>
        </div>
        <div className="hero-card">
          <div className="floating-card card-a">Top corset rosa<br /><strong>$15.000</strong></div>
          <div className="floating-card card-b">Vestido floral<br /><strong>$28.000</strong></div>
          <div className="circle-photo">BB</div>
        </div>
      </section>

      <section id="comunidad" className="value-section">
        <h2>Más que moda, comunidad y propósito</h2>
        <div className="value-grid">
          <article><HeartHandshake /><h3>Compra consciente</h3><p>Dale una segunda vida a prendas lindas.</p></article>
          <article><Sparkles /><h3>Apoya a mujeres</h3><p>Cada compra impulsa el closet de otra mujer.</p></article>
          <article><BadgeCheck /><h3>Comunidad segura</h3><p>Perfiles, publicaciones y pagos con control.</p></article>
          <article><CreditCard /><h3>Membresía mensual</h3><p>Modelo con fee mensual para participar como vendedora.</p></article>
        </div>
      </section>
    </main>
  );
}
