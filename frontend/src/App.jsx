import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Forecasts from './pages/Forecasts';
import Commandes from './pages/Commandes';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
          } />
          <Route path="/stock" element={
            <ProtectedRoute><MainLayout><Products /></MainLayout></ProtectedRoute>
          } />
          <Route path="/stocks" element={
            <ProtectedRoute><MainLayout><Stocks /></MainLayout></ProtectedRoute>
          } />
          <Route path="/fournisseurs" element={
            <ProtectedRoute><MainLayout><Suppliers /></MainLayout></ProtectedRoute>
          } />
          <Route path="/previsions" element={
            <ProtectedRoute><MainLayout><Forecasts /></MainLayout></ProtectedRoute>
          } />
          <Route path="/commandes" element={
            <ProtectedRoute><MainLayout><Commandes /></MainLayout></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;