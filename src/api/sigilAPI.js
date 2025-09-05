import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const generateSigil = async (intention, category = 'general') => {
  try {
    const response = await api.post('/sigils/generate', {
      intention,
      category,
      timestamp: new Date().toISOString()
    })
    return response.data
  } catch (error) {
    console.error('Error generating sigil:', error)
    throw error
  }
}

export const saveSigil = async (sigilData) => {
  try {
    const response = await api.post('/sigils', sigilData)
    return response.data
  } catch (error) {
    console.error('Error saving sigil:', error)
    throw error
  }
}

export const getAllSigils = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString()
    const response = await api.get(`/sigils${queryString ? `?${queryString}` : ''}`)
    // unwrap if backend sends { sigils: [...] }
    return response.data.sigils || response.data
  } catch (error) {
    console.error('Error fetching sigils:', error)
    throw error
  }
}

export const getMySigils = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString()
    const response = await api.get(`/sigils/my${queryString ? `?${queryString}` : ''}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user sigils:', error)
    throw error
  }
}

export const getSigilById = async (id) => {
  try {
    const response = await api.get(`/sigils/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching sigil:', error)
    throw error
  }
}

export const updateSigil = async (id, updates) => {
  try {
    const response = await api.patch(`/sigils/${id}`, updates)
    return response.data
  } catch (error) {
    console.error('Error updating sigil:', error)
    throw error
  }
}

export const deleteSigil = async (id) => {
  try {
    const response = await api.delete(`/sigils/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting sigil:', error)
    throw error
  }
}

export const getSigilsByCategory = async (category, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString()
    const response = await api.get(`/sigils/category/${category}${queryString ? `?${queryString}` : ''}`)
    return response.data
  } catch (error) {
    console.error('Error fetching sigils by category:', error)
    throw error
  }
}

export const searchSigils = async (query, params = {}) => {
  try {
    const searchParams = new URLSearchParams({ q: query, ...params }).toString()
    const response = await api.get(`/sigils/search?${searchParams}`)
    return response.data
  } catch (error) {
    console.error('Error searching sigils:', error)
    throw error
  }
}

export const trackDownload = async (id) => {
  try {
    const response = await api.post(`/sigils/${id}/download`)
    return response.data
  } catch (error) {
    console.error('Error tracking download:', error)
    throw error
  }
}

export const getSigilStats = async () => {
  try {
    const response = await api.get('/sigils/stats/summary')
    return response.data
  } catch (error) {
    console.error('Error fetching sigil stats:', error)
    throw error
  }
}