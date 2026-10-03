import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080/api';
export const API_URL = import.meta.env.VITE_API_URL ?? `${API_BASE}/tickets`;
export const INCIDENT_API_URL = `${API_BASE}/incidents`;
export const AUTH_URL = `${API_BASE}/auth`;

export const MAX_MESSAGE_LENGTH = 2000;
export const POLL_INTERVAL_MS = 10000;

export const AUTH_EXPIRED_EVENT = 'auth:expired';

export const STATUS_STEPS = [
  { key: 'OPEN', label: 'Received', note: 'We have your request and it is in the queue.' },
  { key: 'IN_PROGRESS', label: 'In progress', note: 'A team member is working on it.' },
  { key: 'RESOLVED', label: 'Resolved', note: 'Your request has been closed.' },
];

export const PRIORITY = {
  HIGH: { label: 'High', color: '#b42318' },
  MEDIUM: { label: 'Medium', color: '#b45309' },
  LOW: { label: 'Low', color: '#027a48' },
};

export const EXAMPLES = [
  { label: 'Charged twice', text: 'I was charged twice for my last order.' },
  { label: "Can't log in", text: "I can't log in and the verification code never arrives." },
  { label: 'Order is late', text: 'My order is a week late and tracking has not updated.' },
];

/* ------------------------------------------------------------------ */
/* Login session                                                       */
/* ------------------------------------------------------------------ */

const AUTH_KEY = 'auth';

function readStoredSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_KEY));
    return stored?.token ? stored : null;
  } catch {
    return null;
  }
}

// Kept in memory too, so login still works if browser storage is unavailable
let session = readStoredSession();

export const getSession = () => session;

export function setSession(next) {
  session = next;
  try {
    if (next) localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    // storage unavailable (private mode etc.): the session lasts until the page closes
  }
}

function expireSession() {
  setSession(null);
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

// Every axios request carries the token
axios.interceptors.request.use((config) => {
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

// An expired or invalid token sends the user back to the login page
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.startsWith(AUTH_URL);
    if (error.response?.status === 401 && session && !isAuthCall) expireSession();
    return Promise.reject(error);
  },
);

// Same as fetch(), but sends the token and handles an expired login.
// The admin dashboard uses this.
export async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && session) expireSession();
  return response;
}

export const registerUser = (payload) =>
  axios.post(`${AUTH_URL}/register`, payload).then((r) => r.data);
export const loginUser = (payload) =>
  axios.post(`${AUTH_URL}/login`, payload).then((r) => r.data);
export const loginAdmin = (payload) =>
  axios.post(`${AUTH_URL}/admin/login`, payload).then((r) => r.data);

/* ------------------------------------------------------------------ */
/* Tickets                                                             */
/* ------------------------------------------------------------------ */

export const createTicket = (message) => axios.post(API_URL, { message }).then((r) => r.data);
export const getTicket = (id) => axios.get(`${API_URL}/${id}`).then((r) => r.data);

// Recent ticket numbers are remembered per account, so two people
// sharing a browser do not see each other's numbers
function storageKey() {
  return session?.id ? `recentTicketIds:${session.id}` : 'recentTicketIds';
}

export function loadRecentIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey()));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function saveRecentId(id) {
  const updated = [id, ...loadRecentIds().filter((existing) => existing !== id)].slice(0, 5);
  try {
    localStorage.setItem(storageKey(), JSON.stringify(updated));
  } catch {
    // storage unavailable (private mode etc.): tracking by number still works
  }
  return updated;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}