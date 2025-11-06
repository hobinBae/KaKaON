import axios, { type InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- JWT 인증 관련 로직 ---

// accessToken을 메모리에 저장 (새로고침 시 초기화됨)
let accessToken: string | null = null;

/**
 * 메모리에서 accessToken을 가져오는 함수
 */
export const getToken = (): string | null => {
  return accessToken;
};

/**
 * 메모리에 accessToken을 저장하는 함수
 */
export const setToken = (token: string): void => {
  accessToken = token;
};

/**
 * 메모리에서 accessToken을 삭제하는 함수
 */
export const removeToken = (): void => {
  accessToken = null;
};

// 요청 인터셉터: 모든 요청에 Authorization 헤더 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 토큰 재발급 관련 로직 ---
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 응답 인터셉터: API 에러 공통 처리 (토큰 재발급 로직 추가)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (axios.isAxiosError(error) && error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/auth/refresh');
        const newAccessToken = data.data.accessToken;
        setToken(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeToken();
        // useBoundStore.getState().logout(); // Zustand 스토어 직접 접근 (권장되지 않음)
        // 대신 페이지를 새로고침하여 App.tsx의 PrivateRoute가 처리하도록 유도
        window.location.href = '/';
        alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
