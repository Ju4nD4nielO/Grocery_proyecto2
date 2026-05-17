import { useState, useCallback } from 'react'
import { api } from '../hooks/useApi'
import { useToast } from '../components/Toast'

const Q = n => 'Q' + parseFloat(n || 0).toFixed(2)

const REPORTS = [
  {
    key: 'ventas-detalle',
    label: 'Ventas (VIEW)',
    headers: ['#', 'Fecha', 'Cliente', 'Empleado', 'Puesto', 'Total'],
    row: r => [r.id_venta, new Date(r.fecha).toLocaleDateString('es-GT'), r.cliente, r.empleado, r.puesto, Q(r.total)],
    renderCell: (val, i) => i === 5
      ? <td key={i} style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{val}</td>
      : i === 0 ? <td key={i}><span className="badge badge-green">#{val}</span></td>
      : i === 4 ? <td key={i}><span className="badge badge-warn">{val}</span></td>
      : <td key={i}>{val}</td>,
  },
  {
    key: 'productos-vendidos',
    label: 'Prod. vendidos',
    headers: ['Producto', 'Categoría', 'Proveedor', 'Unidades', 'Ingresos'],
    row: r => [r.producto, r.categoria, r.proveedor, r.total_vendido, Q(r.ingresos)],
  },
  {
    key: 'clientes-compras',
    label: 'Clientes',
    headers: ['Cliente', 'Email', 'Compras', 'Total gastado'],
    row: r => [r.cliente, r.email || '—', r.num_compras, Q(r.total_gastado)],
  },
  {
    key: 'ventas-por-categoria',
    label: 'Por categoría',
    headers: ['Categoría', 'Ventas', 'Unidades', 'Ingresos'],
    row: r => [r.categoria, r.num_ventas, r.unidades_vendidas, Q(r.ingresos_total)],
  },
  {
    key: 'productos-sin-ventas',
    label: 'Sin ventas',
    headers: ['Producto', 'Stock', 'Categoría'],
    row: r => [r.nombre, r.stock, r.categoria],
  },
  {
    key: 'clientes-frecuentes',
    label: 'Frecuentes',
    headers: ['Cliente', 'Email', 'Teléfono'],
    row: r => [r.nombre, r.email || '—', r.telefono || '—'],
  },
  {
    key: 'ranking-empleados',
    label: 'Empleados',
    headers: ['Ranking', 'Empleado', 'Puesto', 'Ventas', 'Monto total'],
    row: r => ['#' + r.ranking, r.empleado, r.puesto, r.ventas_atendidas, Q(r.monto_total)],
  },
  {
    key: 'stock-bajo',
    label: 'Stock bajo',
    headers: ['Producto', 'Stock', 'Categoría', 'Prom. categoría'],
    row: r => [r.nombre, r.stock, r.categoria, parseFloat(r.promedio_categoria).toFixed(1)],
  },
]

export default function Reportes() {
  const toast = useToast()
  const [active, setActive] = useState(REPORTS[0])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (rep) => {
    setActive(rep)
    setLoading(true)
    try { setData(await api.get('/reportes/' + rep.key)) }
    catch (e) { toast(e.message, 'err') }
    finally { setLoading(false) }
  }, [toast])

  // Auto-load first report on mount
  useState(() => { load(REPORTS[0]) })

  function exportCSV() {
    if (!data.length) { toast('Sin datos para exportar', 'err'); return }
    const csvRows = [active.headers, ...data.map(r => active.row(r))]
    const csv = csvRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `reporte_${active.key}.csv`,
    })
    a.click()
    toast('CSV exportado')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reportes</div>
          <div className="page-subtitle">Consultas SQL avanzadas</div>
        </div>
        <button className="btn btn-primary" onClick={exportCSV}>Exportar CSV</button>
      </div>

      <div className="report-tabs">
        {REPORTS.map(r => (
          <button
            key={r.key}
            className={`btn btn-ghost btn-sm report-tab ${active.key === r.key ? 'active' : ''}`}
            onClick={() => load(r)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading
        ? <div className="loading">EJECUTANDO CONSULTA…</div>
        : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>{active.headers.map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.length === 0
                  ? <tr><td colSpan={active.headers.length} style={{ color: 'var(--muted)' }}>Sin resultados</td></tr>
                  : data.map((r, ri) => (
                    <tr key={ri}>
                      {active.renderCell
                        ? active.row(r).map((val, ci) => active.renderCell(val, ci))
                        : active.row(r).map((val, ci) => <td key={ci}>{val}</td>)
                      }
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}