import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { CartProvider, useCart } from '../context/CartContext'

function AuthConsumer() {
  const { user, login, logout, isAuthenticated } = useAuth()
  return (
    <div>
      <div data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="user">{user?.nombre || 'none'}</div>
      <button onClick={() => { try { login('admin', 'admin123') } catch (_) {} }}>login-ok</button>
      <button onClick={() => { try { login('x', 'wrong') } catch (_) {} }}>login-bad</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

function CartConsumer() {
  const { items, total, itemCount, addItem, removeItem, updateQty, clear } = useCart()
  return (
    <div>
      <div data-testid="count">{itemCount}</div>
      <div data-testid="total">{total}</div>
      <div data-testid="items">{items.length}</div>
      <button onClick={() => addItem({ id_producto: 1, nombre: 'Leche', precio: 12.5, cantidad: 2 })}>add</button>
      <button onClick={() => addItem({ id_producto: 1, nombre: 'Leche', precio: 12.5, cantidad: 1 })}>add-again</button>
      <button onClick={() => addItem({ id_producto: 2, nombre: 'Pan', precio: 1.5, cantidad: 3 })}>add2</button>
      <button onClick={() => updateQty(1, 5)}>update</button>
      <button onClick={() => removeItem(1)}>remove</button>
      <button onClick={clear}>clear</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('starts unauthenticated', () => {
    render(<AuthProvider><AuthConsumer /></AuthProvider>)
    expect(screen.getByTestId('auth').textContent).toBe('no')
    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('logs in with valid credentials', () => {
    render(<AuthProvider><AuthConsumer /></AuthProvider>)
    act(() => { fireEvent.click(screen.getByText('login-ok')) })
    expect(screen.getByTestId('auth').textContent).toBe('yes')
    expect(screen.getByTestId('user').textContent).toBe('Rosa Tzoc')
  })

  it('stays unauthenticated on bad credentials', () => {
    render(<AuthProvider><AuthConsumer /></AuthProvider>)
    act(() => { fireEvent.click(screen.getByText('login-bad')) })
    expect(screen.getByTestId('auth').textContent).toBe('no')
  })

  it('logs out and clears user', () => {
    render(<AuthProvider><AuthConsumer /></AuthProvider>)
    act(() => { fireEvent.click(screen.getByText('login-ok')) })
    act(() => { fireEvent.click(screen.getByText('logout')) })
    expect(screen.getByTestId('auth').textContent).toBe('no')
    expect(screen.getByTestId('user').textContent).toBe('none')
  })
})

describe('CartContext', () => {
  it('starts empty', () => {
    render(<CartProvider><CartConsumer /></CartProvider>)
    expect(screen.getByTestId('items').textContent).toBe('0')
    expect(screen.getByTestId('total').textContent).toBe('0')
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('adds item and computes total', () => {
    render(<CartProvider><CartConsumer /></CartProvider>)
    act(() => { fireEvent.click(screen.getByText('add')) })
    expect(screen.getByTestId('items').textContent).toBe('1')
    expect(screen.getByTestId('total').textContent).toBe('25')
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  it('merges duplicate items', () => {
    render(<CartProvider><CartConsumer /></CartProvider>)
    act(() => { fireEvent.click(screen.getByText('add')) })
    act(() => { fireEvent.click(screen.getByText('add-again')) })
    expect(screen.getByTestId('items').textContent).toBe('1')
    expect(screen.getByTestId('count').textContent).toBe('3')
  })

  it('updates quantity', () => {
    render(<CartProvider><CartConsumer /></CartProvider>)
    act(() => { fireEvent.click(screen.getByText('add')) })
    act(() => { fireEvent.click(screen.getByText('update')) })
    expect(screen.getByTestId('count').textContent).toBe('5')
    expect(screen.getByTestId('total').textContent).toBe('62.5')
  })

  it('removes an item', () => {
    render(<CartProvider><CartConsumer /></CartProvider>)
    act(() => { fireEvent.click(screen.getByText('add')) })
    act(() => { fireEvent.click(screen.getByText('add2')) })
    act(() => { fireEvent.click(screen.getByText('remove')) })
    expect(screen.getByTestId('items').textContent).toBe('1')
  })

  it('clears the cart', () => {
    render(<CartProvider><CartConsumer /></CartProvider>)
    act(() => { fireEvent.click(screen.getByText('add')) })
    act(() => { fireEvent.click(screen.getByText('clear')) })
    expect(screen.getByTestId('items').textContent).toBe('0')
    expect(screen.getByTestId('total').textContent).toBe('0')
  })
})