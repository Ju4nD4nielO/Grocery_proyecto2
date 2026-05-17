import { useState, useEffect, useCallback } from 'react'
import { api } from '../hooks/useApi'
import { useToast } from '../components/Toast'

const empty = { nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '' }
const Q = n => 'Q' + parseFloat(n || 0).toFixed(2)

export default function Productos() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [cats, setCats] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([api.get('/productos'), api.get('/categorias')])
      setRows(p)
      setCats(c)
    } catch (e) { toast(e.message, 'err') }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  function handle(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'Requerido'
    if (form.precio === '' || isNaN(+form.precio) || +form.precio < 0) errs.precio = 'Precio inválido'
    if (form.stock === '' || isNaN(+form.stock) || +form.stock < 0) errs.stock = 'Stock inválido'
    if (!form.id_categoria) errs.id_categoria = 'Selecciona categoría'
    return errs
  }

  async function save() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const body = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      id_categoria: parseInt(form.id_categoria),
    }
    try {
      if (editId) { await api.put('/productos/' + editId, body); toast('Producto actualizado') }
      else        { await api.post('/productos', body);          toast('Producto creado') }
      setForm(empty); setEditId(null); load()
    } catch (e) { toast(e.message, 'err') }
  }

  function edit(p) {
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, id_categoria: p.id_categoria })
    setEditId(p.id_producto)
    setErrors({})
  }

  async function del(id) {
    if (!confirm('¿Eliminar este producto?')) return
    try { await api.delete('/productos/' + id); toast('Eliminado'); load() }
    catch (e) { toast(e.message, 'err') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Productos</div>
          <div className="page-subtitle">Gestión de inventario</div>
        </div>
      </div>

      {/* Form */}
      <div className="table-wrap" style={{ padding: 16, marginBottom: 20 }}>
        <div className="section-title" style={{ marginTop: 0 }}>{editId ? 'Editar producto' : 'Nuevo producto'}</div>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre *</label>
            <input className="form-control" name="nombre" value={form.nombre} onChange={handle} placeholder="Leche entera 1L" />
            {errors.nombre && <div className="form-error">{errors.nombre}</div>}
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input className="form-control" name="descripcion" value={form.descripcion} onChange={handle} placeholder="Opcional" />
          </div>
          <div className="form-group">
            <label>Precio (Q) *</label>
            <input className="form-control" name="precio" type="number" step="0.01" min="0" value={form.precio} onChange={handle} style={{ minWidth: 90 }} />
            {errors.precio && <div className="form-error">{errors.precio}</div>}
          </div>
          <div className="form-group">
            <label>Stock *</label>
            <input className="form-control" name="stock" type="number" min="0" value={form.stock} onChange={handle} style={{ minWidth: 80 }} />
            {errors.stock && <div className="form-error">{errors.stock}</div>}
          </div>
          <div className="form-group">
            <label>Categoría *</label>
            <select className="form-control" name="id_categoria" value={form.id_categoria} onChange={handle}>
              <option value="">Seleccionar…</option>
              {cats.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
            {errors.id_categoria && <div className="form-error">{errors.id_categoria}</div>}
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end', gap: 6 }}>
            <button className="btn btn-primary" onClick={save}>{editId ? 'Actualizar' : 'Crear'}</button>
            {editId && <button className="btn btn-ghost" onClick={() => { setForm(empty); setEditId(null); setErrors({}) }}>Cancelar</button>}
          </div>
        </div>
      </div>

      {loading ? <div className="loading">CARGANDO…</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id_producto}>
                  <td>{p.nombre}</td>
                  <td><span className="badge badge-blue">{p.categoria}</span></td>
                  <td style={{ fontFamily: 'var(--mono, monospace)' }}>{Q(p.precio)}</td>
                  <td>
                    <span className={`badge ${p.stock < 30 ? 'badge-red' : p.stock < 80 ? 'badge-warn' : 'badge-green'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-edit btn-sm" onClick={() => edit(p)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p.id_producto)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}