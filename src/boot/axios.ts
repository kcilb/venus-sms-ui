import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { boot } from 'quasar/wrappers';

interface ApiConfig {
  baseurl: string;
  timeout?: number;
  headers?: Record<string, string>;
  excludeAuthFor?: string[];
}

let apiClient: AxiosInstance;

const DEFAULT_EXCLUDE_AUTH_ENDPOINTS = ['/auth/login', '/auth/reset', '/auth/change'];

function shouldExcludeAuth(url: string, excludeList: string[]): boolean {
  return excludeList.some((pattern) => {
    // Exact match
    if (pattern === url) return true;
    // Wildcard pattern
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(url);
    }
    return false;
  });
}

async function initializeApiClient(): Promise<AxiosInstance> {
  try {

    const configPath = process.env.NODE_ENV == 'production' ? '/venus-ui/api-config.json'
      : './api-config.json';
    const response: AxiosResponse<ApiConfig> = await axios.get(configPath);
    const config = response.data;

    apiClient = axios.create({
      baseURL: config.baseurl,
      timeout: config.timeout || 10000,
      headers: config.headers || {},
    });

    // Get the list of endpoints to exclude from auth
    const excludeAuthEndpoints = config.excludeAuthFor || DEFAULT_EXCLUDE_AUTH_ENDPOINTS;

    // Add request interceptor for auth
    apiClient.interceptors.request.use(
      (config) => {
        const url = config.url || '';

        // Check if this URL should exclude auth
        if (shouldExcludeAuth(url, excludeAuthEndpoints)) {
          return config; // Skip adding auth header
        }

        let username = "neptune";
        let password = "p@ssw0rd";
        if (username && password) {
          const credentials = `${username}:${password}`;
          const base64Credentials = btoa(credentials);
          config.headers.Authorization = `Basic ${base64Credentials}`;
        }
        return config;
      },
      (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
    );

    return apiClient;
  } catch (error) {
    console.error('Failed to load API config, using defaults:', error);

    // Fallback to defaults
    apiClient = axios.create({
      baseURL: process.env.API_BASE_URL || 'http://localhost:8081',
      timeout: 10000,
    });

    apiClient.interceptors.request.use(
      (config) => {
        const url = config.url || '';

        if (shouldExcludeAuth(url, DEFAULT_EXCLUDE_AUTH_ENDPOINTS)) {
          return config;
        }

        let username = "neptune";
        let password = "p@ssw0rd";
        if (username && password) {
          const credentials = `${username}:${password}`;
          const base64Credentials = btoa(credentials);
          config.headers.Authorization = `Basic ${base64Credentials}`;
        }

        return config;
      },
      (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
    );

    return apiClient;
  }
}

export default boot(async ({ app }) => {
  await initializeApiClient();

  // Make axios available globally in Vue components
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = apiClient;
});

export { apiClient, initializeApiClient };
