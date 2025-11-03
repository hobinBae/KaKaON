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

// 응답 인터셉터: API 에러 공통 처리
apiClient.interceptors.response.use(
  (response) => {
    // 2xx 범위의 상태 코드 - 응답 데이터 그대로 반환
    return response;
  },
  (error) => {
    // 2xx 외의 상태 코드 - 에러 처리
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;

      if (status === 401) {
        // 401 Unauthorized: 인증 실패 (토큰 만료 등)
        removeToken();
        // 로그인 페이지로 리디렉션 (실제 앱에서는 react-router의 navigate 사용)
        window.location.href = '/login';
        alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
      }
      
      // 다른 공통 에러 처리 (예: 403, 500 등)를 여기에 추가할 수 있음
    }

    return Promise.reject(error);
  }
);

export default apiClient;
