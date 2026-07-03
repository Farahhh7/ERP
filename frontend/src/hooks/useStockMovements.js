import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/stock-movements';

export function useStockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API, { headers });
      if (!res.ok) throw new Error('Erreur chargement mouvements');
      const data = await res.json();
      setMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMovement = async (form) => {
    const res = await fetch(API, {
      method: 'POST', headers,
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur création');
    await fetchMovements();
    return data;
  };

  const deleteMovement = async (id) => {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers });
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