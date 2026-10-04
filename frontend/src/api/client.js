// API Base URL - works directly with Vite proxy in dev or custom backend URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('railpass_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  register: (data) => fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  login: (credentials) => fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(res => res.json()),

  getCurrentUser: () => fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),

  // Trains
  getTrains: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/trains${query ? `?${query}` : ''}`).then(res => res.json());
  },

  getTrainAvailability: (trainId) => 
    fetch(`${API_BASE}/trains/${trainId}/availability`).then(res => res.json()),

  // Passenger
  bookTicket: (data) => fetch(`${API_BASE}/passenger/book`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }).then(res => res.json()),

  cancelTicket: (data) => fetch(`${API_BASE}/passenger/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }).then(res => res.json()),

  getMyTickets: () => fetch(`${API_BASE}/passenger/tickets`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),

  // Admin
  getAdminStats: () => fetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),

  getAllTickets: (status = 'all') => fetch(`${API_BASE}/admin/tickets?status=${status}`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),

  verifyTicket: (ticketId) => fetch(`${API_BASE}/admin/tickets/${ticketId}/verify`, {
    method: 'PUT',
    headers: getAuthHeaders()
  }).then(res => res.json()),

  issueTicket: (ticketId) => fetch(`${API_BASE}/admin/issue`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ticket_id: ticketId })
  }).then(res => res.json()),

  createTrain: (data) => fetch(`${API_BASE}/admin/trains`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }).then(res => res.json()),

  updateTrain: (id, data) => fetch(`${API_BASE}/admin/trains/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }).then(res => res.json()),

  deleteTrain: (id) => fetch(`${API_BASE}/admin/trains/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(res => res.json()),

  getUsers: () => fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),

  getCancellations: () => fetch(`${API_BASE}/admin/cancellations`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),

  processRefund: (id) => fetch(`${API_BASE}/admin/cancellations/${id}/refund`, {
    method: 'PUT',
    headers: getAuthHeaders()
  }).then(res => res.json())
};
