import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // Accept 2xx status codes (including 201 Created) as success
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  }
});

export default api;
