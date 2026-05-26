import { Link } from "react-router-dom";
import { BadgeCheck, CreditCard, HeartHandshake, Sparkles } from "lucide-react";
import { useAuthState } from "../hooks/useAuthState";

function HeroSection() {
  const { isLoggedIn } = useAuthState();

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Comunidad circular de moda</p>
        <h1>Tu closet merece una <span>segunda historia</span></h1>
        <p>Perchi es una comunidad de mujeres que compran, venden e inspiran. Sube tus prendas, crea tu closet y conecta con compradoras reales.</p>
        <div className="hero-actions">
          <Link className="primary-button" to="/sell">Vender mi closet</Link>
          <Link className="secondary-button" to="/marketplace">Explorar productos</Link>
          {isLoggedIn ? <Link className="secondary-button" to="/profile">Ir a mi perfil</Link> : null}
        </div>
      </div>

      <div className="hero-visual" aria-label="Closet circular Perchi">
        <div className="hero-image-frame">
          <img src="/inicio.png" alt="Closet circular femenino con prendas, accesorios y comunidad" />
          <div className="hero-price-tag hero-price-tag-a">
            <span>Top corset rosa</span>
            <strong>$15.000</strong>
          </div>
          <div className="hero-price-tag hero-price-tag-b">
            <span>Vestido floral</span>
            <strong>$28.000</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <HeroSection />

      <section id="comunidad" className="value-section">
        <h2>{"M\u00e1s que moda, comunidad y prop\u00f3sito"}</h2>
        <div className="value-grid">
          <article><HeartHandshake /><h3>Compra consciente</h3><p>Dale una segunda vida a prendas lindas.</p></article>
          <article><Sparkles /><h3>Apoya a mujeres</h3><p>Cada compra impulsa el closet de otra mujer.</p></article>
          <article><BadgeCheck /><h3>Comunidad segura</h3><p>Perfiles, publicaciones y pagos con control.</p></article>
          <article><CreditCard /><h3>{"Membres\u00eda mensual"}</h3><p>Modelo con fee mensual para participar como vendedora.</p></article>
        </div>
      </section>
    </main>
  );
}
