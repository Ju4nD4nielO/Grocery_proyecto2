import { useEffect, useState, useCallback } from 'react'
import { api } from '../hooks/useApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const Q = n => 'Q' + parseFloat(n || 0).toFixed(2)

export default function Dashboard() {
  const [ventas,    setVentas]    = useState([])
  const [productos, setProductos] = useState([])
  const [clientes,  setClientes]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [v, p, c, cat] = await Promise.all([
        api.get('/reportes/ventas-detalle'),
        api.get('/productos'),
        api.get('/clientes'),
        api.get('/reportes/ventas-por-categoria'),
      ])
      setVentas(v)
      setProductos(p)
      setClientes(c)
      setCategorias(cat)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const totalVentas  = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0)
  const stockTotal   = productos.reduce((s, p) => s + (p.stock || 0), 0)
  const stockBajo    = productos.filter(p => p.stock < 30).length

  if (loading) return <div className="loading">CARGANDO DATOS…</div>
  if (error)   return <div className="form-error" style={{ padding: 20 }}>⚠ {error}</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Resumen general de la tienda</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Ventas totales</div>
          <div className="kpi-value">{ventas.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Ingresos</div>
          <div className="kpi-value" style={{ fontSize: '1.2rem' }}>{Q(totalVentas)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Productos</div>
          <div className="kpi-value">{productos.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Clientes</div>
          <div className="kpi-value">{clientes.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Stock total</div>
          <div className="kpi-value">{stockTotal}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Stock bajo</div>
          <div className="kpi-value" style={{ color: stockBajo > 0 ? 'var(--danger)' : 'var(--accent)' }}>
            {stockBajo}
          </div>
        </div>
      </div>

      {/* Gráfica de ventas por categoría */}
      <div className="section-title">Ingresos por categoría</div>
      <div className="table-wrap" style={{ padding: '20px 16px', marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categorias} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <XAxis dataKey="categoria" tick={{ fill: '#888', fontSize: 11 }} />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 4 }}
              labelStyle={{ color: '#e8e8e8' }}
              formatter={v => [Q(v), 'Ingresos']}
            />
            <Bar dataKey="ingresos_total" radius={[2, 2, 0, 0]}>
              {categorias.map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? '#00e5a0' : '#00b37d'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Últimas ventas */}
      <div className="section-title">Últimas 10 ventas</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Empleado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.slice(0, 10).map(v => (
              <tr key={v.id_venta}>
                <td><span className="badge badge-green">#{v.id_venta}</span></td>
                <td>{new Date(v.fecha).toLocaleDateString('es-GT')}</td>
                <td>{v.cliente}</td>
                <td>{v.empleado} <span className="badge badge-warn">{v.puesto}</span></td>
                <td style={{ color: 'var(--accent)' }}>{Q(v.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}