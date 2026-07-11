import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/suppliers';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
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

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithTimeout(API, { headers: getHeaders() });
      if (!res.ok) throw new Error('Erreur chargement fournisseurs');
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setSuppliers([]); // évite d'afficher d'anciennes données incohérentes
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (form) => {
    const res = await fetchWithTimeout(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur création');
    await fetchSuppliers();
    return data;
  };

  const updateSupplier = async (id, form) => {
    const res = await fetchWithTimeout(`${API}/${id}`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur modification');
    await fetchSuppliers();
    return data;
  };

  const deleteSupplier = async (id) => {
    const res = await fetchWithTimeout(`${API}/${id}`, {
      method: 'DELETE', headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erreur suppression');
    await fetchSuppliers();
  };

  useEffect(() => { fetchSuppliers(); }, []);

  return {
    suppliers, loading, error,
    fetchSuppliers, createSupplier,
    updateSupplier, deleteSupplier
  };
}