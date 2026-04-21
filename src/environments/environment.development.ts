type RuntimeEnv = typeof globalThis & {
  __RURAL_ANIMAL_API_URL__?: string;
  __RURAL_ANIMAL_WS_URL__?: string;
};

const runtimeEnv = globalThis as RuntimeEnv;

export const environment = {
  production: false,
  apiUrl: runtimeEnv.__RURAL_ANIMAL_API_URL__ || 'http://localhost:8080',
  webSocketUrl: runtimeEnv.__RURAL_ANIMAL_WS_URL__ || 'ws://localhost:8080'
};
