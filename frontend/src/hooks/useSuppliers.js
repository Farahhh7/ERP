import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/suppliers';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API, { headers });
      if (!res.ok) throw new Error('Erreur chargement fournisseurs');
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (form) => {
    const res = await fetch(API, {
      method: 'POST', headers,
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur création');
    await fetchSuppliers();
    return data;
  };

  const updateSupplier = async (id, form) => {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT', headers,
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur modification');
    await fetchSuppliers();
    return data;
  };

  const deleteSupplier = async (id) => {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers });
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