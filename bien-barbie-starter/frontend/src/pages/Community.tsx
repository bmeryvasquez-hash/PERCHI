import { Link } from "react-router-dom";
import { getCommunityMockUsers } from "../api/mock";
import { useAuthState } from "../hooks/useAuthState";

export default function Community() {
  const { mockUserId } = useAuthState();
  const users = getCommunityMockUsers(mockUserId);

  return (
    <main className="community-page">
      <div className="page-heading">
        <p className="eyebrow">Comunidad</p>
        <h1>Perfiles de la comunidad</h1>
        <p className="muted">
          {mockUserId ? "Estas viendo otros closets de la comunidad." : "Aqui puedes descubrir los perfiles disponibles en modo local."}
        </p>
      </div>

      <section className="community-grid">
        {users.map(user => (
          <article className="community-card" key={user.id}>
            <Link className="community-cover" to={`/users/${user.id}`}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user.name.slice(0, 1)}</span>}
            </Link>
            <div className="community-body">
              <h3>{user.name}</h3>
              <p className="muted">{user.city ?? "Chile"}</p>
              <p className="community-bio">{user.bio ?? "Closet sin descripcion todavia."}</p>
              <div className="community-actions">
                <Link className="secondary-button" to={`/users/${user.id}`}>Ver perfil</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
