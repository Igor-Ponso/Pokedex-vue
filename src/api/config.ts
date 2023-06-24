import axios from 'axios';

export const api = axios.create({
  baseURL: window.DM_ENV.API_URL,
});
