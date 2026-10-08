import { createSlice, nanoid } from '@reduxjs/toolkit'

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'Abcd@123',
  id: 'admin-001',
  name: 'Admin',
  isAdmin: true,
}

const initialState = {
  users: [],
  currentUser: null,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signup(state, action) {
      const { name, email, password } = action.payload
      const normalised = email.trim().toLowerCase()
      // Block using the admin email for signup
      if (normalised === ADMIN_CREDENTIALS.email) {
        state.error = 'An account with this email already exists.'
        return
      }
      const exists = state.users.some(
        (user) => user.email.toLowerCase() === normalised,
      )
      if (exists) {
        state.error = 'An account with this email already exists.'
        return
      }
      const user = {
        id: nanoid(),
        name: name.trim(),
        email: normalised,
        password,
      }
      state.users.push(user)
      // Keep session user without password.
      state.currentUser = { id: user.id, name: user.name, email: user.email, isAdmin: false }
      state.error = null
    },
    login(state, action) {
      const email = action.payload.email.trim().toLowerCase()
      const { password } = action.payload

      // Check admin credentials first
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        state.currentUser = {
          id: ADMIN_CREDENTIALS.id,
          name: ADMIN_CREDENTIALS.name,
          email: ADMIN_CREDENTIALS.email,
          isAdmin: true,
        }
        state.error = null
        return
      }

      const user = state.users.find(
        (entry) => entry.email === email && entry.password === password,
      )
      if (!user) {
        state.error = 'Invalid email or password.'
        return
      }
      state.currentUser = { id: user.id, name: user.name, email: user.email, isAdmin: false }
      state.error = null
    },
    logout(state) {
      state.currentUser = null
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
    setUsers(state, action) {
      state.users = action.payload || []
    },
  },
})

export const { signup, login, logout, clearAuthError, setUsers } = authSlice.actions
export default authSlice.reducer
