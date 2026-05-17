import { useEffect, useState, useCallback } from 'react'
import { api } from '../hooks/useApi'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'

const Q = n => 'Q' + parseFloat(n || 0).toFixed(2)

export default function Ventas() {
  const toast = useToast()
  const {
    items, id_cliente, id_empleado, total,
    addItem, updateQty, removeItem,
    setCliente, setEmpleado, clear,
  } = useCart()

  const [clientes,  setClientes]  = useState([])
  const [empleados, setEmpleados] = useState([])
  const [productos, setProductos] = useState([])
  const [selProd,   setSelProd]   = useState('')
  const [selQty,    setSelQty]    = useState(1)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [c, e, p] = await Promise.all([api.get('/clientes'), api.get('/empleados'), api.get('/productos')])
      setClientes(c); setEmpleados(e); setProductos(p)
    } catch (err) { toast(err.message, 'err') }
  }, [toast])

  useEffect(() => { loadData() }, [loadData])

  function addToCart() {
    setError('')
    const prod = productos.find(p => p.id_producto === parseInt(selProd))
    if (!prod)          { setError('Selecciona un producto'); return }
    if (selQty < 1)     { setError('Cantidad debe ser al menos 1'); return }
    if (selQty > prod.stock) { setError(`Stock insuficiente (disponible: ${prod.stock})`); return }
    addItem({ id_producto: prod.id_producto, nombre: prod.nombre, precio: parseFloat(prod.precio), cantidad: selQty })
    setSelProd(''); setSelQty(1)
  }

  async function confirmar() {
    setError('')
    if (!id_cliente)  { setError('Selecciona un cliente');  return }
    if (!id_empleado) { setError('Selecciona un empleado'); return }
    if (!items.length) { setError('Agrega al menos un producto'); return }
    setLoading(true)
    try {
      const r = await api.post('/ventas', {
        id_cliente: parseInt(id_cliente),
        id_empleado: parseInt(id_empleado),
        productos: items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
      })
      toast(`Venta #${r.id_venta} registrada`)
      clear()
      loadData()
    } catch (e) {
      setError('⚠ ' + e.message)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Nueva Venta</div>
          <div className="page-subtitle">Registra una venta para un cliente</div>
        </div>
      </div>

      {/* Cliente / Empleado */}
      <div className="table-wrap" style={{ padding: 16, marginBottom: 16 }}>
        <div className="section-title" style={{ marginTop: 0 }}>Datos de la venta</div>
        <div className="form-row">
          <div className="form-group">
            <label>Cliente *</label>
            <select className="form-control" value={id_cliente} onChange={e => setCliente(e.target.value)}>
              <option value="">Seleccionar…</option>
              {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Empleado *</label>
            <select className="form-control" value={id_empleado} onChange={e => setEmpleado(e.target.value)}>
              <option value="">Seleccionar…</option>
              {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre} ({e.puesto})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Agregar producto */}
      <div className="table-wrap" style={{ padding: 16, marginBottom: 16 }}>
        <div className="section-title" style={{ marginTop: 0 }}>Agregar producto</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Producto</label>
            <select className="form-control" value={selProd} onChange={e => setSelProd(e.target.value)} style={{ minWidth: 220 }}>
              <option value="">Seleccionar…</option>
              {productos.map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} — {Q(p.precio)} (stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Cantidad</label>
            <input className="form-control" type="number" min="1" value={selQty}
              onChange={e => setSelQty(parseInt(e.target.value) || 1)} style={{ minWidth: 70 }} />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={addToCart}>Agregar</button>
          </div>
        </div>
      </div>

      {/* Carrito */}
      <div className="table-wrap" style={{ padding: 16, marginBottom: 16 }}>
        <div className="section-title" style={{ marginTop: 0 }}>Carrito</div>
        {items.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Sin productos agregados</p>
          : (
            <>
              {items.map(item => (
                <div key={item.id_producto} className="cart-item">
                  <span className="cart-item-name">{item.nombre}</span>
                  <input
                    className="form-control cart-item-qty"
                    type="number" min="1" value={item.cantidad}
                    onChange={e => updateQty(item.id_producto, parseInt(e.target.value) || 1)}
                  />
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent)', minWidth: 80, textAlign: 'right' }}>
                    {Q(item.precio * item.cantidad)}
                  </span>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeItem(item.id_producto)}>✕</button>
                </div>
              ))}
              <div className="cart-total">Total: {Q(total)}</div>
            </>
          )
        }

        {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={confirmar} disabled={loading}>
            {loading ? 'Procesando…' : 'Confirmar venta'}
          </button>
          {items.length > 0 && (
            <button className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={clear}>Limpiar</button>
          )}
        </div>
      </div>
    </div>
  )
}