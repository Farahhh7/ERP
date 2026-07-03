import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/products';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API, { headers });
      if (!res.ok) throw new Error('Erreur chargement produits');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (form) => {
    const res = await fetch(API, {
      method: 'POST', headers,
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur création');
    await fetchProducts();
    return data;
  };

  const updateProduct = async (id, form) => {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT', headers,
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur modification');
    await fetchProducts();
    return data;
  };

  const deleteProduct = async (id) => {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE', headers
    });
    if (!res.ok) throw new Error('Erreur suppression');
    await fetchProducts();
  };

  useEffect(() => { fetchProducts(); }, []);

  return {
    products, loading, error,
    fetchProducts, createProduct,
    updateProduct, deleteProduct
  };
}