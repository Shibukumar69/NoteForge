import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('noteforge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
};

export const lectureAPI = {
  getYouTubeInfo: (url) => api.post('/lectures/youtube-info', { url }),
  createLectureFromYouTube: (data) => api.post('/lectures/create-from-youtube', data),
  createLecture: (formData, onProgress) =>
    api.post('/lectures/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }),
  getLectures: () => api.get('/lectures'),
  getStatus: (id) => api.get(`/lectures/${id}/status`),
  deleteLecture: (id) => api.delete(`/lectures/${id}`),
  updateLectureTags: (id, tags) => api.patch(`/lectures/${id}/tags`, { tags }),
};

export const notesAPI = {
  getNotes: () => api.get('/notes'),
  getNoteById: (id) => api.get(`/notes/${id}`),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

export default api;
