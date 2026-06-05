const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4000';

export async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'API 요청에 실패했습니다.');
  }

  return result.data;
}