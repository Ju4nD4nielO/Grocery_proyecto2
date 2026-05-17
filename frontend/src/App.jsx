import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'

import Login       from './pages/Login'
import Dashboard   from './pages/Dashboard'
import Productos   from './pages/Productos'
import { Categorias, Clientes, Empleados, Proveedores } from './pages/CrudPages'
import Ventas      from './pages/Ventas'
import Reportes    from './pages/Reportes'

function PrivateLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/"            element={<Dashboard />}   />
          <Route path="/ventas"      element={<Ventas />}      />
          <Route path="/productos"   element={<Productos />}   />
          <Route path="/categorias"  element={<Categorias />}  />
          <Route path="/clientes"    element={<Clientes />}    />
          <Route path="/empleados"   element={<Empleados />}   />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/reportes"    element={<Reportes />}    />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function PublicRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Login />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<PublicRoute />} />
              <Route path="/*"     element={<PrivateLayout />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}