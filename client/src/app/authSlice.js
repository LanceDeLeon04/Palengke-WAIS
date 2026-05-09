import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../api/forum.js'

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.login(data)
    localStorage.setItem('pw_token', res.token)
    return res
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.register(data)
    localStorage.setItem('pw_token', res.token)
    return res
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Registration failed')
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { return await api.getMe() }
  catch { return rejectWithValue(null) }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('pw_token'), loading: false, error: null },
  reducers: {
    logout(state) {
      state.user  = null
      state.token = null
      localStorage.removeItem('pw_token')
    },
    clearError(state) { state.error = null },
  },
  extraReducers: (b) => {
    const pending  = (s) => { s.loading = true;  s.error = null }
    const rejected = (s, a) => { s.loading = false; s.error = a.payload }
    const fulfilled = (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token || s.token }

    b.addCase(loginUser.pending,    pending)
    b.addCase(loginUser.rejected,   rejected)
    b.addCase(loginUser.fulfilled,  fulfilled)
    b.addCase(registerUser.pending,   pending)
    b.addCase(registerUser.rejected,  rejected)
    b.addCase(registerUser.fulfilled, fulfilled)
    b.addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload.user })
    b.addCase(fetchMe.rejected,  (s) => { s.token = null; localStorage.removeItem('pw_token') })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
