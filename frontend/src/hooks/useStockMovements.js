import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/stock-movements';

export function useStockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  });

  // Wrapper fetch b timeout — bech ma yeb9ach "pending" l'infini
  // ken WiFi mfassel b l7a9i9a (machi DevTools offline)
  const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Délai dépassé — vérifiez votre connexion');
      }
      throw err;
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithTimeout(API, { headers: getHeaders() });
      if (!res.ok) throw new Error('Erreur chargement mouvements');
      const data = await res.json();
      setMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setMovements([]); // évite d'afficher d'anciennes données incohérentes
    } finally {
      setLoading(false);
    }
  };

  const createMovement = async (form) => {
    const res = await fetchWithTimeout(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur création');
    await fetchMovements();
    return data;
  };

  const deleteMovement = async (id) => {
    const res = await fetchWithTimeout(`${API}/${id}`, {
      method: 'DELETE', headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erreur suppression');
    await fetchMovements();
  };

  const totalEntrees = movements
    .filter(m => m.type === 'entree')
    .reduce((s, m) => s + m.quantite, 0);

  const totalSorties = movements
    .filter(m => m.type === 'sortie')
    .reduce((s, m) => s + m.quantite, 0);

  useEffect(() => { fetchMovements(); }, []);

  return {
    movements, loading, error,
    totalEntrees, totalSorties,
    fetchMovements, createMovement, deleteMovement
  };
}