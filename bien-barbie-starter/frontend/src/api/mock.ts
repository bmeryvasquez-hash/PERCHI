export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
  status: "PENDING_PAYMENT" | "ACTIVE" | "SUSPENDED";
};

export type MockListing = {
  id: string;
  title: string;
  brand?: string;
  category: string;
  size: string;
  condition: string;
  description?: string;
  priceClp: number;
  imageUrls: string[];
  sellerId: string;
  createdAt: string;
};

const USERS_KEY = "bb_mock_users";
const LISTINGS_KEY = "bb_mock_listings";
const SEED_USER_ID = "mock-bryan";
const SEED_USER_EMAIL = "b.mery.vasquez@gmail.com";
const SEED_USER_PASSWORD = "pionero.98";
const SECOND_SEED_USER_ID = "mock-barbie";
const SECOND_SEED_USER_EMAIL = "3arbie.urm@gmail.com";
const SECOND_SEED_USER_PASSWORD = "1234";

const seedUser: MockUser = {
  id: SEED_USER_ID,
  name: "Bryan Mery",
  email: SEED_USER_EMAIL,
  password: SEED_USER_PASSWORD,
  city: "Santiago",
  bio: "Closet curado para navegar, probar publicaciones y validar la experiencia.",
  avatarUrl: "/demo-images/vestido-satinado-fucsia.jpg",
  status: "ACTIVE"
};

const secondSeedUser: MockUser = {
  id: SECOND_SEED_USER_ID,
  name: "Barbie Urm",
  email: SECOND_SEED_USER_EMAIL,
  password: SECOND_SEED_USER_PASSWORD,
  city: "Vina del Mar",
  bio: "Closet playful con vestidos, denim claro y accesorios para probar la comunidad.",
  avatarUrl: "/demo-images/blazer-vintage-marfil.jpg",
  status: "ACTIVE"
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureMockData() {
  const users = readJson<MockUser[]>(USERS_KEY, []);
  const nextUsers = [...users];

  if (!nextUsers.some(user => user.email === SEED_USER_EMAIL)) {
    nextUsers.unshift(seedUser);
  }

  if (!nextUsers.some(user => user.email === SECOND_SEED_USER_EMAIL)) {
    nextUsers.unshift(secondSeedUser);
  }

  if (nextUsers.length !== users.length) {
    writeJson(USERS_KEY, nextUsers);
  }

  const listings = readJson<MockListing[]>(LISTINGS_KEY, []);
  if (!Array.isArray(listings)) {
    writeJson(LISTINGS_KEY, []);
  }
}

export function getMockUsers() {
  ensureMockData();
  return readJson<MockUser[]>(USERS_KEY, []);
}

export function getMockListings() {
  ensureMockData();
  return readJson<MockListing[]>(LISTINGS_KEY, []);
}

export function findMockUserByEmail(email: string) {
  return getMockUsers().find(user => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function findMockUserById(userId: string) {
  return getMockUsers().find(user => user.id === userId) ?? null;
}

export function createMockUser(input: Omit<MockUser, "id" | "status">) {
  const users = getMockUsers();
  const user: MockUser = {
    id: `mock-${crypto.randomUUID()}`,
    status: "ACTIVE",
    ...input
  };

  writeJson(USERS_KEY, [user, ...users]);
  return user;
}

export function updateMockUser(userId: string, patch: Partial<Pick<MockUser, "name" | "city" | "bio" | "avatarUrl" | "status">>) {
  const users = getMockUsers().map(user => user.id === userId ? { ...user, ...patch } : user);
  writeJson(USERS_KEY, users);
  return users.find(user => user.id === userId) ?? null;
}

export function createMockListing(input: Omit<MockListing, "id" | "createdAt">) {
  const listings = getMockListings();
  const listing: MockListing = {
    id: `listing-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    ...input
  };

  writeJson(LISTINGS_KEY, [listing, ...listings]);
  return listing;
}

export function getMockListingsByUser(userId: string) {
  return getMockListings()
    .filter(listing => listing.sellerId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function verifyMockCredentials(email: string, password: string) {
  const user = findMockUserByEmail(email);
  if (!user || user.password !== password) return null;
  return user;
}

export function getSeedMockCredentials() {
  return { email: SEED_USER_EMAIL, password: SEED_USER_PASSWORD };
}

export function getCommunityMockUsers(excludeUserId?: string | null) {
  return getMockUsers().filter(user => !excludeUserId || user.id !== excludeUserId);
}
