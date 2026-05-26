import { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { getCommunityMockUsers } from "../api/mock";
import { useAuthState } from "../hooks/useAuthState";
import { findCity, findCommune, type LocationOption } from "../lib/chileLocations";

type CommunityUser = {
  id: string;
  name: string;
  city?: string;
  commune?: string;
  bio?: string;
  avatarUrl?: string;
  status: string;
  _count?: { listings: number };
};

type MapLocation = Required<Pick<LocationOption, "label" | "lat" | "lon">>;

type Tile = {
  key: string;
  x: number;
  y: number;
  url: string;
};

const tileSize = 256;
const defaultMapSize = { width: 960, height: 520 };
const chileLocation: MapLocation = { label: "Chile", lat: -35.6751, lon: -71.5430 };

function getUserLocation(user: Pick<CommunityUser, "city" | "commune">): MapLocation {
  const commune = findCommune(user.commune);
  if (commune?.lat && commune.lon) return { label: commune.label, lat: commune.lat, lon: commune.lon };

  const city = findCity(user.city);
  if (city?.lat && city.lon) return { label: city.label, lat: city.lat, lon: city.lon };

  return chileLocation;
}

function latLonToWorld(lat: number, lon: number, zoom: number) {
  const scale = tileSize * 2 ** zoom;
  const sinLat = Math.sin((lat * Math.PI) / 180);

  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
  };
}

function worldToLatLon(x: number, y: number, zoom: number): MapLocation {
  const scale = tileSize * 2 ** zoom;
  const lon = (x / scale) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale)));
  const lat = (latRad * 180) / Math.PI;

  return { label: "Mapa", lat, lon };
}

function getUsersCenter(users: CommunityUser[]) {
  const locations = users.map(getUserLocation);
  if (locations.length === 0) return chileLocation;

  return {
    label: "Chile",
    lat: locations.reduce((sum, location) => sum + location.lat, 0) / locations.length,
    lon: locations.reduce((sum, location) => sum + location.lon, 0) / locations.length
  };
}

