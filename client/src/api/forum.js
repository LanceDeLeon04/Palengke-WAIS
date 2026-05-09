import axios from 'axios'

const BASE = '/api'
const getToken = () => localStorage.getItem('pw_token')

const api = axios.create({ baseURL: BASE })
api.interceptors.request.use(cfg => {
  const t = getToken()
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

export const register = (data) => api.post('/auth/register', data).then(r => r.data)
export const login    = (data) => api.post('/auth/login', data).then(r => r.data)
export const getMe    = ()     => api.get('/auth/me').then(r => r.data)

export const getCategories = () => api.get('/forum/categories').then(r => r.data)
export const getPosts      = (params) => api.get('/forum/posts', { params }).then(r => r.data)
export const getPost       = (id) => api.get(`/forum/posts/${id}`).then(r => r.data)
export const createPost    = (data) => api.post('/forum/posts', data).then(r => r.data)
export const deletePost    = (id) => api.delete(`/forum/posts/${id}`).then(r => r.data)
export const getComments   = (postId) => api.get(`/forum/posts/${postId}/comments`).then(r => r.data)
export const createComment = (postId, data) => api.post(`/forum/posts/${postId}/comments`, data).then(r => r.data)
export const deleteComment = (id) => api.delete(`/forum/comments/${id}`).then(r => r.data)
export const vote          = (data) => api.post('/forum/vote', data).then(r => r.data)
