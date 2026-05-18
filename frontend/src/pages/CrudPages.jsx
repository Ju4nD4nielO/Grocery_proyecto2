import { useState, useEffect, useCallback } from 'react'
import { api } from '../hooks/useApi'
import { useToast } from '../components/Toast'

// ── Generic CRUD table ────────────────────────────────────
function CrudPage({ title, subtitle, endpoint, fields, idKey, renderRow, headers }) {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(f => [f.name, ''])))
  const [editId, setEditId] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setRows(await api.get('/' + endpoint)) }
    catch (e) { toast(e.message, 'err') }
    finally { setLoading(false) }
  }, [endpoint, toast])

  useEffect(() => { load() }, [load])

  function handle(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  function validate() {
    const errs = {}
    fields.forEach(f => {
      if (f.required && !form[f.name]?.toString().trim()) errs[f.name] = 'Requerido'
      if (f.type === 'email' && form[f.name] && !/\S+@\S+\.\S+/.test(form[f.name]))
        errs[f.name] = 'Email inválido'
    })
    return errs
  }

  async function save() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const body = Object.fromEntries(fields.map(f => [f.name, form[f.name].trim?.() ?? form[f.name]]))
    try {
      if (editId) { await api.put(`/${endpoint}/${editId}`, body); toast(`${title} actualizado`) }
      else        { await api.post(`/${endpoint}`, body);          toast(`${title} creado`) }
      setForm(Object.fromEntries(fields.map(f => [f.name, ''])))
      setEditId(null); setErrors({}); load()
    } catch (e) { toast(e.message, 'err') }
  }

  function edit(row) {
    setForm(Object.fromEntries(fields.map(f => [f.name, row[f.name] || ''])))
    setEditId(row[idKey])
    setErrors({})
  }

  async function del(id) {
    if (!confirm('¿Confirmar eliminación?')) return
    try { await api.delete(`/${endpoint}/${id}`); toast('Eliminado'); load() }
    catch (e) { toast(e.message, 'err') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{title}</div>
          <div className="page-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="table-wrap" style={{ padding: 16, marginBottom: 20 }}>
        <div className="section-title" style={{ marginTop: 0 }}>{editId ? `Editar ${title}` : `Nuevo ${title}`}</div>
        <div className="form-row">
          {fields.map(f => (
            <div className="form-group" key={f.name}>
              <label>{f.label}{f.required ? ' *' : ''}</label>
              {f.options ? (
                <select className="form-control" name={f.name} value={form[f.name]} onChange={handle}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  className="form-control"
                  name={f.name}
                  type={f.type || 'text'}
                  value={form[f.name]}
                  onChange={handle}
                  placeholder={f.placeholder || ''}
                />
              )}
              {errors[f.name] && <div className="form-error">{errors[f.name]}</div>}
            </div>
          ))}
          <div className="form-group" style={{ justifyContent: 'flex-end', gap: 6 }}>
            <button className="btn btn-primary" onClick={save}>{editId ? 'Actualizar' : 'Crear'}</button>
            {editId && (
              <button className="btn btn-ghost" onClick={() => {
                setForm(Object.fromEntries(fields.map(f => [f.name, ''])))
                setEditId(null); setErrors({})
              }}>Cancelar</button>
            )}
          </div>
        </div>
      </div>

      {loading ? <div className="loading">CARGANDO…</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}<th>Acciones</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row[idKey]}>
                  {renderRow(row)}
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-edit btn-sm" onClick={() => edit(row)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(row[idKey])}>Eliminar</button>
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

export function Categorias() {
  return (
    <CrudPage
      title="Categorías" subtitle="Grupos de productos"
      endpoint="categorias" idKey="id_categoria"
      headers={['Nombre', 'Descripción']}
      fields={[
        { name: 'nombre',      label: 'Nombre',      required: true, placeholder: 'Lácteos' },
        { name: 'descripcion', label: 'Descripción',              placeholder: 'Opcional' },
      ]}
      renderRow={r => (<>
        <td>{r.nombre}</td>
        <td style={{ color: 'var(--muted)' }}>{r.descripcion || '—'}</td>
      </>)}
    />
  )
}

export function Clientes() {
  return (
    <CrudPage
      title="Clientes" subtitle="Base de clientes"
      endpoint="clientes" idKey="id_cliente"
      headers={['Nombre', 'Email', 'Teléfono']}
      fields={[
        { name: 'nombre',   label: 'Nombre',    required: true, placeholder: 'Ana García' },
        { name: 'email',    label: 'Email',      type: 'email', placeholder: 'correo@email.com' },
        { name: 'telefono', label: 'Teléfono',               placeholder: '5501-0000' },
      ]}
      renderRow={r => (<>
        <td>{r.nombre}</td>
        <td style={{ color: 'var(--muted)' }}>{r.email || '—'}</td>
        <td style={{ color: 'var(--muted)' }}>{r.telefono || '—'}</td>
      </>)}
    />
  )
}

export function Empleados() {
  const puestos = ['Cajero', 'Vendedor', 'Bodeguero', 'Gerente']
  return (
    <CrudPage
      title="Empleados" subtitle="Personal de la tienda"
      endpoint="empleados" idKey="id_empleado"
      headers={['Nombre', 'Puesto']}
      fields={[
        { name: 'nombre', label: 'Nombre',  required: true, placeholder: 'Roberto Ajú' },
        { name: 'puesto', label: 'Puesto',  options: puestos },
      ]}
      renderRow={r => (<>
        <td>{r.nombre}</td>
        <td><span className="badge badge-warn">{r.puesto}</span></td>
      </>)}
    />
  )
}

export function Proveedores() {
  return (
    <CrudPage
      title="Proveedores" subtitle="Proveedores de productos"
      endpoint="proveedores" idKey="id_proveedor"
      headers={['Nombre', 'Teléfono', 'Email']}
      fields={[
        { name: 'nombre',   label: 'Nombre',    required: true, placeholder: 'Lácteos El Campo' },
        { name: 'telefono', label: 'Teléfono',               placeholder: '2345-0000' },
        { name: 'email',    label: 'Email',      type: 'email', placeholder: 'ventas@proveedor.com' },
      ]}
      renderRow={r => (<>
        <td>{r.nombre}</td>
        <td style={{ color: 'var(--muted)' }}>{r.telefono || '—'}</td>
        <td style={{ color: 'var(--muted)' }}>{r.email || '—'}</td>
      </>)}
    />
  )
}