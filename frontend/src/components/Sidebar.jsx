import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/',            label: 'Dashboard',   icon: '◈' },
  { to: '/ventas',      label: 'Nueva Venta', icon: '◉' },
  { to: '/productos',   label: 'Productos',   icon: '▦' },
  { to: '/categorias',  label: 'Categorías',  icon: '◧' },
  { to: '/clientes',    label: 'Clientes',    icon: '◎' },
  { to: '/empleados',   label: 'Empleados',   icon: '◐' },
  { to: '/proveedores', label: 'Proveedores', icon: '◑' },
  { to: '/reportes',    label: 'Reportes',    icon: '▤' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Grocery<span>OS</span></div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span style={{ fontFamily: 'monospace', fontSize: '.9rem' }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <strong>{user?.nombre}</strong>
        {user?.role}
        <button className="btn-logout" onClick={logout}>Cerrar sesión</button>
      </div>
    </aside>
  )
}