import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.username) { setError('Usuario requerido'); return }
    if (!form.password) { setError('Contraseña requerida'); return }
    setLoading(true)
    try {
      login(form.username, form.password)
      toast('Bienvenido', 'ok')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">GroceryOS</div>
        <div className="login-sub">Sistema de inventario y ventas</div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              className="form-control"
              name="username"
              value={form.username}
              onChange={handle}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              className="form-control"
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 10 }}>⚠ {error}</div>}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Entrando…' : 'Ingresar'}
          </button>
        </form>

        <div className="login-hint">
          <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>Cuentas de demo</strong>
          admin / admin123 — Gerente<br />
          cajero / cajero123 — Cajero<br />
          vendedor / vend123 — Vendedor
        </div>
      </div>
    </div>
  )
}