import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/products';

export function useNotifications() {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getToken = () =>
    localStorage.getItem('token') || sessionStorage.getItem('token');

  // Wrapper fetch b timeout — bech el polling ma yeb9ach y'accumuler
  // requêtes "pending" ken offline (mochkil khassa hna parce que
  // el interval yet3awad kol 30s)
  const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const checkAlerts = async () => {
    // Skip direct ken offline — matbadelch yet7awesla b sur3a,
    // texhem el batterie/CPU b requêtes li bech tfeelou fi kol 5 cas
    if (!navigator.onLine) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetchWithTimeout(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const products = await res.json();
      const ruptures = products.filter(p => p.quantite <= p.seuilCritique);
      setAlerts(ruptures);
      setUnreadCount(ruptures.length);
    } catch {
      // silencieux — normal ken offline wela timeout, mafamech besoin y'afficher erreur
    }
  };

  useEffect(() => {
    checkAlerts();
    const interval = setInterval(checkAlerts, 30000);

    // Bonus: ki yerja3 el connexion, ychek direct badal ma yestanna 30s
    window.addEventListener('online', checkAlerts);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkAlerts);
    };
  }, []);

  return { alerts, unreadCount, checkAlerts };
}