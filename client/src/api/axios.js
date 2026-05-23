import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api', // Maps to your Express port
  withCredentials: true,               // CRITICAL: Tells Axios to include cookies across origins
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;