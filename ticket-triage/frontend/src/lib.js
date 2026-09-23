import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/tickets';
export const MAX_MESSAGE_LENGTH = 2000;
export const POLL_INTERVAL_MS = 10000;

const STORAGE_KEY = 'recentTicketIds';

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

export const createTicket = (message) => axios.post(API_URL, { message }).then((r) => r.data);
export const getTicket = (id) => axios.get(`${API_URL}/${id}`).then((r) => r.data);

export function loadRecentIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function saveRecentId(id) {
  const updated = [id, ...loadRecentIds().filter((existing) => existing !== id)].slice(0, 5);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage unavailable (private mode etc.): tracking by number still works
  }
  return updated;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}