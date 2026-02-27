interface ApiConfig {
  baseurl: string;
  timeout?: number;
  headers?: Record<string, string>;
  excludeAuthFor?: string[];
}

let apiConfig: ApiConfig | null = null;
let configLoadPromise: Promise<ApiConfig> | null = null;

export function loadConfig(): Promise<ApiConfig> {
  // Check if promise exists (not undefined/null) instead of checking truthiness
  if (configLoadPromise !== null) {
    return configLoadPromise;
  }

  const configPath =
    process.env.NODE_ENV == 'production' ? '/venus-ui/api-config.json' : './api-config.json';

  configLoadPromise = fetch(configPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      return response.json();
    })
    .then((config) => {
      apiConfig = config;
      return config;
    })
    .catch((error) => {
      console.error('Error loading config:', error);
      // Provide fallback config
      apiConfig = {
        baseurl: 'http://localhost:1981',
        timeout: 30000,
        headers: {},
        excludeAuthFor: [],
      };
      return apiConfig;
    });

  return configLoadPromise;
}

export function getConfig(): ApiConfig {
  if (apiConfig === null) {
    throw new Error('Config not loaded. Call loadConfig() first or await loadConfig().');
  }
  return apiConfig;
}

export async function ensureConfigLoaded(): Promise<ApiConfig | null> {
  if (apiConfig === null) {
    await loadConfig();
  }
  return apiConfig;
}
