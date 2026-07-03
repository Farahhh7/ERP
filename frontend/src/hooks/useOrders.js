import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/orders';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API, { headers });
      if (!res.ok) throw new Error('Erreur chargement commandes');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (form) => {
    const res = await fetch(API, {
      method: 'POST', headers,
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur création');
    await fetchOrders();
    return data;
  };

  const updateOrderStatus = async (id, statut) => {
    const res = await fetch(`${API}/${id}/statut`, {
      method: 'PUT', headers,
      body: JSON.stringify({ statut })
    });
    if (!res.ok) throw new Error('Erreur mise à jour statut');
    await fetchOrders();
  };

  const deleteOrder = async (id) => {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error('Erreur suppression');
    await fetchOrders();
  };

  useEffect(() => { fetchOrders(); }, []);

  return {
    orders, loading, error,
    fetchOrders, createOrder,
    updateOrderStatus, deleteOrder
  };
}