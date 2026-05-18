import { createContext, useContext, useReducer, useCallback, useMemo } from 'react'

const CartContext = createContext(null)

// ── Reducer ──────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id_producto === action.item.id_producto)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id_producto === action.item.id_producto
              ? { ...i, cantidad: i.cantidad + action.item.cantidad }
              : i
          )
        }
      }
      return { ...state, items: [...state.items, action.item] }
    }

    case 'UPDATE_QTY': {
      const qty = Math.max(1, action.cantidad)
      return {
        ...state,
        items: state.items.map(i =>
          i.id_producto === action.id_producto ? { ...i, cantidad: qty } : i
        )
      }
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id_producto !== action.id_producto) }

    case 'SET_CLIENTE':
      return { ...state, id_cliente: action.id_cliente }

    case 'SET_EMPLEADO':
      return { ...state, id_empleado: action.id_empleado }

    case 'CLEAR':
      return initialState

    default:
      return state
  }
}

const initialState = { items: [], id_cliente: '', id_empleado: '' }

// ── Provider ─────────────────────────────────────────────
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = useCallback((item) => dispatch({ type: 'ADD_ITEM', item }), [])
  const updateQty = useCallback((id_producto, cantidad) =>
    dispatch({ type: 'UPDATE_QTY', id_producto, cantidad }), [])
  const removeItem = useCallback((id_producto) =>
    dispatch({ type: 'REMOVE_ITEM', id_producto }), [])
  const setCliente = useCallback((id_cliente) =>
    dispatch({ type: 'SET_CLIENTE', id_cliente }), [])
  const setEmpleado = useCallback((id_empleado) =>
    dispatch({ type: 'SET_EMPLEADO', id_empleado }), [])
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const total = useMemo(
    () => state.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
    [state.items]
  )

  const itemCount = useMemo(() => state.items.reduce((s, i) => s + i.cantidad, 0), [state.items])

  return (
    <CartContext.Provider value={{
      ...state, total, itemCount,
      addItem, updateQty, removeItem, setCliente, setEmpleado, clear
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}