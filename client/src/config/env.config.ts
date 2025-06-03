interface EnvConfig {
  NODE_ENV: string;
  API_URL: string;
  SOCKET_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
}

const env: EnvConfig = {
  NODE_ENV: import.meta.env.MODE || 'development',
  API_URL: import.meta.env.VITE_API_URL || '/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || '',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Campus Code Wars',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

export default env; 