function buildTiles(zoom: number, center: MapLocation, mapSize: { width: number; height: number }) {
  const centerWorld = latLonToWorld(center.lat, center.lon, zoom);
  const topLeft = {
    x: centerWorld.x - mapSize.width / 2,
    y: centerWorld.y - mapSize.height / 2
  };

  const minTileX = Math.floor(topLeft.x / tileSize);
  const maxTileX = Math.floor((topLeft.x + mapSize.width) / tileSize);
  const minTileY = Math.floor(topLeft.y / tileSize);
  const maxTileY = Math.floor((topLeft.y + mapSize.height) / tileSize);
  const tileCount = 2 ** zoom;
  const tiles: Tile[] = [];

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      if (y < 0 || y >= tileCount) continue;
      const wrappedX = ((x % tileCount) + tileCount) % tileCount;
      tiles.push({
        key: `${zoom}-${x}-${y}`,
        x: x * tileSize - topLeft.x,
        y: y * tileSize - topLeft.y,
        url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`
      });
    }
  }

  return { tiles, topLeft };
}

export default function Community() {
  const { mockUserId } = useAuthState();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [apiUsers, setApiUsers] = useState<CommunityUser[] | null>(null);
  const [message, setMessage] = useState("");
  const [zoom, setZoom] = useState(8);
  const [mapSize, setMapSize] = useState(defaultMapSize);
  const [mapCenter, setMapCenter] = useState<MapLocation | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; center: MapLocation } | null>(null);

  useEffect(() => {
    api<{ users: CommunityUser[] }>("/auth/users")
      .then(data => setApiUsers(data.users))
      .catch(() => {
        if (import.meta.env.DEV) {
          setApiUsers(null);
          setMessage("Mostrando comunidad local mientras la API no esta disponible.");
          return;
        }

        setApiUsers([]);
        setMessage("No se pudo conectar con la API para cargar la comunidad.");
      });
  }, []);

  const users = useMemo(() => {
    if (apiUsers) return apiUsers.filter(user => user.id !== mockUserId);
    return getCommunityMockUsers(mockUserId);
  }, [apiUsers, mockUserId]);

  const usersCenter = useMemo(() => getUsersCenter(users), [users]);
  const center = mapCenter ?? usersCenter;
  const map = useMemo(() => buildTiles(zoom, center, mapSize), [zoom, center, mapSize]);

  useEffect(() => {
    setMapCenter(null);
  }, [usersCenter.lat, usersCenter.lon]);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const syncSize = () => {
      const rect = element.getBoundingClientRect();
      setMapSize({
        width: Math.max(320, Math.round(rect.width)),
        height: Math.max(320, Math.round(rect.height))
      });
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const locations = useMemo(() => {
    const unique = new Map<string, MapLocation>();
    users.forEach(user => {
      const location = getUserLocation(user);
      unique.set(location.label.toLowerCase(), location);
    });
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [users]);

  function moveMapBy(deltaX: number, deltaY: number, baseCenter = center) {
    const world = latLonToWorld(baseCenter.lat, baseCenter.lon, zoom);
    setMapCenter(worldToLatLon(world.x + deltaX, world.y + deltaY, zoom));
  }

  function onMapPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      center
    };
    setDragOffset({ x: 0, y: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onMapPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setDragOffset({
      x: event.clientX - drag.startX,
      y: event.clientY - drag.startY
    });
  }

  function stopMapDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      moveMapBy(drag.startX - event.clientX, drag.startY - event.clientY, drag.center);
      setDragOffset({ x: 0, y: 0 });
      dragRef.current = null;
    }
  }

  function onMapLinkClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (dragRef.current) event.preventDefault();
  }

  function zoomMap(nextZoom: number) {
    setZoom(Math.min(13, Math.max(5, nextZoom)));
  }

  return (
    <main className="community-page">
      <div className="page-heading">
        <p className="eyebrow">Comunidad</p>
        <h1>Perfiles de la comunidad</h1>
        <p className="muted">
          {message || (mockUserId ? "Estas viendo otros closets de la comunidad." : "Aqui puedes descubrir perfiles y ubicaciones de la comunidad.")}
        </p>
      </div>

      <section className="community-map-section">
        <div>
          <p className="eyebrow">Mapa</p>
          <h2>Ubicaciones de usuarias</h2>
          <p className="muted">Mapa real con puntos aproximados segun la comuna o ciudad declarada en cada perfil.</p>
          <div className="map-city-list">
            {locations.map(location => (
              <span key={location.label}>{location.label}</span>
            ))}
          </div>
        </div>

        <div
          ref={mapRef}
          className="community-map tile-map"
          aria-label="Mapa real de ubicaciones de usuarias"
          onPointerDown={onMapPointerDown}
          onPointerMove={onMapPointerMove}
          onPointerUp={stopMapDrag}
          onPointerCancel={stopMapDrag}
        >
          <div
            className="tile-stage"
            style={{
              width: `${mapSize.width}px`,
              height: `${mapSize.height}px`,
              transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`
            }}
          >
            {map.tiles.map(tile => (
              <img
                alt=""
                className="map-tile"
                draggable={false}
                key={tile.key}
                src={tile.url}
                style={{ left: `${tile.x}px`, top: `${tile.y}px` }}
              />
            ))}
            <div className="map-pins-layer" aria-label="Ubicaciones aproximadas de usuarias">
              {users.map(user => {
                const location = getUserLocation(user);
                const world = latLonToWorld(location.lat, location.lon, zoom);
                const x = world.x - map.topLeft.x;
                const y = world.y - map.topLeft.y;

                return (
                  <Link
                    key={user.id}
                    className="map-user-pin"
                    style={{ left: `${x}px`, top: `${y}px` }}
                    to={`/users/${user.id}`}
                    title={`${user.name} - ${location.label}`}
                    onClick={onMapLinkClick}
                  >
                    <span>{user.name.slice(0, 1)}</span>
                    <small>{location.label}</small>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="map-zoom-controls" aria-label="Controles de zoom del mapa" onPointerDown={event => event.stopPropagation()}>
            <button type="button" onClick={() => zoomMap(zoom + 1)}>+</button>
            <button type="button" onClick={() => zoomMap(zoom - 1)}>-</button>
          </div>
        </div>
      </section>

      <section className="community-grid">
        {users.map(user => {
          const location = getUserLocation(user);

          return (
            <article className="community-card" key={user.id}>
              <Link className="community-cover" to={`/users/${user.id}`}>
                {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user.name.slice(0, 1)}</span>}
              </Link>
              <div className="community-body">
                <h3>{user.name}</h3>
                <p className="muted">{location.label}</p>
                <p className="community-bio">{user.bio ?? "Closet sin descripcion todavia."}</p>
                <div className="community-actions">
                  <Link className="secondary-button" to={`/users/${user.id}`}>Ver perfil</Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
